import League from './League';
import SoccerPlayer from './SoccerPlayer';
import Team from './Team';

export default class FantasyPlayer {
	activeChip: string;
	bank: number;
	countryImage: string;
	gameweekRank = 0;
	gameweekTransfers: SoccerPlayer[];
	gameweekTransfersCost: number;
	id: number;
	leagues: League[];
	name: string;
	overallRank = 0;
	team: Team;

	constructor(
		activeChip = '',
		bank = 0,
		countryImage = '',
		gameweekRank = -1,
		gameweekTransfers = [],
		gameweekTransfersCost = 0,
		id = -1,
		leagues = [],
		name = '',
		overallRank = -1,
		team = new Team()
	) {
		this.activeChip = activeChip;
		this.bank = bank;
		this.countryImage = countryImage;
		this.gameweekRank = gameweekRank;
		this.gameweekTransfers = gameweekTransfers;
		this.gameweekTransfersCost = gameweekTransfersCost;
		this.id = id;
		this.leagues = leagues;
		this.name = name;
		this.overallRank = overallRank;
		this.team = team;
	}
}
