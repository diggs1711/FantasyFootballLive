import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

import FantasyPlayer from '../../../Models/FantasyPlayer';
import League from '../../../Models/League';
import { LeaguesService } from 'src/app/Services/leagues/leagues.service';
import { PitchComponent } from '../../../Components/pitch/pitch.component';

@Component({
	selector: 'app-league',
	templateUrl: './league.component.html',
	styleUrls: [ './league.component.scss' ]
})
export class LeagueComponent implements OnInit {
	league: League;
	fantasyPlayer: FantasyPlayer;
	showSpinner: boolean = true;
	maxTries: number = 5;

	constructor(
		public modalController: ModalController,
		private navParams: NavParams,
		private leaguesService: LeaguesService
	) {}

	ngOnInit() {
		this.load(this.navParams.data.leagueId);
	}

	/**
	 * 
	 * @param id id of the league to be loaded
	 * @description loads the all the data needed to display the league 
	 */
	async load(id: number) {
		this.league = await this.leaguesService.getLeague(id);
		//sometimes the league returns undefined for some users and they need to
		//fetched again. this checks if any are undefined and loads the league again
		//can be optimised to just fetch undefined users but this works for now
		if (this.league.members.includes(undefined) && this.maxTries > 0) {
			this.maxTries--;
			this.load(this.league.id);
			return;
		}
		this.maxTries = 5;
		this.sortLeagueInDescendingOrder(this.league)
		this.showSpinner = false;
	}

	/**
	 * 
	 * @param league league object to sorted
	 */
	sortLeagueInDescendingOrder(league: League) {
		league.members.sort((a, b) => b.team.overallPoints - a.team.overallPoints);
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
		await this.load(id);
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
		const selectedPlayer = this.league.members.find((memeber) => memeber.team.id == playerId);
		const modal = await this.modalController.create({
			component: PitchComponent,
			componentProps: {
				fantasyPlayer: selectedPlayer
			}
		});
		return await modal.present();
	}
}
