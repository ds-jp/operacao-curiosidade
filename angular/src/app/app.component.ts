import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HeaderDesktopComponent } from './shared/components/header-desktop/header-desktop.component';
import { HeaderMobileComponent } from './shared/components/header-mobile/header-mobile.component';
import { ModalService } from './shared/components/modal/modal.service';
import { NavDesktopComponent } from './shared/components/nav-desktop/nav-desktop.component';
import { NavMobileComponent } from './shared/components/nav-mobile/nav-mobile.component';
import { AuthService } from './shared/guards/auth.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, HeaderDesktopComponent, NavDesktopComponent, HeaderMobileComponent, NavMobileComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
	isAuthenticated: boolean = false;

	constructor(
		private authService: AuthService,
		private router: Router,
		private modalService: ModalService,
		private viewContainerRef: ViewContainerRef
	) { }

	ngOnInit(): void {
		this.isAuthenticated = this.authService.isAuthenticated;
		this.authService.stopTokenExpirationTimer();
		this.authService.startTokenExpirationTimer();

		this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
			this.isAuthenticated = this.authService.isAuthenticated;
			this.authService.stopTokenExpirationTimer();
			this.authService.startTokenExpirationTimer();
		});

		this.modalService.getModalObservable().subscribe(({ title, content, expiration }) => {
			this.openModal(title, content, expiration);
		});
	}

	openModal(title: string, content: string, expiration: boolean = false): void {
		this.modalService.openModal(this.viewContainerRef, title, content, false, true, expiration)
			.subscribe((data) => {
				if (data) { }
			});
	};
}
