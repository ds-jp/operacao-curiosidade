import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormService } from '../../shared/services/form.service';
import { SharedService } from '../../shared/services/shared.service';
import { Router } from '@angular/router';
import { ModalService } from '../../shared/components/modal/modal.service';

@Component({
	selector: 'app-new-register',
	standalone: true,
	imports: [ReactiveFormsModule, NgIf, NgClass],
	templateUrl: './register.component.html',
	styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
	editData: any;

	registerForm: FormGroup;
	errorMessage!: string;
	formError: boolean = false;

	constructor(
		private fb: FormBuilder,
		private formService: FormService,
		private sharedService: SharedService,
		private modalService: ModalService,
		private router: Router,
	) {
		this.registerForm = this.fb.group({
			status: [1],
			name: ['', [Validators.required, Validators.maxLength(225), Validators.pattern(/^[^\d]*$/)]],
			age: ['', [Validators.required, Validators.min(0), Validators.max(122)]],
			email: ['', [Validators.required, Validators.email, Validators.maxLength(225)]],
			address: ['', [Validators.required, Validators.maxLength(225)]],
			otherInformation: ['', [Validators.required, Validators.maxLength(225)]],
			interests: ['', [Validators.required, Validators.maxLength(225)]],
			feelings: ['', [Validators.required, Validators.maxLength(225)]],
			values: ['', [Validators.required, Validators.maxLength(225)]]
		});
	}

	ngOnInit(): void {
		this.editData = this.sharedService.getEditData();
		this.sharedService.setEditData(undefined);
		if (this.editData) {
			try {
				this.editData = JSON.parse(this.editData);

				this.editData.status === 'Ativo'
					? this.editData.status = 1
					: this.editData.status = 0;

				this.registerForm.patchValue(this.editData);
			} catch (error) {
			}
		} else {
			if (this.router.url.includes('edit-register'))
				this.router.navigate(['/new-register']);
		}
	}

	toggleStatus() {
		const statusControl = this.registerForm.get('status');
		if (statusControl instanceof FormControl)
			statusControl.setValue(statusControl.value === 1 ? 0 : 1);
	}

	isInvalid(fieldName: string): boolean {
		return this.formService.isInvalid(this.registerForm, fieldName);
	}

	getErrorMessage(fieldName: string): string {
		return this.formService.getErrorMessage(this.registerForm, fieldName);
	}

	getInputClasses(fieldName: string): { [key: string]: boolean; } {
		return this.formService.getInputClasses(this.registerForm, fieldName);
	}

	setFormError(): void {
		this.formService.markAllFieldsAsTouched(this.registerForm);
		this.formError = true;
		this.errorMessage = 'Preencha todos os campos corretamente.';
		setTimeout(() => {
			this.formError = false;
		}, 2000);
	}

	handleCreate() {
		const values = this.registerForm.value;

		values.status = values.status === 0 ? 1 : 0;

		this.formService.createClient(values).subscribe({
			next: () => {
				this.registerForm.reset();
				this.modalService.openModalApp('Sucesso!', 'Cadastro realizado com sucesso!');
				this.router.navigate(['/registration']);

			},
			error: (error: any) => {
				if (error.error.message.includes('E-mail já cadastrado'))
					this.registerForm.get('email')?.setErrors({ 'duplicateEmail': true });
				this.setFormError();
				this.errorMessage = 'Ocorreu um erro ao processar o formulário.';
			}
		});
	}

	handleUpdate() {
		let values = this.registerForm.value;

		values.status = values.status === 0 ? 1 : 0;
		values = { ...values, id: this.editData.id };

		this.formService.updateClient(values, this.editData.id).subscribe({
			next: () => {
				this.registerForm.reset();
				this.modalService.openModalApp('Sucesso!', 'Cadastro alterado com sucesso!');
				this.router.navigate(['/registration']);
			},
			error: (error: any) => {
				if (error.error.message.includes('E-mail já cadastrado'))
					this.registerForm.get('email')?.setErrors({ 'duplicateEmail': true });
				this.setFormError();
				this.errorMessage = 'Ocorreu um erro ao processar o formulário.';
			}
		});
	}

	onSubmit(): void {
		this.formService.trimValues(this.registerForm);

		if (this.registerForm.valid && !this.editData) {
			this.handleCreate();
		} else if (this.registerForm.valid && this.editData) {
			this.handleUpdate();
		} else {
			this.setFormError();
		}
	}

}
