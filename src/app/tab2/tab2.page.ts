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

  constructor(private http: HTTP, private device: Device, private testHttp: Http) {
    this.http = http
    this.testHttp = testHttp
    this.device = device
    this.items = []
    this.league_name = ""
    this.init()
  }

  init() {
    this.updateLeagueList(0)
  }

  itemSelected(item: string) {
    
  }

  getLeagueData(leagueId) : Promise<HTTPResponse> {

    if(this.device.cordova) {
      return this.http.get("https://fantasy.premierleague.com/drf/leagues-classic-standings/" + leagueId, {}, {})
    }

    return this.testHttp.get("https://fantasy.premierleague.com/drf/leagues-classic-standings/" + leagueId).toPromise()
  }

  parseJsonData(data) {
    if(this.device.cordova) {
      return JSON.parse(data.data)
    }
    return data.json()
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
      results.forEach(result => {
        this.items.push({
          player_name: result.player_name,
          entry_name: result.entry_name,
          total: result.total,
          rank: result.rank,
          event_total: result.event_total
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


