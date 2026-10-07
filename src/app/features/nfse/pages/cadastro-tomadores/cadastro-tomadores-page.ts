import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  NfseApiError,
  type TomadorRequest,
  type TomadorResponse,
} from '../../data-access/models/nfse-api.models';
import { TomadoresApiService } from '../../data-access/services/tomadores-api.service';

const PAGE_SIZE = 20;

function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

@Component({
  selector: 'app-cadastro-tomadores-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-tomadores-page.html',
  styleUrl: './cadastro-tomadores-page.scss',
})
export class CadastroTomadoresPageComponent implements OnInit {
  private readonly api = inject(TomadoresApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  protected readonly items = signal<TomadorResponse[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly page = signal(1);
  protected readonly query = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));

  /** null = formulario fechado; 'new' = novo cadastro; demais = edicao. */
  protected readonly editing = signal<TomadorResponse | 'new' | null>(null);
  protected readonly isSaving = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    cpfCnpj: ['', [Validators.required, Validators.pattern(/^(\D*\d){11}\D*$|^(\D*\d){14}\D*$/)]],
    razaoSocial: ['', [Validators.required, Validators.maxLength(200)]],
    inscricaoMunicipal: [''],
    inscricaoEstadual: [''],
    email: ['', [Validators.email]],
    // Endereco completo e exigido pela prefeitura (tomador e destinatario IBS/CBS).
    tipoLogradouro: [''],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    complemento: [''],
    bairro: ['', [Validators.required]],
    uf: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
    codigoMunicipio: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
    cep: ['', [Validators.required, Validators.pattern(/^\D*(\d\D*){8}$/)]],
  });

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.query.set(query);
        this.page.set(1);
        this.load();
      });

    this.load();
  }

  protected onSearchInput(value: string): void {
    this.search$.next(value.trim());
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  protected openNew(): void {
    this.form.reset();
    this.form.controls.cpfCnpj.enable();
    this.editing.set('new');
  }

  protected openEdit(tomador: TomadorResponse): void {
    this.form.reset({
      cpfCnpj: this.formatCpfCnpj(tomador.cpfCnpj),
      razaoSocial: tomador.razaoSocial,
      inscricaoMunicipal: tomador.inscricaoMunicipal ?? '',
      inscricaoEstadual: tomador.inscricaoEstadual ?? '',
      email: tomador.email ?? '',
      tipoLogradouro: tomador.tipoLogradouro ?? '',
      logradouro: tomador.logradouro ?? '',
      numero: tomador.numero ?? '',
      complemento: tomador.complemento ?? '',
      bairro: tomador.bairro ?? '',
      uf: tomador.uf ?? '',
      codigoMunicipio: tomador.codigoMunicipio ?? '',
      cep: tomador.cep ?? '',
    });
    // CPF/CNPJ identifica o tomador; nao e alterado na edicao.
    this.form.controls.cpfCnpj.disable();
    this.editing.set(tomador);
  }

  protected closeForm(): void {
    this.editing.set(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: TomadorRequest = {
      ...value,
      cpfCnpj: digitsOnly(value.cpfCnpj),
      uf: value.uf.toUpperCase(),
      cep: digitsOnly(value.cep),
    };

    const current = this.editing();
    const operation$ =
      current && current !== 'new' ? this.api.update(current.id, request) : this.api.create(request);

    this.isSaving.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.editing.set(null);
        void Swal.fire({
          icon: 'success',
          title: current === 'new' ? 'Tomador cadastrado.' : 'Tomador atualizado.',
          timer: 1800,
          showConfirmButton: false,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        void Swal.fire({ icon: 'error', title: 'Erro ao salvar tomador', text: this.errorText(error) });
      },
    });
  }

  protected async confirmDelete(tomador: TomadorResponse): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Excluir tomador?',
      text: `${tomador.razaoSocial} (${this.formatCpfCnpj(tomador.cpfCnpj)})`,
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });
    if (!result.isConfirmed) {
      return;
    }

    this.api
      .delete(tomador.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.items().length === 1 && this.page() > 1) {
            this.page.update((p) => p - 1);
          }
          this.load();
        },
        error: (error: unknown) =>
          void Swal.fire({ icon: 'error', title: 'Erro ao excluir tomador', text: this.errorText(error) }),
      });
  }

  protected isInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected formatCpfCnpj(value: string): string {
    const d = digitsOnly(value);
    if (d.length === 14) {
      return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (d.length === 11) {
      return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return value;
  }

  protected formatEndereco(t: TomadorResponse): string {
    const rua = [t.tipoLogradouro, t.logradouro].filter(Boolean).join(' ');
    const linha = [rua, t.numero].filter(Boolean).join(', ');
    const cidade = [t.bairro, t.uf].filter(Boolean).join(' - ');
    return [linha, cidade].filter(Boolean).join(' | ') || '-';
  }

  private load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.api
      .search(this.query(), this.page(), PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.items.set([]);
          this.totalCount.set(0);
          this.errorMessage.set(this.errorText(error));
          this.isLoading.set(false);
        },
      });
  }

  private errorText(error: unknown): string {
    return error instanceof NfseApiError ? error.message : 'Erro inesperado.';
  }
}
