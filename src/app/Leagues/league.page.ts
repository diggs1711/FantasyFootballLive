import { Component } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PlayState } from '@angular/core/src/render3/interfaces/player';
import { parseHttpResponse } from 'selenium-webdriver/http';
import { ModalController } from '@ionic/angular';
import { PlayerModal } from './PlayerModal/PlayerModal.page';

@Component({
	selector: 'app-tab2',
	templateUrl: 'league.page.html',
	styleUrls: [ 'league.page.scss' ]
})
export class LeaguePage {
	leaguePlayers: any[];
	league_name: string;
	LEAGUES_URL: string;
	liveFplData: {};
	staticData: {};
	loading: Promise<HTMLIonLoadingElement>;
	leagues: any[];
	leagueId: string;
	currentGameweek: any;
	currentGameweekKey: string;
	userLeaguesKey: string;
	staticKey: string;
	isGameweekUpdated: boolean;
	playerHistoryKey: any;
	playerPicksKey: any;
	selectedLeague: any;

	constructor(
		private changeRef: ChangeDetectorRef,
		private http: HTTP,
		private device: Device,
		private testHttp: Http,
		public loadingController: LoadingController,
		public modalController: ModalController,
		private storage: Storage
	) {
		this.http = http;
		this.testHttp = testHttp;
		this.device = device;
		this.leaguePlayers = [];
		this.leagues = [];
		this.liveFplData = null;
		this.staticData = {};
		this.league_name = '';
		this.currentGameweekKey = 'current_gameweek';
		this.userLeaguesKey = 'user_leagues';
		this.playerHistoryKey = 'player_history';
		this.playerPicksKey = 'player_picks';
		this.staticKey = 'static_data';
		this.selectedLeague = null;
		this.LEAGUES_URL = 'https://fantasy.premierleague.com/drf/leagues-classic-standings/';
		this.init();
	}

	async init() {
		await this.loadLeagues();
		this.staticData = await this.loadStaticData();
		this.currentGameweek = this.getCurrentGameweek();
		this.isGameweekUpdated = await this.isCurrentGameweekUpdated(this.currentGameweek);
		this.persistStaticData(this.staticData);
	}

	persistStaticData(data) {
		if (this.isGameweekUpdated) {
			this.storage.set(this.staticKey, JSON.stringify(data));
		}
	}

	async loadStaticData(): Promise<HTTPResponse> {
		return await this.getStaticData().then((data) => this.parseJsonData(data));
	}

	checkCurrentGameweek(gameweek) {
		if (this.isCurrentGameweekUpdated(gameweek)) {
			this.saveCurrentGameweek(gameweek);
		}
	}

	closeModal() {
		this.modalController.dismiss();
	}

	async isCurrentGameweekUpdated(gameweek) {
		const oldGameweek = await this.storage.get(this.currentGameweekKey);
		return oldGameweek != gameweek;
	}

	async saveCurrentGameweek(gameweek) {
		this.storage.set('current_gameweek', gameweek);
	}

	async loadLeagues() {
		const leagues = await this.storage.get(this.userLeaguesKey);
		if (leagues) {
			const leaguesPromises = [];
			for (const league of leagues) {
				this.leagues.push(league);
			}
		}
	}

	refreshLeague(event) {
		if (this.selectedLeague) {
			this.updateLeagueList(this.selectedLeague).then(() => {
				event.target.complete();
			});
		}
		event.target.complete();
	}

	async createLoadingIcon() {
		return await this.loadingController.create({
			message: 'Loading...',
			duration: 10000
		});
	}

	async leaguePlayerSelected(playerId) {
		if (!playerId) return;

		const picks = await this.getDataAsyncOrRetrieveStored(
			this.playerPicksKey,
			playerId,
			this.composePlayerPicksUrl(playerId, this.currentGameweek)
		);

		const modal = await this.modalController.create({
			component: PlayerModal,
			componentProps: { picks: picks, players: this.staticData['elements'], liveData: this.liveFplData }
		});

		return await modal.present();
	}

	async removeLeague(leagueId) {
		if (leagueId) {
			this.leagues = this.leagues.filter((league) => league.id != leagueId);
			this.storage.set(this.userLeaguesKey, this.leagues);
			this.changeRef.detectChanges();
			this.clearList();
		}
	}

	addLeague(leagueId) {
		if (!leagueId) {
			return alert('No League Entered');
		}
		this.updateLeagueList(leagueId);
		this.changeRef.detectChanges();
		this.leagueId = '';
	}

	leagueSelected(leagueId) {
		this.selectedLeague = leagueId;
		this.updateLeagueList(leagueId);
	}

