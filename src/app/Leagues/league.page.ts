import { Component } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingController } from '@ionic/angular';

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
	playerInfo: {};
	loading: Promise<HTMLIonLoadingElement>;
	gameweek: any;
	leagues: any[];
	leagueId: string;

	constructor(
		private changeRef: ChangeDetectorRef,
		private http: HTTP,
		private device: Device,
		private testHttp: Http,
		public loadingController: LoadingController
	) {
		this.http = http;
		this.testHttp = testHttp;
		this.device = device;
		this.items = [];
		this.leagues = [];
		this.liveFplData = null;
		this.playerInfo = {};
		this.league_name = '';
		this.LEAGUES_URL = 'https://fantasy.premierleague.com/drf/leagues-classic-standings/';
		this.init();
	}

	init() {}

	async createLoadingIcon() {
		return await this.loadingController.create({
			message: 'Loading...',
			duration: 10000
		});
	}

	itemSelected(playerId) {
		const player = this.items.find((p) => p.id === playerId);
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
		console.log(leagueId);
		this.updateLeagueList(leagueId);
	}

	getData(url): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, {}, {});
		}
		return this.testHttp.get(url).toPromise();
	}

	async getCurrentGameweek() {
		this.playerInfo = await this.getData('https://fantasy.premierleague.com/drf/bootstrap-static').then((data) =>
			this.parseJsonData(data)
		);
		return this.playerInfo['current-event'];
	}

	getLeagueData(leagueId): Promise<HTTPResponse> {
		return this.getData(this.LEAGUES_URL + leagueId);
	}

	getPlayerHistory(playerId) {
		return this.getData(`https://fantasy.premierleague.com/drf/entry/${playerId}/history`).then((data) =>
			this.parseJsonData(data)
		);
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

	getPlayerPicks(id, gameweek) {
		return this.getData(`https://fantasy.premierleague.com/drf/entry/${id}/event/${gameweek}/picks`);
	}

	getLiveData(gameweek) {
		return this.getData(`https://fantasy.premierleague.com/drf/event/${gameweek}/live`);
	}

	showLoadingIcon() {
		this.loading.then((icon) => icon.present());
	}

	hideLoadingIcon() {
		this.loading.then((icon) => icon.dismiss());
	}

	async createLeaguePlayerObject(player) {
		const playerHistory = await this.getPlayerHistory(player.entry);
		const playerPicks = await this.getPlayerPicks(player.entry, this.gameweek).then((res) =>
			this.parseJsonData(res)
		);
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

		const pHistory = this.parsePlayerHistory(playerHistory, this.gameweek);
		this.addPlayerToLeague(player, pHistory, chip, totalLivePoints, selctedPlayers);
		this.sortLeague();
		this.hideLoadingIcon();
	}

	async updateLeagueList(leagueId) {
		this.loading = this.createLoadingIcon();
		this.showLoadingIcon();
		this.gameweek = await this.getCurrentGameweek();
		const liveGameweekData = await this.getLiveData(this.gameweek);
		const parsedData = this.parseJsonData(liveGameweekData);
		this.liveFplData = parsedData['elements'];
		this.clearList();

		this.getLeagueData(leagueId)
			.then((response) => this.parseJsonData(response))
			.then((json) => {
				const leagueName = json.league.name;
				this.league_name = leagueName;
				if (!this.leagues.find((league) => league.id === leagueId)) {
					this.leagues.push({
						id: leagueId,
						name: leagueName
					});
				}

				const players = json.standings.results;
				players.forEach((player) => this.createLeaguePlayerObject(player));
			})
			.catch((err) => {
				console.error(err);
			});
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
		return this.playerInfo['elements'].find((player) => player.id === playerId).web_name;
	}

	clearList() {
		this.league_name = '';
		this.items = [];
	}
}
