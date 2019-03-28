import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import { TransferService } from 'src/app/Services/transfers/transfer.service';

@Component({
	selector: 'app-pitch',
	templateUrl: './pitch.component.html',
	styleUrls: [ './pitch.component.scss' ]
})
export class PitchComponent implements OnInit {
	@Input() fantasyPlayer: FantasyPlayer;
	@Input() showCloseButton: boolean = false;
	gameweekTransfers: any[] = [];
	showSpinner: boolean = true;

	constructor(
		private modalController: ModalController,
		private transferService: TransferService
	) {}

	ngOnInit() {
		this.transferService.getGameweekTransfers(this.fantasyPlayer.team.id).then((transfers) => {
			for (const transfer of transfers) {
				this.gameweekTransfers.push(transfer);
			}
			this.showSpinner = false;
		});
	}

	closeModal() {
		this.modalController.dismiss();
	}
}
