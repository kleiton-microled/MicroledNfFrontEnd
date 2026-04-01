import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { EmissaoRpsTesteFacade } from './facades/emissao-rps-teste.facade';
import {
  applyCertificateToEmissaoRpsTesteFormValue,
  getDefaultEmissaoRpsTesteFormValue,
  mapFormToGerarArquivoRpsRequest,
} from './models/emissao-rps-teste.models';

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

      if (!currentCertificate) {
        return;
      }

      this.form.patchValue(
        applyCertificateToEmissaoRpsTesteFormValue(this.form.getRawValue(), currentCertificate),
      );
    });
  }

  ngOnInit(): void {
    this.facade.loadCurrentCertificate();
  }

  protected generateFiles(): void {
    this.facade.generateFiles(mapFormToGerarArquivoRpsRequest(this.form.getRawValue()));
  }

  protected processRps(): void {
    this.facade.processRps(mapFormToGerarArquivoRpsRequest(this.form.getRawValue()));
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
  }
}
