import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import League from '../../Models/League';
import FantasyPlayer from '../../Models/FantasyPlayer';
import { PitchComponent } from '../../Components/ui/pitch/pitch.component';
import { LeaguesService } from 'src/app/Services/LeaguesService/leagues.service';

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
		this.getLeague(this.navParams.data.leagueId);
	}

	getLeague(id: number) {
		this.leaguesService.getLeague(id).then((league) => {
			if (league.members.includes(undefined) && this.maxTries > 0) {
				this.maxTries--;
				this.getLeague(league.id);
				return;
			}

			this.maxTries = 5;
			this.league = league;
			this.showSpinner = false;
		});
	}

	closeModal() {
		this.modalController.dismiss();
	}

	async refresh(id: number) {
		this.getLeague(id);
	}

	async refreshPulldown(event) {
		await this.refresh(this.league.id);
		return event.target.complete();
	}

	async playerSelected(playerId: number) {
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
