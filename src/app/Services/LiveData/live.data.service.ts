import { Injectable } from '@angular/core';
import { HttpRequestService } from '../HttpRequestService/http-request.service';

@Injectable({
	providedIn: 'root'
})
export class LiveDataService {
	constructor(private httpRequestService: HttpRequestService) {}

	async getLiveData(gameweek) {
		return await this.httpRequestService.getData(`https://fantasy.premierleague.com/drf/event/${gameweek}/live`);
	}
}
