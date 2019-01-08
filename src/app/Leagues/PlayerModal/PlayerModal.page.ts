import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';

@Component({
	selector: 'app-my-modal',
	templateUrl: './player-modal.html',
	styleUrls: [ './player-modal.page.scss' ]
})
export class PlayerModal {
	playerData: any;
	goalkeepers: any;
	gamePlayers: any;
	liveFplData: any;
	playerInfo: any;
	defenders: any[];
	midfielders: any[];
	forwards: any[];
	positions: any;

	constructor(public navParams: NavParams, private modalController: ModalController) {
		this.playerData = navParams.get('picks');
		this.gamePlayers = navParams.get('players');
		this.liveFplData = navParams.get('liveData');
		this.playerInfo = navParams.get('player_info');
		this.goalkeepers = [];
		this.defenders = [];
		this.midfielders = [];
		this.forwards = [];
		this.positions = [ [], [], [], [], [], [] ];
		this.displayPicks(this.playerData);
	}

	displayPicks(picks) {
		for (const pick of picks.picks) {
			const type = this.getElementType(pick.element);
			if (pick.position < 12) {
				this.positions[type].push({
					name: this.getPlayerName(pick.element),
					points: this.getPlayerPoints(pick.element, pick.multiplier),
					photo:
						'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/110x140/' +
						'p' +
						this.getPhoto(pick.element),
					is_captain: pick.is_captain,
					is_vice_captain: pick.is_vice_captain
				});
			} else {
				this.positions[5].push({
					name: this.getPlayerName(pick.element),
					points: this.getPlayerPoints(pick.element, pick.multiplier),
					photo:
						'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/110x140/' +
						'p' +
						this.getPhoto(pick.element),
					is_captain: pick.is_captain,
					is_vice_captain: pick.is_vice_captain
				});
			}
		}
	}

	getPlayerPoints(id, multipler) {
		return this.liveFplData[id]['stats']['total_points'] * multipler;
	}

	getPlayerName(playerId) {
		return this.gamePlayers.find((player) => player.id === playerId).web_name;
	}

	getPhoto(playerId) {
		const photo = this.gamePlayers.find((player) => player.id === playerId).photo;
		return photo.replace(/jpg/gi, 'png');
	}

	getElementType(playerId) {
		return this.gamePlayers.find((player) => player.id === playerId).element_type;
	}

	getPosition(type) {
		switch (type) {
			case 1:
				return 'Goalkeepers';
				break;
			case 2:
				return 'Defenders';
				break;
			case 3:
				return 'Midfielders';
				break;
			case 4:
				return 'Forwards';
				break;
			case 5:
				return 'Bench';
				break;
			default:
				break;
		}
	}

	closeModal() {
		this.modalController.dismiss();
	}
} //End of Class
