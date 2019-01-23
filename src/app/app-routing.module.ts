import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{ path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
	{ path: 'news', loadChildren: './News/news.module#NewsPageModule' },
	{ path: 'home', loadChildren: './home/home.module#HomePageModule' },
	{ path: 'team', loadChildren: './team/team.module#TeamPageModule' },
	{ path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
	{ path: 'leagues', loadChildren: './leagues/leagues.module#LeaguesPageModule' }
];
@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
