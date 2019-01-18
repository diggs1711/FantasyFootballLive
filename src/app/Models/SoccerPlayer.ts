export default class SoccerPlayer {
	id: number;
	gameweek_points: number;
	image: any;
	position: number;
	name: string;
	multiplier: number;
	position_number: any;
	isCaptain: boolean;

	constructor(id = -1, name = '', gameweek_points = -1, image = null, position = 0) {
		this.id = id;
		this.name = name;
		this.gameweek_points = gameweek_points;
		this.image = image;
		this.position = position;
		this.position_number = -1;
		this.isCaptain = false;
	}

	getGameweekPoints(id) {}
}
