import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getBootstrapData } from './getData';
import { Player } from './Player';
import { getPriceChanges } from './getPriceChanges';
import { sendMessageToAllDevicses } from './sendMessageToAllDevicses';
import { database, init } from './init';


init();

exports.checkDeadline = functions.https.onRequest((req, res) => {
	getNextDeadline();
	res.send('transfer deadline job complete');
	return null;
});

exports.checkPlayerPriceChanges = functions.https.onRequest(async (req, res) => {
	let changes = await getPriceChanges();
	if(changes) {
		sendPriceChangeAlert(changes)
	}
});

exports.getPLayerPriceChanges = functions.https.onRequest(async (req, res) => {
	res.send(await getPriceChanges());
})

function sendPriceChangeAlert(changes: PriceChange[]) {
	let message = "",
		increases = 0,
		decreases = 0

	if(changes.length == 0) {
		message = "No price changes today"
	} else {
		for(let change of changes) {
			if(change.change == "up") {
				increases++
			} else if (change.change == "down") {
				decreases++
			}
		}
		message = `There were ${increases} price increases and ${decreases} decreases today. Click to find out who!`
	}

	sendMessageToAllDevicses("Prices Change Alerts", message, admin)
}

class PriceChange {
	player: Player
	change: string
	
	constructor(player = new Player(), change = "") {
		this.player = player
		this.change = change
	}
}

function getNextDeadline() {
	database
		.ref('fantasy-football-live')
		.child('deadline')
		.once('value')
		.then((value: any) => value)
		.then((time: any) => {
			if (!time) {
				getDeadline();
			} else if (isPastDeadline(time)) {
				getDeadline();
			} else if (lessThanSixtyMinutesToDeadline(time)) {
				database
					.ref('fantasy-football-live')
					.child('reminder-sent')
					.once('value')
					.then((sent: any) => {
						if (!sent.val()) {
							sendMessageToAllDevicses('DEADLINE APPROACHING', 'Less than 60 minutes until the deadline, make your transfers soon',admin)
							database.ref('fantasy-football-live').child('reminder-sent').set(true).catch((err: any) => {
								console.log(err);
							});
						}
					})
					.catch((err: any) => console.log(err));
			} else {
				return null;
			}
			return null;
		})
		.catch((err: any) => console.log(err));
	
	return null;
}

function getDeadline() {
	getBootstrapData()
		.then((data) => {
			const deadlineTime = data.next_event_fixtures[0].deadline_time;
			database
				.ref('fantasy-football-live')
				.set({
					deadline: deadlineTime,
					'reminder-sent': false
				})
				.catch((err: any) => console.log(err));
		})
		.catch((err) => console.log(err));
}

function isPastDeadline(time: any) {
	return new Date().getTime() >= new Date(time.val()).getTime();
}

function lessThanSixtyMinutesToDeadline(time: any) {
	const sixtyMinutesBeforeDeadline = new Date(time.val());
	sixtyMinutesBeforeDeadline.setHours(sixtyMinutesBeforeDeadline.getHours() - 1);
	return new Date().getTime() >= sixtyMinutesBeforeDeadline.getTime();
}
