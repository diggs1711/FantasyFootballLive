import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaguesList } from './leagues-list.page';
import { PlayerModal } from '../PlayerModal/PlayerModal.page';
import { InputLeagueModal } from '../InputLeagueModal/InputModal.page';
import { LeaguePage } from '../LeaguePage/league.page';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild([ { path: '', component: LeaguesList } ])
	],
	declarations: [ LeaguesList, PlayerModal, InputLeagueModal, LeaguePage ],
	entryComponents: [ PlayerModal, InputLeagueModal, LeaguePage ]
})
export class LeaguesListModule {}
