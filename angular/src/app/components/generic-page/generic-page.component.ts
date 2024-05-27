import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs';

import { TableComponent } from '../../shared/components/table/table.component';
import { IPageData } from '../../shared/interfaces/page-data.interface';
import { PaginationService } from '../../shared/services/pagination.service';
import { SharedService } from '../../shared/services/shared.service';
import { GenericPageService } from './generic-page.service';

@Component({
	selector: 'app-generic-page',
	standalone: true,
	imports: [RouterOutlet, TableComponent],
	templateUrl: './generic-page.component.html',
	styleUrls: ['./generic-page.component.css'],
})
export class GenericPageComponent implements OnInit, OnDestroy {
	pageData!: IPageData;
	dataCount!: number;
	private dataUpdateSubscription?: Subscription;

	searchQuerySubscription: Subscription;
	searchQuery: string = '';

	constructor(
		private genericPageService: GenericPageService,
		private paginationService: PaginationService,
		private sharedService: SharedService
	) {
		this.searchQuerySubscription = this.sharedService.getSearchQuery().subscribe((query) => {
			this.searchQuery = query;
			this.loadData();
		});
	}

	ngOnInit(): void {
		this.genericPageService.initialize();
		this.updatePageData();

		this.dataUpdateSubscription = this.genericPageService.dataUpdate$.subscribe(() => {
			this.updatePageData();
		});
	}

	ngOnDestroy(): void {
		this.dataUpdateSubscription?.unsubscribe();
		this.searchQuerySubscription.unsubscribe();
	}

	private updatePageData(): void {
		this.pageData = this.genericPageService.getPageData();
		this.dataCount = this.paginationService.dataCount;
	}

	loadPreviousPage(): void {
		this.paginationService.loadPreviousPage(() => this.loadData());
	}

	loadNextPage(): void {
		this.paginationService.loadNextPage(() => this.loadData());
	}

	changePageSize(newSize: number): void {
		this.paginationService.changePageSize(newSize, () => this.loadData());
	}

	private loadData(): void {
		this.genericPageService.loadData(this.searchQuery);
	}
}
