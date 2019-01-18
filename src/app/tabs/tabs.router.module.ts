import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{
				path: 'MyTeam',
				children: [
					{
						path: '',
						loadChildren: '../MyTeam/myTeam.module#MyTeamPageModule'
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
		redirectTo: '/tabs/MyTeam',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class TabsPageRoutingModule {}
