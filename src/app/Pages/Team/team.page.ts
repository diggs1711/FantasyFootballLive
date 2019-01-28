import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import FantasyPlayer from '../../Models/FantasyPlayer';

@Component({
	selector: 'app-team',
	templateUrl: './team.page.html',
	styleUrls: [ './team.page.scss' ]
})
export class TeamPage implements OnInit {
	fantasyPlayer: FantasyPlayer;
	constructor(private storage: Storage) {}
	ngOnInit() {
		this.storage.get('user').then((user) => {
			this.fantasyPlayer = user;
		});
	}
}
