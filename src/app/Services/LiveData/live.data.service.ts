import { Injectable } from '@angular/core';
import { FplDataService } from '../FplData/fpl-data.service';

@Injectable({
	providedIn: 'root'
})
export class LiveDataService {
	constructor(private fplDataService: FplDataService) {}

	async getLiveData(gameweek) {
		return await this.fplDataService.getData(`https://fantasy.premierleague.com/drf/event/${gameweek}/live`);
	}
}
