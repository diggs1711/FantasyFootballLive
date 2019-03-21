import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { LoadingSpinnerComponent } from './ui/loading-spinner/loading-spinner.component';
import { PitchComponent } from './pitch/pitch.component';
import { RowOfPlayersComponent } from './pitch/row-of-players/row-of-players.component';
import { ListDividerComponent } from './ui/list-divider/list-divider.component';

@NgModule({
	imports: [ IonicModule, CommonModule ],
	declarations: [ HeaderComponent, LoadingSpinnerComponent, PitchComponent, RowOfPlayersComponent, ListDividerComponent ],
	exports: [ HeaderComponent, LoadingSpinnerComponent, RowOfPlayersComponent, ListDividerComponent ]
})
export class ComponentsModule {}
