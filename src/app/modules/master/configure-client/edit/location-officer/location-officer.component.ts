import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { LocationOfficer, LocationOfficerListData, LocationOfficersDataToUpdate } from '@xrm-core/models/Configure-client/locationOfficers.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ConfigureClientDeclarations } from '@xrm-master/configure-client/Common/declarations';
import { Column, ColumnConfigure } from '@xrm-shared/models/list-view.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-location-officer',
	templateUrl: './location-officer.component.html',
	styleUrls: ['./location-officer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationOfficerComponent implements OnInit, OnDestroy {

  @Input() form: FormGroup;

  private destroyAllSubscribtion$ = new Subject<void>();

  public prefilledDataLocationOfficers: LocationOfficer[] = [];

  private locationOfficersDataForUpload: LocationOfficer[] = [];

  public columnLocationOfficers: Column[] = [
  	{
  		colSpan: 8,
  		asterik: true,
  		columnName: 'LocationOfficerTitle',
  		controls: [
  			{
  				controlType: 'text',
  				controlId: 'text1',
  				maxlength: 200,
  				isEditMode: true,
  				isDisable: false,
  				isSpecialCharacterAllowed: true,
  				specialCharactersAllowed: [],
  				specialCharactersNotAllowed: [],
  				defaultValue: '',
  				placeholder: 'Enter Title',
  				requiredMsg: 'ReqFieldValidationMessage',
  				validators: [this.validators.RequiredValidator('PleaseEnterData', [{ Value: 'LocationOfficerTitle', IsLocalizeKey: true }])]
  			}
  		]
  	}
  ];

  public columnConfigurationLocationOfficers: ColumnConfigure = ConfigureClientDeclarations.ColumnConfigurationLocationOfficers;

  private locationOfficers: FormArray;

  constructor(
    private configureClient: ConfigureClientService,
    private validators: CustomValidators,
    private formBuilder: FormBuilder,
    private widget: WidgetServiceService,
		private cdr: ChangeDetectorRef,
		private scrollService: WindowScrollTopService
  ){
  	this.scrollService.scrollTop();
  }

  ngOnInit(): void {
  	this.locationOfficers = this.form.controls['locationOfficers'] as FormArray;
  	this.getLocationOfficers();

  	this.configureClient.updateObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {reasonForChange: string, update: boolean}) => {
  		if(res.update){
  			this.updateLocationOfficer(res.reasonForChange);
  		}
  		});

    	 this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
  		if (res) {
  			this.locationOfficers.markAsDirty();
  		}
  	});
  }

  private getLocationOfficers(): void {
  	this.configureClient.getLocationOfficers().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
  		next: (data: ApiResponse) => {
  			const getRequestDataLocationOfficers: LocationOfficer[] = [];

  			for (const dt in data.Data) {
  				getRequestDataLocationOfficers.push({
  					text1: data.Data[dt].LocationOfficerDesignation,
  					uKey: data.Data[dt].Ukey,
  					isDisabled: data.Data[dt].Disabled,
  					Id: 0
  				});
  			}
  			if (getRequestDataLocationOfficers.length > Number(magicNumber.zero)) {
  				this.prefilledDataLocationOfficers = [...getRequestDataLocationOfficers];
  				this.fillData(this.prefilledDataLocationOfficers);
  			}
  			this.form.markAsPristine();
  		}
  	});
  }

  public getLocationOfficersDatafromWidget(e: LocationOfficer[]): void {
  	this.locationOfficersDataForUpload = e;
  	this.fillData(e);
  }

  private fillData(list: LocationOfficer[]) : void {
  	this.locationOfficers.clear();
  	list.forEach((row: LocationOfficer) => {
  		this.locationOfficers.push(this.formBuilder.group({
  			LocationOfficerNumber: [row.Id],
  			LocationOfficerTypeId: [row.Id],
  			Ukey: [row.uKey],
  			LocationOfficerDesignation: [row.text1, this.validators.RequiredValidator()],
  			Disabled: [row.isDisabled]
  		}));
  	});
  	this.cdr.markForCheck();
  }

  public getLocationOfficerFormStatus(e: FormGroup): void {
  	this.form = e;
  }

  public onDeleteLocationOfficer(){
  	this.locationOfficers.markAsDirty();
  }

  private updateLocationOfficer(reasonForChange: string): void {
  	const locationOfficersDataToUpdate: LocationOfficerListData[] = [],
  		locationOfficerListDataToUpdate :LocationOfficersDataToUpdate = {
  		locationOfficerTypeList: locationOfficersDataToUpdate,
  		reasonForChange: reasonForChange
  	};

  	for (let i = 0; i < this.locationOfficersDataForUpload.length; i++) {
  		if (!this.form.controls[i].pristine) {
  			const formGroupObjectToinsert : LocationOfficerListData = {
  				uKey: this.locationOfficersDataForUpload[i].uKey,
  				disabled: this.locationOfficersDataForUpload[i].isDisabled,
  				locationOfficerDesignation:
            this.locationOfficersDataForUpload[i].text1
  			};
  			locationOfficersDataToUpdate.push(formGroupObjectToinsert);
  		}
  	}
  	this.configureClient
  		.updateLocationOfficersType(locationOfficerListDataToUpdate)
		  .pipe(
  			switchMap((data: GenericResponseBase<null>) => {
  			this.configureClient.toMove.next({ApiResponse: data, move: true});
  				return of(null);
		  }),
  		takeUntil(this.destroyAllSubscribtion$)
  		)
  		.subscribe(() => {
  			this.getLocationOfficers();
  		});
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	this.widget.updateForm.next(false);
  }
}
