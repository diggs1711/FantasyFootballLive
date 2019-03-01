import { firestore } from "./init";


export function sendMessageToAllDevicses(title: string, notificationMessage: string, admin: any) {
	firestore
		.collection('devices')
		.listDocuments()
		.then((docs: any) => {
			// for (const doc of docs) {
			// 	const message = {
			// 		notification: {
			// 			title: title,
			// 			body: notificationMessage
			// 		},
			// 		token: doc.id
			// 	};
			// 	admin.messaging().send(message).catch((err: any) => console.log(err));
			// }
		})
		.catch((err: any) => console.log(err));
}
