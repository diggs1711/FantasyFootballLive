import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'cross-fetch';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp();
const database = admin.database();
const firestore = admin.firestore();

exports.checkDeadline = functions.https.onRequest((req, res) => {
	// const key = req.query.key;

	// if(!key == functions.config().cron.key) {
	//     res.status(403).send('Security key does not match. Make sure your "key" URL query parameter matches the ' +
	//     'cron.key environment variable.')
	//     return null;
	// }
	getNextDeadline();
	res.send('transfer deadline job complete');
	return null;
});

function getNextDeadline() {
	database
		.ref('fantasy-football-live')
		.child('deadline')
		.once('value')
		.then((value) => value)
		.then((time) => {
			if (!time) {
				getDeadline();
			} else if (isPastDeadline(time)) {
				getDeadline();
			} else if (lessThanSixtyMinutesToDeadline(time)) {
				database
					.ref('fantasy-football-live')
					.child('reminder-sent')
					.once('value')
					.then((sent) => {
						if (!sent.val()) {
							sendReminder();
							database.ref('fantasy-football-live').child('reminder-sent').set(true).catch((err) => {
								console.log(err);
							});
						}
					})
					.catch((err) => console.log(err));
			} else {
				return null;
			}
			return null;
		})
		.catch((err) => console.log(err));

	function getDeadline() {
		fetch('https://fantasy.premierleague.com/drf/bootstrap-static')
			.then((data) => data.json())
			.then((data) => {
				const deadlineTime = data.next_event_fixtures[0].deadline_time;
				database
					.ref('fantasy-football-live')
					.set({
						deadline: deadlineTime,
						'reminder-sent': false
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
	}

	function sendReminder() {
		firestore
			.collection('devices')
			.listDocuments()
			.then(() => {
				const message = {
					notification: {
						title: 'DEADLINE APPROACHING',
						body: 'Less than 60 minutes until the deadline, make your transfers soon',
						icon: "icon/drawable-hdpi-icon"
					},
					token: "fBhmbkPLgN0:APA91bH3JGGHCWYFLeF25pFGHg2gvcGpeK6C-6MAobtsFX_a4RDOpucYU_OAgfUK7Bpjvt3E7jrMwn3C4sx5h1jRZeRfju45cTL4hch1aoA6RHgeNcs-9UNPubyMkXlh3jumOqOtPZMa"
				};

				admin.messaging().send(message).catch(err => console.log(err))
				// for (const doc of docs) {
				// 	const message = {
				// 		notification: {
				// 			title: 'DEADLINE APPROACHING',
				// 			body: 'Less than 60 minutes until the deadline, make your transfers soon'
				// 		},
				// 		token: doc.id
				// 	};

				// 	admin.messaging().send(message).catch((err) => console.log(err));
				// 	console.log(doc.id);
				// }
			})
			.catch((err) => console.log(err));
	}
	// ref.child('deadline').set({
	// 	deadline: new Date().getTime()
	// });
	return null;
}

function isPastDeadline(time: any) {
	return new Date().getTime() >= new Date(time.val()).getTime();
}

function lessThanSixtyMinutesToDeadline(time: any) {
	const sixtyMinutesBeforeDeadline = new Date(time.val());
	sixtyMinutesBeforeDeadline.setHours(sixtyMinutesBeforeDeadline.getHours() - 1);
	return new Date().getTime() >= sixtyMinutesBeforeDeadline.getTime();
}


exports.test = functions.https.onRequest((req, res) => {
    const notification : admin.messaging.Notification = {
		title: 'Deadline Approaching',
		body: 'Less than 60 minutes until the deadline, make your transfers soon',
	}

	const payload: admin.messaging.Message = {
		notification,
		webpush: {
			notification: {
				vibrate: [200, 100, 200],
				icon: "notification_icon"
			}
		},
		android: {
			notification: {
				icon: "notification_icon",
				color: "#BF4035"
			}
		},
		token: "fBhmbkPLgN0:APA91bH3JGGHCWYFLeF25pFGHg2gvcGpeK6C-6MAobtsFX_a4RDOpucYU_OAgfUK7Bpjvt3E7jrMwn3C4sx5h1jRZeRfju45cTL4hch1aoA6RHgeNcs-9UNPubyMkXlh3jumOqOtPZMa"
	}

    admin.messaging().send(payload).catch(err => console.log(err));
    res.send("complete")
    return null
});