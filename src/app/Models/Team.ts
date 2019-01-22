import Gameweek from './Gameweek';
import SoccerPlayer from './SoccerPlayer';

export default class Team {
	id: number;
	gameweekPoints: number;
	gameweek: number;
	overallPoints: number;
	Goalkeepers: SoccerPlayer[];
	Defenders: SoccerPlayer[];
	Midfielders: SoccerPlayer[];
	Forwards: SoccerPlayer[];
	Bench: SoccerPlayer[];
	players: SoccerPlayer[];
	name: string;
	captainId: number;
	captain: string;

	constructor(id = -1, name = '', gameweek = 0, players = [], overall = 0) {
		this.id = id;
		this.name = name;
		this.gameweek = gameweek;
		this.overallPoints = overall;
		this.players = players;
		this.gameweekPoints = 0;
		this.Goalkeepers = [];
		this.Defenders = [];
		this.Midfielders = [];
		this.Forwards = [];
		this.Bench = [];
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
}
