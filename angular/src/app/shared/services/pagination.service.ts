import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class PaginationService {
	currentPage = 1;
	pageSize = 20;
	dataCount = 0;
	searchQuery = '';

	constructor() { }

	setFirstPage(): void {
		this.currentPage = 1;
	}

	loadPreviousPage(loadDataCallback: () => void): void {
		if (this.currentPage > 1) {
			this.currentPage--;
			loadDataCallback();
		}
	}

	loadNextPage(loadDataCallback: () => void): void {
		if (this.currentPage < Math.ceil(this.dataCount / this.pageSize)) {
			this.currentPage++;
			loadDataCallback();
		}
	}

	changePageSize(newSize: number, loadDataCallback: () => void): void {
		this.pageSize = newSize;
		loadDataCallback();
	}

	get totalPages(): number {
		return Math.ceil(this.dataCount / this.pageSize);
	}
}
