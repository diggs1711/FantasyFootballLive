import { Injectable } from '@angular/core';

import { FantasyPlayerService } from '../fantasy-player/fantasy-player.service';
import { HttpRequestService } from '../http-request/http-request.service';
import League from 'src/app/Models/League';
import { LiveDataService } from '../live-data/live.data.service';
import { StaticDataService } from '../static-data/static.data.service';

@Injectable({
	providedIn: 'root'
})
export class LeaguesService {
	constructor(
		private staticDataService: StaticDataService,
		private httpRequestService: HttpRequestService,
		private fantasyPlayerService: FantasyPlayerService,
		private liveDataService: LiveDataService
	) {}

	async getLeague(id: number): Promise<League> {
		const leagueData = await this.httpRequestService.fetch(
			`https://fantasy.premierleague.com/drf/leagues-classic-standings/${id}`
		);

		const currentGameweek = await this.staticDataService.getCurrentGameweek();
		const liveData = await this.liveDataService.fetch(currentGameweek);

		return Promise.all(
			leagueData.standings.results.map((player: any) =>
				this.fantasyPlayerService
					.createPlayer(player.entry, liveData)
					.catch(() => undefined)
			)
		).then((members) => {
			const newLeague = new League(leagueData.league.id, leagueData.league.name, members);
			return newLeague;
		});
	}
}
