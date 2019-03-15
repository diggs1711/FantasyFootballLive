import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class HttpRequestService {
	constructor(private testHttp: Http, private http: HTTP, private device: Device,private router: Router) {}

	public async getData(url) {
		const data = await this.fetchData(url);
		return this.parseJsonData(data);
	}

	private parseJsonData(data) {
		if (data.url == 'https://fantasy.premierleague.com/updating/') {
			this.router.navigateByUrl("/updating")
			return null;
		}

		if (this.device.cordova) {
			return JSON.parse(data.data);
		}
		return data.json();
	}

	private fetchData(url): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, {}, {});
		}
		return this.testHttp.get(url).toPromise();
	}
}
