import { Injectable } from '@angular/core';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { HttpRequestService } from '../HttpRequestService/http-request.service';
import { Storage } from '@ionic/storage';
import { StaticDataService } from '../StaticData/static.data.service';

@Injectable({
	providedIn: 'root'
})
export class SoccerPlayerService {
	players: SoccerPlayer[];
	constructor(
		private HttpRequestService: HttpRequestService,
		private storage: Storage,
		private staticDataService: StaticDataService
	) {}

	async getPlayerData(id: number) {
		return this.HttpRequestService.getData(`https://fantasy.premierleague.com/drf/element-summary/${id}`);
	}

	async getPlayerName(id: number) {
		return this.getPlayerDetails(id).then((player) => player.web_name);
	}

	async getPlayerPhoto(id: number) {
		return this.getPlayerDetails(id).then(
			(player) => '/assets/player_images/' + 'p' + player.photo.replace(/jpg/gi, 'png')
		);
	}

	getPlayerDetails(id: number) {
		return this.staticDataService.getBootstrapData().then(({ elements: players }) => {
			return players.find((player) => player.id === id);
		});
	}

	async getUpcomingFixtures(id: number) {
		// const key = `player-${id} gameweek-${gameweek}`;
		// const stored = await this.storage.get(key);
		// if (stored) return stored;
		const data = await this.getPlayerData(id);
		//this.storage.set(key, data['fixtures']);
		return data['fixtures'];
	}
}
