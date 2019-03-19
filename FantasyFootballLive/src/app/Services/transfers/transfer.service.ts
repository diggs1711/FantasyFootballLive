import { Injectable } from '@angular/core';
import { StaticDataService } from '../static-data/static.data.service';
import { HttpRequestService } from '../http-request/http-request.service';
import { SoccerPlayerService } from '../soccer-player/soccerplayer.service';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root'
})
export class TransferService {
	constructor(
		private staticDataService: StaticDataService,
		private httpRequestService: HttpRequestService,
		private soccerPlayerService: SoccerPlayerService,
		private storage: Storage
	) {}

	async getGameweekTransfers(id: number) {
		const gameweek = await this.staticDataService.getCurrentGameweek();
		const data = await this.httpRequestService.getData(
			`https://fantasy.premierleague.com/drf/entry/${id}/transfers`
		);
		const transfers = data.history.filter((entry: any) => entry.event == gameweek);
		const key = `player-${id} gameweek-${gameweek} transfers`;
		const stored = await this.storage.get(key);

		if (stored) return stored;

		return Promise.all(
			transfers.map((transfer) => {
				return Promise.all([
					this.soccerPlayerService.getPlayerName(transfer.element_in),
					this.soccerPlayerService.getPlayerPhoto(transfer.element_in),
					this.soccerPlayerService.getPlayerName(transfer.element_out),
					this.soccerPlayerService.getPlayerPhoto(transfer.element_out)
				]);
			})
		)
			.then((result) => {
				return result.map((transfer) => {
					return {
						transfer_in: transfer[0],
						transfer_in_photo: transfer[1],
						transfer_out: transfer[2],
						transfer_out_photo: transfer[3]
					};
				});
			})
			.then((result) => {
				this.storage.set(key, result);
				return result;
			});
	}
}
