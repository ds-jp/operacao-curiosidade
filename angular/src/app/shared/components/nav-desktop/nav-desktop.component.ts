import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
	selector: 'app-nav-desktop',
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './nav-desktop.component.html',
	styleUrl: './nav-desktop.component.css'
})
export class NavDesktopComponent implements AfterViewInit {
	@ViewChild('themeToggle') themeToggle!: ElementRef;

	constructor(
		private renderer: Renderer2,
		@Inject(DOCUMENT) private document: Document,
		private apiService: ApiService,
	) {
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
