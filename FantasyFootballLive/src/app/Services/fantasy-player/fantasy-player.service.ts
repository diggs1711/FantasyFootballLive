import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import { HttpRequestService } from '../http-request/http-request.service';
import { LiveDataService } from '../live-data/live.data.service';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { StaticDataService } from '../static-data/static.data.service';
import Team from 'src/app/Models/Team';

@Injectable({
	providedIn: 'root'
})
export class FantasyPlayerService {
	currentGameweek: any;
	bootstrapData: any;
	liveData: any;
	fantasyPlayerHistoryKey: string;

	constructor(
		private staticDataService: StaticDataService,
		private storage: Storage,
		private httpRequestService: HttpRequestService,
		private liveDataService: LiveDataService
	) {}

	async getCurrentGameweekData(id: number, gameweek: number) {
		const key = `current-gameweek-${id}-${gameweek}`;
		const stored = await this.storage.get(key);
		if (stored) return stored;

		const data = await this.httpRequestService
			.getData(this.composeCurrentGameweekInfoUrl(id, gameweek))
			.catch(() => undefined);
		this.storage.set(key, data);
		return data;
	}

	async getPlayerGameweekHistory(id: number, gameweek: number) {
		//use gameweek so it fetches new data when gameweek changes
		const key = `gameweek-history-${id}-${gameweek}`;
		const stored = await this.storage.get(key);
		if (stored) return stored;

		const data = await this.httpRequestService
			.getData(this.composePlayerGameweekHistoryUrl(id))
			.catch(() => undefined);
		this.storage.set(key, data);
		return data;
	}

	composePlayerGameweekHistoryUrl(playerId: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/history`;
	}

	/**
   * 
   * @param id fpl id from user input
   * @description get all data needed to display and current live score
   */
	async createPlayer(id: number, liveData: any): Promise<FantasyPlayer> {
		if (!this.currentGameweek) this.currentGameweek = await this.staticDataService.getCurrentGameweek();
		this.liveData = liveData;

		let [ gameweekData, gameweekHistory ] = await Promise.all([
			this.getCurrentGameweekData(id, this.currentGameweek).catch(() => undefined),
			this.getPlayerGameweekHistory(id, this.currentGameweek).catch(() => undefined)
		]);

		const leagues = gameweekHistory.leagues.classic,
			activeChip = gameweekData.active_chip,
			firstName = gameweekHistory.entry.player_first_name,
			lastName = gameweekHistory.entry.player_last_name,
			country = this.createCountryPhotoUrl(gameweekHistory.entry.player_region_short_iso),
			teamName = gameweekHistory.entry.name,
			currentGameweek_1 = gameweekHistory.entry.current_event,
			lastWeekOverallPoints = gameweekHistory.history.find((gameweek) => gameweek.event == this.currentGameweek - 1).total_points,
			picks = gameweekData.picks,
			team = new Team(id, teamName, currentGameweek_1, [], lastWeekOverallPoints),
			gameweekTransfers = gameweekData.entry_history.event_transfers,
			gameweekTransfersCost = gameweekData.entry_history.event_transfers_cost,
			overallRank = gameweekHistory.history.pop().overall_rank,

			fantasyPlayer = new FantasyPlayer(
			id,
			leagues,
			`${firstName} ${lastName}`,
			team,
			country,
			overallRank,
			gameweekTransfers
		);
		fantasyPlayer.value = gameweekData.entry_history.value
		fantasyPlayer.bank = gameweekData.entry_history.bank
		fantasyPlayer.activeChip = activeChip;
		//create team of players
		for (const pick of picks) {
			const player = this.staticDataService.data.elements.find((player_1) => player_1.id === pick.element);

			const position = this.getElementType(player.element_type);
			const newPlayer = new SoccerPlayer(
				pick.element,
				player.web_name,
				this.getLivePoints(player.id),
				this.createPlayerPhotoUrl(player.photo),
				pick.position,
				position,
				player.element_type
			);
			newPlayer.isCaptain = pick.is_captain;
			newPlayer.multiplier = pick.multiplier;
			fantasyPlayer.team.players.push(newPlayer);
			this.addPlayersToPositions(pick, fantasyPlayer, newPlayer, position);
		}
		for (const player of fantasyPlayer.team.players) {
			if (player.teamPosition < 12) {
				fantasyPlayer.team.gameweekPoints += player.gameweek_points * player.multiplier;
			}

			if (player.isCaptain) fantasyPlayer.team.captain = player.name;
		}
		fantasyPlayer.gameweekTransfersCost = gameweekTransfersCost;
		fantasyPlayer.team.overallPoints =
			lastWeekOverallPoints + fantasyPlayer.team.gameweekPoints - gameweekTransfersCost;
		return fantasyPlayer;
	}

	getLivePoints(id) {
		return this.liveData['elements'][id]['stats']['total_points'];
	}

	addPlayersToPositions(pick, fantasyPlayer, newPlayer, position) {
		//addd starters to positions array to display on team page
		if (pick.position < 12) {
			fantasyPlayer.team[`${position}s`].push(newPlayer);
		} else {
			fantasyPlayer.team.Bench.push(newPlayer);
		}
	}

	async getLiveOverallPoints(id) {
		const currentGameweek = await this.staticDataService.getCurrentGameweek(),
			lastWeekPoints = await this.getLastWeekPoints(id, currentGameweek),
			liveTeamPoints  = await this.getLiveTeamPoints(id, currentGameweek)
		return lastWeekPoints + liveTeamPoints
	}

	async getLastWeekPoints(id: number, currentGameweek) {
		const data = await this.getPlayerGameweekHistory(id, currentGameweek).catch(() => undefined)
		const lastWeekData = data.history.find((week) => week.event == currentGameweek - 1)
		return lastWeekData.total_points;
	}

	async getLiveTeamPoints(id: number, gameweek){
		const gameweekData = await this.getCurrentGameweekData(id, gameweek).catch(() => undefined)
		return await this.calculateTotalTeamPoints(gameweekData.picks, gameweekData.active_chip, gameweek);
	}

	async calculateTotalTeamPoints(picks, chip, gameweek) {
		let liveData = await  this.getLiveData(gameweek),
		result = 0
		for(let pick of picks) {
			if(chip == "bboost" || pick.position < 12) result += liveData['elements'][pick.element]['stats']['total_points'] * pick.multiplier
		}
		return result;
	}

	getElementType(typeId) {
		return this.staticDataService.data.element_types.find((type) => type.id == typeId).singular_name;
	}

	async getLiveData(gameweek: number) {
		return await this.liveDataService.fetchData(gameweek);
	}

	createCountryPhotoUrl(code) {
		return `/assets/country_flags/${code}.gif`;
	}

	createPlayerPhotoUrl(photo) {
		return Team.composePhotoUrl(photo);
	}

	async getDataAsyncOrRetrieveStored(id, url) {
		let key = '';
		const userkey = `${key}-${id}`;
		const storedData = await this.storage.get(userkey);

		if (!storedData) {
			const data = await this.httpRequestService.getData(url);
			//this.storage.set(userkey, data);
			return data;
		}
		return storedData;
	}

	/**
	 * 	
	 * @param playerId id
	 * @param currentGameweek current gameweek
	 * @description formats the url correctly for each player
	 */
	composeCurrentGameweekInfoUrl(playerId: any, currentGameweek: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/event/${currentGameweek}/picks`;
	}
}
