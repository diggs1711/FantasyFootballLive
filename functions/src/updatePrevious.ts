import * as Player_1 from './Player';
import { fflDatabase } from './init';

export function updatePrevious(current: Player_1.Player[]) {
	let prices = fflDatabase.child('player-prices');
	for (let player of current) {
		prices.child(player.id.toString()).set(player);
	}
}
