import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';
import { TransferService } from 'src/app/Services/transfer.service';

@Component({
	selector: 'app-pitch',
	templateUrl: './pitch.component.html',
	styleUrls: [ './pitch.component.scss' ]
})
export class PitchComponent implements OnInit {
	@Input() fantasyPlayer: FantasyPlayer;
	gameweekTransfers: any[] = [];
	showSpinner: boolean = true;

	constructor(
		public navParams: NavParams,
		private modalController: ModalController,
		private transferService: TransferService
	) {}

	ngOnInit() {
		this.navParams.get('fantasyPlayer');
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
