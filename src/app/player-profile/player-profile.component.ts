import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { RequestDataService } from '../Services/FplData/fpl-data.service';
import { LiveDataService } from '../Services/LiveData/live.data.service';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';

@Component({
	selector: 'app-player-profile',
	templateUrl: './player-profile.component.html',
	styleUrls: [ './player-profile.component.scss' ]
})
export class PlayerProfileComponent implements OnInit {
	playerData: any;
	goalkeepers: any;
	gamePlayers: any;
	liveFplData: any;
	league_player_info: any;
	defenders: any[];
	midfielders: any[];
	forwards: any[];
	positions: any;
	currentGameweek: any;
	gameweekTransfers: any;
	showExpandedStats: boolean;
	showPlayerData: string;
	pointsBenched: number;
	playerId: any;
	playerPicks: any;
	captain: any;
	gameweekPoints: any;
	name: any;
	teamName: any;

	constructor(
		public navParams: NavParams,
		private modalController: ModalController,
		private fplDataService: RequestDataService,
		private liveDataService: LiveDataService
	) {
		this.playerId = navParams.get('playerId');
		this.currentGameweek = navParams.get('gameweek');
		this.playerPicks = navParams.get('picks');
		this.captain = navParams.get('captain');
		this.gameweekPoints = navParams.get('gameweekPoints');
		this.name = navParams.get('name');
		this.teamName = navParams.get('name');

		this.goalkeepers = [];
		this.defenders = [];
		this.midfielders = [];
		this.forwards = [];
		this.showPlayerData = 'team';
		this.gameweekTransfers = [];
		this.showExpandedStats = true;
		this.pointsBenched = 0;
		//need an array to store players so I can loop through them with ngFor
		// index 0 = goalkeepers, 1 = defenders ,......
		this.positions = [ [], [], [], [], [] ];
		this.liveFplData = this.liveDataService.getLiveData(this.currentGameweek);
		this.displayPicks(this.playerPicks);
		//this.getTransfers(this.playerData.entry_history.entry);
	}

	ngOnInit() {}

	displayPicks(picks: SoccerPlayer[]) {
		for (const pick of picks) {
			this.addPlayerToPositionMap(pick);
		}
	}

	getPosition(type: number) {
		const indx = Number(type);

		switch (indx) {
			case 0:
				return 'Goalkeepers';
				break;
			case 1:
				return 'Defenders';
				break;
			case 2:
				return 'Midfielders';
				break;
			case 3:
				return 'Forwards';
				break;
			case 4:
				return 'Bench';
				break;
			default:
				break;
		}
	}

	addPlayerToPositionMap(pick: SoccerPlayer) {
		//checks if player is on the starting or on the bench
		//position 5 signifies the bench
		const pos: number = pick.teamPosition < 12 ? pick.position_type : 5;
		if (pos == 5) this.pointsBenched += pick.gameweek_points;

		this.positions[pos - 1].push({
			name: pick.name,
			points: pick.gameweek_points,
			photo: pick.image,
			isCaptain: pick.isCaptain
			//is_vice_captain: pick.is_vice_captain
		});
	}

	async getTransfers(playerId) {
		const transfersData = await this.fplDataService.getData(
			`https://fantasy.premierleague.com/drf/entry/${playerId}/transfers`
		);
		const transfers = transfersData.history;
		this.gameweekTransfers = transfers.filter((transfer) => {
			return transfer.event === this.currentGameweek;
		});

		// this.gameweekTransfers = this.gameweekTransfers.map((transfer) => {
		// 	return {
		// 		player_out_name: this.getPlayerName(transfer.element_out),
		// 		player_in_name: this.getPlayerName(transfer.element_in),
		// 		photo_url_in: '/assets/player_images/' + 'p' + this.getPhoto(transfer.element_in),
		// 		photo_url_out: '/assets/player_images/' + 'p' + this.getPhoto(transfer.element_out),
		// 		player_in_cost: transfer.element_in_cost,
		// 		player_out_cost: transfer.element_out_cost
		// 	};
		// });
	}

	closeModal() {
		this.modalController.dismiss();
	}
} //End of Class
