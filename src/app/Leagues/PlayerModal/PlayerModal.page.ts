import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';

@Component({
	selector: 'app-my-modal',
	templateUrl: './player-modal.html',
	styleUrls: [ './player-modal.page.scss' ]
})
export class PlayerModal {
	playerData: any;
	playerPicks: any;
	gamePlayers: any;
	liveFplData: any;

	constructor(public navParams: NavParams, private modalController: ModalController) {
		this.playerData = navParams.get('picks');
		this.gamePlayers = navParams.get('players');
		this.liveFplData = navParams.get('liveData');
		this.playerPicks = [];
		this.displayPicks(this.playerData);
	}

	displayPicks(picks) {
		for (const pick of picks.picks) {
			this.playerPicks.push({
				name: this.getPlayerName(pick.element),
				points: this.getPlayerPoints(pick.element)
			});
		}
	}

	getPlayerPoints(id) {
		return this.liveFplData[id]['stats']['total_points'];
	}

	getPlayerName(playerId) {
		return this.gamePlayers.find((player) => player.id === playerId).web_name;
	}

	closeModal() {
		this.modalController.dismiss();
	}
} //End of Class
