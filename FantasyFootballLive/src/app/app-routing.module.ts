import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [ { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'updating', loadChildren: './Pages/updating/updating.module#UpdatingPageModule' },
  { path: 'price-changes', loadChildren: './Pages/price-changes/price-changes.module#PriceChangesPageModule' }
];
@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
