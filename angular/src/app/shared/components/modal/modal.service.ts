import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { ModalComponent } from './modal.component';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Injectable({
	providedIn: 'root'
})
export class ModalService {
	private modalStack: ComponentRef<ModalComponent>[] = [];
	private modalSubject = new Subject<any>();

	constructor(
		private router: Router,
		private sharedService: SharedService
	) { }

	openModal(viewContainerRef: ViewContainerRef, modalTitle: string, modalContent: string, deleteClient: boolean = false, onlyClose: boolean = false, isTokenExpirationWarning: boolean = false): Observable<string | void> {
		if (isTokenExpirationWarning) {
			this.closeTokenExpirationWarningModal();
		}

		const componentRef = viewContainerRef.createComponent(ModalComponent);
		componentRef.instance.title = modalTitle;
		componentRef.instance.content = this.formatContent(modalContent);
		componentRef.instance.deleteClient = deleteClient;
		componentRef.instance.onlyClose = onlyClose;
		componentRef.instance.isTokenExpirationWarning = isTokenExpirationWarning;

		const closeSubject = new Subject<string | void>();

		componentRef.instance.closeEvent.subscribe(() => {
			this.closeModal(componentRef);
			closeSubject.complete();
		});

		componentRef.instance.confirmEvent.subscribe(() => {
			this.confirmModal(closeSubject);
			this.closeModal(componentRef);
		});

		componentRef.instance.editEvent.subscribe(() => {
			this.closeModal(componentRef);
			this.navigateToEditPage(modalContent);
		});

		this.modalStack.push(componentRef);

		if (this.modalStack.length === 1) {
			document.addEventListener('keydown', this.handleEscKeyPress);
		}

		return closeSubject.asObservable();
	}

	closeModal(componentRef: ComponentRef<ModalComponent>) {
		const index = this.modalStack.indexOf(componentRef);
		if (index !== -1) {
			componentRef.destroy();
			this.modalStack.splice(index, 1);

			if (this.modalStack.length === 0) {
				document.removeEventListener('keydown', this.handleEscKeyPress);
			}
		}
	}

	navigateToEditPage(editData: any) {
		if (editData) {
			this.sharedService.setEditData(editData);
			this.router.navigate(['/edit-register']);
		}
	}

	handleEscKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && this.modalStack.length > 0) {
			const lastModal = this.modalStack[this.modalStack.length - 1];
			this.closeModal(lastModal);
		}
	};

	confirmModal(closeSubject: Subject<string | void>) {
		closeSubject.next('confirm');
		closeSubject.complete();
	}

	getModalObservable() {
		return this.modalSubject.asObservable();
	}

	openModalApp(title: string, content: string, expiration: boolean = false) {
		this.modalSubject.next({ title, content, expiration });
	}

	closeTokenExpirationWarningModal(): void {
		const tokenExpirationWarningModal = this.modalStack.find(modal => modal.instance.isTokenExpirationWarning);
		if (tokenExpirationWarningModal) {
			this.closeModal(tokenExpirationWarningModal);
		}
	}

	formatContent(content: string): string {
		try {
			const data = JSON.parse(content);
			let formattedContent = '';
			for (const key in data) {
				if (data.hasOwnProperty(key) && key !== 'id' && key !== 'removed' && key !== 'client' && key !== 'userId') {
					const formattedKey = this.formatPropertyName(key);
					formattedContent += `${formattedKey}: ${this.formatPropertyValue(key, data[key])}\n`;
				}
			}
			return formattedContent;
		} catch (error) {
			return content;
		}
	}

	formatPropertyName(key: string): string {
		let lowerCaseKey = key.toLowerCase();

		switch (lowerCaseKey) {
			case 'status':
				return 'Status';
			case 'name':
				return 'Nome';
			case 'age':
				return 'Idade';
			case 'email':
				return 'E-mail';
			case 'address':
				return 'Endereço';
			case 'otherinformation':
				return 'Outras Informações';
			case 'interests':
				return 'Interesses';
			case 'feelings':
				return 'Sentimentos';
			case 'values':
				return 'Valores';
			case 'creationdate':
				return 'Data de criação';
			case 'action':
				return 'Ação';
			case 'details':
				return '\nDetalhes';
			case 'timestamp':
				return 'Data de registro';
			case 'clientid':
				return 'ID do Usuário';
			default:
				return key;
		}
	}

	formatPropertyValue(key: string, value: any): string {
		if (key === 'clientId' && value === null) {
			return 'Não aplicável';
		}
		if (key === 'timestamp') {
			return new Date(value).toLocaleString();
		} else if (key === 'CreationDate' || key === 'creationDate') {
			const dateParts = value.split('T')[0].split('-');
			return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
		} else if (key === 'details') {
			try {
				const detailsObj = JSON.parse(value);
				let formattedDetails = '';
				if (detailsObj.OldClient) {
					formattedDetails += `\n${this.formatClientDetails(detailsObj.OldClient, false)}`;
				}
				if (detailsObj.NewClient) {
					formattedDetails += `\n${this.formatClientDetails(detailsObj.NewClient, true)}`;
				}
				if (detailsObj.ActionDetails && !detailsObj.NewClient && !detailsObj.OldClient) {
					formattedDetails += `\n${detailsObj.ActionDetails}`;
				}
				return formattedDetails;
			} catch (error) {
				return value;
			}
		}
		return value;
	}

	formatClientDetails(client: any, isNewClient: boolean): string {
		const formattedClient = Object.entries(client).map(([key, value]) => {
			if (key !== 'Id' && key !== 'Removed' && key !== 'client' && key !== 'userId') {
				return `${this.formatPropertyName(key)}: ${this.formatPropertyValue(key, value)}`;
			} else {
				return '';
			}
		}).join('\n');

		const clientType = isNewClient ? 'Dados novos' : 'Dados antigos';
		return `${this.formatPropertyName(clientType)}: ${formattedClient}`;
	}
}
