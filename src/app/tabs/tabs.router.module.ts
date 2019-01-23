import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{
				path: 'team',
				children: [
					{
						path: '',
						loadChildren: '../team/team.module#TeamPageModule'
					}
				]
			},
			// {
			// 	path: 'Leagues',
			// 	children: [
			// 		{
			// 			path: '',
			// 			loadChildren: '../Leagues/LeaguesList/league-list.module#LeaguesListModule'
			// 		}
			// 	]
			// },
			// {
			// 	path: 'Stats',
			// 	children: [
			// 		{
			// 			path: '',
			// 			loadChildren: '../Stats/stats.module#StatsPageModule'
			// 		}
			// 	]
			// },
			{
				path: 'News',
				children: [
					{
						path: '',
						loadChildren: '../News/news.module#NewsPageModule'
					}
				]
			},
			{
				path: '',
				redirectTo: '/home',
				pathMatch: 'full'
			}
		]
	},
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class TabsPageRoutingModule {}
