import { Component } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PlayState } from '@angular/core/src/render3/interfaces/player';
import { parseHttpResponse } from 'selenium-webdriver/http';

@Component({
	selector: 'app-tab2',
	templateUrl: 'league.page.html',
	styleUrls: [ 'league.page.scss' ]
})
export class LeaguePage {
	items: any[];
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

	constructor(
		private changeRef: ChangeDetectorRef,
		private http: HTTP,
		private device: Device,
		private testHttp: Http,
		public loadingController: LoadingController,
		private storage: Storage
	) {
		this.http = http;
		this.testHttp = testHttp;
		this.device = device;
		this.items = [];
		this.leagues = [];
		this.liveFplData = null;
		this.staticData = {};
		this.league_name = '';
		this.currentGameweekKey = 'current_gameweek';
		this.userLeaguesKey = 'user_leagues';
		this.playerHistoryKey = 'player_history';
		this.playerPicksKey = 'player_picks';
		this.staticKey = 'static_data';
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

	async createLoadingIcon() {
		return await this.loadingController.create({
			message: 'Loading...',
			duration: 10000
		});
	}

	itemSelected(playerId) {
		return this.items.find((p) => p.id === playerId);
	}

	removeLeague(leagueId) {
		this.leagues = this.leagues.filter((league) => league.id != leagueId);
		this.changeRef.detectChanges();
		this.clearList();
	}

	addLeague(leagueId) {
		this.updateLeagueList(leagueId);
		this.changeRef.detectChanges();
		this.leagueId = '';
	}

	leagueSelected(leagueId) {
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
		this.hideLoadingIcon();
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
					this.persistLeagues(this.leagues);
				}
				json.standings.results.map((player) => {
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
						const playerPicks = picks;
						this.createLeaguePlayerObject(player, history, playerPicks);
					});
				});
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

		this.items.push({
			player_name: player.player_name,
			entry_name: player.entry_name,
			total: playerInfo.pointsLW + totalLivePoints - transferCost,
			rank: player.rank,
			event_total: totalLivePoints,
			transferCost: transferCost,
			transfers: transfers,
			movement: '',
			chip: chip,
			captain: player.captain,
			selectedPlayers: selctedPlayers,
			id: player.id
		});
	}

	sortLeague() {
		this.items.sort((a, b) => b.total - a.total);
		this.items.map((item, index) => {
			const newRank = index + 1;
			item.movement = item.rank === newRank ? 'square' : item.rank > newRank ? 'arrow-dropup' : 'arrow-dropdown';
			item.rank = index + 1;
		});
		this.changeRef.detectChanges();
	}

	getPlayerName(playerId) {
		return this.staticData['elements'].find((player) => player.id === playerId).web_name;
	}

	clearList() {
		this.league_name = '';
		this.items = [];
	}
}
