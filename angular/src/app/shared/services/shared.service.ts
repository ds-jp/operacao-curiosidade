import { Injectable } from '@angular/core';

import { Observable, Subject, debounceTime } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SharedService {
	private searchQuerySubject: Subject<string> = new Subject<string>();
	private printSubject: Subject<void> = new Subject<void>();
	private navSubject: Subject<void> = new Subject<void>();

	private editData: string | undefined;

	constructor() { }

	getCookie(name: string): string | null {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop()?.split(';').shift() || null;

		return null;
	}

	setSearchQuery(query: string): void {
		this.searchQuerySubject.next(query);
	}

	getSearchQuery(): Observable<string> {
		return this.searchQuerySubject.asObservable().pipe(
			debounceTime(250)
		);
	}

	setPrint(): void {
		this.printSubject.next();
	}

	getPrint(): Observable<void> {
		return this.printSubject.asObservable();
	}

	setNav(): void {
		this.navSubject.next();
	}

	getNav(): Observable<void> {
		return this.navSubject.asObservable();
	}

	setEditData(data: string | undefined): void {
		this.editData = data;
	}

	getEditData(): string | undefined {
		return this.editData;
	}
}
