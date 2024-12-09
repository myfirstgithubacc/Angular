/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidatorFn } from '@angular/forms';
import { UserRole, XrmCredential } from '@xrm-master/user/enum/enums';
import { DataItem, DropDownWithTextValue, DropDownWithTextValueBoolean, EventDetails, TreeChecked, locationSectorGroupingList } from '@xrm-master/user/interface/user';
import { DataAccessRight } from '@xrm-master/user/model/data-access-right';
import { DropdownData, UserDetails } from '@xrm-master/user/model/model';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';


@Component({selector: 'app-basicdetails',
	templateUrl: './basicdetails.component.html',
	styleUrls: ['./basicdetails.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicdetailsComponent implements OnInit{
	public userRole = UserRole;
	public xrmCredential = XrmCredential;
	private phoneExtMask: string;
	public UserDetailsForm:FormGroup;
  @Input() inputProperties: {
    disableResendActivationLinkButton:boolean;
    addEditUserForm: FormGroup;
    isEditMode: boolean;
    userDetails: UserDetails;
    timezonelist: DataItem[] | null | undefined;
    entityType:string;
    entityId:number;
    languageList: DropdownData[];
    homeCountrylist: DataItem[] | null | undefined;
    userTypeList: DropDownWithTextValue[];
    selectedKey: string[];
    selectedKeyLocation: string[];
    selectedActionList:DataItem[];
    loginList: DataItem[];
    userRoleList: DataItem[];
    dataAccessList: DataItem[];
    staffingAgencyList: DataItem[];
    homeStatelist: DataItem[];
    expandedKeys: unknown[];
    isDublicateUserID: boolean;
    isStaffingAgencyUserLogin: boolean;
    accessSectorRadioGroupList:DropDownWithTextValueBoolean[];
    accessLocationRadioGroupList:DropDownWithTextValueBoolean[];
    allSectorList:DataItem[];
    locationSectorGroupingList:locationSectorGroupingList[];
    stateLabel:string;
    zipLabel:string;
    selectedLocationIndex: locationSectorGroupingList[];
 };


 @Output() onChangeCountry:EventEmitter<DropDownWithTextValue>;
 @Output() onChangeStaffingAgency:EventEmitter<string>;
 @Output() OnChangeSectorTree:EventEmitter<TreeChecked>;
 @Output() OnChangeLocationRadio:EventEmitter<{ event: DropDownWithTextValue, selectedKeysector: string[] }>;
 @Output() OnChangeLocationTree:EventEmitter<TreeChecked>;
 @Output() onChangeUserGroup:EventEmitter<DropDownWithTextValue>;
 @Output() onChangeUserid:EventEmitter<string>;
 @Output() onChangeLoginMethod:EventEmitter<EventDetails>;
 @Output() onFocusOutEmail:EventEmitter<string>;
 @Output() onChangeSectorSwitch:EventEmitter<boolean>;
 @Output() onChangeDataAccessRight: EventEmitter<DataItem>;
 @Output() onDisableResendActivationLinkButton: EventEmitter<boolean>;


 constructor(private localizationService:LocalizationService, private cd: ChangeDetectorRef, private customValidators:CustomValidators) {
  	this.onChangeCountry= new EventEmitter<DropDownWithTextValue>();
  	this.onChangeStaffingAgency= new EventEmitter<string>();
  	this.OnChangeSectorTree= new EventEmitter<TreeChecked>();
  	this.OnChangeLocationRadio= new EventEmitter<{ event: DropDownWithTextValue, selectedKeysector: string[] }>();
  	this.OnChangeLocationTree= new EventEmitter<TreeChecked>();
  	this.onChangeUserGroup= new EventEmitter<DropDownWithTextValue>();
  	this.onChangeUserid= new EventEmitter<string>();
  	this.onChangeLoginMethod= new EventEmitter<EventDetails>();
  	this.onFocusOutEmail= new EventEmitter<string>();
  	this.onChangeSectorSwitch= new EventEmitter<boolean>();
  	this.onChangeDataAccessRight= new EventEmitter<DataItem>();
  	this.onDisableResendActivationLinkButton= new EventEmitter<boolean>();
 }


 ngOnInit(): void {
  	this.UserDetailsForm = this.inputProperties.addEditUserForm.get('UserDetails') as FormGroup;
 }

 public onChangeSectorRadio(event:DropDownWithTextValue){
  	if(event){
  		this.inputProperties.selectedKey = [];
  		this.inputProperties.addEditUserForm.get('UserDetails')?.get('SectorAccessList')?.setValue([]);
  		this.UserDetailsForm.get('isInvalidSector')?.setValue(false);
  		this.UserDetailsForm.get('IsAllLocationAccessible')?.setValue(true);
  	}
	  else {
 		// When unchecking, reset the selected sectors and tree state
 		this.inputProperties.selectedKey = [];
 		this.inputProperties.selectedActionList = [];
 		this.OnChangeSectorTree.emit({
 			checkedKey: this.inputProperties.selectedKey,
 			selected: []
 		});
 	}
  	this.inputProperties.addEditUserForm.get('UserDetails')?.get('IsAllSectorAccessible')?.markAsDirty();
 	  this.cd.markForCheck();
  	this.cd.detectChanges();
 }

 public reSendActivationLink(){
  	this.onDisableResendActivationLinkButton.emit(true);
 }

 public getDateTransformed(date: string) {
 	return this.localizationService.TransformDate(date, this.inputProperties.userDetails.DateFormat);
 }

 public onChangeLocationRadio(event:DropDownWithTextValue){
  	if(event){
  		this.inputProperties.selectedKeyLocation = [];
  		this.inputProperties.addEditUserForm.get('UserDetails')?.get('LocationAccessList')?.setValue([]);
  		this.UserDetailsForm.get('isInvalidLocation')?.setValue(false);
  	}
 	// else
 	this.OnChangeLocationRadio.emit({ event: event, selectedKeysector: this.inputProperties.selectedKey });
  	this.inputProperties.addEditUserForm.get('UserDetails')?.get('IsAllLocationAccessible')?.markAsDirty();
 	  this.cd.markForCheck();
  	this.cd.detectChanges();
 }

 public selectedItems(data: TreeChecked): void {
 	this.OnChangeSectorTree.emit(data);
 }

 public selectedItemsLocation(data: TreeChecked): void {
  	this.OnChangeLocationTree.emit(data);
 }

 public onChangeLoginMethodDropdown(data: EventDetails) {
  	this.onChangeLoginMethod.emit(data);
 }

 public onChangeUserGroupDropdown(data: DropDownWithTextValue) {
  	this.onChangeUserGroup.emit(data);
 }

 public onChangeCountryDropdown(data: DropDownWithTextValue) {
  	this.phoneExtMask = this.localizationService.GetCulture(
  		CultureFormat.PhoneExtFormat,
  		data?.Value
  	);
 	if(data==null || data==undefined){
 		this.UserDetailsForm.get('UserLanguageId')?.setValue(null);
 		this.inputProperties.languageList=[];
 		return;
 	}else{
 		this.UserDetailsForm.get('UserLanguageId')?.setValue(null);
 		this.inputProperties.languageList=[];
		 this.onChangeCountry.emit(data);
 	}
 }

 public onChangeUseridTextBox(event: Event) {
 	const inputElement = event.target as HTMLInputElement;
  	this.onChangeUserid.emit(inputElement.value);
 }

 public onFocusOutEmailTextBox(event: Event) {
 	const inputElement = event.target as HTMLInputElement;
  	this.onFocusOutEmail.emit(inputElement.value);
 }

 public onChangeSwitch(e: boolean) {
  	this.onChangeSectorSwitch.emit(e);
 }

 public onChangeStaffingAgencyDropdown(event:DropDownWithTextValue){
  	this.onChangeStaffingAgency.emit(event?.Value as string);
 }

 public getPasswordExpiryDate() {
  	return (this.inputProperties.userDetails)?.PasswordExpiryDate;
 }

 public getXRMAcceptedOn() {
  	return (this.inputProperties.userDetails)?.AcknowledgementAcceptedOnDate;
 }

 public resetTree(event: DataItem){
  	(this.inputProperties.addEditUserForm.get('SectorDetails') as FormArray).controls.map((x: AbstractControl) => {
  		x?.get('selectedTree')?.setValue([]);
  	});
  	this.onChangeDataAccessRight.emit(event);
 }

 public onPhoneChange(event:string){
 	if(event){
 		this.UserDetailsForm.get('phoneNumber')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidContactNumber'), this.customValidators.RequiredValidator('PleaseEnterContactNumber') as ValidatorFn]);
 		this.UserDetailsForm.get('phoneNumber')?.updateValueAndValidity();
 	}
 }
 public onPhoneExtChange(event:string){
 	if(event){
 		this.UserDetailsForm.get('phoneNumber')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidContactNumber'), this.customValidators.RequiredValidator('PleaseEnterContactNumber')]);
 		this.UserDetailsForm.get('phoneNumber')?.updateValueAndValidity();
 		this.UserDetailsForm.get('phoneNumberExt')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidContactNumberExtension') as ValidatorFn]);
 		this.UserDetailsForm.get('phoneNumberExt')?.updateValueAndValidity();
		 this.UserDetailsForm.get('phoneNumber')?.markAsTouched();
 	}
 	else{
 		this.UserDetailsForm.get('phoneNumberExt')?.clearValidators();
 		this.UserDetailsForm.get('phoneNumberExt')?.updateValueAndValidity();
 	}
 }

}
