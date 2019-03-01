export default class SoccerPlayer {
	id: number;
	gameweek_points: number;
	image: any;
	position: string;
	position_type: number;
	name: string;
	multiplier: number;
	teamPosition: number;
	isCaptain: boolean;
	fixtures: any[];

	constructor(
		id = -1,
		name = '',
		gameweek_points = -1,
		image = null,
		teamPosition = 0,
		position = '',
		positionType = 0
	) {
		this.id = id;
		this.name = name;
		this.gameweek_points = gameweek_points;
		this.image = image;
		this.position = position;
		this.teamPosition = teamPosition;
		this.isCaptain = false;
		this.position_type = positionType;
	}

	getGameweekPoints(id) {}
}
