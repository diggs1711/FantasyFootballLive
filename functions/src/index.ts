import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'cross-fetch';

admin.initializeApp();
const database = admin.database();
const firestore = admin.firestore();

//http endpoint
exports.checkDeadline = functions.https.onRequest((req, res) => {
	getNextDeadline();
	res.send('transfer deadline job complete');
	return null;
});

//retrieves the next deadline
function getNextDeadline() {
	database
		.ref('fantasy-football-live')
		.child('deadline')
		.once('value')
		.then((value) => value)
		.then((time) => {
			//if the database does not contain a time then get the next deadline
			if (!time) {
				getDeadline();
			} else if (isPastDeadline(time)) {
				getDeadline();
			} else if (lessThanSixtyMinutesToDeadline(time)) {
				//if less than 60 mins before deadline, check if the notification has been sent already, if not send it
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
			.then((docs) => {
				for (const doc of docs) {
					const notification : admin.messaging.Notification = {
						title: 'Deadline Approaching',
						body: 'Less than 60 minutes until the deadline, make your transfers soon!',
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
						token: doc.id
					}
				
					admin.messaging().send(payload).catch(err => console.log(err));
				}
			})
			.catch((err) => console.log(err));
	}

	return null;
}

function isPastDeadline(time: any) {
	return new Date().getTime() >= new Date(time.val()).getTime();
}

function lessThanSixtyMinutesToDeadline(time: any) {
	//creating new date object with time of next deadline
	const sixtyMinutesBeforeDeadline = new Date(time.val());

	//setting date object to 60 mins before deadline is due to occur
	sixtyMinutesBeforeDeadline.setHours(sixtyMinutesBeforeDeadline.getHours() - 1);

	//checking if current time is after date object 
	return new Date().getTime() >= sixtyMinutesBeforeDeadline.getTime();
}

// exports.test = functions.https.onRequest((req, res) => {
//     const notification : admin.messaging.Notification = {
// 		title: 'Deadline Approaching',
// 		body: 'Less than 60 minutes until the deadline, make your transfers soon!',
// 	}

// 	const payload: admin.messaging.Message = {
// 		notification,
// 		webpush: {
// 			notification: {
// 				vibrate: [200, 100, 200],
// 				icon: "notification_icon"
// 			}
// 		},
// 		android: {
// 			notification: {
// 				icon: "notification_icon",
// 				color: "#BF4035"
// 			}
// 		},
// 		token: "f-IiztywR5A:APA91bFcd0ldmwIjFIVaL7yXcsLMoKAjsOxPB3Ex9fTLjzwQ0JPh_Kr-8H9qmFE5LLhQ1740KtaIiIcgny8XGYUZZROuZ35UVKOf565-dU-z1xAG8lu7QVBAWdr4BTYaGTPD5NFI4sKu"
// 	}

//     admin.messaging().send(payload).catch(err => console.log(err));
//     res.send("complete")
//     return null
// });