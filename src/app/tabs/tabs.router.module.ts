import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{ path: 'news', loadChildren: '../News/news.module#NewsPageModule' },
			{ path: 'home', loadChildren: '../home/home.module#HomePageModule' },
			{ path: 'team', loadChildren: '../team/team.module#TeamPageModule' },
			{ path: 'settings', loadChildren: '../settings/settings.module#SettingsPageModule' },
			{ path: 'leagues', loadChildren: '../leagues/leagues.module#LeaguesPageModule' },
			{ path: 'live', loadChildren: '../live-scores/live-scores.module#LiveScoresPageModule' }
		]
	},
	{
		path: '',
		redirectTo: '/tabs/home',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class TabsPageRoutingModule {}
