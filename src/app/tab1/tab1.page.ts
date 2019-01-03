import { Component } from '@angular/core';

@Component({
	selector: 'app-tab1',
	templateUrl: 'tab1.page.html',
	styleUrls: [ 'tab1.page.scss' ]
})
export class Tab1Page {
	constructor() {
		this.login();
	}

	login() {
		console.log('login');
		fetch('https://fantasy.premierleague.com/', {
			credentials: 'include',
			mode: 'no-cors',
			method: 'GET',
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		}).then((resp) => {
			console.log(resp);
		});

		// 	fetch('https://users.premierleague.com/accounts/login/', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/x-www-form-urlencoded'
		// 		},
		// 		mode: 'no-cors',
		// 		credentials: 'include',
		// 		body:
		// 			'csrfmiddlewaretoken=AkElC8S1CHQe6W1FU3GdTouKK6pzrTCo&login=davidhiggins1712%40gmail.com&password=matchy123*'
		// 	})
		// 		.then(function(response) {
		// 			console.log(response);
		// 		})
		// 		.then(function(myJson) {
		// 			console.log(JSON.stringify(myJson));
		// 		});
		// }
	}
}
