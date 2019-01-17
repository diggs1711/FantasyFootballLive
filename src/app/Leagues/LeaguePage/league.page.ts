import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingController, NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PlayerModal } from '../PlayerModal/PlayerModal.page';
import { FplDataService } from '../../Services/FplData/fpl-data.service';
import League from '../../Models/League';
import FantasyPlayer from '../../Models/FantasyPlayer';
import { Storage } from '@ionic/storage';
import Team from 'src/app/Models/Team';
import { LiveDataService } from '../../Services/LiveData/live.data.service';
import { StaticDataService } from '../../Services/StaticData/static.data.service';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';

@Component({
	selector: 'app-tab2',
	templateUrl: 'league.page.html',
	styleUrls: [ 'league.page.scss' ]
})
export class LeaguePage {
	LEAGUES_URL: string;
	livePremPlayerData: {};
	staticData: {};
	loading: Promise<HTMLIonLoadingElement>;
	league: League;
	currentGameweek: any;
	currentGameweekKey: string;
	userLeaguesKey: string;
	staticKey: string;
	isGameweekUpdated: boolean;
	playerHistoryKey: any;
	playerPicksKey: any;
	leaguesTab: string;
	hideChip: boolean;
	fantasyPlayer: FantasyPlayer;
	members: FantasyPlayer[];
	leagueName: string;
	soccerPlayers: {};

	constructor(
		private changeRef: ChangeDetectorRef,
		public loadingController: LoadingController,
		public modalController: ModalController,
		private fplDataService: FplDataService,
		private storage: Storage,
		private navParams: NavParams,
		private staticDataService: StaticDataService,
		private liveDataService: LiveDataService
	) {
		this.members = navParams.data.members || [];
		this.leagueName = navParams.data.name || '';
		this.livePremPlayerData = null;
		this.staticData = {};
		this.currentGameweekKey = 'current_gameweek';
		this.userLeaguesKey = 'user_leagues';
		this.playerHistoryKey = 'player_history';
		this.playerPicksKey = 'player_picks';
		this.staticKey = 'static_data';
		this.leaguesTab = 'MyLeagues';
		this.hideChip = false;
		this.soccerPlayers = {};
		this.init();
	}

	init() {
		this.loadBootstrapData();
	}

	loadBootstrapData() {
		this.staticDataService.getBootstrapData().then(() => {
			if (this.staticDataService.isDataLoaded()) {
				const currentGameweek = this.staticDataService.getCurrentGameweek();
				const soccerPlayers = this.staticDataService.getSoccerPlayers();
				Promise.all([
					this.getMembersCurrentGameweekData(currentGameweek),
					this.liveDataService.getLiveData(currentGameweek),
					this.getMembersGameweekHistory()
				]).then(([ memberGameweekData, liveData, membersGameweekHistory ]: [[], {}, any]) => {
					for (let index = 0; index < memberGameweekData.length; index++) {
						const playerGameweekData: any = memberGameweekData[index];
						const gameweekHistoryData = membersGameweekHistory[index];
						const fantasyPlayer = this.members[index];

						//Current Gameweek data
						const playersPicks = playerGameweekData.picks;
						fantasyPlayer.gameweekTransfers = playerGameweekData.entry_history.event_transfers;
						fantasyPlayer.gameweekTransfersCost = playerGameweekData.entry_history.event_transfers_cost;
						fantasyPlayer.activeChip = playerGameweekData.active_chip;

						//this is actually live data for chips played and transfered played and not the previous gameweek
						//data from FPL is all over the place
						const active_chip = playerGameweekData.active_chip;
						const active_transfers = playerGameweekData.entry_history.event_transfers;
						const active_transfers_cost = playerGameweekData.entry_history.event_transfers_cost;

						let team = fantasyPlayer.team;
						team.overallPoints = this.getOverallPointsLastWeek(membersGameweekHistory[index].history);
						this.createTeamFromPicks(team, playersPicks, soccerPlayers);
						for (const player of fantasyPlayer.team.players) {
							player.gameweek_points =
								this.getLivePlayerPoints(liveData, player.id) * player.multiplier -
								fantasyPlayer.gameweekTransfersCost;
						}

						this.calculateGameweekPoints(team);
					}
				});
			}
		});
	}

	createTeamFromPicks(team: Team, picks, soccerPlayers: any[]) {
		const newPlayers = [];
		for (const pick of picks) {
			if (pick.is_captain) team.captainId = pick.element;
			const newPlayer = new SoccerPlayer(pick.element);
			const player = soccerPlayers.find((player) => player.id == pick.element);
			newPlayer.name = player.web_name;
			newPlayer.multiplier = pick.multiplier;
			newPlayer.image = Team.composePhotoUrl(player.photo);
			newPlayer.position = player.element_type;
			newPlayers.push(newPlayer);
		}
		team.players = newPlayers;
	}

	getActiveChip() {}
	/**
	 * 
	 * @param live live data received from fpl
	 * @param playerId id of player we are looking for
	 * @description extracts the live points of a soccer player
	 */
	getLivePlayerPoints(live, playerId): number {
		return live['elements'][playerId]['stats']['total_points'];
	}

