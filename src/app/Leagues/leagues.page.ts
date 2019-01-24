import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { InputLeagueModal } from './InputLeagueModal/InputModal.page';
import { ModalController } from '@ionic/angular';
import { RequestDataService } from '../Services/FplData/fpl-data.service';
import League from '../Models/League';
import FantasyPlayer from '../Models/FantasyPlayer';

@Component({
	selector: 'app-leagues',
	templateUrl: './leagues.page.html',
	styleUrls: [ './leagues.page.scss' ]
})
export class LeaguesPage implements OnInit {
	fantasyPlayer: FantasyPlayer;
	key: string;
	baseLeagueUrl: string;
	leagues: League[] = [];

	constructor(
		private storage: Storage,
		private modalController: ModalController,
		public fplDataService: RequestDataService
	) {
		this.key = 'player-leagues';
		this.leagues = [];
		this.baseLeagueUrl = 'https://fantasy.premierleague.com/drf/leagues-classic-standings/';
		this.initLeagueList();
	}

	ngOnInit() {}

	initLeagueList() {
		this.loadStoredLeagues();
	}

	loadStoredLeagues() {
		const getLeaguesPromise = this.storage.get(this.key);
		getLeaguesPromise
			.then((leagues) => {
				for (const league of leagues) {
					this.leagues.push(new League(league.id, league.name, league.entry_rank));
				}
			})
			.catch((err) => {
				console.log('Failed to load leagues', err);
			});
	}

	getOrdinalNum(n) {
		return n + (n > 0 ? [ 'th', 'st', 'nd', 'rd' ][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
	}

	openAddLeagueModal() {
		this.modalController
			.create({
				component: InputLeagueModal
			})
			.then((modal) => {
				modal.present();
				return modal;
			})
			.then((modal) => modal.onDidDismiss())
			.then(({ data }) => this.fetchLeagueData(data.leagueId))
			.then((leagueData) => {
				if (leagueData) {
					const { name, id, entry_rank: rank } = leagueData.league;
					const members = FantasyPlayer.createFantasyPlayersArray(leagueData.standings.results);
					this.addLeague(id, name, rank, members);
				}
			})
			.catch((err) => {
				console.log('Unable to add league', err);
			});
	}

	fetchLeagueData(id) {
		return this.fplDataService.getData(this.baseLeagueUrl + id);
	}

	addLeague(id, name, playerRank, members) {
		if (!this.hasLeague(id)) {
			const newLeague = new League(id, name, playerRank, members);
			this.leagues.push(newLeague);
			this.storage.set(this.key, this.leagues);
		}
	}

	hasLeague(id) {
		return this.leagues.find((league) => league.id === id);
	}

	removeLeague(id) {
		this.leagues = this.leagues.filter((league) => league.id !== id);
		this.storage.set(this.key, this.leagues);
	}

	getLeague(id) {
		return this.leagues.find((league) => league.id === id);
	}

	async openLeague(leagueId) {
		if (!leagueId) return;
		const leagueData = await this.fetchLeagueData(leagueId);
		const { name } = leagueData.league;
		const members = FantasyPlayer.createFantasyPlayersArray(leagueData.standings.results);

		// const modal = await this.modalController.create({
		// 	component: LeaguePage,
		// 	componentProps: {
		// 		members: members,
		// 		name: name
		// 	}
		// });

		// return await modal.present();
	}
}
