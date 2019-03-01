import { PriceChange } from "./PriceChange";

export function findPriceChanges(previous: any, current: any): any[] {
	let result = [];
	for (let player of current) {
		if (previous[player.id].cost != player.cost) {
			result.push(new PriceChange(player, previous[player.id] > player.cost ? "up" : "down"));
		}
	}
	return result;
}
