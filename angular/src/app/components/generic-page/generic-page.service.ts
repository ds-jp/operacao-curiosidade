import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { IPageData } from '../../shared/interfaces/page-data.interface';
import { IUrlMap } from '../../shared/interfaces/url-map.interface';
import { ApiService } from '../../shared/services/api.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { SharedService } from '../../shared/services/shared.service';

@Injectable({
	providedIn: 'root',
})
export class GenericPageService {
	title!: string;
	isRegister: boolean | null = true;
	isReport: boolean | null = true;
	showContent: boolean | null = true;
	data: any[] = [];
	type!: string;

	private dataUpdateSubject = new Subject<void>();
	dataUpdate$ = this.dataUpdateSubject.asObservable();
	printSubscription: Subscription;

	private urlMap: IUrlMap = {
		'/registration': { title: 'Cadastro', type: 'clients', isRegister: true, isReport: false },
		'/reports': { title: 'Relatórios', type: 'reports', isRegister: false, isReport: false },
		'/report-details': { title: 'Detalhes do Relatório', type: 'clients', isRegister: false, isReport: true },
		'/logging': { title: 'Registros', type: 'logs', isRegister: false, isReport: false },
	};

	constructor(
		private router: Router,
		private apiService: ApiService,
		private paginationService: PaginationService,
		private sharedService: SharedService
	) {
		this.printSubscription = this.sharedService.getPrint().subscribe(() => {
			let pageSize = this.paginationService.pageSize;
			this.paginationService.pageSize = this.paginationService.dataCount;
			this.loadData('', true);
			this.paginationService.pageSize = pageSize;
		});
	}

	initialize(): void {
		this.showContent = !this.router.url.includes('register');
		this.checkIfNewRegister();
		if (this.showContent) {
			this.setData();
			this.setFirstPage();
		}
	}

	private setFirstPage(): void {
		this.paginationService.setFirstPage();
		this.loadData();
	}

	getPageData(): IPageData {
		return {
			title: this.title,
			isRegister: this.isRegister,
			isReport: this.isReport,
			showContent: this.showContent,
			data: this.data,
			type: this.type,
		};
	}

	private checkIfNewRegister(): void {
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				map((event) => event as NavigationEnd)
			)
			.subscribe((event: NavigationEnd) => {
				this.showContent = !event.url.includes('register');
			});
	}

	private setData(): void {
		const currentUrl = this.router.url;
		const map = Object.keys(this.urlMap).find((url) => currentUrl.startsWith(url));

		if (map) {
			const { title, type, isRegister, isReport } = this.urlMap[map];
			this.title = title;
			this.type = type;
			this.isRegister = isRegister;
			this.isReport = isReport;
		}
	}

	private getApiCall(searchQuery: string = '') {
		switch (this.type) {
			case 'clients':
				return this.apiService.getClients(
					this.paginationService.currentPage,
					this.paginationService.pageSize,
					searchQuery
				);
			case 'reports':
				return this.apiService.getReports(
					this.paginationService.currentPage,
					this.paginationService.pageSize,
					searchQuery
				);
			case 'logs':
				return this.apiService.getLogs(
					this.paginationService.currentPage,
					this.paginationService.pageSize,
					searchQuery
				);
			default:
				return;
		}
	}

	private getCountFromApiResponse(data: any): number {
		return this.type === 'logs' ? data.logCount : (this.type === 'reports' ? data.reportCount : data.clientCount);
	}

	private getDataTypeFromApiResponse(data: any): any[] {
		return this.type === 'logs' ? data.logs : (this.type === 'reports' ? data.reports : data.clients);
	}

	loadData(searchQuery: string = '', print: boolean = false): void {
		const apiCall = this.getApiCall(searchQuery);

		apiCall?.subscribe({
			next: (data) => {
				const count = this.getCountFromApiResponse(data);
				const dataType = this.getDataTypeFromApiResponse(data);

				this.data = dataType;
				this.paginationService.dataCount = count;

				this.dataUpdateSubject.next();

				if (print) {
					setTimeout(() => {
						window.print();
						this.loadData();
					}, 200);
				}
			},
			error: (error) => {
			},
		});
	}
}
