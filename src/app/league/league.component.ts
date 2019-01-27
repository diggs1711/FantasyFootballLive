import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingController, NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { RequestDataService } from '../Services/FplData/fpl-data.service';
import League from '../Models/League';
import FantasyPlayer from '../Models/FantasyPlayer';
import { Storage } from '@ionic/storage';
import Team from 'src/app/Models/Team';
import { LiveDataService } from '../Services/LiveData/live.data.service';
import { StaticDataService } from '../Services/StaticData/static.data.service';
import SoccerPlayer from 'src/app/Models/SoccerPlayer';
import { PitchComponent } from '../Components/ui/pitch/pitch.component';

@Component({
	selector: 'app-league',
	templateUrl: './league.component.html',
	styleUrls: [ './league.component.scss' ]
})
export class LeagueComponent implements OnInit {
	liveFplData: {};
	staticData: {};
	loading: Promise<HTMLIonLoadingElement>;
	league: League;
	currentGameweek: any;
	currentGameweekKey: string;
	staticKey: string;
	isGameweekUpdated: boolean;
	playerHistoryKey: any;
	playerPicksKey: any;
	fantasyPlayer: FantasyPlayer;
	members: FantasyPlayer[];
	leagueName: string;
	soccerPlayers: any;
	membersGameweekData: any;
	membersGameweekHistory: any;
	showSpinner: boolean = true;

	constructor(
		public loadingController: LoadingController,
		public modalController: ModalController,
		private requestDataService: RequestDataService,
		private storage: Storage,
		private navParams: NavParams,
		private liveDataService: LiveDataService
	) {
		this.members = this.navParams.data.members || [];
		this.leagueName = this.navParams.data.name || '';
		this.liveFplData = null;
		this.membersGameweekData = null;
		this.membersGameweekHistory = null;
		this.staticData = null;
		this.currentGameweekKey = 'current_gameweek';
		this.playerHistoryKey = 'player_history';
		this.playerPicksKey = 'player_picks';
		this.staticKey = 'static_data';
		this.soccerPlayers = null;
	}

	ngOnInit() {
		this.loadMemebersData();
	}

	getBootstrapData() {
		return this.requestDataService.getData('https://fantasy.premierleague.com/drf/bootstrap-static');
	}

	loadMemebersData() {
		this.getBootstrapData().then((bootstrap) => {
			const { 'current-event': currentGameweek, elements: soccerPlayers } = bootstrap;
			this.soccerPlayers = soccerPlayers;
			Promise.all([
				this.getMembersCurrentGameweekData(currentGameweek).catch(() => undefined),
				this.liveDataService.getLiveData(currentGameweek),
				this.getMembersGameweekHistory().catch(() => undefined)
			])
				.then(([ membersGameweekData, liveData, membersGameweekHistory ]: [[], {}, []]) => {
					this.constructLeague(membersGameweekData, liveData, membersGameweekHistory);
					return null;
				})
				.finally(() => (this.showSpinner = false));
		});
	}

	constructLeague(membersGameweekData: [], liveData: {}, membersGameweekHistory: []) {
		this.membersGameweekData = this.membersGameweekData || membersGameweekData || [];
		this.liveFplData = this.liveFplData || liveData || [];
		this.membersGameweekHistory = this.membersGameweekHistory || membersGameweekHistory || [];

		for (let index = 0; index < membersGameweekData.length; index++) {
			const playerGameweekData = membersGameweekData[index];
			const gameweekHistoryData = membersGameweekHistory[index];
			const fantasyPlayer = this.members[index];

			//Current Gameweek data
			if (playerGameweekData && gameweekHistoryData) {
				this.constructTeam(playerGameweekData, fantasyPlayer, gameweekHistoryData);
			}
		}
	}

	constructTeam(playerGameweekData, fantasyPlayer: FantasyPlayer, gameweekHistoryData) {
		const playersPicks = playerGameweekData.picks;
		fantasyPlayer.gameweekTransfers = playerGameweekData.entry_history.event_transfers;
		fantasyPlayer.gameweekTransfersCost = playerGameweekData.entry_history.event_transfers_cost;
		fantasyPlayer.activeChip = playerGameweekData.active_chip;

		//this is actually live data for chips played and transfered played and not the previous gameweek
		//data from FPL is all over the place
		const active_chip = playerGameweekData.active_chip;
		const active_transfers = playerGameweekData.entry_history.event_transfers;
		const active_transfers_cost = playerGameweekData.entry_history.event_transfers_cost;

		let team = fantasyPlayer.team;
		team.overallPoints = this.getOverallPointsLastWeek(gameweekHistoryData.history);
		team.players = this.createTeamPlayers(team, playersPicks);
		for (const player of fantasyPlayer.team.players) {
			player.gameweek_points = this.getLivePlayerPoints(this.liveFplData, player.id) * player.multiplier;
		}

		this.calculateGameweekPoints(team);
		team.overallPoints += team.gameweekPoints - fantasyPlayer.gameweekTransfersCost;
	}

	/**
	 * 
	 * @param team A fantasy team 	
	 * @param picks players selected by the fantasy manager for the current week
	 * @returns array of selected soccer players without relevent data pertaining to each soccer player
	 */
	createTeamPlayers(team: Team, picks) {
		const newPlayers = [];
		for (const pick of picks) {
			const newPlayer = this.createPlayer(pick.element);
			newPlayer.multiplier = pick.multiplier;
			newPlayer.position = this.getPosition(newPlayer.position_type);
			newPlayer.teamPosition = pick.position;
			if (pick.is_captain) {
				newPlayer.isCaptain = true;
				team.captain = newPlayer.name;
			}
			newPlayers.push(newPlayer);
		}
		return newPlayers;
	}

