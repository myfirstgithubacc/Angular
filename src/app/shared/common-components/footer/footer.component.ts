import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SupportContactInfo } from '@xrm-core/models/Configure-client/basic-details.model';
import { SupportDetails } from '@xrm-core/models/Configure-client/system-messages.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit{

	public support: SupportDetails = {
		contactNumber: '',
		email: ''
	};

	private isSupportDetailsFetched: boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private configureClientService: ConfigureClientService,
		private cdr: ChangeDetectorRef,
		private sessionStore: SessionStorageService
	){
		this.configureClientService.footerRefresh$
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe(() => {
		  this.getSupportDetails();
			});
	}

	ngOnInit(): void {
		if(!this.fetchSupportDetails())
		{
			this.getSupportDetails();
		}
	}

	private getSupportDetails(): void {
		this.configureClientService.getSupportDetail()
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe({
				next: (data: GenericResponseBase<SupportContactInfo>) => {
					this.sessionStore.set('supportContactNumber', data.Data?.SupportContactNumber ?? '');
					this.sessionStore.set('supportEmail', data.Data?.SupportEmail ?? '');
					this.support.contactNumber = data.Data?.SupportContactNumber ?? '';
					this.support.email = data.Data?.SupportEmail ?? '';
					this.cdr.detectChanges();
				}
			});
	}

	private fetchSupportDetails(): boolean {
		if(this.sessionStore.get('supportContactNumber') && this.sessionStore.get('supportEmail')	)
		{
			this.support.contactNumber = this.sessionStore.get('supportContactNumber')??'';
			this.support.email = this.sessionStore.get('supportEmail')?? '';
			this.isSupportDetailsFetched = true;
		}
		else
		{
			this.isSupportDetailsFetched = false;
		}
		return this.isSupportDetailsFetched;
	}

	ngOnDestroy(){
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
