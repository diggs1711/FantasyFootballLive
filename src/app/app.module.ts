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

//Pipes

import { NgLoopObjectPipe } from './Pipes/ng-loop-object.pipe';

@NgModule({
	declarations: [ AppComponent, NgLoopObjectPipe ],
	entryComponents: [],
	imports: [ BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpModule, IonicStorageModule.forRoot() ],
	providers: [ HTTP, Device, StatusBar, SplashScreen, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy } ],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
