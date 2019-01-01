import { Component } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device/ngx';
import { ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'app-tab2',
	templateUrl: 'tab2.page.html',
	styleUrls: [ 'tab2.page.scss' ]
})
export class LeaguePage {
	items: any[];
	league_name: string;
	LEAGUES_URL: string;
	liveFplData: {};

	constructor(
		private changeRef: ChangeDetectorRef,
		private http: HTTP,
		private device: Device,
		private testHttp: Http
	) {
		this.http = http;
		this.testHttp = testHttp;
		this.device = device;
		this.items = [];
		this.liveFplData = null;
		this.league_name = '';
		this.LEAGUES_URL = 'https://fantasy.premierleague.com/drf/leagues-classic-standings/';
		this.init();
	}

	init() {
		this.updateLeagueList(0);
	}

	itemSelected(item: string) {}

	getData(url): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, {}, {});
		}
		return this.testHttp.get(url).toPromise();
	}

	getCurrentGameweek() {
		return this.getData('https://fantasy.premierleague.com/drf/bootstrap-static')
			.then((data) => this.parseJsonData(data))
			.then((json) => json['current-event']);
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

	updateLeagueList(leagueId) {
		leagueId = '171842'; //'218801';
		this.getLeagueData(leagueId)
			.then((response) => this.parseJsonData(response))
			.then((json) => {
				this.league_name = json.league.name;
				return json.standings.results;
			})
			.then((results) => {
				this.clearList();
				return results;
			})
			.then(async (players) => {
				const gameweek = await this.getCurrentGameweek();
				players.forEach((player) => {
					this.getPlayerPicks(player.entry, gameweek)
						.then((data) => this.parseJsonData(data))
						.then((json) => json.picks)
						.then(async (picks) => {
							if (!this.liveFplData) {
								const result = await this.getLiveData(gameweek);
								const parsedData = this.parseJsonData(result);
								this.liveFplData = parsedData['elements'];
							}

							const totalLivePoints = picks.reduce((acc, pick) => {
								const totalPoints = this.liveFplData[pick.element]['stats']['total_points'];
								if (pick.position <= 11) {
									if (pick.is_captain) {
										return totalPoints * pick.multiplier + acc;
									}
									return totalPoints + acc;
								}
								return acc;
							}, 0);

							const playerHistory = this.getPlayerHistory(player.entry);
							playerHistory
								.then((json) => {
									return {
										pointsLW: json.history.find((week) => week.event === gameweek - 1).total_points,
										transferCost: json.history.find((week) => week.event === gameweek)
											.event_transfers_cost
									};
								})
								.then((info) => {
									this.items.push({
										player_name: player.player_name,
										entry_name: player.entry_name,
										total: info.pointsLW + totalLivePoints - info.transferCost,
										rank: player.rank,
										event_total: totalLivePoints,
										movement: ''
									});
								})
								.then(() => {
									this.items.sort((a, b) => b.total - a.total);
									this.items.map((item, index) => {
										const newRank = index + 1;
										item.movement = item.rank > newRank ? 'success' : 'danger';
										item.rank = index + 1;
									});
									this.changeRef.detectChanges();
								});
						});
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}

	clearList() {
		this.items = [];
	}
}
