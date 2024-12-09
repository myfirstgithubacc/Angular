import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';

@Component({selector: 'app-unauthorized',
	templateUrl: './unauthorized.component.html',
	styleUrls: ['./unauthorized.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedComponent {

	constructor( private authService: AuthGuardService, private route: Router) { }

	loginAgain(){
		this.authService.logOut();
		this.route.navigate(['auth/login']);
	}

}
