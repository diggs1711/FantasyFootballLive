import { Injectable } from '@angular/core';
import League from 'src/app/Models/League';
import { HttpRequestService } from '../HttpRequestService/http-request.service';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import Team from 'src/app/Models/Team';
import { FantasyPlayerService } from '../FantasyPlayerService/fantasy-player.service';
import { StaticDataService } from '../StaticData/static.data.service';
import { LiveDataService } from '../LiveData/live.data.service';

@Injectable({
	providedIn: 'root'
})
export class LeaguesService {
	constructor(
		private staticDataService: StaticDataService,
		private httpRequestService: HttpRequestService,
		private fantasyPlayerService: FantasyPlayerService,
		private LiveDataService: LiveDataService
	) {}

	async getLeague(id: number): Promise<League> {
		const leagueData = await this.httpRequestService.getData(
			`https://fantasy.premierleague.com/drf/leagues-classic-standings/${id}`
		);

		const currentGameweek = await this.staticDataService.getCurrentGameweek();
		const liveData = await this.LiveDataService.getLiveData(currentGameweek);

		return Promise.all(
			leagueData.standings.results.map((player: any) =>
				this.fantasyPlayerService.createPlayer(player.entry, liveData).catch(() => undefined)
			)
		).then((members) => {
			const newLeague = new League(leagueData.league.id, leagueData.league.name, 0, members);
			return newLeague;
		});
	}
}
