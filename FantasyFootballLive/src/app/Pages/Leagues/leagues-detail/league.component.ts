import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

import FantasyPlayer from '../../../Models/FantasyPlayer';
import League from '../../../Models/League';
import { LeaguesService } from 'src/app/Services/leagues/leagues.service';
import { TeamPageComponent } from 'src/app/Components/team-page/team-page.component';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';
import { CustomLeagueService } from 'src/app/Services/leagues/custom-league.service';

@Component({
	selector: 'app-league',
	templateUrl: './league.component.html',
	styleUrls: [ './league.component.scss' ]
})
export class LeagueComponent implements OnInit {
	league: League = null;
	fantasyPlayer: FantasyPlayer;
	showSpinner = true;
	maxTries = 5;
	leagueStanding = [];
	isCustom = false;

	constructor(
		public modalController: ModalController,
		private navParams: NavParams,
		private leaguesService: LeaguesService,
		private mainUserService: MainUserService,
		private customLeagueService: CustomLeagueService
	) {}

	ngOnInit() {
		this.isCustom = this.navParams.data.isCustom;
		if (!this.isCustom) {
			this.load(this.navParams.data.leagueId).then((league) => this.onLeagueLoaded(league));
		} else {
			this.customLeagueService.getLeague(this.navParams.data.leagueId).then((custLeague) => {
				this.customLeagueService
					.loadLeague(custLeague)
					.then((league) => this.onLeagueLoaded(league));
			});
		}
	}

	onLeagueLoaded(league) {
		this.league = league;
		this.leagueStanding = this.league.sort();
		this.showSpinner = false;
		return this.league;
	}

	/**
	 *
	 * @param id id of the league to be loaded
	 * @description loads the all the data needed to display the league
	 */
	async load(id: number) {
		return this.leaguesService.getLeague(id);
	}

	/**
	 * @description the league view is a modal, this closes it
	 */
	closeModal() {
		this.modalController.dismiss();
	}

	/**
	 *
	 * @param id id of league to refresh
	 * @description refreshes the league by loading it again
	 */
	async refresh(id: number) {
		return this.load(id).then((league) => this.onLeagueLoaded(league));
	}

	/**
	 * @param event method that responds to the refresh pulldown event on the view
	 */
	async refreshPulldown(event) {
		await this.refresh(this.league.id);
		return event.target.complete();
	}

	/**
	 * @description loads a detailed view of the player selected
	 * @param playerId id of the player in the league selected by the user
	 */
	async onPlayerSelected(playerId: number) {
		const selectedPlayer = this.league.members.get(playerId);
		const modal = await this.modalController.create({
			component: TeamPageComponent,
			componentProps: {
				fantasyPlayer: selectedPlayer,
				showCloseButton: true
			}
		});
		return await modal.present();
	}

	/**
	 * deletes a custom league
	 */
	deleteLeague() {
		this.customLeagueService.remove(this.league);
		this.customLeagueService.saveToDatabase();
		this.modalController.dismiss();
		return;
	}
}
