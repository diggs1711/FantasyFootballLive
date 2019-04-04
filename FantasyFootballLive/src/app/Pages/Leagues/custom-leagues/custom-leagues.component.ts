import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-custom-leagues',
	templateUrl: './custom-leagues.component.html',
	styleUrls: [ './custom-leagues.component.scss' ]
})
export class CustomLeaguesComponent implements OnInit {
	newCustomLeague = [];
	newLeagueName = '';

	constructor() {}

	ngOnInit() {}

	createLeague() {}
}
