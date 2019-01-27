import { Injectable } from '@angular/core';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import { Storage } from '@ionic/storage';
import { FantasyPlayerService } from '../FplTeamService/fantasy-player.service';

@Injectable({
	providedIn: 'root'
})
export class MainUserService {
	user: FantasyPlayer;
	userLeaguesKey: string = 'user-leagues';
	userKey: string = 'user';

	constructor(private storage: Storage, private fantasyPlayerService: FantasyPlayerService) {}

	async loadSavedUser() {
		return await this.storage.get(this.userKey).then((user) => {
			this.user = user;
		});
	}

	async createUser(id) {
		return await this.fantasyPlayerService.createPlayer(id).then((user) => {
			this.user = user;
			this.storage.set(this.userKey, user);
		});
	}
}