	getData(url): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, {}, {});
		}
		return this.testHttp.get(url).toPromise();
	}

	async getStaticData() {
		return await this.getData('https://fantasy.premierleague.com/drf/bootstrap-static');
	}

	getCurrentGameweek() {
		return this.staticData['current-event'];
	}

	async getDataAsyncOrRetrieveStored(key, id, url) {
		const userkey = `${key}-${id}`;
		const storedData = await this.storage.get(userkey);

		if (!storedData) {
			const data = await this.getData(url);
			const parsedData = this.parseJsonData(data);
			this.storage.set(userkey, parsedData);
			return parsedData;
		}
		return storedData;
	}

	getTotalPointsLastWeek(data) {
		data.then((json) => json.history.slice(1, -1).total_points);
	}

	parseJsonData(data) {
		if (this.device.cordova) {
			return JSON.parse(data.data);
		}
		return data.json();
	}

	retrieveStoredPlayerPicks(playerId) {
		return this.storage.get(`player-${playerId}`);
	}

	//needs to call each time. Maybe can check if gameweek is live?
	getLiveData(gameweek) {
		return this.getData(`https://fantasy.premierleague.com/drf/event/${gameweek}/live`);
	}

	showLoadingIcon() {
		this.loading.then((icon) => icon.present());
	}

	hideLoadingIcon() {
		this.loading.then((icon) => icon.dismiss());
	}

	persistLeagues(leagues) {
		this.storage.set(this.userLeaguesKey, leagues);
	}

	createLeaguePlayerObject(player, playerHistory, playerPicks) {
		const { picks, chip } = playerPicks;
		const selctedPlayers = [];

		const totalLivePoints = picks.reduce((acc, pick) => {
			const totalPoints = this.liveFplData[pick.element]['stats']['total_points'];
			const playerName = this.getPlayerName(pick.element);
			selctedPlayers.push(playerName);
			if (chip === 'bboost' || pick.position <= 11) {
				if (pick.is_captain) {
					player.captain = playerName;
					return totalPoints * pick.multiplier + acc;
				}
				return totalPoints + acc;
			}
			return acc;
		}, 0);

		const pHistory = this.parsePlayerHistory(playerHistory, this.currentGameweek);
		this.addPlayerToLeague(player, pHistory, chip, totalLivePoints, selctedPlayers);
		this.sortLeague();
	}

	async getLeaguePlayerData(player) {
		return Promise.all([
			this.getDataAsyncOrRetrieveStored(
				this.playerHistoryKey,
				player.entry,
				this.composePlayerHistoryUrl(player.entry)
			),
			this.getDataAsyncOrRetrieveStored(
				this.playerPicksKey,
				player.entry,
				this.composePlayerPicksUrl(player.entry, this.currentGameweek)
			)
		]).then(([ history, picks ]) => {
			this.createLeaguePlayerObject(player, history, picks);
		});
	}

	async updateLeagueList(leagueId) {
		this.loading = this.createLoadingIcon();
		this.showLoadingIcon();
		const liveGameweekData = await this.getLiveData(this.currentGameweek);
		const parsedData = this.parseJsonData(liveGameweekData);
		this.liveFplData = parsedData['elements'];
		this.clearList();

		this.getDataAsyncOrRetrieveStored(this.userLeaguesKey, leagueId, this.composeUserLeaguesUrl(leagueId))
			.then((json) => {
				const leagueName = json.league.name;
				this.league_name = leagueName;
				if (!this.leagues.find((league) => league.id === leagueId)) {
					this.leagues.push({
						id: leagueId,
						name: leagueName
					});
					//persisting all leagues so I can load them all initially and just loop through without knowing their id
					this.persistLeagues(this.leagues);
				}

				return Promise.all(json.standings.results.map(this.getLeaguePlayerData.bind(this))).then(() =>
					this.hideLoadingIcon()
				);
			})
			.catch((err) => {
				console.error(err);
			});
	}
	composeUserLeaguesUrl(leagueId: any): any {
		return this.LEAGUES_URL + leagueId;
	}
	composePlayerPicksUrl(playerId: any, currentGameweek: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/event/${currentGameweek}/picks`;
	}
	composePlayerHistoryUrl(playerId: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/history`;
	}

	parsePlayerHistory(player, gameweek) {
		return {
			pointsLW: player.history.find((week) => week.event === gameweek - 1).total_points,
			currentGameweek: player.history.find((week) => week.event === gameweek)
		};
	}

	addPlayerToLeague(player, playerInfo, chip, totalLivePoints, selctedPlayers) {
		const transferCost = playerInfo.currentGameweek.event_transfers_cost;
		const transfers = playerInfo.currentGameweek.event_transfers;

		this.leaguePlayers.push({
			player_name: player.player_name,
			entry_name: player.entry_name,
			total: playerInfo.pointsLW + totalLivePoints - transferCost,
			rank: player.rank,
			event_total: totalLivePoints,
			transferCost: transferCost,
			transfers: transfers,
			movement: '',
			chip: chip,
			entry: player.entry,
			captain: player.captain,
			selectedPlayers: selctedPlayers,
			id: player.id
		});
	}

	sortLeague() {
		this.leaguePlayers.sort((a, b) => b.total - a.total);
		this.leaguePlayers.map((leaguePlayers, index) => {
			const newRank = index + 1;
			leaguePlayers.movement =
				leaguePlayers.rank === newRank
					? 'square'
					: leaguePlayers.rank > newRank ? 'arrow-dropup' : 'arrow-dropdown';
			leaguePlayers.rank = index + 1;
		});
		this.changeRef.detectChanges();
	}

	getPlayerName(playerId) {
		return this.staticData['elements'].find((player) => player.id === playerId).web_name;
	}

	clearList() {
		this.league_name = '';
		this.leaguePlayers = [];
	}
}
