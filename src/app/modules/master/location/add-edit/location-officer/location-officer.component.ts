import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { StateService } from 'src/app/services/masters/state.service';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LocationService } from '@xrm-master/location/services/location.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-location-officer',
	templateUrl: './location-officer.component.html',
	styleUrls: ['./location-officer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationOfficerComponent implements OnInit, OnDestroy {

	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get the form is in edit mode or add mode
	@Input() isEditMode: boolean;

	// get is the whole form submitted
	@Input() isSubmitted: boolean;

	// list view widget control component reference
	@ViewChild(ListViewComponent) listViewComponent: ListViewComponent;

	// location officer child form
	public locationOfficerForm: FormGroup;

	// make form array for background check field
	public locationOfficerArray: FormArray;

	// whole sector details
	@Input() public locationDetails: any;

	public locationOfficerTypeList: any = [];
	public configureClientBasicDetails!: any;
	public specialCharsNotAllowed: any[] = ["&", "<", ">", "/", "'"];
	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		public state: StateService,
		private locationService: LocationService,
		private customValidators: CustomValidators,
		private configureClientService: ConfigureClientService,
		public udfCommonMethods: UdfCommonMethods,
		private widget: WidgetServiceService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnChanges(changes: SimpleChanges) {
		if (this.isSubmitted) {
			this.listViewComponent.checkTouched();
		}
		if (changes['locationDetails']) {
			const data = changes['locationDetails'].currentValue;
			this.getLocationDetailsById(data);
		}
	}

	private getLocationDetailsById(data: any) {
		this.locationDetails = data;
		if (this.isEditMode) {
			if (this.locationDetails?.LocationOfficers.length) {
				this.handleLocationOfficersEditMode();
			}
		} else {
			this.handleLocationOfficersAddMode();
		}
	}


	ngOnInit(): void {
		this.widget.updateForm.next(false);
		this.locationOfficerForm = this.childFormGroup.get('locationOfficer') as FormGroup;
		this.locationOfficerArray = this.locationOfficerForm.controls['locationOfficerArray'] as FormArray;

		// only used for verifying domain name in email as in configure client to be enter in lovcation officer email
		this.getConfigureClientBasicDetail();

		this.widget.updateFormObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			if (data) {
				this.locationOfficerForm.markAsDirty();
			}
		});
	}


	private configureClientEmailDomainWithoutAtTheRate: any;
	private configureClientEmailDomain: any;

	private configureClientDetails$: Observable<boolean>;

	private getConfigureClientBasicDetail() {
		this.configureClientDetails$ = this.locationService.configureClientDetailsObs;
		this.configureClientDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			if (data !== null) {
				this.configureClientBasicDetails = data.Data;
				this.configureClientBasicDetails.EmailDomain = this.configureClientBasicDetails.EmailDomain
					.split(',').map((domain: string) =>
						domain.trim()).join(',');
				this.configureClientEmailDomain = this.configureClientBasicDetails.EmailDomain.replace(/,/g, ", ");
				this.configureClientEmailDomainWithoutAtTheRate = (this.configureClientBasicDetails.EmailDomain.replace(/@/g, "")).split(',');
				this.UpdateLocationOfficerColumnListView();
				this.cdr.markForCheck();
			}
		});
	}


	private handleLocationOfficersEditMode() {
		this.configureClientService.getLocationOfficers().pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			const locationOfficerTypeList: any = [],
				locationOfficerConfigureClient = data.Data;

			locationOfficerConfigureClient.forEach((item1: any) => {
				const matchingItem2 = this.locationDetails?.LocationOfficers.find((item2: any) =>
					item2['LocationOfficerTypeId'] === item1['LocationOfficerTypeId']);

				if (matchingItem2) {
					locationOfficerTypeList.push({
						"FirstName": matchingItem2.FirstName,
						"LastName": matchingItem2.LastName,
						"MiddleName": matchingItem2.MiddleName,
						"Email": matchingItem2.Email,
						"LocationOfficerDesignation": matchingItem2.LocationOfficerDesignation,
						"LocationOfficerTypeId": matchingItem2.LocationOfficerTypeId,
						"Id": matchingItem2.Id
					});
				} else {
					locationOfficerTypeList.push(item1);
				}
			});
			this.locationOfficerTypeList = locationOfficerTypeList;
			this.onLocationOfficerChange(true);
			this.cdr.markForCheck();
		});
	}

	private handleLocationOfficersAddMode() {
		this.configureClientService.getLocationOfficers().pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			this.locationOfficerTypeList = data.Data;
			this.onLocationOfficerChange(true);
			this.cdr.markForCheck();
		});
	}


	// location officer section

	public locationOfficerPrefilledData: any[] = [];

	public locationOfficerColumnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: true,
		Id: true,
		firstColumnName: '',
		secondColumnName: '',
		deleteButtonName: '',
		noOfRows: 0,
		itemSr: false,
		itemLabelName: '',
		firstColumnColSpan: 0,
		lastColumnColSpan: 0,
		isAddMoreValidation: false
	};

	public locationOfficerColumn: any[] = [];

	// eslint-disable-next-line max-lines-per-function
	private UpdateLocationOfficerColumnListView() {
		this.locationOfficerColumn.length = 0;
		this.locationOfficerColumn = [
			{
				colSpan: 2,
				columnName: 'LocationOfficer',
				asterik: false,
				controls: [
					{
						controlType: 'text',
						controlId: 'LocationOfficerDesignation',
						defaultValue: '',
						isEditMode: false,
						isDisable: false
					}
				]
			},
			{
				colSpan: 6,
				columnName: 'Name',
				asterik: false,
				controls: [
					{
						controlType: 'text',
						controlId: 'LastName',
						defaultValue: '',
						isEditMode: true,
						isDisable: false,
						placeholder: 'Last Name',
						isSpecialCharacterAllowed: false,
						maxlength: magicNumber.fifty,
						validators: [this.customValidators.MaxLengthValidator(magicNumber.fifty)]
					},
					{
						controlType: 'text',
						controlId: 'FirstName',
						defaultValue: '',
						isEditMode: true,
						isDisable: false,
						placeholder: 'First Name',
						isSpecialCharacterAllowed: false,
						maxlength: magicNumber.fifty,
						validators: [this.customValidators.MaxLengthValidator(magicNumber.fifty)]
					},
					{
						controlType: 'text',
						controlId: 'MiddleName',
						defaultValue: '',
						isEditMode: true,
						isDisable: false,
						placeholder: 'Middle Initial',
						isSpecialCharacterAllowed: false,
						maxlength: magicNumber.fifty,
						validators: [this.customValidators.MaxLengthValidator(magicNumber.fifty)]
					}
				]
			},
			{
				colSpan: 4,
				columnName: 'OfficerEmail',
				asterik: false,
				tooltipVisible: true,
				tooltipTitile: `Following domain(s) are permitted. (${this.configureClientEmailDomain})`,
				controls: [
					{
						controlType: 'text',
						controlId: 'Email',
						defaultValue: '',
						isEditMode: true,
						isDisable: false,
						placeholder: '',
						isSpecialCharacterAllowed: true,
						specialCharactersAllowed: ['-', '_', '.', ',', '@'],
						specialCharactersNotAllowed: [this.specialCharsNotAllowed],
						maxlength: magicNumber.fifty,
						validators: [
							this.customValidators.MaxLengthValidator(magicNumber.eightThousand),
							this.customValidators.MultiEmailValidator('Enter a valid email from suggested domain(s).', [], this.configureClientEmailDomainWithoutAtTheRate)
						]
					}
				]
			}
		];
	}

	// function naming change later
	private onLocationOfficerChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.setLocationOfficerPrefieldData();
		} else {
			this.locationOfficerArray.clear();
		}
	}

	public tempDataLocation: any;

	// get location officer form status valid or invalid
	public getLocationOfficerFormStatus(list: any) {
		this.tempDataLocation = list.getRawValue();
		this.onAddLocationOfficer(this.tempDataLocation);
		this.locationOfficerArray.markAllAsTouched();
	}

	// set data to be shown prefied when this section open
	private setLocationOfficerPrefieldData(): void {
		// manupulate location officer number as ukey for both add and edit
		this.locationOfficerTypeList.forEach((obj: any) => {
			obj['uKey'] = obj['LocationOfficerTypeId'];
		});

		const data = this.locationOfficerTypeList;
		this.locationOfficerPrefilledData = data.length > magicNumber.zero
			? data
			: this.locationOfficerPrefilledData;
		this.onAddLocationOfficer(this.locationOfficerPrefilledData);
	}


	private onAddLocationOfficer(list: any) {
		this.locationOfficerArray.clear();
		list.forEach((row: any, index: number) => {

			this.locationOfficerArray.push(this.formBuilder.group({
				"FirstName": [row.FirstName],
				"LastName": [row.LastName],
				"MiddleName": [row.MiddleName],
				"Email": [row.Email ?? (row.Email)?.toLowerCase(), [this.customValidators.MultiEmailValidator('Enter a valid email from suggested domain(s).', [], this.configureClientEmailDomainWithoutAtTheRate)]],
				"locationOfficerTypeId": [row.uKey],
				"Id": [
					(list[index].Id !== magicNumber.zero && list[index].Id !== null)
						? list[index].Id
						: magicNumber.zero
				]
			}));
		});

	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
