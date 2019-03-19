import { Injectable } from '@angular/core';
import { HttpRequestService } from '../http-request/http-request.service';

@Injectable({
	providedIn: 'root'
})
export class LiveDataService {
	constructor(private httpRequestService: HttpRequestService) {}

	fetchData(gameweek) {
		return this.httpRequestService.getData(
			`https://fantasy.premierleague.com/drf/event/${gameweek}/live`
		);
	}
}
