import { HttpStatusCode } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BasicDetails, validationMessage } from '@xrm-core/models/Configure-client/basic-details.model';
import { dropdownModel } from '@xrm-core/models/job-category.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { FocusOnErrorDirective } from '@xrm-shared/directives/focus-on-erro.directive';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-basic-details',
	templateUrl: './basic-details.component.html',
	styleUrls: ['./basic-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDetailsComponent implements OnInit, OnDestroy{

  @Input() form: FormGroup;

  private destroyAllSubscribtion$ = new Subject<void>();

  public time: dropdownModel[] | null | undefined;

  public language: dropdownModel[];

  public country: dropdownModel[] | null | undefined;

  public weekend: dropdownModel[] | null | undefined;

  private basicDetailsConfigureClientUkey: string;

  public weekendingDatesAllowedTrue: boolean;

  public sowReq: boolean;

  private clientName:string;

  public PortalImplementationTextParams: DynamicParam[];

  private noOfPreviousWeekending: number;

  private focus: FocusOnErrorDirective = new FocusOnErrorDirective();

  public clientConfigureType: dropdownModel[] | null | undefined = [
  	{ Text: 'National', Value: 'National' },
  	{ Text: 'International', Value: 'International' }
  ];

  constructor(
    	private validators: CustomValidators,
		private toasterService : ToasterService,
    	private configureClient: ConfigureClientService,
    	private localizationService: LocalizationService,
    	private cdr: ChangeDetectorRef,
		private widget: WidgetServiceService,
		private scrollService: WindowScrollTopService,
		private translateService: TranslateService
  ){
  	this.scrollService.scrollTop();
  }

  ngOnInit(): void {
  	forkJoin([
  		this.configureClient.getTimeZone(),
  		this.configureClient.getCountry(),
  		this.configureClient.getWeekending()
  	]).
  		pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([
  			timeZone,
  			country,
  			weekend
  		]) => {
  			this.time = timeZone.Data;
  			this.country = country.Data;
  			this.weekend = weekend.Data;
  			this.cdr.markForCheck();
  		});

  	this.getBasicDetails();
  	this.configureClient.updateObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {reasonForChange: string, update: boolean}) => {
  		if(res.update){
  			this.updateBasicdetails(res.reasonForChange);
  		}
  	});
  }

  private validatorsParams(startingValue: number, endingValue: number) {
  	return [
  		{ Value: startingValue.toString(), IsLocalizeKey: false },
			 { Value: endingValue.toString(), IsLocalizeKey: false }
  	];
  }

  private getBasicDetails(): void {
  	this.configureClient
  		.getBasicDetails()
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe({
  			next: (data: ApiResponse) => {

  				this.basicDetailsConfigureClientUkey = data.Data.Ukey;
  				this.weekendingDatesAllowedTrue = data.Data.IsLimitAvailableWeekendingInTimeCapture;
  				this.sowReq = data.Data.IsRfxRequired;
  				this.clientName = data.Data.Name;
  				const basicDetailsData = new BasicDetails(data.Data);
  				this.PortalImplementationTextParams = [
  					{ Value: this.clientName, IsLocalizeKey: true },
  					{ Value: this.clientName, IsLocalizeKey: true }
  				];
  				this.noOfPreviousWeekending = data.Data.NoOfPreviousWeekending;

  				this.onCountryChange({Value: data.Data.CountryId.toString(), Text: data.Data.HomeCountry});

  				this.form.patchValue(basicDetailsData);

  				this.form.patchValue({
  					TimezoneId: { Value: data.Data.TimezoneId.toString() },
  					DefaultCulture: { Value: data.Data.DefaultCultureId.toString() },
  					CountryId: { Value: data.Data.CountryId.toString() },
  					WeekEndingDayId: { Value: data.Data.WeekEndingDayId.toString() }
  				});

  				this.cdr.markForCheck ();

  				this.configureClient.sowReq.next(data.Data.IsRfxRequired);
  			},
  			complete: () => {

  				if(this.form.controls['IsRfxRequired'].value)
  					this.form.controls['IsRfxRequired'].disable();

  				if(this.form.controls['IsAcroTracInOutTime'].value)
  				   	this.form.controls['IsAcroTracInOutTime'].disable();
  			},
			 error: () => {
  				// will be implemented later
  			}
  		});
  }

  public getLocalizedText(key: string, params?: DynamicParam[]): string {
  	let localizedText = this.translateService.instant(key);

  	if (params && params.length > 0) {
  		params.forEach((param, index) => {
  			const placeholder = `{{placeholder${index + magicNumber.one}}}`;
  			localizedText = localizedText.replace(placeholder, param.Value);
  		});
  	}

  	return localizedText;
  }


  public onEmailTextBoxChange(formName: FormGroup, controlName: string, label: string) {
  	if (formName.controls['SupportEmail']) {
  		const emailDomain = formName.controls['EmailDomain'].value,
		 validDomains = emailDomain
  				? emailDomain.split(',').map((domain: string) =>
  					domain.trim())
  				: [];

  		if (controlName === "SupportEmail" || controlName === "ProgramManagerEmail" || controlName === "Email") {
  			const supportEmail = formName.controls[controlName].value;

  			if (validDomains.length > 0) {
  				const isValidSupportEmail = validDomains.some((domain: string) =>
  					supportEmail.endsWith(domain));

  				if (!isValidSupportEmail) {
  					formName.controls[controlName].setErrors({
  						message: 'EmailDomainSameAsClientDomain'
  					});
  					return;
  				} else {
  					formName.controls[controlName].setErrors(null);
  				}
  			}
  		}
  	}

  	if (!formName.valid) {
  		if (!formName.controls[controlName].valid) {
  			if (controlName === "Email") {
  				this.removeAndSetValidators(
  					formName, controlName,
  					[this.validators.EmailValidator()]
  				);
  			} else if (controlName === "SupportEmail" || controlName === "ProgramManagerEmail") {
  				this.removeAndSetValidators(
  					formName, controlName,
  					[
  						this.validators.RequiredValidator('PleaseEnterData', [{ Value: label, IsLocalizeKey: true }]),
  						this.validators.EmailValidator()
  					]
  				);
  			} else {
  				this.removeAndSetValidators(formName, controlName, [
  					this.validators.RequiredValidator('PleaseEnterData', [{ Value: label, IsLocalizeKey: true }]),
  					this.validators.MultiEmailValidator('MultipleEmailValidationMessage')
  				]);
  			}
  		}
  	}
  }

  private removeAndSetValidators(
  	formName: FormGroup,
  	controlName: string,
  	validatorsList: ValidatorFn[] | ValidatorFn
  ): void {
  	formName.controls[controlName].setErrors(null);
  	formName.controls[controlName].clearValidators();
  	formName.controls[controlName].addValidators(validatorsList);
  	formName.controls[controlName].updateValueAndValidity();
  }

  public EmailDomainChange(){
  	this.removeDynamicApiValidationMessagesBasicDetails(['SupportEmail', 'ProgramManagerEmail', 'Email']);

  	const value = this.form.controls['EmailDomain'].value;
  	this.form.controls['EmailDomain'].patchValue(value.replace(/\s\s\s+/g, '  '));
  }

  private removeDynamicApiValidationMessagesBasicDetails(data: string[]){
  	for (const field of data){
  		this.form.controls[field].clearValidators();
  		this.form.controls[field].updateValueAndValidity();
  	}

  	this.form.controls['Email'].addValidators(this.validators.EmailValidator());
  	this.form.controls['ProgramManagerEmail'].addValidators([this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'ProgramManagerEmailAddress', IsLocalizeKey: true }]), this.validators.EmailValidator()]);
  	this.form.controls['SupportEmail'].addValidators([this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'EmailAddress', IsLocalizeKey: true }]), this.validators.EmailValidator()]);

  	for (const field of data){
  		this.form.controls[field].updateValueAndValidity();
  	}
  }

  public onCountryChange(e:dropdownModel){
  	this.form.controls['DefaultCulture'].patchValue(null);
  	this.configureClient.getLanguageByCountry(e.Value).pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: GenericResponseBase<dropdownModel[]>) => {
  			this.language = res.Data ?? [];

  		});
  }

  public weekendingLimitChangefn(event: boolean): void {
  	this.weekendingDatesAllowedTrue = event;
	    if(!event)
  	{
  		this.form.controls['NoOfPreviousWeekending'].clearValidators();
  		this.form.controls['NoOfPreviousWeekending'].markAsPristine();
  		this.form.controls['NoOfPreviousWeekending'].updateValueAndValidity();
  	}
  	else
  	{
  		this.form.controls['NoOfPreviousWeekending'].setValidators([
  			this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'NoOfPastWeekeding', IsLocalizeKey: true }]), this.validators.RangeValidator(
  			magicNumber.one,
  			magicNumber.sixty,
  			'NoOfPreviousWeekEndingDatesValidation',
  			this.validatorsParams(magicNumber.one, magicNumber.sixty)
  		)
  		]);
  		this.form.controls['NoOfPreviousWeekending'].updateValueAndValidity();
  	}
  	this.form.updateValueAndValidity();
  }

  private updateBasicdetails(reasonForChange: string): void {

  	const basicDetailDatatoUpdate = new BasicDetails(this.form.value);
  	basicDetailDatatoUpdate.UKey = this.basicDetailsConfigureClientUkey;
  	basicDetailDatatoUpdate.CountryId = this.form.controls['CountryId'].value.Value;
  	basicDetailDatatoUpdate.DefaultCultureId = parseInt(this.form.controls['DefaultCulture'].value.Value);
  	basicDetailDatatoUpdate.TimezoneId = this.form.controls['TimezoneId'].value.Value;
  	basicDetailDatatoUpdate.WeekEndingDayId = this.form.controls['WeekEndingDayId'].value?.Value || '';
  	basicDetailDatatoUpdate.SupportContactNumber = this.form.controls['SupportContactNumber'].value;
  	basicDetailDatatoUpdate.SupportEmail = this.form.controls['SupportEmail'].value;
  	basicDetailDatatoUpdate.IsRfxRequired = this.form.controls['IsRfxRequired'].value;
  	basicDetailDatatoUpdate.IsAcroTracInOutTime = this.form.controls['IsAcroTracInOutTime'].value;
  	if(!basicDetailDatatoUpdate.IsAcroTracInOutTime){
  		basicDetailDatatoUpdate.NoOfPreviousWeekending =this.noOfPreviousWeekending;
  	}
  	this.clientName = this.form.controls['Name'].value;
  	this.PortalImplementationTextParams = [
  		{ Value: this.clientName, IsLocalizeKey: true },
  		{ Value: this.clientName, IsLocalizeKey: true }
  	];
  	basicDetailDatatoUpdate.ReasonForChange = reasonForChange;
  	this.updateBasicDetailUsingService(basicDetailDatatoUpdate);
  }


  private updateBasicDetailUsingService(basicDetailDatatoUpdate :BasicDetails){
  	this.configureClient.updateBasicDetails(basicDetailDatatoUpdate).pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((data: GenericResponseBase<null>) => {

  			if (data.StatusCode == Number(HttpStatusCode.Ok)) {
  				this.configureClient.toMove.next({ApiResponse: data, move: true});
  					this.localizationService.Refresh();
  					this.localizationService.RefreshFile();
  					this.widget.reloadJson.next(true);
  				this.configureClient.FooterRefresh();
  				this.form.controls['NoOfPreviousWeekending'].setValue(this.noOfPreviousWeekending);
  			} else if (data.StatusCode == Number(HttpStatusCode.Forbidden)) {

  				this.addDynamicApiValidationMessagesBasicDetails(data.ValidationMessages??[]);

  				this.focus.formName = this.form;
  				this.focus.onClick();

  			} else {
  				this.toasterService.showToaster(ToastOptions.Error, data.Message);
  			}
  		});
  }

  private addDynamicApiValidationMessagesBasicDetails(data: validationMessage[])
  {
  	for (const err of data) {
  		if (this.form.contains(err.PropertyName)) {
  			this.form.controls[
  				err.PropertyName
  			].addValidators(this.customValidator(err.ErrorMessage));
  			this.form.controls[
  				err.PropertyName
  			].updateValueAndValidity();
  			this.cdr.detectChanges();
  		}
  	}
  }

  private customValidator(message: string): ValidatorFn {
  	return (control: AbstractControl): ValidationErrors | null => {
  		return { error: true, message: message };
  	};
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  }
}
