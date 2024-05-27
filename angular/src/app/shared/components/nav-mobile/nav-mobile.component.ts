import { DOCUMENT, NgClass } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';

@Component({
	selector: 'app-nav-mobile',
	standalone: true,
	imports: [RouterLink, RouterLinkActive, NgClass],
	templateUrl: './nav-mobile.component.html',
	styleUrl: './nav-mobile.component.css'
})
export class NavMobileComponent {
	showNav: boolean = false;
	@ViewChild('themeToggle') themeToggle!: ElementRef;

	constructor(
		private renderer: Renderer2,
		@Inject(DOCUMENT) private document: Document,
		private apiService: ApiService,
		private sharedService: SharedService,
		private router: Router
	) {
		this.sharedService.getNav().subscribe(() => {
			this.showNav = this.showNav ? false : true;
		});

		this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
			this.showNav = false;
		});
	}

	ngAfterViewInit() {
		this.getTheme();
	}

	getTheme() {
		this.apiService.getUserTheme().subscribe({
			next: (data) => {
				if (data.theme === 'light') {
					this.renderer.removeAttribute(this.document.body, 'data-theme');
				} else {
					this.renderer.setAttribute(this.document.body, 'data-theme', 'dark');
				}

				const theme = this.document.body.getAttribute('data-theme');
				if (theme)
					this.themeToggle.nativeElement.checked = (theme === 'dark');
			},
			error: (error) => {
			}
		});
	}

	onThemeChange(event: any) {
		if (event.target.checked) {
			this.apiService.setUserTheme('dark').subscribe({
				next: (data) => {
					this.getTheme();
				},
				error: (error) => {
				}
			});
		} else {
			this.apiService.setUserTheme('light').subscribe({
				next: (data) => {
					this.getTheme();
				},
				error: (error) => {
				}
			});
		}
	}
}
