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

	closeModal(leagueId, teamId) {
		this.modalController.dismiss({
			leagueId: leagueId,
			teamId: teamId
		});
	}

	addLeague(leagueId, teamId) {
		if (!leagueId && !teamId) {
			return alert('No League Entered');
		}
		this.leagueId = '';
		this.teamId = '';
		this.closeModal(leagueId, teamId);
	}
}
