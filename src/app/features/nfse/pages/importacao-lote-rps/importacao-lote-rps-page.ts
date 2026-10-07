import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { NfseApiService } from '../../data-access/services/nfse-api.service';
import { TomadoresApiService } from '../../data-access/services/tomadores-api.service';
import { CertificateResponse, NfseApiError } from '../../data-access/models/nfse-api.models';
import {
  applyCertificateToEmissaoRpsTesteFormValue,
  buildNfseSpCalculateTaxesRequest,
  getDefaultEmissaoRpsTesteFormValue,
  mapFormToProcessarRpsRequest,
  mapNfseSpCalculateTaxesResponseToFormPatch,
  mapPendingRpsResponseToEmissaoRpsTesteFormValue,
  validateNfseSpCalculateTaxesInput,
  type EmissaoRpsTesteFormValue,
} from '../emissao-nfse/models/emissao-rps-teste.models';
import {
  getTomadorEnderecoPendencias,
  mergeTomadorCadastroIntoForm,
  normalizeDigits,
} from '../emissao-nfse/data/local-clients.storage';

const PRESTADOR_CNPJ_CODIGO_SERVICO_NBS = normalizeDigits('02126914000129');
const PRESTADOR_CODIGO_SERVICO_PADRAO = '02919';
const PRESTADOR_NBS_PADRAO = '115022000';

@Component({
  selector: 'app-importacao-lote-rps-page',
  standalone: true,
  templateUrl: './importacao-lote-rps-page.html',
})
export class ImportacaoLoteRpsPageComponent implements OnInit {
  private readonly nfseApiService = inject(NfseApiService);
  private readonly tomadoresApi = inject(TomadoresApiService);
  private readonly router = inject(Router);

  protected readonly running = signal(false);
  protected readonly total = signal(0);
  protected readonly current = signal(0);
  protected readonly imported = signal(0);
  protected readonly failed = signal(0);
  protected readonly logLines = signal<string[]>([]);
  protected readonly finished = signal(false);

  async ngOnInit(): Promise<void> {
    await this.runImport();
  }

  protected goToLista(): void {
    void this.router.navigateByUrl('/nfse/lista-notas-fiscais');
  }

  private appendLog(line: string): void {
    this.logLines.update((lines) => [...lines, line]);
  }

  private async runImport(): Promise<void> {
    this.running.set(true);
    this.finished.set(false);
    try {
      const countResponse = await firstValueFrom(this.nfseApiService.contarPendingRps());
      const total = countResponse.count ?? 0;
      this.total.set(total);
      if (total <= 0) {
        this.appendLog('Nao ha RPS pendente no Access para importar.');
        this.finished.set(true);
        return;
      }

      this.appendLog(`Encontrados ${total} RPS. Importando um a um (calculo de impostos e XML).`);
      const certificates = await firstValueFrom(this.nfseApiService.listarCertificadosDisponiveis());
      const certificate = certificates.find((item) => item.isCurrentlySelected) ?? null;

      for (let index = 0; index < total; index += 1) {
        this.current.set(index + 1);
        try {
          await this.importOne(certificate);
          this.imported.update((value) => value + 1);
        } catch (error: unknown) {
          this.failed.update((value) => value + 1);
          this.appendLog(`Falha no RPS ${index + 1}: ${this.toMessage(error)}`);
        }
      }

      this.appendLog(
        `Importacao concluida. ${this.imported()} na lista como A processar. ${this.failed()} com falha.`,
      );
      this.finished.set(true);
      if (this.imported() > 0 && this.failed() === 0) {
        this.goToLista();
      }
    } catch (error: unknown) {
      this.appendLog(this.toMessage(error));
      this.finished.set(true);
    } finally {
      this.running.set(false);
    }
  }

  private async importOne(certificate: CertificateResponse | null): Promise<void> {
    const pending = await firstValueFrom(this.nfseApiService.obterPendingRps(1));
    if (!pending.request?.rpsList?.length) {
      throw new Error('Nenhum RPS restante no Access.');
    }

    const numero = pending.request.rpsList[0]?.numeroRps ?? '?';
    this.appendLog(`Preparando RPS ${numero}...`);

    let form: EmissaoRpsTesteFormValue = getDefaultEmissaoRpsTesteFormValue();
    if (certificate) {
      form = applyCertificateToEmissaoRpsTesteFormValue(form, certificate);
    }
    form = mapPendingRpsResponseToEmissaoRpsTesteFormValue(pending, form);
    form = this.applyPrestadorServicoNbsRule(form);
    form = await this.applyTomadorCadastro(form, numero);

    const validationError = validateNfseSpCalculateTaxesInput(form);
    if (validationError) {
      throw new Error(validationError);
    }

    const taxes = await firstValueFrom(
      this.nfseApiService.calcularImpostosNfseSp(buildNfseSpCalculateTaxesRequest(form)),
    );
    form = { ...form, ...mapNfseSpCalculateTaxesResponseToFormPatch(taxes) };

    const queued = await firstValueFrom(
      this.nfseApiService.enqueuePendingRps({
        request: mapFormToProcessarRpsRequest(form),
        recordIds: pending.recordIds ?? [],
        // PIS/COFINS/IR/CSLL ja vao no request; o agente grava esses valores, a BC e o liquido no Access.
        baseCalculoFederal: taxes.baseCalculoFederal,
        valorLiquido: taxes.valorLiquido,
      }),
    );

    if (!queued.success) {
      throw new Error(queued.errors?.[0] ?? queued.message);
    }

    this.appendLog(`RPS ${numero} importado (a processar).`);
  }

  /**
   * O Access traz apenas o CNPJ do tomador; nome e endereco vem do cadastro de tomadores.
   * Sem endereco o RPS nao e importado (a prefeitura rejeitaria Cidade/CEP = 0).
   */
  private async applyTomadorCadastro(
    form: EmissaoRpsTesteFormValue,
    numeroRps: string | number,
  ): Promise<EmissaoRpsTesteFormValue> {
    const cpfCnpj = normalizeDigits(form.tomadorCpfCnpj);
    if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
      return form;
    }

    const tomador = await firstValueFrom(this.tomadoresApi.getByCpfCnpj(cpfCnpj));
    if (tomador) {
      form = mergeTomadorCadastroIntoForm(form, tomador);
      this.appendLog(`RPS ${numeroRps}: dados do tomador ${tomador.razaoSocial} preenchidos pelo cadastro.`);
    }

    const pendencias = getTomadorEnderecoPendencias(form);
    if (pendencias.length > 0) {
      throw new Error(
        tomador
          ? `Tomador ${cpfCnpj} esta cadastrado sem ${pendencias.join(', ')}. Complete o cadastro em Tomadores e importe novamente.`
          : `Tomador ${cpfCnpj} nao encontrado no cadastro e o RPS nao traz o endereco (${pendencias.join(', ')}). Cadastre-o em Tomadores e importe novamente.`,
      );
    }

    return form;
  }

  private applyPrestadorServicoNbsRule(form: EmissaoRpsTesteFormValue): EmissaoRpsTesteFormValue {
    if (normalizeDigits(form.prestadorCpfCnpj) !== PRESTADOR_CNPJ_CODIGO_SERVICO_NBS) {
      return form;
    }

    return {
      ...form,
      codigoServico: PRESTADOR_CODIGO_SERVICO_PADRAO,
      ibsNbs: PRESTADOR_NBS_PADRAO,
    };
  }

  private toMessage(error: unknown): string {
    if (error instanceof NfseApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Falha inesperada na importacao.';
  }
}
