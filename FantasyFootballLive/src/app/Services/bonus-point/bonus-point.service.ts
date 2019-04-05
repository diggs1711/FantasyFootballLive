import { Injectable, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root'
})
export class BonusPointService implements OnInit {
	inlcudeBonusPoints: boolean;

	constructor(private storage: Storage) {}

	ngOnInit(): void {
		this.storage.get('include-bonus-points').then((include) => {
			this.inlcudeBonusPoints = include ? include : false;
		});
	}

	async getUserSetting(): Promise<boolean> {
		const inlcude = await this.storage.get('include-bonus-points');
		return inlcude ? inlcude : false;
	}

	includeBonusPoints(): void {
		this.updateSetting(true);
	}

	updateSetting(val: boolean): void {
		this.storage.set('include-bonus-points', val);
	}

	getBPSBonusForLiveGames(fixtures: any[]) {
		const matches = [];

		for (const fixture of fixtures) {
			for (const stat of fixture.stats) {
				// change to bps from stat and calculate top 3 players
				if (stat && stat.bps) {
					const matchBPS = [];
					for (const player of stat.bps.a) {
						matchBPS.push(player);
					}

					for (const player of stat.bps.h) {
						matchBPS.push(player);
					}

					matchBPS.sort((a, b) => b.value - a.value);
					console.log(matchBPS);
				}
			}
		}
	}
}
