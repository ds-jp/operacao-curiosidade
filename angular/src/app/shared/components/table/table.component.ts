import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { IPageData } from '../../interfaces/page-data.interface';
import { ApiService } from '../../services/api.service';
import { PaginationService } from '../../services/pagination.service';
import { SharedService } from '../../services/shared.service';
import { ModalService } from '../modal/modal.service';

@Component({
	selector: 'app-table',
	standalone: true,
	imports: [RouterLink, NgFor, NgIf, JsonPipe],
	templateUrl: './table.component.html',
	styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
	@Input() pageData!: IPageData;
	@Input() dataCount!: number;

	@Output() nextPage = new EventEmitter<void>();
	@Output() previousPage = new EventEmitter<void>();
	@Output() pageSizeChange = new EventEmitter<number>();

	labels: string[] = [];
	keys: string[] = [];
	pageSize: number = this.paginationService.pageSize;

	constructor(
		private paginationService: PaginationService,
		private modalService: ModalService,
		private viewContainerRef: ViewContainerRef,
		private apiService: ApiService,
		private router: Router,
		private sharedService: SharedService
	) { }

	ngOnInit(): void {
		switch (this.pageData.type) {
			case 'clients':
				this.setClientTable();
				break;
			case 'reports':
				this.setReportTable();
				break;
			case 'logs':
				this.setLogTable();
				break;
			default:
				break;
		}
	}

	onPageSizeChange(event: Event): void {
		const selectElement = event.target as HTMLSelectElement;
		this.paginationService.setFirstPage();
		this.pageSizeChange.emit(Number(selectElement.value));
	}

	openModal(item: any): void {
		if (this.pageData.type !== 'reports') {
			this.modalService.openModal(
				this.viewContainerRef,
				`${this.pageData.type === 'clients' ? 'Usuário' : 'Registro'} ${item.id}`,
				JSON.stringify(item),
				false,
				this.pageData.type === 'clients' ? false : true)
				.subscribe((data) => {
					if (data && this.pageData.type === 'clients')
						this.apiService.deleteClient(item.id).subscribe({
							next: (data) => {
								this.modalService.openModalApp('Sucesso!', 'Cadastro exluído com sucesso!');
								this.sharedService.setSearchQuery('');
							}
						});
				});
		} else {
			this.router.navigate(['/report-details']);
		}
	}

	print() {
		this.sharedService.setPrint();
	}

	formatDateTime(dateTime: string): string {
		return new Date(dateTime).toLocaleString();
	}

	setClientTable(): void {
		this.labels = ['NOME', 'E-MAIL', 'STATUS'];
		this.keys = ['name', 'email', 'status'];
	};

	setReportTable(): void {
		this.labels = ['NOME'];
		this.keys = ['name'];
	};

	setLogTable(): void {
		this.labels = ['AÇÃO', 'USUÁRIO', 'DATA E HORA'];
		this.keys = ['action', 'client', 'timestamp'];
	}


	get currentPage(): number {
		return this.paginationService.currentPage;
	}

	get totalPages(): number {
		return this.paginationService.totalPages;
	}

	get isFirstPage(): boolean {
		return this.currentPage === 1;
	}

	get isLastPage(): boolean {
		return this.currentPage === this.totalPages;
	}
}
