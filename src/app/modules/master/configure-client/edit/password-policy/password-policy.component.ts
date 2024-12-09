import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PasswordPolicy } from '@xrm-core/models/Configure-client/password-policy.model';
import { CommonObjectModel } from '@xrm-core/models/Configure-client/staffing-agency-tier.model';
import { dropdownModel } from '@xrm-core/models/job-category.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-password-policy',
	templateUrl: './password-policy.component.html',
	styleUrls: ['./password-policy.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordPolicyComponent implements OnInit, OnDestroy {

  @Input() form: FormGroup;

  private destroyAllSubscribtion$ = new Subject<void>();

  private passwordPolicyUkey: string;

  public accLockedDurationRequired: boolean = true;

  public characterslimitForMin: CommonObjectModel[];

  public suspendedPeriod: CommonObjectModel[];

  public expiryNotify: CommonObjectModel[];

  public threshold: CommonObjectModel[];

  constructor(
    private configureClient: ConfigureClientService,
    private validators: CustomValidators,
		private cdr: ChangeDetectorRef,
		private scrollService: WindowScrollTopService
  ){
  	this.scrollService.scrollTop();
  }

  ngOnInit(): void {

  	this.getPasswordPolicyDropdowns();
  	this.getPasswordPolicy();

  	this.configureClient.updateObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {reasonForChange: string, update: boolean}) => {
  			if(res.update){
  				this.updatePasswordPolicy(res.reasonForChange);
  			}
  		});
  }

  private getPasswordPolicyDropdowns(){
  	forkJoin([
  		this.configureClient.getStaticDataTypeListforDropDownAsync("PasswordExpiryPeriod"),
  		this.configureClient.getStaticDataTypeListforDropDownAsync("MinMaxPasswordCharLimit"),
  		this.configureClient.getStaticDataTypeListforDropDownAsync("PasswordExpiryNotificationDays"),
  		this.configureClient.getStaticDataTypeListforDropDownAsync("InvalidAttemptThreshold")
  	]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([suspended, characterMinMax, expiryNotify, thresold]) => {
  		this.suspendedPeriod = suspended.Data;
  		this.characterslimitForMin = characterMinMax.Data;
  		this.expiryNotify = expiryNotify.Data;
  		this.threshold = thresold.Data;
  		this.cdr.markForCheck();
  	});
  }

  private getPasswordPolicy(){
  	this.configureClient.getPasswordPolicy().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: ApiResponse) => {
  		this.passwordPolicyUkey = data.Data.UKey;
  		const passwordPolicyData = new PasswordPolicy(data.Data);
  		this.form.patchValue(passwordPolicyData);
  		this.form.patchValue({
  			AccLockedDuration: data.Data.AccLockedDuration == magicNumber.zero
  				? magicNumber.threeHundred
  				: data.Data.AccLockedDuration,
  			ReqLength: { Value: data.Data.ReqLength.toString() },
  			SuspendedPeriod: { Value: data.Data.SuspendedPeriod.toString() },
  			PwdExpiryPeriod: { Value: data.Data.PwdExpiryPeriod.toString() },
  			PwdExpiryNotification: {
  				Value: data.Data.PwdExpiryNotification.toString()
  			},
  			AccLockedMaxFailedAttempts: {
  				Value: data.Data.AccLockedMaxFailedAttempts.toString()
  			}
  		});
  		this.cdr.detectChanges();
  		this.onChangethreshold({Text: '', Value: data.Data.AccLockedMaxFailedAttempts.toString()});
  	});
  }

  onChangethreshold(e: dropdownModel){
  	if(e.Value == "0"){
  		this.form.controls['AccLockedDuration'].clearValidators();
  		this.accLockedDurationRequired = false;
  	}
  	else{
  		this.form.controls['AccLockedDuration'].addValidators([
  			this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'AccountLockDuration', IsLocalizeKey: true }]),
  			this.validators.RangeValidator(
  				magicNumber.ten,
  				magicNumber.twoThousandEightHundredEighty,
  				'YouCanEnterValueBetween',
  				this.validatorsParams(magicNumber.ten, magicNumber.twoThousandEightHundredEighty)
  			)
  		]);
  		this.accLockedDurationRequired = true;
  	}
  	this.form.controls['AccLockedDuration'].updateValueAndValidity();
  }

  private validatorsParams(startingValue: number, endingValue: number) {
  	return [
  		{ Value: startingValue.toString(), IsLocalizeKey: false },
			 { Value: endingValue.toString(), IsLocalizeKey: false }
  	];
  }

  private updatePasswordPolicy(reasonForChange: string): void {

  	const passwordPolicyDataToUpload = new PasswordPolicy(this.form.value);
  	passwordPolicyDataToUpload.UKey = this.passwordPolicyUkey;
  	passwordPolicyDataToUpload.ReqLength = parseInt(this.form.controls['ReqLength'].value.Value);
  	passwordPolicyDataToUpload.SuspendedPeriod = parseInt(this.form.controls['SuspendedPeriod'].value.Value);
  	passwordPolicyDataToUpload.PwdExpiryPeriod = parseInt(this.form.controls['PwdExpiryPeriod'].value.Value);
  	passwordPolicyDataToUpload.PwdExpiryNotification = parseInt(this.form.controls['PwdExpiryNotification'].value.Value);
  	passwordPolicyDataToUpload.AccLockedMaxFailedAttempts = parseInt(this.form.controls['AccLockedMaxFailedAttempts'].value.Value);
  	passwordPolicyDataToUpload.AccLockedDuration = parseInt(this.form.controls['AccLockedDuration'].value);
  	passwordPolicyDataToUpload.ReasonForChange = reasonForChange;

  	this.configureClient
  		.updatePasswordPolicy(passwordPolicyDataToUpload)
		  .pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((data: GenericResponseBase<null>) => {
  			this.configureClient.toMove.next({ApiResponse: data, move: true});
  		});
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  }
}
