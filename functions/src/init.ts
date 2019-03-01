import * as admin from 'firebase-admin';
export let database: any = null,
    firestore: any = null;
    
export function init() {
	admin.initializeApp();
	database = admin.database();
	firestore = admin.firestore();
}

export const fflDatabase = database.ref('fantasy-football-live');