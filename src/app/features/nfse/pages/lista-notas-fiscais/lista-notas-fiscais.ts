import { Component, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ListaNotasFiscaisFacade } from './facades/lista-notas-fiscais.facade';
import { NfseApiService } from '../../data-access/services/nfse-api.service';
import { NfseApiError, NotaFiscalEventoItem, NotaFiscalItemResponse, NotaFiscalResponse, ConsultarStatusRpsResponse } from '../../data-access/models/nfse-api.models';
import { ReenvioNotaState } from './models/reenvio-nota-state';
import { DuplicarNotaState } from './models/duplicar-nota-state';

type NotaAcao = 'consultar' | 'pdf' | 'enviar' | 'pagamento' | 'editar' | 'duplicar' | 'excluir';

interface NotaAcaoOpcao {
  acao: NotaAcao;
  label: string;
  icon: string;
  danger?: boolean;
}

interface AcoesMenuState {
  item: NotaFiscalItemResponse;
  top: number;
  right: number;
}

interface ModalDraft {
  pago: boolean;
  dataPagamento: string;
  valorDepositado: number | null;
}

@Component({
  selector: 'app-lista-notas-fiscais',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './lista-notas-fiscais.html',
  styleUrl: './lista-notas-fiscais.scss',
  providers: [ListaNotasFiscaisFacade],
})
export class ListaNotasFiscaisComponent implements OnInit {
  protected readonly facade = inject(ListaNotasFiscaisFacade);
  private readonly nfseApiService = inject(NfseApiService);
  private readonly router = inject(Router);

  @ViewChild('editDialog') private editDialog!: ElementRef<HTMLDialogElement>;

  protected readonly expandedId = signal<string | null>(null);
  /** Menu "Acoes" aberto (posicao fixa na tela: a tabela tem overflow e cortaria um menu absoluto). */
  protected readonly acoesMenu = signal<AcoesMenuState | null>(null);
  protected readonly consultandoProtocoloId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly duplicandoId = signal<string | null>(null);
  protected readonly editingItem = signal<NotaFiscalItemResponse | null>(null);
  protected readonly modalSaving = signal(false);
  protected modalDraft: ModalDraft = { pago: false, dataPagamento: '', valorDepositado: null };

  ngOnInit(): void {
    this.facade.loadPage();
  }

  protected nextPage(): void {
    this.facade.nextPage();
  }

  protected previousPage(): void {
    this.facade.previousPage();
  }

  protected toggleAccordion(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedId() === id;
  }

  protected openEditModal(item: NotaFiscalItemResponse): void {
    this.editingItem.set(item);
    this.modalDraft = {
      pago: item.pago ?? false,
      dataPagamento: item.dataPagamento
        ? new Date(item.dataPagamento).toISOString().substring(0, 10)
        : '',
      valorDepositado: item.valorDepositado ?? null,
    };
    this.editDialog.nativeElement.showModal();
  }

  protected closeModal(): void {
    this.editDialog.nativeElement.close();
    this.editingItem.set(null);
  }

  protected onModalPagoChange(pago: boolean): void {
    this.modalDraft.pago = pago;
    if (!pago) {
      this.modalDraft.dataPagamento = '';
      this.modalDraft.valorDepositado = null;
    }
  }

  protected saveModal(): void {
    const item = this.editingItem();
    if (!item || this.modalSaving()) return;

    this.modalSaving.set(true);

    const body: { pago: boolean; dataPagamento?: string; valorDepositado?: number; alteradoPor: string } = {
      pago: this.modalDraft.pago,
      alteradoPor: 'frontend',
    };

    if (this.modalDraft.pago) {
      if (this.modalDraft.dataPagamento) {
        body.dataPagamento = new Date(this.modalDraft.dataPagamento).toISOString();
      }
      if (this.modalDraft.valorDepositado !== null && this.modalDraft.valorDepositado !== undefined) {
        body.valorDepositado = this.modalDraft.valorDepositado;
      }
    }

    this.nfseApiService
      .atualizarPagamento(item.id, body)
      .pipe(finalize(() => this.modalSaving.set(false)))
      .subscribe({
        next: () => {
          this.syncPagamentoNfAccess(item);
          this.closeModal();
          this.facade.loadPage();
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel salvar o pagamento.';
          alert(message);
        },
      });
  }

  /**
   * Depois de salvar no sistema, replica Pago / dt_pgto / valor_depositado na tabela NF do Access.
   * Falha aqui nao desfaz o pagamento salvo; apenas avisa.
   */
  private syncPagamentoNfAccess(item: NotaFiscalItemResponse): void {
    if (!item.numeroNota) {
      return;
    }

    const pago = this.modalDraft.pago;
    const numeroNota = item.numeroNota;
    this.nfseApiService
      .atualizarPagamentoNfAccess(numeroNota, {
        pago,
        // Data local (yyyy-MM-dd), sem conversao para UTC.
        dataPagamento: pago && this.modalDraft.dataPagamento ? this.modalDraft.dataPagamento : null,
        valorDepositado: pago ? this.modalDraft.valorDepositado : null,
      })
      .subscribe({
        next: (response) => {
          if (!response.found) {
            alert(
              'Pagamento salvo no sistema, mas a NF ' + numeroNota + ' nao existe na tabela NF do Access.',
            );
          }
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError ? error.message : 'erro desconhecido';
          alert('Pagamento salvo no sistema, mas nao foi possivel atualizar a tabela NF do Access: ' + message);
        },
      });
  }

