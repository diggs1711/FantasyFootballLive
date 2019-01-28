import { Injectable } from '@angular/core';
import { HttpRequestService } from '../HttpRequestService/http-request.service';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root'
})
export class StaticDataService {
	data: any;
	storageKey: string = 'bootstrap';

	constructor(private httpRequestService: HttpRequestService, private storage: Storage) {}

	/**
	 * @Returns returns a promise containing bootstrap data
	 * @description returns current gameweek, soccer player data, prem team data, next gw fixtures
	 */

	async getBootstrapData() {
		//retrieve bootstrap data if it is stored
		//make request
		this.data = await this.httpRequestService.getData('https://fantasy.premierleague.com/drf/bootstrap-static');
		this.storage.set(this.storageKey, this.data);
		return this.data;
	}

	async getCurrentGameweek() {
		this.data = await this.getBootstrapData();
		return this.data['current-event'];
	}
}
