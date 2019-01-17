import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'app-my-modal',
	templateUrl: './input-modal.html',
	styleUrls: [ './input-modal.page.scss' ]
})
export class InputLeagueModal {
	leagueId: string;
	teamId: string;
	constructor(private modalController: ModalController) {}

	closeModal(leagueId) {
		this.modalController.dismiss({
			leagueId: leagueId
		});
	}

	addLeague(leagueId) {
		if (leagueId) {
			this.leagueId = '';
			this.closeModal(leagueId);
		}
	}
}
