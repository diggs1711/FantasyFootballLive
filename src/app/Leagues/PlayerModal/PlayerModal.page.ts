import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device/ngx';

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
	currentGameweek: any;
	gameweekTransfers: any;
	showExpandedStats: boolean;
	showPlayerData: string;

	constructor(
		public navParams: NavParams,
		private modalController: ModalController,
		private http: HTTP,
		private testHttp: Http,
		private device: Device
	) {
		this.http = http;
		this.testHttp = testHttp;
		this.device = device;
		this.playerData = navParams.get('picks');
		this.gamePlayers = navParams.get('players');
		this.liveFplData = navParams.get('liveData');
		this.playerInfo = navParams.get('player_info');
		this.currentGameweek = navParams.get('gameweek');
		this.goalkeepers = [];
		this.defenders = [];
		this.midfielders = [];
		this.forwards = [];
		this.showPlayerData = 'gameweek';
		this.gameweekTransfers = [];
		this.showExpandedStats = true;
		this.positions = [ [], [], [], [], [], [] ];
		this.displayPicks(this.playerData);
		this.getTransfers(this.playerData.entry_history.entry);
	}

	//Need to extract into its own class
	getData(url): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, {}, {});
		}
		return this.testHttp.get(url).toPromise();
	}

	displayPicks(picks) {
		for (const pick of picks.picks) {
			const type = this.getElementType(pick.element);

			if (pick.position < 12) {
				this.positions[type].push({
					name: this.getPlayerName(pick.element),
					points: this.getPlayerPoints(pick.element, pick.multiplier),
					photo: '/assets/player_images/' + 'p' + this.getPhoto(pick.element),
					is_captain: pick.is_captain,
					is_vice_captain: pick.is_vice_captain
				});
			} else {
				this.positions[5].push({
					name: this.getPlayerName(pick.element),
					points: this.getPlayerPoints(pick.element, pick.multiplier),
					photo: '/assets/player_images/' + 'p' + this.getPhoto(pick.element),
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

	parseJsonData(data) {
		if (this.device.cordova) {
			return JSON.parse(data.data);
		}
		return data.json();
	}

	async getTransfers(playerId) {
		const transfersData = await this.getData(`https://fantasy.premierleague.com/drf/entry/${playerId}/transfers`);
		const parsedTranferData = this.parseJsonData(transfersData);
		const transfers = parsedTranferData.history;
		this.gameweekTransfers = transfers.filter((transfer) => {
			return transfer.event === this.currentGameweek;
		});

		this.gameweekTransfers = this.gameweekTransfers.map((transfer) => {
			return {
				player_out_name: this.getPlayerName(transfer.element_out),
				player_in_name: this.getPlayerName(transfer.element_in),
				player_in_cost: transfer.element_in_cost,
				player_out_cost: transfer.element_out_cost
			};
		});
		const c = transfers;
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
