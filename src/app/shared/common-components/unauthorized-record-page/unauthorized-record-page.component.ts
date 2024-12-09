import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';

@Component({
	selector: 'app-unauthorized-record-page',
	standalone: true,
	imports: [],
	templateUrl: './unauthorized-record-page.component.html',
	styleUrl: './unauthorized-record-page.component.scss'
})
export class UnauthorizedRecordPageComponent {
	constructor( private authService: AuthGuardService, private route: Router) { }

	loginAgain(){
		this.authService.logOut();
		// this.route.navigate(['auth/login']);
	}

}
