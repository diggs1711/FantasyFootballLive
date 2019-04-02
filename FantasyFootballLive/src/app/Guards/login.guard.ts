import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { MainUserService } from '../Services/main-user/main-user.service';

@Injectable({
	providedIn: 'root'
})
export class LoginGuard implements CanActivate {
	constructor(
		private storage: Storage,
		private router: Router,
		private mainUserService: MainUserService
	) {}

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> | Promise<boolean> | boolean {
		return this.storage.get('user').then((user) => {
			if (user) {
				return this.mainUserService.loadSavedUser().then(() => true);
			} else {
				this.router.navigateByUrl(`/tabs/home`);
				return false;
			}
		});
	}
}
