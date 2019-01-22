import { Injectable } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Http } from '@angular/http';

@Injectable({
	providedIn: 'root'
})
export class RequestDataService {
	constructor(private testHttp: Http, private http: HTTP, private device: Device) {
		this.device = device;
		this.http = http;
		this.testHttp = testHttp;
	}

	public async getData(url) {
		const data = await this.fetchData(url);
		return this.parseJsonData(data);
	}

	private parseJsonData(data) {
		if (data.url == 'https://fantasy.premierleague.com/updating/') {
			throw new Error('Site Updating');
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
