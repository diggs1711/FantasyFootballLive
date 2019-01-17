import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{
				path: 'tab1',
				children: [
					{
						path: '',
						loadChildren: '../tab1/tab1.module#Tab1PageModule'
					}
				]
			},
			{
				path: 'Leagues',
				children: [
					{
						path: '',
						loadChildren: '../Leagues/LeaguesList/league-list.module#LeaguesListModule'
					}
				]
			},
			{
				path: 'Stats',
				children: [
					{
						path: '',
						loadChildren: '../Stats/stats.module#StatsPageModule'
					}
				]
			},
			{
				path: '',
				redirectTo: '/tabs/leagues',
				pathMatch: 'full'
			}
		]
	},
	{
		path: '',
		redirectTo: '/tabs/tab1',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class TabsPageRoutingModule {}
