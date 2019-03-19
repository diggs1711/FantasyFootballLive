import { Component, OnInit } from '@angular/core';
import { BonusPointService } from 'src/app/Services/bonus-point/bonus-point.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.page.html',
	styleUrls: [ './settings.page.scss' ]
})
export class SettingsPage implements OnInit {
	includeBonusPoints: boolean = false;
	public form = [ { val: 'Include Bonus Points', isChecked: this.includeBonusPoints } ];
	constructor(private bonusPointService: BonusPointService) {}

	ngOnInit() {
		this.bonusPointService.getUserSetting().then((include) => {
			this.includeBonusPoints = include;
		});

		this.form = [ { val: 'Include Bonus Points', isChecked: this.includeBonusPoints } ];
	}

	updateSetting(val: boolean): void {
		this.bonusPointService.updateSetting(val);
	}
}
