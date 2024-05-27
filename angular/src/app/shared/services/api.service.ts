import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';

import { environment } from '../../../environments/environment.development';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private apiUrl = environment.apiUrl;

	constructor(
		private http: HttpClient,
		private sharedService: SharedService
	) { }

	getClients(page: number = 1, pageSize: number = 20, clientName: string = ''): Observable<any> {
		const endpoint = 'Client';
		const params = { page, pageSize, clientName };

		return this.get(endpoint, params);
	}

	getReports(page: number = 1, pageSize: number = 20, reportName: string = ''): Observable<any> {
		const endpoint = reportName ? 'Report' : 'Report/search';
		const params = { page, pageSize, reportName };

		return this.get(endpoint, params);
	}

	getLogs(page: number = 1, pageSize: number = 20, search = ''): Observable<any> {
		const endpoint = 'Log';
		const params = { page, pageSize, search };

		return this.get(endpoint, params);
	}

	getMonthlyClientCount(): Observable<any> {
		return this.get('Client/monthlyCount');
	}

	getInactiveClientCount(): Observable<any> {
		return this.get('Client/inactiveCount');
	}

	login(email: string, password: string): Observable<any> {
		const endpoint = 'User/login';
		const data = { email, password };

		return this.post(endpoint, {}, data);
	}

	logout(): Observable<any> {
		return this.post('User/logout');
	}

	createClient(client: object = {}): Observable<any> {
		const endpoint = 'Client';

		return this.post(endpoint, {}, client);
	}

	updateClient(client: object = {}, clientId: number): Observable<any> {
		const endpoint = `Client/${clientId}`;

		return this.put(endpoint, {}, client);
	}

	deleteClient(clientId: number): Observable<any> {
		const endpoint = `Client/${clientId}`;

		return this.delete(endpoint, {});
	}

	getUserTheme() {
		const userEmail = this.getCookie('email');

		return this.get(`User/${userEmail}/theme`);
	}

	setUserTheme(theme: string) {
		const userEmail = this.getCookie('email');

		return this.put(`User/${userEmail}/theme`, {}, { theme });
	}

	getUserExpiration() {
		return this.get(`User/token/expiration`);
	}

	private getCookie(name: string): string | null {
		return this.sharedService.getCookie(name);
	}

	private urlAndParamsBuilder(endpoint: string, params: any = {}): { url: string, options: any; } {
		const url = `${this.apiUrl}/${endpoint}`;
		const httpParams = new HttpParams({ fromObject: params });

		let headers = new HttpHeaders();
		const authToken = this.getCookie('authToken');
		if (authToken) {
			headers = headers.set('Authorization', `Bearer ${authToken}`);
		}

		const options = { params: httpParams, headers };

		return { url, options };
	}

	private get(endpoint: string, params: any = {}): Observable<any> {
		const { url, options } = this.urlAndParamsBuilder(endpoint, params);

		return this.http.get(url, options);
	}

	private post(endpoint: string, params: any = {}, data: object = {}): Observable<any> {
		const { url, options } = this.urlAndParamsBuilder(endpoint, params);

		return this.http.post(url, data, options);
	}

	private put(endpoint: string, params: any = {}, data: object = {}): Observable<any> {
		const { url, options } = this.urlAndParamsBuilder(endpoint, params);

		return this.http.put(url, data, options);
	}

	private delete(endpoint: string, params: any = {}): Observable<any> {
		const { url, options } = this.urlAndParamsBuilder(endpoint, params);

		return this.http.delete(url, options);
	}
}