  protected toggleAcoesMenu(item: NotaFiscalItemResponse, event: MouseEvent): void {
    event.stopPropagation();
    if (this.acoesMenu()?.item.id === item.id) {
      this.acoesMenu.set(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.acoesMenu.set({
      item,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }

  @HostListener('document:click')
  @HostListener('window:resize')
  @HostListener('window:scroll')
  protected closeAcoesMenu(): void {
    if (this.acoesMenu()) {
      this.acoesMenu.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeAcoesMenu();
  }

  /** Opcoes do menu "Acoes" conforme a situacao da nota. */
  protected getAcoes(item: NotaFiscalItemResponse): NotaAcaoOpcao[] {
    const status = item.status?.toLowerCase();
    const autorizada = this.isAuthorized(item.status);
    const aProcessar = status === 'pending' || status === 'generated';
    const comFalha = status === 'rejected' || status === 'error';
    const opcoes: NotaAcaoOpcao[] = [];

    if (item.protocolo) {
      opcoes.push({ acao: 'consultar', label: 'Consultar nota na prefeitura', icon: 'bi-search' });
    }
    if (item.numeroNota && item.inscricaoPrestador) {
      opcoes.push({ acao: 'pdf', label: 'Ver PDF', icon: 'bi-file-earmark-pdf' });
    }
    if (aProcessar) {
      opcoes.push({ acao: 'enviar', label: 'Enviar nota', icon: 'bi-send' });
    }
    if (autorizada) {
      opcoes.push({ acao: 'pagamento', label: 'Informar pagamento', icon: 'bi-cash-coin' });
    }
    if (comFalha) {
      opcoes.push({ acao: 'editar', label: 'Editar nota', icon: 'bi-pencil' });
    }
    if (autorizada) {
      opcoes.push({ acao: 'duplicar', label: 'Duplicar nota', icon: 'bi-files' });
    }
    // "Ainda nao enviada": sem protocolo da prefeitura e nao autorizada.
    if (!item.protocolo && !autorizada) {
      opcoes.push({ acao: 'excluir', label: 'Excluir nota', icon: 'bi-trash', danger: true });
    }

    return opcoes;
  }

  protected isAcaoEmAndamento(item: NotaFiscalItemResponse): boolean {
    return (
      this.consultandoProtocoloId() === item.id ||
      this.deletingId() === item.id ||
      this.duplicandoId() === item.id ||
      this.facade.sendingId() === item.id
    );
  }

  protected executarAcao(acao: NotaAcao, item: NotaFiscalItemResponse): void {
    this.acoesMenu.set(null);
    switch (acao) {
      case 'consultar':
        this.consultarProtocolo(item);
        break;
      case 'pdf':
        this.abrirPdfPrefeitura(item);
        break;
      case 'enviar':
        void this.facade.processOne(item.id);
        break;
      case 'pagamento':
        this.openEditModal(item);
        break;
      case 'editar':
        this.reenviarNota(item);
        break;
      case 'duplicar':
        this.duplicarNota(item);
        break;
      case 'excluir':
        this.excluirNota(item);
        break;
    }
  }

  protected getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'authorized':
        return 'Autorizada';
      case 'pending':
      case 'generated':
        return 'A processar';
      case 'sent':
      case 'processing':
        return 'Em processamento';
      case 'rejected':
        return 'Rejeitada';
      case 'cancelled':
      case 'cancelada':
        return 'Cancelada';
      case 'error':
        return 'Erro';
      default:
        return status ?? '-';
    }
  }

  protected isAuthorized(status: string): boolean {
    const normalized = status?.toLowerCase();
    return normalized === 'authorized' || normalized === 'autorizada';
  }

  protected getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'autorizada':
      case 'authorized':
        return 'text-bg-success';
      case 'cancelada':
        return 'text-bg-danger';
      case 'pendente':
      case 'pending':
      case 'generated':
        return 'text-bg-warning';
      case 'rejeitada':
      case 'rejected':
        return 'text-bg-danger';
      case 'error':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  protected hasEventos(item: NotaFiscalItemResponse): boolean {
    return this.errosDaNota(item).length > 0 || (item.alertas?.length ?? 0) > 0;
  }

  /** Erros do envio feito agora (sessao) ou os gravados na nota (retorno da prefeitura). */
  protected errosDaNota(item: NotaFiscalItemResponse): NotaFiscalEventoItem[] {
    return this.facade.sendErrors()[item.id] ?? item.erros ?? [];
  }

  /** Erros ficam sempre visiveis abaixo da linha; alertas so ao expandir. */
  protected showEventosRow(item: NotaFiscalItemResponse): boolean {
    return this.errosDaNota(item).length > 0 || (this.isExpanded(item.id) && this.hasEventos(item));
  }

  protected consultarProtocolo(item: NotaFiscalItemResponse): void {
    if (!item.protocolo || !item.cnpjPrestador) {
      alert('Nota sem protocolo ou CNPJ do prestador — nao e possivel consultar.');
      return;
    }

    if (this.consultandoProtocoloId() === item.id) {
      return;
    }

    this.consultandoProtocoloId.set(item.id);

    this.nfseApiService
      .consultarStatusRps({ numeroProtocolo: item.protocolo, cnpjRemetente: item.cnpjPrestador })
      .pipe(finalize(() => this.consultandoProtocoloId.set(null)))
      .subscribe({
        next: (res: ConsultarStatusRpsResponse) => {
          if (res.sucesso) {
            this.facade.loadPage();
          } else {
            const erros = res.erros?.join('\n') ?? 'Erro desconhecido';
            alert(`Consulta retornou erro:\n${erros}`);
          }
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel consultar o protocolo.';
          alert(message);
        },
      });
  }

  protected abrirPdfPrefeitura(item: NotaFiscalItemResponse): void {
    const inscricao = item.inscricaoPrestador;
    const nf = item.numeroNota;
    if (!inscricao || !nf) return;
    const returnUrl = encodeURIComponent(`consultas.aspx?inscricao=${inscricao}`);
    window.open(
      `https://nfe.prefeitura.sp.gov.br/contribuinte/notaprint.aspx?inscricao=${inscricao}&nf=${nf}&returnUrl=${returnUrl}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  protected excluirNota(item: NotaFiscalItemResponse): void {
    if (this.deletingId() === item.id) return;
    if (!confirm(`Excluir a nota ${item.numeroRps ?? item.id}? Esta ação não pode ser desfeita.`)) return;
    this.deletingId.set(item.id);
    this.nfseApiService
      .excluirNotaFiscal(item.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.facade.loadPage(),
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Não foi possível excluir a nota fiscal.';
          alert(message);
        },
      });
  }

  protected reenviarNota(item: NotaFiscalItemResponse): void {
    const state: ReenvioNotaState = {
      numeroRps: item.numeroRps,
      serieRps: item.serieRps,
      cpfCnpjTomador: item.cpfCnpjTomador,
      dataEmissao: item.dataEmissao
        ? item.dataEmissao.substring(0, 10)
        : undefined,
    };

    void this.router.navigate(['/nfse/emissao-nfse'], { state: { reenvio: state } });
  }

  protected duplicarNota(item: NotaFiscalItemResponse): void {
    if (this.duplicandoId() === item.id) return;

    this.duplicandoId.set(item.id);

    this.nfseApiService
      .obterNotaFiscalPorId(item.id)
      .pipe(finalize(() => this.duplicandoId.set(null)))
      .subscribe({
        next: (response: NotaFiscalResponse) => {
          const state: DuplicarNotaState = {
            serieRps: response.serieRps,
            tipoRps: response.tipoRps,
            statusRps: response.statusRps,
            tributacaoRps: response.tributacaoRps,
            discriminacao: response.discriminacao,
            codigoMunicipio: response.codigoMunicipio,
            exigibilidadeISS: response.exigibilidadeISS,
            municipioIncidencia: response.municipioIncidencia,
            tomadorCpfCnpj: response.cpfCnpjTomador,
            tomadorRazaoSocial: response.nomeTomador,
            tomadorEmail: response.tomadorEmail,
            tomadorInscricaoMunicipal: response.tomadorInscricaoMunicipal,
            tomadorCep: response.tomadorCep,
            tomadorLogradouro: response.tomadorLogradouro,
            tomadorNumero: response.tomadorNumero,
            tomadorComplemento: response.tomadorComplemento,
            tomadorBairro: response.tomadorBairro,
            tomadorCodigoMunicipio: response.tomadorCodigoMunicipio,
            tomadorUf: response.tomadorUf,
            codigoServico: response.codigoServico,
            valorServicos: response.valorServicos,
            aliquotaServicos: response.aliquotaServicos,
            issRetido: response.issRetido,
            valorIss: response.valorIss,
            valorDeducoes: response.valorDeducoes,
            valorPis: response.valorPis,
            valorCofins: response.valorCofins,
            valorInss: response.valorInss,
            valorIr: response.valorIr,
            valorCsll: response.valorCsll,
            outrasRetencoes: response.outrasRetencoes,
            descontoCondicionado: response.descontoCondicionado,
            descontoIncondicionado: response.descontoIncondicionado,
            ibsIndDest: response.ibsIndDest,
            ibsCstIbs: response.ibsCstIbs,
            ibsAliqEstadual: response.ibsAliqEstadual,
            ibsAliqMunicipal: response.ibsAliqMunicipal,
            ibsCstCbs: response.ibsCstCbs,
            ibsAliqCbs: response.ibsAliqCbs,
          };

          void this.router.navigate(['/nfse/emissao-nfse'], { state: { duplicar: state } });
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel carregar os dados da nota fiscal.';
          alert(message);
        },
      });
  }
}
