import FantasyPlayer from './FantasyPlayer';
export default class League {
	id: number;
	name: string;
	members: FantasyPlayer[];

	constructor(id = -1, name = '', members = []) {
		this.id = id;
		this.name = name;
		this.members = members;
	}
}
