import FantasyPlayer from './FantasyPlayer';
export default class League {
	id: number;
	name: string;
	members: FantasyPlayer[];
	baseLeagueUrl: string;

	constructor(id = -1, name = '', members = []) {
		this.id = id;
		this.name = name;
		this.members = members;
		this.baseLeagueUrl = 'https://fantasy.premierleague.com/drf/leagues-classic-standings/';
	}

	updateLeagueRanking() {
		this.members.sort((a, b) => b.team.overallPoints - a.team.overallPoints);
	}

	addMember(fantasyPlayer: FantasyPlayer) {
		this.members.push(fantasyPlayer);
	}

	get url() {
		return this.baseLeagueUrl + this.id;
	}

	getLeagueData() {}

	get key() {
		return 'league-' + this.id;
	}

	getMember(id) {
		return this.members.find((member) => member.id === id);
	}

	onMemberSelected(memberId) {}
}
