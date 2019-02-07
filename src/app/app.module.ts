import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

//HTTP
import { HttpModule } from '@angular/http';
import { HTTP } from '@ionic-native/http/ngx';
import { Device } from '@ionic-native/device/ngx';

//Storage
import { IonicStorageModule } from '@ionic/storage';

//Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { Firebase } from '@ionic-native/firebase/ngx';

var config = {
	apiKey: 'AIzaSyDjd6XqSB35R06kIrZp1CVzwnV6zroI9jQ',
	authDomain: 'fantasy-football-live.firebaseapp.com',
	databaseURL: 'https://fantasy-football-live.firebaseio.com',
	projectId: 'fantasy-football-live',
	storageBucket: 'fantasy-football-live.appspot.com',
	messagingSenderId: '276208393080'
};

@NgModule({
	declarations: [ AppComponent ],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		HttpModule,
		IonicStorageModule.forRoot(),
		AngularFireModule.initializeApp(config),
		AngularFirestoreModule
	],
	providers: [
		HTTP,
		Device,
		StatusBar,
		SplashScreen,
		Firebase,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
