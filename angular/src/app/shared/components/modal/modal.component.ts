import { Component, EventEmitter, Output, ViewContainerRef } from '@angular/core';
import { NgClass } from '@angular/common';

import { ModalService } from './modal.service';

@Component({
	selector: 'app-modal',
	standalone: true,
	imports: [NgClass],
	templateUrl: './modal.component.html',
	styleUrl: './modal.component.css'
})
export class ModalComponent {
	@Output() closeEvent = new EventEmitter<void>();
	@Output() editEvent = new EventEmitter<void>();
	@Output() confirmEvent = new EventEmitter<void>();
	title: string = 'Título do Modal';
	content: string = 'Conteúdo do Modal';
	deleteClient = false;
	onlyClose = false;
	isTokenExpirationWarning = false;

	constructor(
		private modalService: ModalService,
		private viewContainerRef: ViewContainerRef
	) { }

	closeModal() {
		this.closeEvent.emit();
	}

	onEdit() {
		this.editEvent.emit();
	}

	onConfirm() {
		this.confirmEvent.emit();
	}

	stopPropagation(event: MouseEvent) {
		event.stopPropagation();
	}

	openNewModal() {
		const modalTitle = 'Exclusão';
		const modalContent = 'Tem certeza que deseja excluir esse usuário?';
		this.modalService.openModal(this.viewContainerRef, modalTitle, modalContent, true)
			.subscribe(result => {
				if (result) this.onConfirm();
			});
	}
}
