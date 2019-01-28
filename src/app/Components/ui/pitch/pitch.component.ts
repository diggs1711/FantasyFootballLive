import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import FantasyPlayer from 'src/app/Models/FantasyPlayer';

@Component({
	selector: 'app-pitch',
	templateUrl: './pitch.component.html',
	styleUrls: [ './pitch.component.scss' ]
})
export class PitchComponent implements OnInit {
	@Input() fantasyPlayer: FantasyPlayer;

	constructor(public navParams: NavParams, private modalController: ModalController) {}

	ngOnInit() {
		this.navParams.get('fantasyPlayer');
	}

	closeModal() {
		this.modalController.dismiss();
	}
}
