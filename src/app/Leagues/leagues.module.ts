import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LeaguesPage } from './leagues.page';
import { ComponentsModule } from '../Components/components.module';
import { LeagueComponent } from '../league/league.component';
import { PlayerProfileComponent } from '../player-profile/player-profile.component';
import { PitchComponent } from '../Components/ui/pitch/pitch.component';

const routes: Routes = [
	{
		path: '',
		component: LeaguesPage
	}
];

@NgModule({
	entryComponents: [ LeagueComponent, PlayerProfileComponent, PitchComponent ],
	imports: [ CommonModule, FormsModule, IonicModule, ComponentsModule, RouterModule.forChild(routes) ],
	declarations: [ LeaguesPage, LeagueComponent, PlayerProfileComponent ]
})
export class LeaguesPageModule {}
