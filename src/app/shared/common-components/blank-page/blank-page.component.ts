import { HttpStatusCode } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ReviewlinkService } from '@xrm-shared/services/reviewlink.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';

@Component({
	selector: 'app-blank-page',
	templateUrl: './blank-page.component.html',
	styleUrl: './blank-page.component.scss'
})
export class BlankPageComponent {

	public label = '';
	public label2 = '';
	public isData : boolean = false;
	private encryptedfeUkey: string;
	private unsubscribed$ = new Subject<void>();
	public displayData: ApiResponse = {};
	public StatusCode: number;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private authService: AuthGuardService,
		private reviewLinkService :ReviewlinkService,
		private localizationService: LocalizationService,
		public route: Router
	){}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			this.encryptedfeUkey = params['id1'];
			this.checkwhetherReviewLinkIsValid(this.encryptedfeUkey);
		});
	}

	// this method is used to check whether the review link is valid or not
	private checkwhetherReviewLinkIsValid(encryptedlink : string)
	{
		// calling the service to check whether the review link is valid or not
		this.reviewLinkService.checkwhetherReviewLinkIsValid(encryptedlink).pipe(takeUntil(this.unsubscribed$)).subscribe((data) => {
			this.displayData = data;
			if(data.StatusCode === Number(HttpStatusCode.Ok))
			{
				this.isData = false;
				// if the review link is valid then redirecting to the respective page
				const feRouteUkey = data.Data.ferukeyeny,
					recordUKey = data.Data.recukeyeny;
				localStorage.setItem('feRouteUkey', feRouteUkey);
				localStorage.setItem('recordUKey', recordUKey);
				localStorage.setItem('isReviewLink', 'true');
				if(sessionStorage.getItem('loggedIn') && sessionStorage.getItem('loggedIn') === 'true')
				{
					this.route.navigate(['/xrm/landing/home']);
				}
				else
				{
					this.route.navigate(['auth/login']);
				}
			}
			else
			{
				this.isData = true;
				this.StatusCode = data.Data.StatusCode ?? 401;
				this.label = this.localizationService.GetLocalizeMessage(data.Message);
				this.label2 = this.localizationService.GetLocalizeMessage(data.Data.ContactMessage);


			}
		});
	}

	loginAgain(){
		this.authService.logOut();
		this.route.navigate(['auth/login']);
	}
}
