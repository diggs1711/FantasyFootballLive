import Gameweek from './Gameweek';
import SoccerPlayer from './SoccerPlayer';

export default class Team {
	id: number;
	gameweekPoints: number;
	overallPoints: number;
	players: SoccerPlayer[];
	name: string;
	captainId: number;

	constructor(id = -1, name = '', gameweek = 0, players = [], overall = 0) {
		this.id = id;
		this.name = name;
		this.gameweekPoints = gameweek;
		this.overallPoints = overall;
		this.players = players;
	}

	static composePhotoUrl(photo) {
		return '/assets/player_images/' + 'p' + photo.replace(/jpg/gi, 'png');
	}

	updateTeamPoints() {
		this.gameweekPoints = 0;

		for (const player of this.players) {
			this.gameweekPoints += player.gameweek_points;
		}

		return this.gameweekPoints;
	}

	get captain() {
		if (this.players.length > 0) return this.players.find((player) => player.id == this.captainId).name;
		return '';
	}
}
