import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, map, of, pipe, takeUntil, timer } from 'rxjs';

import { ModalService } from '../components/modal/modal.service';
import { ApiService } from '../services/api.service';
import { SharedService } from './../services/shared.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private destroy$ = new Subject<void>();

	private readonly cookieKey = 'authToken';
	private readonly cookieKeyEmail = 'email';

	constructor(
		private apiService: ApiService,
		private sharedService: SharedService,
		private modalService: ModalService,
		private router: Router
	) { }

	get isAuthenticated(): boolean {
		return this.getCookie(this.cookieKey) !== null;
	}

	login(email: string, password: string): Observable<string> {
		return this.apiService.login(email, password).pipe(
			map((data) => {
				this.setCookie(this.cookieKeyEmail, email, 60 * 60 - 15);
				this.setCookie(this.cookieKey, data.token, 60 * 60 - 15);
				return 'Sucesso';
			}),
			catchError((error) => {
				if (error.status === 401) {
					return of('Credenciais inválidas.');
				}
				return of('Erro de conexão. Tente novamente mais tarde.');
			})
		);
	}

	logout(): Observable<boolean> {
		return this.apiService.logout().pipe(
			map((data) => {
				this.deleteCookie(this.cookieKey);
				this.deleteCookie(this.cookieKeyEmail);

				return true;
			}),
			catchError((error) => {
				if (error.status === 401) {
					this.deleteCookie(this.cookieKey);
					this.deleteCookie(this.cookieKeyEmail);
				}
				return of(false);
			})
		);
	}

	startTokenExpirationTimer(): void {
		if (this.router.url.includes('/login'))
			return;

		if (this.isAuthenticated) {
			this.apiService.getUserExpiration().pipe(
				takeUntil(this.destroy$)
			).subscribe((data) => {
				const expirationDate = new Date(data.expiration);
				const now = new Date();
				const diff = expirationDate.getTime() - now.getTime() - 20 * 1000;

				if (diff > 0) {
					this.scheduleAlerts(diff);
				}
			});
		}
	}

	private scheduleAlerts(diff: number): void {
		this.destroy$.next();

		const timers = [5 * 60 * 1000, 4 * 60 * 1000, 3 * 60 * 1000, 2 * 60 * 1000, 1 * 60 * 1000, 0];

		timers.forEach(t => {
			if (diff > t) {
				if (t / 1000 / 60 == 0) {
					this.modalService.closeTokenExpirationWarningModal();
					this.logout();

					timer(diff - t).pipe(takeUntil(this.destroy$)).subscribe(() => {
						this.modalService.openModalApp('Aviso', 'Sua sessão expirou, faça o login novamente.', true);
					});
				} else {
					timer(diff - t).pipe(takeUntil(this.destroy$)).subscribe(() => {
						this.modalService.openModalApp('Aviso', `Sua sessão irá expirar em ${t / 1000 / 60} ${t / 1000 / 60 === 1 ? 'minuto' : 'minutos'} você precisará fazer o login novamente. Por favor, salve seu trabalho.`, true);
					});
				}
			}
		});

		timer(diff).pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.logout().subscribe((loggedOut) => {
				if (loggedOut) {
					this.router.navigate(['/login']);
				}
			});
		});
	}

	stopTokenExpirationTimer(): void {
		this.destroy$.next();
	}

	private getCookie(name: string): string | null {
		return this.sharedService.getCookie(name);
	}

	private setCookie(name: string, value: string, seconds: number): void {
		const expires = new Date(Date.now() + seconds * 1000).toUTCString();
		document.cookie = `${name}=${value}; expires=${expires}; path=/`;
	}

	private deleteCookie(name: string): void {
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	}
}
