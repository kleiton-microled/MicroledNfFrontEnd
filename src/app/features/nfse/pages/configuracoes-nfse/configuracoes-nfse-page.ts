import { DatePipe } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

const AGENTE_LOCAL_DOWNLOAD_URL = 'https://drive.google.com/file/d/1_XyGESuKgieF0b44wLc7SUPjukZzAn7i/view';

import { CertificateResponse } from '../../data-access/models/nfse-api.models';
import { CertificateSelectorModalComponent } from './components/certificate-selector-modal/certificate-selector-modal';
import { ConfiguracoesNfseFacade } from './facades/configuracoes-nfse.facade';
import { mapCertificateToConfiguracoesFormValue } from './models/configuracoes-nfse.models';

@Component({
  selector: 'app-configuracoes-nfse-page',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, CertificateSelectorModalComponent],
  templateUrl: './configuracoes-nfse-page.html',
  styleUrl: './configuracoes-nfse-page.scss',
  providers: [ConfiguracoesNfseFacade],
})
export class ConfiguracoesNfsePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly facade = inject(ConfiguracoesNfseFacade);
  protected readonly configurationForm = this.formBuilder.nonNullable.group({
    empresaNome: '',
    cnpj: '',
    cpf: '',
    inscricaoMunicipal: '',
    thumbprint: '',
    certificadoNome: '',
    emissorCertificado: '',
    serialNumber: '',
    storeLocation: '',
    storeName: '',
    validadeInicial: '',
    validadeFinal: '',
    ambiente: 'producao',
  });

  constructor() {
    effect(() => {
      const selectedCertificate = this.facade.selectedCertificate();

      if (!selectedCertificate) {
        return;
      }

      this.configurationForm.patchValue(mapCertificateToConfiguracoesFormValue(selectedCertificate));
    });
  }

  ngOnInit(): void {
    this.facade.initialize();
  }

  protected handleCertificateSelection(certificate: CertificateResponse): void {
    this.facade.selectCertificate(certificate);
  }

  protected downloadAgenteLocal(): void {
    if (!AGENTE_LOCAL_DOWNLOAD_URL) {
      alert('Link de download ainda não disponível.');
      return;
    }

    window.open(AGENTE_LOCAL_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
  }
}
