import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { EmissaoRpsTesteFacade } from './facades/emissao-rps-teste.facade';
import {
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
export class EmissaoNfsePageComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly facade = inject(EmissaoRpsTesteFacade);
  protected readonly form = this.formBuilder.nonNullable.group(getDefaultEmissaoRpsTesteFormValue());

  protected generateFiles(): void {
    this.facade.generateFiles(mapFormToGerarArquivoRpsRequest(this.form.getRawValue()));
  }

  protected resetForm(): void {
    this.form.reset(getDefaultEmissaoRpsTesteFormValue());
  }
}
