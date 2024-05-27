import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_, state) => {
	const router = inject(Router);
	const authService = inject(AuthService);
	const isLoginPage = state.url === '/login';
	const isAuthenticated = authService.isAuthenticated;

	if (!isAuthenticated && !isLoginPage) {
		return router.createUrlTree(['login']);
	} else if (isAuthenticated && isLoginPage) {
		return router.createUrlTree(['home']);
	}

	return true;
};
