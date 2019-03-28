import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import { FantasyPlayerService } from '../fantasy-player/fantasy-player.service';
import { FcmService } from '../Firebase/fcm.service';
import { LiveDataService } from '../live-data/live.data.service';
import { StaticDataService } from '../static-data/static.data.service';


@Injectable({
	providedIn: 'root'
})
export class MainUserService {
	public user: FantasyPlayer;
	private userKey = 'user';

	constructor(
		private storage: Storage,
		private fantasyPlayerService: FantasyPlayerService,
		private liveDataService: LiveDataService,
		private staticDataService: StaticDataService,
		private fcmService: FcmService
	) {}

	async loadSavedUser() {
		this.user = await this.storage.get(this.userKey);
		return this.user;
	}

	async getSavedUserId() {
		const user = await this.storage.get(this.userKey);
		return user.id;
	}

	/**
	 * @description creates the main user of the app
	 * @param id fpl id of user
	 */
	async createUser(id: number): Promise<FantasyPlayer> {
		const gameweek = await this.staticDataService.getCurrentGameweek();
		const liveData = await this.liveDataService.fetch(gameweek);

		return await this.fantasyPlayerService.createPlayer(id, liveData).then((user) => {
			this.user = user;
			this.storage.set(this.userKey, user);
			this.updateDeviceToken(this.user.id);
			return user;
		});
	}

	updateDeviceToken(id: number) {
		this.fcmService.getToken(id);
	}

	async updateUser(id: number) {
		// just re create user to get live data
		return await this.createUser(id);
	}

	getLivePoints() {

	}
}
