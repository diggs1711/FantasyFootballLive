import { Component, OnInit } from '@angular/core';
import { RequestDataService } from '../Services/FplData/fpl-data.service';

@Component({
	selector: 'app-news',
	templateUrl: './news.page.html',
	styleUrls: [ './news.page.scss' ]
})
export class NewsPage implements OnInit {
	latestPosts: any[];
	constructor(private requestDataService: RequestDataService) {
		this.latestPosts = [];
	}

	ngOnInit() {
		this.getLatestPosts();
	}

	getLatestPosts() {
		this.requestDataService.getData('https://www.reddit.com/r/fantasypl/new/.json?limit=40%27').then((data) => {
			this.latestPosts = data.data.children.filter((post) => !post.data.is_self).map((post) => {
				return {
					url: post.data.url,
					title: post.data.title,
					image: post.data.thumbnail
				};
			});
		});
	}
}
