import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './ui/loading-spinner/loading-spinner.component';
import { PitchComponent } from './pitch/pitch.component';

@NgModule({
	imports: [ IonicModule, CommonModule ],
	declarations: [ HeaderComponent, LoadingSpinnerComponent, PitchComponent ],
	exports: [ HeaderComponent, LoadingSpinnerComponent ]
})
export class ComponentsModule {}
