import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { merge, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  filterPrestadores,
  formToTomadorRequest,
  getTomadorEnderecoPendencias,
  normalizeDigits,
  prestadorTemplateToFormPatch,
  resolveUniquePrestadorTemplate,
  type PrestadorTemplate,
  tomadorToFormPatch,
} from './data/local-clients.storage';
import { NfseApiError, type TomadorResponse } from '../../data-access/models/nfse-api.models';
import { TomadoresApiService } from '../../data-access/services/tomadores-api.service';
import { EmissaoRpsTesteFacade } from './facades/emissao-rps-teste.facade';
import {
  applyCertificateToEmissaoRpsTesteFormValue,
  getDefaultEmissaoRpsTesteFormValue,
  mapFormToGerarArquivoRpsRequest,
  mapFormToProcessarRpsRequest,
} from './models/emissao-rps-teste.models';
import { ReenvioNotaState } from '../lista-notas-fiscais/models/reenvio-nota-state';
import { DuplicarNotaState } from '../lista-notas-fiscais/models/duplicar-nota-state';

const TRIBUTOS_APENAS_API_FORM_KEYS = [
  'tributosBaseCalculoIss',
  'tributosBaseCalculoFederal',
  'tributosValorISS',
  'tributosTotalRetencoesFederais',
  'tributosValorPIS',
  'tributosValorCOFINS',
  'tributosValorINSS',
  'tributosValorIR',
  'tributosValorCSLL',
  'tributosValorCargaTributaria',
  'tributosPercentualCargaTributaria',
  'tributosFonteCargaTributaria',
  'tributosValorFinalCobrado',
] as const;

/** Campo desabilitado e excluido do JSON de process / gerar arquivo. */
const IBS_NAO_ENVIADO_FORM_KEYS = ['ibsTpEnteGov'] as const;

/** CNPJ (somente digitos): preenche codigo de servico e NBS automaticamente. */
const PRESTADOR_CNPJ_CODIGO_SERVICO_NBS = normalizeDigits('02126914000129');
const PRESTADOR_CODIGO_SERVICO_PADRAO = '02919';
const PRESTADOR_NBS_PADRAO = '115022000';

const MIN_TOMADOR_CPF_QUERY_LEN = 3;
const MIN_TOMADOR_RAZAO_QUERY_LEN = 2;

