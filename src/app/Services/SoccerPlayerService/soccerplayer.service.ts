import { Injectable } from '@angular/core';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';

@Injectable({
	providedIn: 'root'
})
export class SoccerPlayerService {
	players: SoccerPlayer[];
	constructor() {}
}
