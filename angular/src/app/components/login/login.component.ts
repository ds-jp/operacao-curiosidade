import { DOCUMENT, NgClass, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../shared/guards/auth.service';
import { FormService } from '../../shared/services/form.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [ReactiveFormsModule, NgIf, NgClass],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
	@ViewChild('themeToggle') themeToggle!: ElementRef;

	loginForm: FormGroup;
	errorMessage!: string;
	formError: boolean = false;

	constructor(
		private router: Router,
		private authService: AuthService,
		private fb: FormBuilder,
		private formService: FormService,
		private renderer: Renderer2,
		@Inject(DOCUMENT) private document: Document
	) {
		this.loginForm = this.fb.group({
			email: ['', [Validators.required, Validators.email, Validators.maxLength(225)]],
			password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(23)]]
		});
	}

	ngAfterViewInit() {
		const theme = this.document.body.getAttribute('data-theme');
		if (theme)
			this.themeToggle.nativeElement.checked = (theme === 'dark');
	}

	onThemeChange(event: any) {
		if (event.target.checked) {
			this.renderer.setAttribute(this.document.body, 'data-theme', 'dark');
		} else {
			this.renderer.removeAttribute(this.document.body, 'data-theme');
		}
	}

	isInvalid(fieldName: string): boolean {
		return this.formService.isInvalid(this.loginForm, fieldName);
	}

	getErrorMessage(fieldName: string): string {
		return this.formService.getErrorMessage(this.loginForm, fieldName);
	}

	getInputClasses(fieldName: string): { [key: string]: boolean; } {
		return this.formService.getInputClasses(this.loginForm, fieldName);
	}

	setFormError(message: string): void {
		this.formService.markAllFieldsAsTouched(this.loginForm);
		this.formError = true;
		this.errorMessage = message;
		setTimeout(() => {
			this.formError = false;
		}, 2000);
	}

	onSubmit(): void {
		this.formService.trimValues(this.loginForm);

		if (this.loginForm.valid) {
			const { email, password } = this.loginForm.value;

			this.authService.login(email, password).subscribe((loggedIn) => {
				if (loggedIn === 'Sucesso') {
					this.router.navigate(['/home']);
				} else {
					this.setFormError(loggedIn);
				}
			});
		} else {
			this.setFormError('Preencha todos os campos corretamente.');
		}
	}
}
