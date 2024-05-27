import { Component, OnDestroy, OnInit } from '@angular/core';

import { TableComponent } from '../../shared/components/table/table.component';
import { IPageData } from '../../shared/interfaces/page-data.interface';
import { ApiService } from '../../shared/services/api.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { SharedService } from '../../shared/services/shared.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [TableComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
	pageData: IPageData = {
		title: 'Últimos Cadastros',
		isRegister: false,
		isReport: false,
		showContent: true,
		data: [],
		type: 'clients'
	};
	dataCount!: number;
	monthlyCount!: number;
	inactiveCount!: number;

	searchQuerySubscription: Subscription;
	searchQuery: string = '';

	constructor(
		private apiService: ApiService,
		private paginationService: PaginationService,
		private sharedService: SharedService
	) {
		this.searchQuerySubscription = this.sharedService.getSearchQuery().subscribe((query) => {
			this.searchQuery = query;
			this.loadClients();
		});
	}

	ngOnInit(): void {
		this.paginationService.setFirstPage();
		this.loadClients();
	}

	ngOnDestroy(): void {
		this.searchQuerySubscription.unsubscribe();
	}

	loadClients(): void {
		this.apiService.getClients(this.paginationService.currentPage, this.paginationService.pageSize, this.searchQuery).subscribe({
			next: (data) => {
				this.pageData.data = data.clients;
				this.paginationService.dataCount = data.clientCount;
				this.getDataCount();
				this.getMonthlyCount();
				this.getInactiveCount();
			},
			error: (error) => {
			}
		});
	}

	getMonthlyCount() {
		this.apiService.getMonthlyClientCount().subscribe({
			next: (data) => {
				this.monthlyCount = data.monthlyClientCount;
			},
			error: (error) => {
			}
		});
	}

	getInactiveCount() {
		this.apiService.getInactiveClientCount().subscribe({
			next: (data) => {
				this.inactiveCount = data.inactiveClientCount;
			},
			error: (error) => {
			}
		});
	}

	getDataCount() {
		if (this.searchQuery === '') {
			return this.dataCount = this.paginationService.dataCount;
		} else {
			return this.dataCount;
		}
	}

	loadPreviousPage(): void {
		this.paginationService.loadPreviousPage(() => this.loadClients());
	}

	loadNextPage(): void {
		this.paginationService.loadNextPage(() => this.loadClients());
	}

	changePageSize(newSize: number): void {
		this.paginationService.changePageSize(newSize, () => this.loadClients());
	}
}
