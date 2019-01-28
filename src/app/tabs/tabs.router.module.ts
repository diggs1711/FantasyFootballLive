import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{ path: 'news', loadChildren: '../Pages/News/news.module#NewsPageModule' },
			{ path: 'home', loadChildren: '../Pages/Home/home.module#HomePageModule' },
			{ path: 'team', loadChildren: '../Pages/Team/team.module#TeamPageModule' },
			{ path: 'settings', loadChildren: '../Pages/Settings/settings.module#SettingsPageModule' },
			{ path: 'leagues', loadChildren: '../Pages/Leagues/leagues.module#LeaguesPageModule' },
			{ path: 'stats', loadChildren: '../Pages/Stats/stats.module#StatsPageModule' }
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
