import { Injectable } from '@angular/core';
import League from 'src/app/Models/League';

@Injectable({
	providedIn: 'root'
})
export class LeaguesService {
	constructor() {}

	async getLeagueData(id: number): Promise<League> {
		return null;
	}
}
