import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { InputLeagueModal } from '../InputLeagueModal/InputModal.page';
import { LeaguePage } from '../LeaguePage/league.page';
import { ModalController } from '@ionic/angular';
import { FplDataService } from '../../Services/FplData/fpl-data.service';
import League from '../../Models/League';
import FantasyPlayer from '../../Models/FantasyPlayer';

@Component({
	selector: 'app-tab2',
	templateUrl: 'leagues-list.page.html',
	styleUrls: [ 'leagues-list.page.scss' ]
})
export class LeaguesList {
	fantasyPlayer: FantasyPlayer;
	key: string;
	baseLeagueUrl: string;
	leagues: League[] = [];

	constructor(
		private storage: Storage,
		private modalController: ModalController,
		public fplDataService: FplDataService
	) {
		this.key = 'player-leagues';
		this.leagues = [];
		this.baseLeagueUrl = 'https://fantasy.premierleague.com/drf/leagues-classic-standings/';
		this.initLeagueList();
	}

	initLeagueList() {
		this.loadStoredLeagues();
	}

	loadStoredLeagues() {
		const getLeaguesPromise = this.storage.get(this.key);
		getLeaguesPromise
			.then((leagues) => {
				this.leagues = leagues || [];
			})
			.catch((err) => {
				console.log('Failed to load leagues', err);
			});
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
					const { name, id } = leagueData.league;
					const members = FantasyPlayer.createFantasyPlayersArray(leagueData.standings.results);
					this.addLeague(id, name, members);
				}
			})
			.catch((err) => {
				console.log('Unable to add league', err);
			});
	}

	fetchLeagueData(id) {
		return this.fplDataService.getData(this.baseLeagueUrl + id);
	}

	addLeague(id, name, members) {
		if (!this.hasLeague(id)) {
			const newLeague = new League(id, name, members);
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
		const selectedLeague = this.getLeague(leagueId);

		const modal = await this.modalController.create({
			component: LeaguePage,
			componentProps: {
				members: selectedLeague.members,
				name: selectedLeague.name
			}
		});

		return await modal.present();
	}
}
