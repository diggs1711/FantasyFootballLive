import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaguePage } from './league.page';
import { PlayerModal } from './PlayerModal/PlayerModal.page';
import { InputLeagueModal } from './InputLeagueModal/InputModal.page';

@NgModule({
	imports: [ IonicModule, CommonModule, FormsModule, RouterModule.forChild([ { path: '', component: LeaguePage } ]) ],
	declarations: [ LeaguePage, PlayerModal, InputLeagueModal ],
	entryComponents: [ PlayerModal, InputLeagueModal ]
})
export class LeaguePageModule {}
