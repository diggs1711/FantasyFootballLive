import { Injectable } from '@angular/core';
import FantasyPlayer from '../Models/FantasyPlayer';
import Team from '../Models/Team';
import { RequestDataService } from './FplData/fpl-data.service';

@Injectable({
	providedIn: 'root'
})
export class FantasyPlayerService {
	constructor(private requestDataService: RequestDataService) {}

	/**
   * 
   * @param id fpl id
   * @description retrieves fantasy player from fpl site
   * @returns a new fantasy player object
   */

	getPlayerData(id): FantasyPlayer {
		return new FantasyPlayer(1, [], 'David', new Team(), 'IE', 0);
	}
}
