import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TeamPage } from './team.page';
import { ComponentsModule } from '../../Components/components.module';
import { PitchComponent } from 'src/app/Components/pitch/pitch.component';

const routes: Routes = [
	{
		path: '',
		component: TeamPage
	}
];

@NgModule({
	entryComponents: [ PitchComponent ],
	imports: [ CommonModule, FormsModule, IonicModule, ComponentsModule, RouterModule.forChild(routes) ],
	declarations: [ TeamPage ]
})
export class TeamPageModule {}
