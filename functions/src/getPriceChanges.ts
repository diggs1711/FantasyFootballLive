import { getCurrentPrices, getYesterdaysPrices } from './getPrices';
import { updatePrevious } from "./updatePrevious";
import { updateTodaysChanges } from "./updateTodaysChanges";
import { PriceChange } from './PriceChange';
import { database } from './init';

export function getPriceChanges() {
	return Promise.all([getYesterdaysPrices(database), getCurrentPrices()])
		.then(([previous, current]) => {
            let changes = [];
            
			if (previous) {
				changes = findPriceChanges(previous, current);
				updateTodaysChanges(changes);
			}
			else {
				updatePrevious(current);
			}
			return changes;
		});
}

function findPriceChanges(previous: any, current: any) : any[]{
	let result = []

	for(let player of current) {
		if(previous[player.id].cost != player.cost) {
			result.push(new PriceChange(player, previous[player.id] > player.cost ? "up" : "down"));
		}
	}

	return result;
}
