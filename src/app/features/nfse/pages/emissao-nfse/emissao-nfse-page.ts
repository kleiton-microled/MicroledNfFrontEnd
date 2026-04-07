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
import { merge } from 'rxjs';

import {
  filterPrestadores,
  filterTomadores,
  normalizeDigits,
  prestadorTemplateToFormPatch,
  type PrestadorTemplate,
  type TomadorTemplate,
  tomadorTemplateToFormPatch,
} from './data/local-clients.storage';
import { EmissaoRpsTesteFacade } from './facades/emissao-rps-teste.facade';
import {
  applyCertificateToEmissaoRpsTesteFormValue,
  getDefaultEmissaoRpsTesteFormValue,
  mapFormToGerarArquivoRpsRequest,
  mapFormToProcessarRpsRequest,
} from './models/emissao-rps-teste.models';

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
  'tributosValorFinalCobrado',
] as const;

/** Campo desabilitado e excluido do JSON de process / gerar arquivo. */
const IBS_NAO_ENVIADO_FORM_KEYS = ['ibsTpEnteGov'] as const;

/** CNPJ (somente digitos): preenche codigo de servico e NBS automaticamente. */
const PRESTADOR_CNPJ_CODIGO_SERVICO_NBS = normalizeDigits('02126914000129');
const PRESTADOR_CODIGO_SERVICO_PADRAO = '02919';
const PRESTADOR_NBS_PADRAO = '115022000';

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

  protected readonly facade = inject(EmissaoRpsTesteFacade);
  protected readonly form = this.formBuilder.nonNullable.group(getDefaultEmissaoRpsTesteFormValue());

  protected readonly prestadorAcHost = viewChild<ElementRef<HTMLElement>>('prestadorAcHost');
  protected readonly tomadorAcHost = viewChild<ElementRef<HTMLElement>>('tomadorAcHost');

  protected readonly prestadorMatches = signal<PrestadorTemplate[]>([]);
  protected readonly showPrestadorSuggestions = signal(false);
  protected readonly tomadorMatches = signal<TomadorTemplate[]>([]);
  protected readonly showTomadorSuggestions = signal(false);

  constructor() {
    effect(() => {
      const currentCertificate = this.facade.currentCertificate();
      const locked = currentCertificate !== null;

      if (currentCertificate) {
        this.form.patchValue(
          applyCertificateToEmissaoRpsTesteFormValue(this.form.getRawValue(), currentCertificate),
          { emitEvent: false },
        );
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
    this.facade.loadCurrentCertificate();

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
    this.tomadorMatches.set(
      filterTomadores(
        this.form.controls.tomadorCpfCnpj.getRawValue(),
        this.form.controls.tomadorRazaoSocial.getRawValue(),
      ),
    );
  }

  protected selectTomador(item: TomadorTemplate): void {
    this.form.patchValue(tomadorTemplateToFormPatch(item), { emitEvent: false });
    this.showTomadorSuggestions.set(false);
    this.tomadorMatches.set([]);
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

    this.facade.generateFiles(mapFormToGerarArquivoRpsRequest(this.form.getRawValue()));
  }

  protected processRps(): void {
    if (!this.facade.taxesCalculatedSuccessfully()) {
      return;
    }

    this.facade.processRps(mapFormToProcessarRpsRequest(this.form.getRawValue()));
  }

  protected consultarStatus(): void {
    this.facade.consultarStatus();
  }

  protected updateProtocol(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.facade.setProtocol(input.value);
  }

  protected resetForm(): void {
    const defaultValue = getDefaultEmissaoRpsTesteFormValue();
    const currentCertificate = this.facade.currentCertificate();

    this.form.reset(
      currentCertificate
        ? applyCertificateToEmissaoRpsTesteFormValue(defaultValue, currentCertificate)
        : defaultValue,
    );
    this.syncIbsLocalPrestacaoWithPrestadorMunicipio();
    this.applyPrestadorServicoNbsRule();
    this.facade.resetTaxCalculationState();

    for (const name of TRIBUTOS_APENAS_API_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }

    for (const name of IBS_NAO_ENVIADO_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }
  }

  protected importPendingRps(): void {
    this.facade.importPendingRps(this.form.getRawValue(), (value) => {
      this.form.patchValue(value, { emitEvent: false });
      this.syncIbsLocalPrestacaoWithPrestadorMunicipio();
      this.applyPrestadorServicoNbsRule();
    });
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
}
