import { Injectable } from '@angular/core';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { HttpRequestService } from '../HttpRequestService/http-request.service';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root'
})
export class SoccerPlayerService {
	players: SoccerPlayer[];
	constructor(private HttpRequestService: HttpRequestService, private storage: Storage) {}

	async getPlayerData(id: number) {
		return this.HttpRequestService.getData(`https://fantasy.premierleague.com/drf/element-summary/${id}`);
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
