import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LeagueComponent } from 'src/app/Pages/Leagues/leagues-detail/league.component';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';


@Component({
	selector: 'app-leagues',
	templateUrl: './leagues.page.html',
	styleUrls: [ './leagues.page.scss' ]
})
export class LeaguesPage implements OnInit {
	constructor(
		private modalController: ModalController,
		public mainUserService: MainUserService
	) {}

	ngOnInit() {}

	/**
	 * @param leagueId id of league
	 * @description creates a modal view of the league selected by the user
	 */
	async openLeague(leagueId: number) {
		if (!leagueId) {
			return null;
		}

		const modal = await this.modalController.create({
			component: LeagueComponent,
			animated: true,
			componentProps: {
				leagueId: leagueId
			}
		});

		return await modal.present();
	}
}
