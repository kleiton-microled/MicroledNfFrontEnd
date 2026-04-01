import { Component, effect, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CancelamentoNfseFacade } from './facades/cancelamento-nfse.facade';
import {
  applyCertificateToCancelamentoNfseFormValue,
  getDefaultCancelamentoNfseFormValue,
  mapFormToCancelarNotaFiscalRequest,
} from './models/cancelamento-nfse.models';

@Component({
  selector: 'app-cancelamento-nfse-page',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './cancelamento-nfse-page.html',
  styleUrl: './cancelamento-nfse-page.scss',
  providers: [CancelamentoNfseFacade],
})
export class CancelamentoNfsePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly facade = inject(CancelamentoNfseFacade);
  protected readonly form = this.formBuilder.nonNullable.group(getDefaultCancelamentoNfseFormValue());

  constructor() {
    effect(() => {
      const currentCertificate = this.facade.currentCertificate();

      if (!currentCertificate) {
        return;
      }

      this.form.patchValue(
        applyCertificateToCancelamentoNfseFormValue(this.form.getRawValue(), currentCertificate),
      );
    });
  }

  ngOnInit(): void {
    this.facade.loadCurrentCertificate();
  }

  protected cancelarNotaFiscal(): void {
    this.facade.cancelarNotaFiscal(mapFormToCancelarNotaFiscalRequest(this.form.getRawValue()));
  }

  protected resetForm(): void {
    const defaultValue = getDefaultCancelamentoNfseFormValue();
    const currentCertificate = this.facade.currentCertificate();

    this.form.reset(
      currentCertificate
        ? applyCertificateToCancelamentoNfseFormValue(defaultValue, currentCertificate)
        : defaultValue,
    );
  }
}
