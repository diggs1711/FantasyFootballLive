import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';
import { LeaguesService } from 'src/app/Services/LeaguesService/leagues.service';
import { LeagueComponent } from 'src/app/Components/league/league.component';

@Component({
	selector: 'app-leagues',
	templateUrl: './leagues.page.html',
	styleUrls: [ './leagues.page.scss' ]
})
export class LeaguesPage implements OnInit {
	constructor(private modalController: ModalController, public mainUserService: MainUserService) {}

	ngOnInit() {
		this.mainUserService.loadSavedUser();
	}

	async openLeague(leagueId: number) {
		if (!leagueId) return;

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
