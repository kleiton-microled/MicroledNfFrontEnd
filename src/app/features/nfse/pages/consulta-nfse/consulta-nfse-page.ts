import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ConsultaNfseDetailPanelComponent } from './components/consulta-nfse-detail-panel/consulta-nfse-detail-panel';
import { ConsultaNfseFacade } from './facades/consulta-nfse.facade';

@Component({
  selector: 'app-consulta-nfse-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, ConsultaNfseDetailPanelComponent],
  templateUrl: './consulta-nfse-page.html',
  styleUrl: './consulta-nfse-page.scss',
  providers: [ConsultaNfseFacade],
})
export class ConsultaNfsePageComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly facade = inject(ConsultaNfseFacade);
  protected readonly filtersForm = this.formBuilder.nonNullable.group({
    inscricaoPrestador: '',
    numeroNFe: '',
    codigoVerificacao: '',
    chaveNotaNacional: '',
  });

  protected search(): void {
    this.facade.search(this.filtersForm.getRawValue());
  }

  protected clearFilters(): void {
    this.filtersForm.reset({
      inscricaoPrestador: '',
      numeroNFe: '',
      codigoVerificacao: '',
      chaveNotaNacional: '',
    });
    this.facade.reset();
  }
}
