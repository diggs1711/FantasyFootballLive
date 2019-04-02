import { Injectable } from '@angular/core';
import League from 'src/app/Models/League';
import { FantasyPlayerService } from '../fantasy-player/fantasy-player.service';
import { HttpRequestService } from '../http-request/http-request.service';
import { LiveDataService } from '../live-data/live.data.service';
import { StaticDataService } from '../static-data/static.data.service';
import { SoccerPlayerService } from '../soccer-player/soccerplayer.service';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';

@Injectable({
	providedIn: 'root'
})
export class LeaguesService {
	constructor(
		private staticDataService: StaticDataService,
		private httpRequestService: HttpRequestService,
		private fantasyPlayerService: FantasyPlayerService,
		private liveDataService: LiveDataService,
		private soccerPlayerService: SoccerPlayerService
	) {}

	async getLeague(id: number): Promise<League> {
		const leagueData = await this.httpRequestService.fetch(
			`https://fantasy.premierleague.com/drf/leagues-classic-standings/${id}`
		);
		let currentGameweek = null,
			soccerPlayers = null;

		return Promise.all([
			this.staticDataService.getCurrentGameweek(),
			this.soccerPlayerService.getPlayers()
		])
			.then(([gameweek, players]) => {
				currentGameweek = gameweek;
				soccerPlayers = players;
				return this.liveDataService.fetch(currentGameweek);
			})
			.then((liveData) => {
				return Promise.all(
					leagueData.standings.results.map((player: any) =>
						this.fantasyPlayerService
							.createPlayer(player.entry, liveData, soccerPlayers, currentGameweek)
							.catch(() => {
								// create new player with just basic info
								const p = new FantasyPlayer();
								p.id = player.entry;
								p.name = player.entry_name;
								return p;
							})
					)
				);
			})
			.then((members: any[]) => {
				const membersMap = new Map();
				// create map for easy retrieval of memebrs
				for (const member of members) {
					if (member) {
						membersMap.set(member.id, member);
					}
				}
				const newLeague = new League(
					leagueData.league.id,
					leagueData.league.name,
					membersMap
				);
				return newLeague;
			});
	}
}
