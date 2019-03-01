import { Player } from './Player';
export class PriceChange {
	player: Player;
	change: string;
	constructor(player = new Player(), change = "") {
		this.player = player;
		this.change = change;
	}
}
