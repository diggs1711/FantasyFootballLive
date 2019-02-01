import { Injectable } from '@angular/core';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import { Storage } from '@ionic/storage';
import { FantasyPlayerService } from '../FantasyPlayerService/fantasy-player.service';
import { StaticDataService } from '../StaticData/static.data.service';
import { LiveDataService } from '../LiveData/live.data.service';

@Injectable({
	providedIn: 'root'
})
export class MainUserService {
	user: FantasyPlayer;
	userLeaguesKey: string = 'user-leagues';
	userKey: string = 'user';

	constructor(
		private storage: Storage,
		private fantasyPlayerService: FantasyPlayerService,
		private liveDataService: LiveDataService,
		private staticDataService: StaticDataService
	) {}

	async loadSavedUser() {
		return await this.storage.get(this.userKey).then((user) => {
			this.user = user;
		});
	}

	async createUser(id: number) {
		const gameweek = await this.staticDataService.getCurrentGameweek();
		const liveData = await this.liveDataService.getLiveData(gameweek);

		return await this.fantasyPlayerService.createPlayer(id, liveData).then((user) => {
			this.user = user;
			this.storage.set(this.userKey, user);
		});
	}

	async updateUser(id: number) {
		//just re create user to get live data
		await this.createUser(id);
	}
}
