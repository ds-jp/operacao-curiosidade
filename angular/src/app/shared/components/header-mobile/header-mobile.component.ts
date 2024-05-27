import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

import { AuthService } from '../../guards/auth.service';
import { SharedService } from '../../services/shared.service';

@Component({
	selector: 'app-header-mobile',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './header-mobile.component.html',
	styleUrl: './header-mobile.component.css'
})
export class HeaderMobileComponent {
	searchQuery: string = '';
	showSearchBar: boolean = true;
	searchBarPlaceholder: string = 'Pesquisar pelo nome...';
	logoText: string = 'menu';

	constructor(
		private router: Router,
		private authService: AuthService,
		private sharedService: SharedService
	) {
		this.sharedService.getSearchQuery().subscribe((query) => {
			this.searchQuery = query;
		});
	}

	ngOnInit(): void {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.logoText = 'menu';

				(event.url.includes('reports') || event.url.includes('register'))
					? this.showSearchBar = false
					: this.showSearchBar = true;

				(event.url.includes('logging'))
					? this.searchBarPlaceholder = 'Pesquisar pela ação...'
					: this.searchBarPlaceholder = 'Pesquisar pelo nome...';

				this.searchQuery = '';
			}
		});
	}

	showNav() {
		this.sharedService.setNav();
		this.logoText = this.logoText === 'menu' ? 'close' : 'menu';
	}

	onSearch(event: Event): void {
		if (event.target instanceof HTMLInputElement)
			this.sharedService.setSearchQuery(event.target.value);
	}

	logout(): void {
		this.authService.logout().subscribe((loggedOut) => {
			if (loggedOut) {
				this.router.navigate(['/login']);
			}
		});
	}
}
