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
	liveFplData: {};
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
	soccerPlayers: any;
	membersGameweekData: any;
	membersGameweekHistory: any;

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
		this.members = this.navParams.data.members || [];
		this.leagueName = this.navParams.data.name || '';
		this.liveFplData = null;
		this.membersGameweekData = null;
		this.membersGameweekHistory = null;

		this.staticData = null;
		this.currentGameweekKey = 'current_gameweek';
		this.userLeaguesKey = 'user_leagues';
		this.playerHistoryKey = 'player_history';
		this.playerPicksKey = 'player_picks';
		this.staticKey = 'static_data';
		this.leaguesTab = 'MyLeagues';
		this.hideChip = false;
		this.soccerPlayers = null;
		this.init();
	}

	init() {
		this.loadBootstrapData();
	}

	loadBootstrapData() {
		this.createLoadingIcon();
		this.staticDataService.getBootstrapData().then(async () => {
			if (this.staticDataService.isDataLoaded()) {
				//If data is stored just retrieve it
				//otherwise fetch
				this.currentGameweek = await this.staticDataService.getCurrentGameweek();
				const membersGameweekDataPromise =
					this.membersGameweekData ||
					this.getMembersCurrentGameweekData(this.currentGameweek).catch(() => undefined);
				const membersGameweekHistoryPromise =
					this.membersGameweekHistory || this.getMembersGameweekHistory().catch(() => undefined);

				Promise.all([
					membersGameweekDataPromise,
					this.liveDataService.getLiveData(this.currentGameweek).catch(() => undefined),
					membersGameweekHistoryPromise
				])
					.then(([ membersGameweekData, liveData, membersGameweekHistory ]: [[], {}, any]) =>
						this.constructLeague(membersGameweekData, liveData, membersGameweekHistory)
					)
					.then(() => this.hideLoadingIcon())
					.catch((err) => console.log(err));
			}
		});
	}

	constructLeague(membersGameweekData, liveData, membersGameweekHistory) {
		this.membersGameweekData = this.membersGameweekData || membersGameweekData || [];
		this.liveFplData = this.liveFplData || liveData || [];
		this.membersGameweekHistory = this.membersGameweekHistory || membersGameweekHistory || [];

		for (let index = 0; index < membersGameweekData.length; index++) {
			const playerGameweekData: any = membersGameweekData[index];
			const gameweekHistoryData = membersGameweekHistory[index];
			const fantasyPlayer = this.members[index];
			this.soccerPlayers = this.staticDataService.getSoccerPlayers();

			//Current Gameweek data
			if (playerGameweekData && gameweekHistoryData) {
				this.constructTeam(playerGameweekData, fantasyPlayer, gameweekHistoryData);
			}
		}
	}

	constructTeam(playerGameweekData, fantasyPlayer, gameweekHistoryData) {
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
		team.overallPoints = this.getOverallPointsLastWeek(gameweekHistoryData.history);
		team.players = this.createTeamPlayers(team, playersPicks);
		for (const player of fantasyPlayer.team.players) {
			player.gameweek_points =
				this.getLivePlayerPoints(this.liveFplData, player.id) * player.multiplier -
				fantasyPlayer.gameweekTransfersCost;
		}

		this.calculateGameweekPoints(team);
	}

	/**
	 * 
	 * @param team A fantasy team 	
	 * @param picks players selected by the fantasy manager for the current week
	 * @param soccerPlayers list of soccer players in the game
	 * @returns array of selected soccer players without relevent data pertaining to the soccer player
	 */
	createTeamPlayers(team: Team, picks) {
		const newPlayers = [];
		for (const pick of picks) {
			const newPlayer = this.createPlayer(pick.element);
			newPlayer.multiplier = pick.multiplier;
			newPlayer.position_number = pick.position;
			if (pick.is_captain) {
				newPlayer.isCaptain = true;
				team.captain = newPlayer.name;
			}
			newPlayers.push(newPlayer);
		}
		return newPlayers;
	}

	createPlayer(id) {
		const newPlayer = new SoccerPlayer(id);
		const player = this.soccerPlayers.find((player) => player.id == id);
		newPlayer.name = player.web_name;
		newPlayer.image = Team.composePhotoUrl(player.photo);
		newPlayer.position = player.element_type;
		return newPlayer;
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
		return gameweekHistory[gameweekHistory.length - 2].total_points;
	}

	/**
	 * 
	 * @param team Team object
	 * @returns {number} total live points for the current gameweek
	 */
	calculateGameweekPoints(team: Team) {
		team.gameweekPoints = 0;

		for (const player of team.players) {
			if (player.position_number < 12) team.gameweekPoints += player.gameweek_points;
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
	async getMembersCurrentGameweekData(gameweek) {
		return Promise.all(
			this.members.map((member) => this.getMemberCurrentGameweek(member.team.id, gameweek))
		).catch((err) => {
			console.log(`failed to retrieve player picks` + err);
		});
	}

	async getMembersGameweekHistory() {
		return Promise.all(
			this.members.map((member) => this.getPlayerGameweekHistory(member.team.id).catch(() => undefined))
		).catch((err) => console.log('failed to get player history', err));
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
		this.refresh();
		event.target.complete();
	}

	refresh() {
		if (this.membersGameweekData && this.membersGameweekHistory) {
			this.liveDataService.getLiveData(this.currentGameweek).then((result) => {
				this.liveFplData = result;
				this.constructLeague(this.membersGameweekData, this.liveFplData, this.membersGameweekHistory);
			});
		}
	}

	async createLoadingIcon() {
		this.loading = this.loadingController.create({
			message: 'Calculating Live Scores...',
			duration: 20000
		});

		this.showLoadingIcon();
	}

	async leaguePlayerSelected(playerId) {
		const selectedPlayer = this.members.find((memeber) => memeber.team.id == playerId);
		const selectedPlayerPicks = selectedPlayer.team.players;
		const captain = selectedPlayer.team.captain;

		const modal = await this.modalController.create({
			component: PlayerModal,
			componentProps: {
				playerId: playerId,
				picks: selectedPlayerPicks,
				gameweek: this.currentGameweek,
				captain: captain,
				gameweekPoints: selectedPlayer.team.gameweekPoints,
				name: selectedPlayer.name,
				teamName: selectedPlayer.team.name
			}
		});

		return await modal.present();
	}

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

	getLeagueData(leagueId) {
		this.league.getLeagueData();
	}

	switchToLiveTab(): any {
		this.leaguesTab = 'Live';
	}

	addPlayerToLeague(fantasyPlayer: FantasyPlayer) {
		this.league.addMember(fantasyPlayer);
	}
}
