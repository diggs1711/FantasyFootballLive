import League from './League';
import Team from './Team';

export default class FantasyPlayer {
	leagues: League[];
	name: string;
	team: Team;
	id: number;
	gameweekTransfers: number;
	gameweekTransfersCost: number;
	activeChip: string;

	constructor(id = -1, leagues = [], name = '', team = new Team()) {
		this.leagues = leagues;
		this.name = name;
		this.team = team;
		this.id = id;
	}

	getLeagues() {
		return this.leagues;
	}

	removeLeague(id) {
		this.leagues = this.leagues.filter((league) => league.id != id);
	}

	addLeague(id, name) {
		const newLeague = new League(id, name);
		this.leagues.push(newLeague);
	}

	static createFantasyPlayersArray(array) {
		const newArray = [];
		for (const member of array) {
			const newTeam = new Team(member.entry, member.entry_name);
			const newPlayer = new FantasyPlayer(member.id, null, member.player_name, newTeam);
			newArray.push(newPlayer);
		}
		return newArray;
	}
}
