import { Component } from '@angular/core';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Http } from '@angular/http'
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class LeaguePage {
  items: any[];
  league_name: string;
  LEAGUES_URL: string;
  liveFplData: {};

  constructor(private http: HTTP, private device: Device, private testHttp: Http) {
    this.http = http
    this.testHttp = testHttp
    this.device = device
    this.items = []
    this.liveFplData = null
    this.league_name = ""
    this.LEAGUES_URL = "https://fantasy.premierleague.com/drf/leagues-classic-standings/"
    this.init()
  }

  init() {
    this.updateLeagueList(0)
  }

  itemSelected(item: string) {
    
  }

  getData(url) : Promise<HTTPResponse> {
    if(this.device.cordova) {
      return this.http.get(url, {}, {})
    }
    return this.testHttp.get(url).toPromise()
  }

  getCurrentGameweek() {
    return this.getData("https://fantasy.premierleague.com/drf/bootstrap-static")
    .then(data => this.parseJsonData(data))
    .then(json => json["current-event"]);
  }

  getLeagueData(leagueId) : Promise<HTTPResponse> {
      return this.getData(this.LEAGUES_URL + leagueId)
  }

  parseJsonData(data) {
    if(this.device.cordova) {
      return JSON.parse(data.data)
    }
    return data.json()
  }

  getPlayerPicks(id, gameweek) {
    return this.getData(`https://fantasy.premierleague.com/drf/entry/${id}/event/${gameweek}/picks`)
    
  }

  getLiveData(gameweek) {
    return this.getData(`https://fantasy.premierleague.com/drf/event/${gameweek}/live`)
  }

  updateLeagueList(leagueId) {
    leagueId = "218801"
    this.getLeagueData(leagueId)
    .then(response => this.parseJsonData(response))
    .then(json => {
      this.league_name = json.league.name
      return json.standings.results
    })
    .then(results => {
      this.clearList()
      return results;
    })
    .then(async players => {
      const gameweek = await this.getCurrentGameweek()
      players.forEach(player => {
        this.getPlayerPicks(player.entry, gameweek)
        .then(data => this.parseJsonData(data))
        .then(json => json.picks)
        .then(async picks => {
          if(!this.liveFplData) {
            let result = await this.getLiveData(gameweek)
            let parsedData = this.parseJsonData(result)
            this.liveFplData = parsedData['elements']
          }

          let totalLivePoints = picks.reduce((acc, pick) => {
            if(pick.position <= 11) {
              if(pick.is_captain) {
                return (this.liveFplData[pick.element]['stats']['total_points'] * 2) + acc
              }
              return this.liveFplData[pick.element]['stats']['total_points'] + acc
            }
            return acc
          }, 0)

          this.items.push({
              player_name: player.player_name,
              entry_name: player.entry_name,
              total: player.total + totalLivePoints,
              rank: player.rank,
              event_total: totalLivePoints,
              movement: ""
          });
        })
        .then(() => {
          this.items.sort((a,b) => b.total - a.total)
          this.items.map((item, index) => {
            let newRank = index+1
            item.movement = item.rank > newRank ? "success" : "danger"
            item.rank = index + 1
          })
        })
      });
      
    })
    .catch(err => {
      console.error(err)
    })
  }

  clearList() {
    this.items = []
  }

}


