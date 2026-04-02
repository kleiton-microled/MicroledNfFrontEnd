import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { merge } from 'rxjs';

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

  protected readonly facade = inject(EmissaoRpsTesteFacade);
  protected readonly form = this.formBuilder.nonNullable.group(getDefaultEmissaoRpsTesteFormValue());

  constructor() {
    effect(() => {
      const currentCertificate = this.facade.currentCertificate();
      const locked = currentCertificate !== null;

      if (currentCertificate) {
        this.form.patchValue(
          applyCertificateToEmissaoRpsTesteFormValue(this.form.getRawValue(), currentCertificate),
          { emitEvent: false },
        );
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

    merge(
      this.form.controls.valorServicos.valueChanges,
      this.form.controls.aliquotaServicos.valueChanges,
      this.form.controls.codigoServico.valueChanges,
    ).subscribe(() => {
      this.facade.onTaxCalculationInputsChanged((patch) =>
        this.form.patchValue(patch, { emitEvent: false }),
      );
    });
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
    this.facade.resetTaxCalculationState();

    for (const name of TRIBUTOS_APENAS_API_FORM_KEYS) {
      this.form.get(name)?.disable({ emitEvent: false });
    }
  }

  protected importPendingRps(): void {
    this.facade.importPendingRps(this.form.getRawValue(), (value) =>
      this.form.patchValue(value, { emitEvent: false }),
    );
  }
}
