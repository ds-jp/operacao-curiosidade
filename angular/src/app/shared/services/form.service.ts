import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root'
})
export class FormService {

	constructor(
		private apiService: ApiService
	) { }

	trimValues(form: FormGroup): void {
		Object.keys(form.controls).forEach(key => {
			const control = form.get(key);
			if (control instanceof FormControl && typeof control.value === 'string') {
				const trimmedValue = control.value.trim().replace(/\s+/g, ' ');
				control.setValue(trimmedValue);
			} else if (control instanceof FormGroup) {
				this.trimValues(control);
			}
		});
	}

	isInvalid(form: FormGroup, fieldName: string): boolean {
		const field = form.get(fieldName);
		return !!field && (field.dirty || field.touched) && field.invalid;
	}

	getErrorMessage(form: FormGroup, fieldName: string): string {
		const field = form.get(fieldName) as AbstractControl;
		if (!field) return '';

		if (field.hasError('required')) {
			return 'Campo obrigatório*';
		} else if (field.hasError('minlength')) {
			return 'Campo deve ter no mínimo 08 caracteres';
		} else if (field.hasError('maxlength')) {
			if (fieldName === 'password') return 'Campo deve ter no máximo 23 caracteres';
			return 'Campo deve ter no máximo 225 caracteres';
		} else if (field.hasError('min') || field.hasError('max')) {
			return 'Idade deve estar entre 0 e 122';
		} else if (field.hasError('email')) {
			return 'E-mail deve ser um endereço de e-mail válido';
		} else if (field.hasError('pattern')) {
			if (/\d/.test(field.value))
				return 'O campo não deve conter números';
		} else if (field.hasError('duplicateEmail')) {
			return 'E-mail já está cadastrado.';
		}

		return '';
	}

	markAllFieldsAsTouched(form: FormGroup) {
		Object.keys(form.controls).forEach(field => {
			const control = form.get(field) as AbstractControl;
			if (control) {
				control.markAsTouched();
			}
		});
	}

	getInputClasses(form: FormGroup, fieldName: string): { [key: string]: boolean; } {
		const field = form.get(fieldName);
		if (!field) return {};

		return {
			'preencher': field.invalid && (field.dirty || field.touched),
			'preenchido': !(field.invalid && (field.dirty || field.touched))
		};
	}

	createClient(data: object) {
		return this.apiService.createClient(data);
	}

	updateClient(data: object, clientId: number) {
		return this.apiService.updateClient(data, clientId);
	}

	getEditData(): any {
		throw new Error('Method not implemented.');
	}
}
