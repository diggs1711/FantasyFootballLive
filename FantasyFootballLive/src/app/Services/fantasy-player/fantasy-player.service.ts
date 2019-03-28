import { Injectable } from '@angular/core';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import Team from 'src/app/Models/Team';
import { StaticDataService } from '../static-data/static.data.service';
import { GameweekDataService } from '../gameweek-data/gameweek-data.service';
import { GameweekHistoryService } from '../gameweek-history/gameweek-history.service';
import { SoccerPlayerService } from '../soccer-player/soccerplayer.service';

@Injectable({
	providedIn: 'root'
})
export class FantasyPlayerService {
	constructor(
		private staticDataService: StaticDataService,
		private gameweekDataService: GameweekDataService,
		private gameweekHistoryService: GameweekHistoryService,
		private soccerPlayerService: SoccerPlayerService
	) {}

	/**
   *
   * @param id fpl id
   * @description creates a fantasy premier league player
   * @returns FantasyPlayer object
   */
	async createPlayer(id: number, liveData: any): Promise<FantasyPlayer> {
		const currentGameweek = await this.staticDataService.getCurrentGameweek(),
			userGameweekData = await this.gameweekDataService.getGameweekData(id, currentGameweek),
			previousGameweeksHistory = await this.gameweekHistoryService.fetch(id),
			playerData = this.parsePlayerData(
				userGameweekData,
				previousGameweeksHistory,
				currentGameweek
			),
			team = new Team(id, playerData.teamName, playerData.lastWeekOverallPoints),
			newFantasyPlayer = new FantasyPlayer(
				playerData.activeChip,
				playerData.bank,
				playerData.countryImage,
				0,
				playerData.gameweekTransfers,
				playerData.gameweekTransfersCost,
				id,
				playerData.leagues,
				playerData.name,
				playerData.overallRank,
				team
			);

		await this.populateSquad(playerData.picks, newFantasyPlayer, liveData);
		return newFantasyPlayer;
	}

	/**
	 * extracts relevant data from objects return from FPL API
	 * @param userGameweekData {}
	 * @param previousGameweekHistory {}
	 * @param currentGameweek {number}
	 */
	private parsePlayerData(
		userGameweekData: any,
		previousGameweekHistory: any,
		currentGameweek: number
	) {
		const leagues = previousGameweekHistory.leagues.classic,
			activeChip = userGameweekData.active_chip,
			name = `${previousGameweekHistory.entry.player_first_name} ${previousGameweekHistory
				.entry.player_last_name}`,
			countryImage = `assets/country_flags/${previousGameweekHistory.entry
				.player_region_short_iso}.gif`,
			teamName = previousGameweekHistory.entry.name,
			lastWeekOverallPoints = previousGameweekHistory.history.find(
				(gameweek) => gameweek.event === currentGameweek - 1
			).total_points,
			picks = userGameweekData.picks,
			bank = userGameweekData.entry_history.value,
			gameweekTransfers = userGameweekData.entry_history.event_transfers,
			gameweekTransfersCost = userGameweekData.entry_history.event_transfers_cost,
			overallRank = previousGameweekHistory.history.pop().overall_rank;

		return {
			leagues,
			activeChip,
			name,
			countryImage,
			teamName,
			lastWeekOverallPoints,
			picks,
			bank,
			gameweekTransfers,
			gameweekTransfersCost,
			overallRank
		};
	}

	private async populateSquad(picks: any[], fantasyPlayer: FantasyPlayer, liveData: any) {
		// tslint:disable-next-line: prefer-const
		let totalPoints = 0;

		for (const pick of picks) {
			const currentPlayer = await this.soccerPlayerService.getPlayer(pick.element),
				position = await this.staticDataService.getPositionLabel(
					pick.element_type
				),
				currentPlayerPoints =
					liveData['elements'][currentPlayer.id]['stats']['total_points'],
				newPlayer = new SoccerPlayer(
					pick.element,
					null,
					null,
					currentPlayerPoints,
					currentPlayer.name,
					position
				);
			fantasyPlayer.team[`${position}s`].push(newPlayer);

			if (fantasyPlayer.activeChip === 'bboost' || pick.position < 12) {
				totalPoints += currentPlayerPoints * pick.multiplier;
			}

			if (pick.is_captain) {
				fantasyPlayer.team.captainId = pick.element;
			}
		}
		fantasyPlayer.team.gameweekPoints = totalPoints;
		fantasyPlayer.team.overallPoints += totalPoints - fantasyPlayer.gameweekTransfersCost;
		return null;
	}
}
