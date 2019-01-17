export default class SoccerPlayer {
	id: number;
	gameweek_points: number;
	image: any;
	position: string;
	name: string;
	multiplier: number;

	constructor(id = -1, name = '', gameweek_points = -1, image = null, position = '') {
		this.id = id;
		this.name = name;
		this.gameweek_points = gameweek_points;
		this.image = image;
		this.position = position;
	}

	getGameweekPoints(id) {}
}