@Component({
  selector: 'app-emissao-nfse-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './emissao-nfse-page.html',
  styleUrl: './emissao-nfse-page.scss',
  providers: [EmissaoRpsTesteFacade],
})
export class EmissaoNfsePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly tomadoresApi = inject(TomadoresApiService);
  private readonly tomadorQuery$ = new Subject<string>();

  protected readonly facade = inject(EmissaoRpsTesteFacade);
  protected readonly form = this.formBuilder.nonNullable.group(getDefaultEmissaoRpsTesteFormValue());

  protected readonly prestadorAcHost = viewChild<ElementRef<HTMLElement>>('prestadorAcHost');
  protected readonly tomadorAcHost = viewChild<ElementRef<HTMLElement>>('tomadorAcHost');

  protected readonly prestadorMatches = signal<PrestadorTemplate[]>([]);
  protected readonly showPrestadorSuggestions = signal(false);
  protected readonly tomadorMatches = signal<TomadorResponse[]>([]);
  protected readonly showTomadorSuggestions = signal(false);
  /** Tomador do cadastro correspondente ao CPF/CNPJ atual do formulario (null = nao cadastrado). */
  protected readonly tomadorCadastrado = signal<TomadorResponse | null>(null);
  protected readonly isSavingTomador = signal(false);

  constructor() {
    effect(() => {
      const currentCertificate = this.facade.currentCertificate();
      const locked = currentCertificate !== null;

      if (currentCertificate) {
        this.form.patchValue(
          applyCertificateToEmissaoRpsTesteFormValue(this.form.getRawValue(), currentCertificate),
          { emitEvent: false },
        );
        this.applyPrestadorCadastroLocalIfUnambiguous();
        this.syncIbsLocalPrestacaoWithPrestadorMunicipio();
        this.applyPrestadorServicoNbsRule();
      }

      const prestadorLockedNames = [
        'prestadorCpfCnpj',
        'prestadorInscricaoMunicipal',
      ] as const;

      for (const name of prestadorLockedNames) {
        const control = this.form.get(name);
        if (!control) {
          continue;
        }
        if (locked) {
          control.disable({ emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    this.applyReenvioStateIfPresent();
    this.facade.loadCurrentCertificate();
    this.facade.loadProximoNumeroRps((numero) => {
      this.form.controls.numeroRps.patchValue(String(numero), { emitEvent: false });
    });
    this.applyDuplicarStateIfPresent();

    for (const name of TRIBUTOS_APENAS_API_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }

    for (const name of IBS_NAO_ENVIADO_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }

    merge(
      this.form.controls.valorServicos.valueChanges,
      this.form.controls.aliquotaServicos.valueChanges,
      this.form.controls.codigoServico.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.facade.onTaxCalculationInputsChanged((patch) =>
          this.form.patchValue(patch, { emitEvent: false }),
        );
      });

    merge(
      this.form.controls.prestadorCpfCnpj.valueChanges,
      this.form.controls.prestadorRazaoSocial.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.showPrestadorSuggestions()) {
          this.refreshPrestadorMatches();
        }
      });

    this.form.controls.prestadorCodigoMunicipio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncIbsLocalPrestacaoWithPrestadorMunicipio());

    this.syncIbsLocalPrestacaoWithPrestadorMunicipio();
    this.applyPrestadorServicoNbsRule();

    this.form.controls.prestadorCpfCnpj.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyPrestadorServicoNbsRule());

    merge(
      this.form.controls.tomadorCpfCnpj.valueChanges,
      this.form.controls.tomadorRazaoSocial.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.showTomadorSuggestions()) {
          this.refreshTomadorMatches();
        }
      });

    this.tomadorQuery$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) =>
          query
            ? this.tomadoresApi.search(query, 1, 10).pipe(
                map((page) => page.items),
                catchError(() => of([] as TomadorResponse[])),
              )
            : of([] as TomadorResponse[]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => this.tomadorMatches.set(items));

    // CPF (11) / CNPJ (14) completo: busca no cadastro e preenche o tomador automaticamente.
    this.form.controls.tomadorCpfCnpj.valueChanges
      .pipe(
        map((value) => normalizeDigits(value)),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((digits) =>
          digits.length === 11 || digits.length === 14
            ? this.tomadoresApi.getByCpfCnpj(digits).pipe(catchError(() => of(null)))
            : of(null),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tomador) => {
        this.tomadorCadastrado.set(tomador);
        if (tomador) {
          this.applyTomador(tomador);
        }
      });

    this.syncTomadorCadastrado();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.prestadorAcHost()?.nativeElement.contains(target)) {
      return;
    }
    if (this.tomadorAcHost()?.nativeElement.contains(target)) {
      return;
    }
    this.showPrestadorSuggestions.set(false);
    this.showTomadorSuggestions.set(false);
  }

  protected onPrestadorAutocompleteInteract(): void {
    this.showPrestadorSuggestions.set(true);
    this.refreshPrestadorMatches();
  }

  protected refreshPrestadorMatches(): void {
    this.prestadorMatches.set(
      filterPrestadores(
        this.form.controls.prestadorCpfCnpj.getRawValue(),
        this.form.controls.prestadorRazaoSocial.getRawValue(),
      ),
    );
  }

  protected selectPrestador(item: PrestadorTemplate): void {
    this.form.patchValue(prestadorTemplateToFormPatch(item), { emitEvent: false });
    this.syncIbsLocalPrestacaoWithPrestadorMunicipio();
    this.applyPrestadorServicoNbsRule();
    this.showPrestadorSuggestions.set(false);
    this.prestadorMatches.set([]);
  }

  protected onTomadorAutocompleteInteract(): void {
    this.showTomadorSuggestions.set(true);
    this.refreshTomadorMatches();
  }

  protected refreshTomadorMatches(): void {
    const digits = normalizeDigits(this.form.controls.tomadorCpfCnpj.getRawValue());
    const razao = this.form.controls.tomadorRazaoSocial.getRawValue().trim();
    let query = '';
    if (digits.length >= MIN_TOMADOR_CPF_QUERY_LEN) {
      query = digits;
    } else if (razao.length >= MIN_TOMADOR_RAZAO_QUERY_LEN) {
      query = razao;
    }

    if (!query) {
      this.tomadorMatches.set([]);
    }
    this.tomadorQuery$.next(query);
  }

  protected selectTomador(item: TomadorResponse): void {
    this.applyTomador(item);
    this.tomadorCadastrado.set(item);
    this.showTomadorSuggestions.set(false);
    this.tomadorMatches.set([]);
  }

  protected formatCpfCnpj(value: string): string {
    const d = normalizeDigits(value);
    if (d.length === 14) {
      return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (d.length === 11) {
      return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return value;
  }

  /** Cadastra o tomador do formulario ou atualiza o cadastro existente com os dados atuais. */
  protected saveTomadorNoCadastro(): void {
    const request = formToTomadorRequest(this.form.getRawValue());
    if (request.cpfCnpj.length !== 11 && request.cpfCnpj.length !== 14) {
      void Swal.fire({ icon: 'warning', title: 'Informe um CPF (11) ou CNPJ (14 digitos) valido.' });
      return;
    }
    if (!request.razaoSocial) {
      void Swal.fire({ icon: 'warning', title: 'Informe a razao social do tomador.' });
      return;
    }

    const existing = this.tomadorCadastrado();
    const operation$ = existing
      ? this.tomadoresApi.update(existing.id, request)
      : this.tomadoresApi.create(request);

    this.isSavingTomador.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        this.isSavingTomador.set(false);
        this.tomadorCadastrado.set(saved);
        void Swal.fire({
          icon: 'success',
          title: existing ? 'Cadastro do tomador atualizado.' : 'Tomador cadastrado.',
          timer: 1800,
          showConfirmButton: false,
        });
      },
      error: (error: unknown) => {
        this.isSavingTomador.set(false);
        const message =
          error instanceof NfseApiError ? error.message : 'Nao foi possivel salvar o tomador.';
        void Swal.fire({ icon: 'error', title: 'Erro ao salvar tomador', text: message });
      },
    });
  }

  /** A prefeitura rejeita o envio sem o endereco completo do tomador/destinatario (erros 251-253). */
  private validateTomadorEndereco(): boolean {
    const pendencias = getTomadorEnderecoPendencias(this.form.getRawValue());
    if (pendencias.length === 0) {
      return true;
    }

    void Swal.fire({
      icon: 'warning',
      title: 'Endereco do tomador incompleto',
      html:
        '<p class="text-start mb-2">A prefeitura exige o endereco completo do tomador. Preencha:</p>' +
        `<ul class="text-start mb-2">${pendencias.map((p) => `<li>${p}</li>`).join('')}</ul>` +
        '<p class="text-start mb-0 small">Dica: use "Salvar no cadastro" para que as proximas notas deste tomador ja venham preenchidas.</p>',
    });
    return false;
  }

  private applyTomador(tomador: TomadorResponse): void {
    this.form.patchValue(tomadorToFormPatch(tomador), { emitEvent: false });
  }

  /** Para CPF/CNPJ preenchido sem digitacao (reenvio/duplicar), apenas identifica se ja esta cadastrado. */
  private syncTomadorCadastrado(): void {
    const digits = normalizeDigits(this.form.controls.tomadorCpfCnpj.getRawValue());
    if (digits.length !== 11 && digits.length !== 14) {
      return;
    }

    this.tomadoresApi
      .getByCpfCnpj(digits)
      .pipe(
        catchError(() => of(null)),
        filter((tomador): tomador is TomadorResponse => tomador !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tomador) => this.tomadorCadastrado.set(tomador));
  }

  protected calculateTaxes(): void {
    this.facade.calculateTaxes(this.form.getRawValue(), (patch) =>
      this.form.patchValue(patch, { emitEvent: false }),
    );
  }

  protected generateFiles(): void {
    if (!this.facade.taxesCalculatedSuccessfully()) {
      return;
    }
    if (!this.validateTomadorEndereco()) {
      return;
    }

    this.facade.generateFiles(mapFormToGerarArquivoRpsRequest(this.form.getRawValue()));
  }

  protected async confirmProcessRps(): Promise<void> {
    if (!this.facade.taxesCalculatedSuccessfully()) {
      return;
    }
    if (!this.validateTomadorEndereco()) {
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmar envio da nota?',
      html:
        '<p class="text-start mb-2">Ao confirmar, o sistema irá <strong>criar e enviar</strong> a nota fiscal (processamento do RPS).</p>' +
        '<p class="text-start mb-0">Deseja continuar?</p>',
      icon: 'warning',
      showCancelButton: true,
      focusCancel: true,
      confirmButtonText: 'Sim, enviar nota',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    this.facade.processRps(mapFormToProcessarRpsRequest(this.form.getRawValue()));
  }

  protected resetForm(): void {
    const defaultValue = getDefaultEmissaoRpsTesteFormValue();
    const currentCertificate = this.facade.currentCertificate();

    this.form.reset(
      currentCertificate
        ? applyCertificateToEmissaoRpsTesteFormValue(defaultValue, currentCertificate)
        : defaultValue,
    );
    if (currentCertificate) {
      this.applyPrestadorCadastroLocalIfUnambiguous();
    }
    this.syncIbsLocalPrestacaoWithPrestadorMunicipio();
    this.applyPrestadorServicoNbsRule();
    this.facade.resetTaxCalculationState();

    for (const name of TRIBUTOS_APENAS_API_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }

    for (const name of IBS_NAO_ENVIADO_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }

    this.facade.loadProximoNumeroRps((numero) => {
      this.form.controls.numeroRps.patchValue(String(numero), { emitEvent: false });
    });
  }

  protected importPendingRps(): void {
    void this.router.navigateByUrl('/nfse/emissao-nfse/lote');
  }

  private syncIbsLocalPrestacaoWithPrestadorMunicipio(): void {
    const codigoMunicipioPrestador = this.form.controls.prestadorCodigoMunicipio.getRawValue();
    if (this.form.controls.ibsCLocPrestacao.getRawValue() === codigoMunicipioPrestador) {
      return;
    }

    this.form.controls.ibsCLocPrestacao.patchValue(codigoMunicipioPrestador, { emitEvent: false });
  }

  private applyPrestadorServicoNbsRule(): void {
    const cnpj = normalizeDigits(this.form.controls.prestadorCpfCnpj.getRawValue());
    if (cnpj !== PRESTADOR_CNPJ_CODIGO_SERVICO_NBS) {
      return;
    }

    this.form.controls.codigoServico.patchValue(PRESTADOR_CODIGO_SERVICO_PADRAO, { emitEvent: true });
    this.form.controls.ibsNbs.patchValue(PRESTADOR_NBS_PADRAO, { emitEvent: false });
  }

  /** Aplica email/endereco do cadastro local quando o certificado ja identifica um unico prestador. */
  private applyPrestadorCadastroLocalIfUnambiguous(): void {
    const raw = this.form.getRawValue();
    const resolved = resolveUniquePrestadorTemplate(raw.prestadorCpfCnpj, raw.prestadorRazaoSocial);
    if (!resolved) {
      return;
    }
    this.form.patchValue(prestadorTemplateToFormPatch(resolved), { emitEvent: false });
  }

  private applyReenvioStateIfPresent(): void {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    const source = (navState ?? history.state) as Record<string, unknown>;
    const reenvio = source?.['reenvio'];

    if (!reenvio || typeof reenvio !== 'object') {
      return;
    }

    const state = reenvio as ReenvioNotaState;
    const patch: Partial<{ numeroRps: string; serieRps: string; tomadorCpfCnpj: string; dataEmissao: string }> = {};

    if (state.numeroRps) {
      patch.numeroRps = state.numeroRps;
    }

    if (state.serieRps) {
      patch.serieRps = state.serieRps;
    }

    if (state.cpfCnpjTomador) {
      patch.tomadorCpfCnpj = state.cpfCnpjTomador;
    }

    if (state.dataEmissao) {
      patch.dataEmissao = state.dataEmissao;
    }

    if (Object.keys(patch).length > 0) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  private applyDuplicarStateIfPresent(): void {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    const source = (navState ?? history.state) as Record<string, unknown>;
    const duplicar = source?.['duplicar'];

    if (!duplicar || typeof duplicar !== 'object') {
      return;
    }

    const state = duplicar as DuplicarNotaState;
    const patch: Partial<{
      serieRps: string;
      tipoRps: string;
      statusRps: string;
      tributacaoRps: string;
      discriminacao: string;
      tomadorCpfCnpj: string;
      tomadorRazaoSocial: string;
      tomadorEmail: string;
      tomadorInscricaoMunicipal: string;
      enderecoCep: string;
      enderecoLogradouro: string;
      enderecoNumero: string;
      enderecoComplemento: string;
      enderecoBairro: string;
      enderecoCodigoMunicipio: string;
      enderecoUf: string;
      codigoServico: string;
      valorServicos: string;
      aliquotaServicos: string;
      issRetido: boolean;
      valorDeducoes: string;
      tributosValorPIS: string;
      tributosValorCOFINS: string;
      tributosValorINSS: string;
      tributosValorIR: string;
      tributosValorCSLL: string;
      ibsIndDest: string;
    }> = {};

    if (state.serieRps) patch.serieRps = state.serieRps;
    if (state.tipoRps) patch.tipoRps = state.tipoRps;
    if (state.statusRps) patch.statusRps = state.statusRps;
    if (state.tributacaoRps) patch.tributacaoRps = state.tributacaoRps;
    if (state.discriminacao) patch.discriminacao = state.discriminacao;
    if (state.tomadorCpfCnpj) patch.tomadorCpfCnpj = state.tomadorCpfCnpj;
    if (state.tomadorRazaoSocial) patch.tomadorRazaoSocial = state.tomadorRazaoSocial;
    if (state.tomadorEmail) patch.tomadorEmail = state.tomadorEmail;
    if (state.tomadorInscricaoMunicipal) patch.tomadorInscricaoMunicipal = state.tomadorInscricaoMunicipal;
    if (state.tomadorCep) patch.enderecoCep = state.tomadorCep;
    if (state.tomadorLogradouro) patch.enderecoLogradouro = state.tomadorLogradouro;
    if (state.tomadorNumero) patch.enderecoNumero = state.tomadorNumero;
    if (state.tomadorComplemento != null) patch.enderecoComplemento = state.tomadorComplemento;
    if (state.tomadorBairro) patch.enderecoBairro = state.tomadorBairro;
    if (state.tomadorCodigoMunicipio) patch.enderecoCodigoMunicipio = state.tomadorCodigoMunicipio;
    if (state.tomadorUf) patch.enderecoUf = state.tomadorUf;
    if (state.codigoServico) patch.codigoServico = state.codigoServico;
    if (state.valorServicos) patch.valorServicos = state.valorServicos;
    if (state.aliquotaServicos) patch.aliquotaServicos = state.aliquotaServicos;
    if (state.issRetido != null) patch.issRetido = state.issRetido === '1' || state.issRetido === 'true';
    if (state.valorDeducoes) patch.valorDeducoes = state.valorDeducoes;
    if (state.valorPis) patch.tributosValorPIS = state.valorPis;
    if (state.valorCofins) patch.tributosValorCOFINS = state.valorCofins;
    if (state.valorInss) patch.tributosValorINSS = state.valorInss;
    if (state.valorIr) patch.tributosValorIR = state.valorIr;
    if (state.valorCsll) patch.tributosValorCSLL = state.valorCsll;
    if (state.ibsIndDest) patch.ibsIndDest = state.ibsIndDest;

    if (Object.keys(patch).length > 0) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }
}
