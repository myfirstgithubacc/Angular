import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LocationService } from '../services/location.service';
import { NavigationPaths } from '../constant/routes-constant';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { Subject, takeUntil } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ISectorDetailById } from '@xrm-shared/models/common.model';
import { AssignmentData, AssignmentType, BenefitAdderData, ComplianceItemData, InavigationPaths, LocHourDistributionRule, LocationDataByUkey, LocationOfficerData } from '@xrm-core/models/location/location.model';
import { Column } from 'src/app/modules/contractor/contractor-details/constant/contractor-interface';
@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public showPhoneExt: FormGroup;
	public entityId = XrmEntities.Location;
	public sectorId: number = magicNumber.zero;
	public uKey: string = '';
	public actionTypeId: number = ActionType.View;
	public showWeekOne: boolean = false;
	public navigationPaths: InavigationPaths = NavigationPaths;
	public locationDetails: LocationDataByUkey;
	public sectorBenefitAdders: BenefitAdderData[] = [];
	public backgroundCheckGridData: ComplianceItemData[] = [];
	public assignmentTypesGridData: AssignmentData[] = [];
	public locationOfficersGridData: LocationOfficerData[] = [];
	public localizeParamZip: DynamicParam[] = [];
	public localizeParamState: DynamicParam[] = [];
	public badgeLength: string = '10 (Characters)';
	public stateLabel: string = '';
	public zipLabel: string = '';
	public hourDistributionRuleName: string = '';
	private unsubscribe$: Subject<void> = new Subject<void>();
	public hideCLPJobRotation: boolean = true;

	public columnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		firstColumnName: 'Item',
		secondColumnName: 'Add More',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero
	};

	public benefitAdderColumnConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'Item #',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemSr: true,
		itemLabelName: 'BenefitAdder',
		firstColumnColSpan: magicNumber.four,
		lastColumnColSpan: magicNumber.zero,
		isAddMoreValidation: true
	};

	public assignmentTypesGridColumns = [
		{
			colSpan: magicNumber.three,
			columnName: 'ItemNumber',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'Id',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.nine,
			columnName: 'ItemTitle',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'AssignmentName',
					requiredMsg: '',
					isEditMode: true
				}
			]
		}
	];

	public benifitAdderGridColumns = [
		{
			colSpan: magicNumber.eight,
			columnName: 'BenefitAdder',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'Label',
					requiredMsg: '',
					isEditMode: true
				}
			]
		}
	];

	public backgroundCheckGridColumns: Column[] = [
		{
			colSpan: magicNumber.three,
			columnName: 'ComplianceFieldName',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'ComplianceFieldName',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.four,
			columnName: 'ComplianceItemLabel',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'ComplianceItemLabel',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'Visible',
			tooltipVisible: true,
			tooltipTitile: 'Standard_Field_Name_Visible_Tooltip',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'IsVisibleToClient',
					requiredMsg: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'Professional',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'IsApplicableForProfessional',
					isEditMode: false,
					isDisable: false,
					requiredMsg: ''
				}
			]
		},
		{
			colSpan: magicNumber.one,
			columnName: 'LightIndustrial',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'IsApplicableForLi',
					isEditMode: false,
					isDisable: false,
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		}
	];

	public locationOfficersGridColumns = [
		{
			colSpan: magicNumber.four,
			columnName: 'LocationOfficer',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'LocationOfficerDesignation',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.four,
			columnName: 'Name',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'FullName',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.four,
			columnName: 'OfficerEmail',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'Email',
					requiredMsg: '',
					isEditMode: true
				}
			]
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private locationService: LocationService,
		private localizationService: LocalizationService,
		public udfCommonMethods: UdfCommonMethods,
		public dialogPopup: DialogPopupService,
		public router: Router,
		private formBuilder: FormBuilder,
		private changeDetect: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.initializePhoneForm();
		this.handleRouteParams();
	}

	private initializePhoneForm(): void {
		this.showPhoneExt = this.formBuilder.group({
			phoneControl: [null],
			phoneExt: [null]
		});
	}

	private handleRouteParams(): void {
		this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getLocationById(param['id']);
			}
		});
	}

	private getLocationById(id: string): void {
		this.locationService.getLocationById(id)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe({
				next: (response: GenericResponseBase<LocationDataByUkey>) =>
					 this.handleLocationResponse(response)
			});
	}

	private handleLocationResponse(response: GenericResponseBase<LocationDataByUkey>): void {
		if (!response.Succeeded || !response.Data) {
			return;
		}
		this.processLocationOfficers(response.Data.LocationOfficers);
		this.updateLocationDetails(response.Data);
		this.updateStatusData();
	}

	private processLocationOfficers(officers: LocationOfficerData[]): void {
		officers.forEach((officer) => {
			officer.FullName = [
				officer.LastName
					? officer.LastName.trim()
					: '',
				[officer.FirstName || '', officer.MiddleName || ''].join(' ')
			]
				.filter(Boolean)
				.join(', ');
		});
	}

	private updateLocationDetails(data: LocationDataByUkey): void {
		this.getRfxSowData(data.SectorId);
		this.locationDetails = this.dateTransform(data);
		this.setPhonevalues(this.locationDetails);
		this.hourDistributionRuleName = this.getHourDistributionRuleName(this.locationDetails.LocHourDistributionRule);

		this.showWeekOne = Boolean(this.locationDetails.NineEightyWeekOne);
		this.sectorId = this.locationDetails.SectorId;
		this.uKey = this.locationDetails.UKey;
		this.locationOfficersGridData = this.locationDetails.LocationOfficers;
		this.sectorBenefitAdders = this.locationDetails.SectorBenefitAdders;
		this.assignmentTypesGridData = this.getAssignmentTypes(this.locationDetails.SectorAssignmentTypes);
	}

	private getHourDistributionRuleName(rules: LocHourDistributionRule[]): string {
		return rules.map((rule) =>
			 rule.RuleName).join(', ');
	}

	private getAssignmentTypes(types: AssignmentType[]) {
		return types.map((type) =>
			 ({
				Id: type.DisplayOrder,
				AssignmentName: type.AssignmentName
			}));
	}

	private updateStatusData(): void {
		this.stateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, this.locationDetails.CountryId);
		this.zipLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, this.locationDetails.CountryId);
		this.localizeParamZip.push({ Value: this.zipLabel, IsLocalizeKey: false });
		this.localizeParamState.push({ Value: this.stateLabel, IsLocalizeKey: false });
		this.locationService.sharedDataSubject.next({
			Disabled: this.locationDetails.Disabled,
			LocationConfigId: this.locationDetails.LocationId,
			LocationConfigCode: this.locationDetails.LocationCode
		  });
	}

	private getRfxSowData(sectorId: number) {
		this.locationService.getDataFromSector(sectorId).pipe(takeUntil(this.unsubscribe$)).subscribe({
			next: (data: GenericResponseBase<ISectorDetailById>) => {
				if (!data.Data?.IsRfxSowRequired){
					this.backgroundCheckGridData = this.reShaper(this.locationDetails.SectorBackgroundCheck.SectorBackgrounds);
					this.changeDetect.markForCheck();
					return;
				}
				this.addIcsowColumn();
				this.changeDetect.markForCheck();
			}
		});
	}

	private addIcsowColumn(): void {
		const icsowColumn = {
			colSpan: magicNumber.one,
			columnName: 'ICSOW',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'IsApplicableForSow',
					isEditMode: false,
					isDisable: false,
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		};
		this.backgroundCheckGridColumns.push(icsowColumn);
		this.backgroundCheckGridData = this.reShaper(this.locationDetails.SectorBackgroundCheck.SectorBackgrounds);
	}

	private setPhonevalues(locationDetails: LocationDataByUkey) {
		this.showPhoneExt.controls['phoneControl'].setValue(locationDetails.PhoneNo);
		this.showPhoneExt.controls['phoneExt'].setValue(locationDetails.PhoneExtension);
	}

	public reShaper(data: ComplianceItemData[]) {
		return data.map((obj) => {
			Object.keys(obj).forEach((key) => {
				if (typeof obj[key] === 'boolean' && key !== 'IsActiveClearance') {
					obj[key] = obj[key]
						? 'Yes'
						: 'No';
				}
				if (key === 'ComplianceFieldName') {
					obj[key] = `${this.localizationService.GetLocalizeMessage('OnboardingItem')} ${parseInt(obj[key], 10)}`;

				}
			});
			return obj;
		});
	}

	private dateTransform(data: LocationDataByUkey) {
		data.NineEightyWeekOne = this.localizationService.TransformDate(data.NineEightyWeekOne);
		data.EffectiveDateForLunchConfig =
			this.localizationService.TransformDate(data.EffectiveDateForLunchConfig);
		return data;
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
