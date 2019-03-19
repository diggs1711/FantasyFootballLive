import { Component, OnInit } from '@angular/core';
import { RedditService } from 'src/app/Services/reddit-data/reddit.service';

@Component({
	selector: 'app-news',
	templateUrl: './news.page.html',
	styleUrls: [ './news.page.scss' ]
})
export class NewsPage implements OnInit {
	latestPosts: any[];
	title: string = 'NEWS';
	showSpinner: boolean = true;

	constructor(private redditService: RedditService) {
		this.latestPosts = [];
	}

	ngOnInit() {
		this.getLatestPosts();
	}

	getLatestPosts() {
		this.redditService.getLatestLinkPosts().then((posts) => {
			this.latestPosts = posts;
			this.showSpinner = false;
		});
	}

	refresh(event) {
		this.getLatestPosts()
		event.target.complete();
	}

	openNewsStory(url: string) {
		window.open(url);
	}
}
