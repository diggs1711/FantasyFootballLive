import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: [ './home.page.scss' ]
})
export class HomePage implements OnInit {
	FANTASY_ID_KEY: string = 'fantasy_id';
	fantasyId: number = null;

	constructor(private storage: Storage, private plt: Platform, private router: Router) {}

	ngOnInit() {
		this.checkForFantasyId();
	}

	isAuthenticated() {}

	checkForFantasyId() {
		return this.storage.get(this.FANTASY_ID_KEY).then((res) => {
			if (res) {
				this.fantasyId = res;
			}
		});
	}

	onFantasyIdEntered(id) {
		this.fantasyId = id;
		this.storeFantasyId(id);
	}

	storeFantasyId(id: number) {
		return this.storage.set(this.FANTASY_ID_KEY, id);
	}

	navigateTo(url: string) {
		this.router.navigateByUrl(url);
	}
}
