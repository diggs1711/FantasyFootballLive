import { Injectable } from '@angular/core';
import { HttpRequestService } from '../HttpRequestService/http-request.service';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root'
})
export class StaticDataService {
	data: any;
	storageKey: string = 'bootstrap';
	updateKey: string = 'update-bootstrap-time';

	constructor(private httpRequestService: HttpRequestService, private storage: Storage) {}

	/**
	 * @Returns returns a promise containing bootstrap data
	 * @description returns current gameweek, soccer player data, prem team data, next gw fixtures
	 */

	async getBootstrapData() {
		//store bootstrap data until time of next gameweek begins
		return this.storage
			.get(this.updateKey)
			.then(async (time) => {
				//compare next deadline time to current date
				//if before deadline you can get old data otherwise update
				if (time && Date.now() <= new Date(time).getTime()) {
					return this.storage.get(this.storageKey);
				}
				//store user and delete unecessary stored data -> need to test first before implementing
				const user = await this.storage.get("user");
				await this.storage.clear();
				await this.storage.set("user", user)
				return this.httpRequestService.getData('https://fantasy.premierleague.com/drf/bootstrap-static');
			})
			.then((bootstrap) => {
				//make request
				this.data = bootstrap;
				const nextDeadline = bootstrap.next_event_fixtures[0]
					? bootstrap.next_event_fixtures[0].deadline_time
					: null;
				this.storage.set(this.updateKey, nextDeadline);
				this.storage.set(this.storageKey, this.data);
				return this.data;
			});

		//retrieve bootstrap data if it is stored
	}

	async getCurrentGameweek() {
		this.data = await this.getBootstrapData();
		return this.data['current-event'];
	}

	async getUpcomingFixtures() {
		this.data = await this.getBootstrapData();
		return this.data['next_event_fixtures'];
	}

	async getTeams() {
		this.data = await this.getBootstrapData();
		return this.data['teams'];
	}
}
