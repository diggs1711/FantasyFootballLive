import League from './League';
import Team from './Team';
import SoccerPlayer from './SoccerPlayer';

export default class FantasyPlayer {
	leagues: League[];
	gameweekTransfersPlayers: SoccerPlayer[];
	name: string;
	team: Team;
	id: number;
	gameweekTransfers: number;
	gameweekTransfersCost: number;
	activeChip: string;
	country: string;
	bank: number;
	overallRank: number = 0;
	gameweekRank: number = 0;

	constructor(
		id = -1,
		leagues = [],
		name = '',
		team = new Team(),
		country = '',
		overallRank: number,
		transfers: number = 0
	) {
		this.leagues = leagues;
		this.name = name;
		this.team = team;
		this.id = id;
		this.country = country;
		this.overallRank = overallRank;
		this.gameweekTransfers = transfers;
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
			const newPlayer = new FantasyPlayer(member.id, null, member.player_name, newTeam, '', 0);
			newArray.push(newPlayer);
		}
		return newArray;
	}
}
