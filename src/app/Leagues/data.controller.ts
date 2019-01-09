import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Http } from '@angular/http';

export default class DataController {
	static device: any;
	static http: any;
	static testHttp: any;

	constructor(private testHttp: Http, private http: HTTP, private device: Device) {
		this.device = device;
		this.http = http;
		this.testHttp = testHttp;
	}

	getData(url): Promise<HTTPResponse> {
		if (this.device.cordova) {
			return this.http.get(url, {}, {});
		}
		return this.testHttp.get(url).toPromise();
	}
}
