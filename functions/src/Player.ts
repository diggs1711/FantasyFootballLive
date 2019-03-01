export class Player {
	name: string;
	cost: number;
	id: number;
	constructor(id = -1, name = "", cost = 0) {
		this.name = name;
		this.cost = cost;
		this.id = id;
	}
}
