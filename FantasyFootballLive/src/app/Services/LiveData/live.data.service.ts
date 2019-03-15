import { Injectable } from '@angular/core';
import { HttpRequestService } from '../HttpRequestService/http-request.service';

@Injectable({
	providedIn: 'root'
})
export class LiveDataService {
	data: any;
	constructor(private httpRequestService: HttpRequestService) {}

	async getLiveData(gameweek) {
		this.data = await this.httpRequestService.getData(
			`https://fantasy.premierleague.com/drf/event/${gameweek}/live`
		);

		return this.data;
	}

	async getLastestHistory(id: number) {
		const history = await this.httpRequestService.getData(`https://fantasy.premierleague.com/drf/entry/${id}/history`)
		return history.history.pop();
	}
}
