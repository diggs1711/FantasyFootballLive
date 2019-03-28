import { Device } from '@ionic-native/device/ngx';
import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class HttpRequestService {
	constructor(
		private testHttp: Http,
		private http: HTTP,
		private device: Device,
		private router: Router
	) {}

	/**
	 * @description public method used to request data from external api
	 * @param url string
	 */
	public async fetch(url: string, params: {} = {}, header: {} = {}) {
		return this.parseJsonData(await this.fetchData(url, params, header));
	}

	/**
	 *
	 * @param data returned response object from the http request
	 * @description parse the json string from the response object
	 */
	private parseJsonData(res: any) {
		if (res.url === 'https://fantasy.premierleague.com/updating/') {
			this.router.navigateByUrl('/updating');
			return null;
		}

		if (this.device.cordova) {
			return JSON.parse(res.data);
		}

		return res.json();
	}

	/**
	 * @description makes http calls
	 * @param url {string}
	 */
	private fetchData(url: string, param: {} = null, header: {} = null): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, param, header);
		}
		return this.testHttp.get(url).toPromise();
	}
}
