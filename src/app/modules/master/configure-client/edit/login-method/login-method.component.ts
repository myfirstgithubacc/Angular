import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { dataItemSingleSignOn, SingleSign } from '@xrm-core/models/Configure-client/staffing-agency-tier.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-login-method',
	templateUrl: './login-method.component.html',
	styleUrls: ['./login-method.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginMethodComponent implements OnInit, OnDestroy{

	public singleSignOnData: SingleSign[] = [];

	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private configureClient: ConfigureClientService,
		private cdr: ChangeDetectorRef,
		private scrollService: WindowScrollTopService
	){
		this.scrollService.scrollTop();
	}

	ngOnInit(): void {

		this.getSingleSignOnData();
	}

	private getSingleSignOnData(){
		this.configureClient.getSingleSignOn().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: ApiResponse) => {
				this.singleSignOnData = this.transformData(data.Data);
				this.singleSignOnData.forEach((res: SingleSign, index: number) => {
					const a: string[] = res.LoginCredential?.toString().split(',') ?? [];
					this.singleSignOnData[index].LoginCredential = a;
					this.singleSignOnData[index].UserType = res.UserType;
					this.singleSignOnData[index].IsDefault =res.IsDefault;
				});
				this.cdr.markForCheck();
			}
		});
	}

	private transformData(data: SingleSign[]) {
  	let transformedData: SingleSign[] = [];
  	data.forEach((res: SingleSign) => {
	  const existingEntry = transformedData.find((entry) =>
  			entry.UserType === res.UserType);
	  if (existingEntry) {
				const a = {LoginCredential: res.LoginCredential ?? [], IsDefault: res.IsDefault ?? false};
  			existingEntry.data.push(a);
	  } else {
  			transformedData.push({
		  UserType: res.UserType,
		  data: [{"LoginCredential": res.LoginCredential, "IsDefault": res.IsDefault}]
  			});
	  }
  	});
	   transformedData = transformedData.map((item) =>
  		({
  		UserType: item.UserType,
  		data: item.data.flat(Infinity).map((entry: dataItemSingleSignOn) =>
  				({
  			LoginCredential: entry.LoginCredential,
  			IsDefault: entry.IsDefault
  		}))
  	}));

  	return transformedData;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
	}
}
