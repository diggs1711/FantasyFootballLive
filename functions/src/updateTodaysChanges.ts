import { fflDatabase } from "./init";

export function updateTodaysChanges(changes: any[]) {
	const today = new Date().getTime();
	fflDatabase.child('price-changes').set({
		date: today,
		changes
	});
	return null;
}
