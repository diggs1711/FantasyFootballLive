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
}
