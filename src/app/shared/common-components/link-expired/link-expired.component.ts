import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';

@Component({
	selector: 'app-link-expired',
	templateUrl: './link-expired.component.html',
	styleUrls: ['./link-expired.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkExpiredComponent implements OnInit {

	constructor(
    private authService: AuthGuardService,
		public route: Router
	) { }

	ngOnInit() {
	}
	public loginAgain(): void{
		this.authService.logOut();
		this.route.navigate(['auth/login']);
	}

}
