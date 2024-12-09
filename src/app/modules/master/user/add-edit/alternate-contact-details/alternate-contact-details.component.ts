import { Component, Input, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownData } from '@xrm-master/user/model/model';
import { UsersService } from '@xrm-master/user/service/users.service';
import { UsersDataService } from '@xrm-master/user/service/usersData.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject } from 'rxjs';

@Component({selector: 'app-alternate-contact-details',
	templateUrl: './alternate-contact-details.component.html',
	styleUrls: ['./alternate-contact-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlternateContactDetailsComponent implements OnInit {
  @Input() inputProperties: {
    addEditUserForm: FormGroup;
    homeStatelist: DropdownData[];
    entityType: string;
    entityId: number;
    isEditMode: boolean;
    stateLabel: string;
    zipLabel: string;
  };

	@Output() onAlternateContactSave = new EventEmitter<boolean>(false);
	private destroyAllSubscribtion$ = new Subject<void>();
	alternateContactDetailsForm: FormGroup;

	// eslint-disable-next-line max-params
	constructor(
    private toasterService: ToasterService,
    private route: Router,
    private customValidators: CustomValidators,
    private usersDataService: UsersDataService,
    private usersService: UsersService
	) {}

	ngOnInit(): void {
  	this.alternateContactDetailsForm = this.inputProperties.addEditUserForm.get('AlternateContactDetails') as FormGroup;
	}


	public onPhone1Change(event: string) {
  	if (this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.value) {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidAlternatePhone1') as ValidatorFn]);
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.updateValueAndValidity();
  	}
  	else {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.clearValidators();
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.updateValueAndValidity();
  		if (this.alternateContactDetailsForm.get('alternatePhoneNumberExt1')?.value) {
  			this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.setValidators([this.customValidators.RequiredValidator('PleaseEnterValidAlternatePhone1')]);
  			this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.markAsTouched();
  			this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.updateValueAndValidity();
  		}
  	}
	}

	public onPhoneExt1Change(event: string) {
  	if (event) {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidAlternatePhone1'), this.customValidators.RequiredValidator('PleaseEnterValidAlternatePhone1')]);
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.updateValueAndValidity();
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt1')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidAlternatePhone1Extension') as ValidatorFn]);
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt1')?.updateValueAndValidity();
  	}
  	else {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.clearValidators();
  		this.alternateContactDetailsForm.get('alternatePhoneNumber1')?.updateValueAndValidity();
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt1')?.clearValidators();
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt1')?.updateValueAndValidity();
  	}
	}

	public onPhone2Change(event: string) {
  	if (event) {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidAlternatePhone2') as ValidatorFn]);
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.updateValueAndValidity();
  	}
  	else {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.clearValidators();
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.updateValueAndValidity();
  		if (this.alternateContactDetailsForm.get('alternatePhoneNumberExt2')?.value) {
  			this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.setValidators([this.customValidators.RequiredValidator('PleaseEnterValidAlternatePhone2')]);
  			this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.markAsTouched();
  			this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.updateValueAndValidity();
  		}
  	}
	}

	public onPhoneExt2Change(event: string) {
  	if (event) {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidAlternatePhone2'), this.customValidators.RequiredValidator('PleaseEnterValidAlternatePhone2')]);
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.updateValueAndValidity();
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt2')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidAlternatePhone2Extension') as ValidatorFn]);
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt2')?.updateValueAndValidity();
  	}
  	else {
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.clearValidators();
  		this.alternateContactDetailsForm.get('alternatePhoneNumber2')?.updateValueAndValidity();
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt2')?.clearValidators();
  		this.alternateContactDetailsForm.get('alternatePhoneNumberExt2')?.updateValueAndValidity();
  	}
	}

	public ShowButtonEnableDisable() {
  	if (this.inputProperties.addEditUserForm.get('AlternateContactDetails')?.pristine) {
  		return true;
  	}
  	else {
  		return false;
  	}
	}
	ngOnDestroy() {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	this.toasterService.resetToaster();
	}

	public Cancel() {
  	this.route.navigate(['/xrm/master/user']);
	}

	public updateAlternateContactDetails() {
		this.onAlternateContactSave.emit(true);
	}
}