	/**
	 * 
	 * @param type player type
	 * @returns returns text version of position
	 */
	getPosition(type: number) {
		const indx = Number(type);

		switch (indx) {
			case 0:
				return 'Goalkeepers';
				break;
			case 1:
				return 'Defenders';
				break;
			case 2:
				return 'Midfielders';
				break;
			case 3:
				return 'Forwards';
				break;
			case 4:
				return 'Bench';
				break;
			default:
				break;
		}
	}

	/**
	 * 
	 * @param id soccer player id
	 * @return new instance of soccer player
	 */
	createPlayer(id) {
		const newPlayer = new SoccerPlayer(id);
		const player = this.soccerPlayers.find((player) => player.id == id);
		newPlayer.name = player.web_name;
		newPlayer.image = Team.composePhotoUrl(player.photo);
		newPlayer.position_type = player.element_type;
		return newPlayer;
	}

	/**
	 * 
	 * @param live live data received from fpl
	 * @param playerId id of player we are looking for
	 * @description extracts the live points of a soccer player
	 */
	getLivePlayerPoints(live, playerId): number {
		return live['elements'][playerId]['stats']['total_points'];
	}

	/**
	 * 
	 * @param gameweekHistory array of past gameweeks
	 * @returns {number} total overall points after last week
	 */
	getOverallPointsLastWeek(gameweekHistory) {
		return gameweekHistory[gameweekHistory.length - 2].total_points;
	}

	/**
	 * 
	 * @param team Team object
	 * @returns {number} total live points for the current gameweek
	 */
	calculateGameweekPoints(team: Team) {
		team.gameweekPoints = 0;

		for (const player of team.players) {
			if (player.teamPosition < 12) team.gameweekPoints += player.gameweek_points;
		}

		return team.gameweekPoints;
	}

	/**
	 * 
	 * @param gameweek current gameweek
	 * @description retrieves all fantasy league players picks from the current selected league for the current gameweek
	 * @returns promise
	 */
	async getMembersCurrentGameweekData(gameweek) {
		return Promise.all(
			this.members.map((member) => this.getMemberCurrentGameweek(member.team.id, gameweek))
		).catch((err) => {
			console.log(`failed to retrieve player picks` + err);
		});
	}

	async getMembersGameweekHistory() {
		return Promise.all(
			this.members.map((member) => this.getPlayerGameweekHistory(member.team.id).catch(() => undefined))
		).catch((err) => console.log('failed to get player history', err));
	}
	/**
	 * 
	 * @param id fantasy player id
	 * @param gameweek current gameweek
	 * @description get the picks for this week for a fantasy player
	 */
	getMemberCurrentGameweek(id, gameweek) {
		return this.getDataAsyncOrRetrieveStored(
			this.playerPicksKey,
			id,
			this.composeCurrentGameweekInfoUrl(id, gameweek)
		);
	}

	/**
	 * 
	 * @param id id of player whos gameweek history we are looking for
	 */
	getPlayerGameweekHistory(id) {
		return this.getDataAsyncOrRetrieveStored(this.playerHistoryKey, id, this.composePlayerGameweekHistoryUrl(id));
	}

	/**
	 * 	
	 * @param playerId id
	 * @param currentGameweek current gameweek
	 * @description formats the url correctly for each player
	 */
	composeCurrentGameweekInfoUrl(playerId: any, currentGameweek: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/event/${currentGameweek}/picks`;
	}

	composePlayerGameweekHistoryUrl(playerId: any): any {
		return `https://fantasy.premierleague.com/drf/entry/${playerId}/history`;
	}

	closeModal() {
		this.modalController.dismiss();
	}

	refreshLeague(event) {
		this.refresh();
		event.target.complete();
	}

	refresh() {
		if (this.membersGameweekData && this.membersGameweekHistory) {
			this.liveDataService.getLiveData(this.currentGameweek).then((result) => {
				this.liveFplData = result;
				this.constructLeague(this.membersGameweekData, this.liveFplData, this.membersGameweekHistory);
			});
		}
	}

	async leaguePlayerSelected(playerId) {
		const selectedPlayer = this.members.find((memeber) => memeber.team.id == playerId);
		const modal = await this.modalController.create({
			component: PitchComponent,
			componentProps: {
				fantasyPlayer: selectedPlayer,
				gameweek: this.currentGameweek
			}
		});
		return await modal.present();
	}

	removeLeague(leagueId) {
		if (leagueId) {
			this.fantasyPlayer.removeLeague(leagueId);
		}
	}

	leagueSelected(leagueId) {
		this.league.onMemberSelected(leagueId);
	}

	async getDataAsyncOrRetrieveStored(key, id, url) {
		const userkey = `${key}-${id}`;
		const storedData = await this.storage.get(userkey);

		if (!storedData) {
			const data = await this.requestDataService.getData(url);
			//this.storage.set(userkey, data);
			return data;
		}
		return storedData;
	}

	persistLeague(leagueId, leagueName) {
		this.fantasyPlayer.addLeague(leagueId, leagueName);
	}

	getLeagueData(leagueId) {
		this.league.getLeagueData();
	}

	addPlayerToLeague(fantasyPlayer: FantasyPlayer) {
		this.league.addMember(fantasyPlayer);
	}
}
