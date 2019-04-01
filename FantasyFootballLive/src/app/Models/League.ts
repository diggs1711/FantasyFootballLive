import FantasyPlayer from './FantasyPlayer';
export default class League {
	id: number;
	name: string;
	members: Map<number, FantasyPlayer>;

	constructor(id = -1, name = '', members = new Map<number, FantasyPlayer>()) {
		this.id = id;
		this.name = name;
		this.members = members;
	}
}
