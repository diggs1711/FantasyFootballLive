import { Component } from '@angular/core';
import { FplDataService } from '../Services/FplData/fpl-data.service';
import { Storage } from '@ionic/storage';
import FantasyPlayer from '../Models/FantasyPlayer';

@Component({
	selector: 'app-myTeam',
	templateUrl: 'myTeam.page.html',
	styleUrls: [ 'myTeam.page.scss' ]
})
export class MyTeamPage {
	fantasyPlayerId: any;
	fplId: string;
	fantasyPlayer: FantasyPlayer;
	readonly fplIdKey = 'fplId';

	constructor(private fplDataService: FplDataService, private storage: Storage) {
		this.fplId = '';
		this.fantasyPlayerId = null;
		this.init();
		this.login();
	}

	async init() {
		this.fantasyPlayerId = (await this.loadStoredId()) || null;
	}

	async loadStoredId() {
		return await this.storage.get(this.fplIdKey);
	}

	onTeamIdEntered(id) {
		this.fantasyPlayerId = id;
		this.fplId = '';
		this.storage.set(this.fplIdKey, this.fantasyPlayerId);
	}

	addLeaguesFromId(playerId) {
		// this.fplDataService
		// 	.getData(`https://fantasy.premierleague.com/drf/leagues-entered/${playerId}`)
		// 	.then((data) => {
		// 		const classicLeagues = data.classic;
		// 		classicLeagues.map((league) => {
		// 			if (!this.isLeaguePresent(league)) {
		// 				this.persistLeague(league.id, league.name);
		// 			}
		// 		});
		// 	});
	}

	login() {
		// console.log('login');
		// fetch('https://fantasy.premierleague.com/', {
		// 	credentials: 'include',
		// 	mode: 'no-cors',
		// 	method: 'GET',
		// 	headers: {
		// 		'Access-Control-Allow-Origin': '*'
		// 	}
		// }).then((resp) => {
		// 	console.log(resp);
		// });
		// 	fetch('https://users.premierleague.com/accounts/login/', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/x-www-form-urlencoded'
		// 		},
		// 		mode: 'no-cors',
		// 		credentials: 'include',
		// 		body:
		// 			'csrfmiddlewaretoken=AkElC8S1CHQe6W1FU3GdTouKK6pzrTCo&login=davidhiggins1712%40gmail.com&password=matchy123*'
		// 	})
		// 		.then(function(response) {
		// 			console.log(response);
		// 		})
		// 		.then(function(myJson) {
		// 			console.log(JSON.stringify(myJson));
		// 		});
		// }
	}
}
