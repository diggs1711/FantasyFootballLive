import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainUserService } from 'src/app/Services/main-user/main-user.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: [ './home.page.scss' ]
})
export class HomePage implements OnInit {
	showSpinner: boolean = true;

	constructor(private mainUserService: MainUserService, private router: Router) {}

	ngOnInit() {
		this.mainUserService.loadSavedUser().then(() => (this.showSpinner = false));
	}

	// createFixtureList(fixtures, teams) {
	// 	this.upcomingFixtures = fixtures.map((fixture) => {
	// 		const homeTeam = this.getTeamName(teams, fixture.team_h);
	// 		const awayTeam = this.getTeamName(teams, fixture.team_a);

	// 		return {
	// 			home_team: homeTeam,
	// 			away_team: awayTeam,
	// 			time: fixture.kickoff_time_formatted,
	// 			badge_home: this.getBadge(homeTeam)
	// 		};
	// 	});
	// }

	onFantasyIdEntered(id) {
		this.mainUserService.createUser(id).then(() => (this.showSpinner = false));
	}

	navigateTo(url: string) {
		this.router.navigateByUrl(`/tabs${url}`);
	}

	// getBadge(team) {
	// 	return `/assets/badges/${team}.png`;
	// }

	// getTeamName(teams, id) {
	// 	return teams.find((team) => team.id === id).name;
	// }
}