	/**
	 * 
	 * @param gameweekHistory array of past gameweeks
	 * @returns {number} total overall points after last week
	 */
	getOverallPointsLastWeek(gameweekHistory) {
		return gameweekHistory.pop().total_points;
	}

	/**
	 * 
	 * @param team Team object
	 * @returns {number} total live points for the current gameweek
	 */
	calculateGameweekPoints(team: Team) {
		team.gameweekPoints = 0;

		for (const player of team.players) {
			team.gameweekPoints += player.gameweek_points;
		}

		team.overallPoints += team.gameweekPoints;
		return team.gameweekPoints;
	}

	/**
	 * 
	 * @param gameweek current gameweek
	 * @description retrieves all fantasy league players picks from the current selected league for the current gameweek
	 * @returns promise
	 */
	getMembersCurrentGameweekData(gameweek) {
		return Promise.all(
			this.members.map((member) => this.getMemberCurrentGameweek(member.team.id, gameweek))
		).catch((err) => {
			console.log(`failed to retrieve player picks` + err);
		});
	}

	getMembersGameweekHistory() {
		return Promise.all(this.members.map((member) => this.getPlayerGameweekHistory(member.team.id)));
	}
	/**
	 * 
	 * @param id fantasy player id
	 * @param gameweek current gameweek
	 * @description get the picks for this week for a fantasy player
	 */
	getMemberCurrentGameweek(id, gameweek) {
		return this.getDataAsyncOrRetrieveStored(
			this.playerPicksKey,
			id,
			this.composeCurrentGameweekInfoUrl(id, gameweek)
		);
	}

	/**
	 * 
	 * @param id id of player whos gameweek history we are looking for
	 */
	getPlayerGameweekHistory(id) {
		return this.getDataAsyncOrRetrieveStored(this.playerHistoryKey, id, this.composePlayerGameweekHistoryUrl(id));
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

	composePlayerGameweekHistoryUrl(playerId: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/history`;
	}

	closeModal() {
		this.modalController.dismiss();
	}

	refreshLeague(event) {
		event.target.complete();
	}

	async createLoadingIcon() {
		return await this.loadingController.create({
			message: 'Calculating Live Scores...',
			duration: 20000
		});
	}

	async leaguePlayerSelected(playerId) {}

	removeLeague(leagueId) {
		if (leagueId) {
			this.fantasyPlayer.removeLeague(leagueId);
		}
	}

	leagueSelected(leagueId) {
		this.league.onMemberSelected(leagueId);
	}

	async getDataAsyncOrRetrieveStored(key, id, url) {
		const userkey = `${key}-${id}`;
		const storedData = await this.storage.get(userkey);

		if (!storedData) {
			const data = await this.fplDataService.getData(url);
			//this.storage.set(userkey, data);
			return data;
		}
		return storedData;
	}

	showLoadingIcon() {
		this.loading.then((icon) => icon.present());
	}

	hideLoadingIcon() {
		this.loading.then((icon) => icon.dismiss());
	}

	persistLeague(leagueId, leagueName) {
		this.fantasyPlayer.addLeague(leagueId, leagueName);
	}

	createLeaguePlayerObject(player, playerHistory, playerPicks) {
		const { picks, active_chip } = playerPicks;
		const selctedPlayers = [];

		const totalLivePoints = picks.reduce((acc, pick) => {
			const totalPoints = this.livePremPlayerData[pick.element]['stats']['total_points'];
			const playerName = this.getPlayerName(pick.element);
			selctedPlayers.push(playerName);
			if (active_chip === 'bboost' || pick.position <= 11) {
				if (pick.is_captain) {
					player.captain = playerName;
					return totalPoints * pick.multiplier + acc;
				}
				return totalPoints + acc;
			}
			return acc;
		}, 0);

		const pHistory = this.parsePlayerHistory(playerHistory, this.currentGameweek);
	}

	getLeagueData(leagueId) {
		this.league.getLeagueData();
	}

	switchToLiveTab(): any {
		this.leaguesTab = 'Live';
	}

	/**
	 * 
	 * @param player current league player
	 * @param gameweek current gameweek
	 * @description returns current gameweek and next gameweek tranfers
	 */
	parsePlayerHistory(player, gameweek) {
		return {
			country_code: player.entry.player_region_short_iso,
			live_squad_value: player.entry.value,
			live_bank: player.entry.bank,
			live_transfers: player.entry.event_transfers,
			live_transfers_cost: player.entry.event_transfers_cost,
			pointsLW: player.history.find((week) => week.event === gameweek - 1).total_points,
			currentGameweek: player.history.find((week) => week.event === gameweek)
		};
	}

	addPlayerToLeague(fantasyPlayer: FantasyPlayer) {
		this.league.addMember(fantasyPlayer);
	}

	getPlayerName(playerId) {
		return this.staticData['elements'].find((player) => player.id === playerId).web_name;
	}
}
