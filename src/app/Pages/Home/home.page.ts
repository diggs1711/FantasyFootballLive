import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';
import { StaticDataService } from 'src/app/Services/StaticData/static.data.service';
import { FixtureService } from 'src/app/Services/FixtureService/fixture.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: [ './home.page.scss' ]
})
export class HomePage implements OnInit {
	showSpinner: boolean = true;
	upcomingFixtures: any[] = [];
	constructor(
		private mainUserService: MainUserService,
		private router: Router,
		private staticDataService: StaticDataService,
		private fixtureService: FixtureService
	) {}

	ngOnInit() {
		Promise.all([
			this.staticDataService.getUpcomingFixtures(),
			this.staticDataService.getTeams()
		]).then(([ fixtures, teams ]) => {
			this.upcomingFixtures = this.fixtureService.createFixtureList(fixtures, teams);
			this.mainUserService.loadSavedUser().then(() => (this.showSpinner = false));
		});
	}

	onFantasyIdEntered(id) {
		this.mainUserService.createUser(id).then(() => (this.showSpinner = false));
	}

	navigateTo(url: string) {
		this.router.navigateByUrl(`/tabs${url}`);
	}
}
