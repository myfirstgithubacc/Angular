import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { OrgLevelDetailsBySectorId, OrganizationLevel, ParentData, PreparedData, SaveUpdatePayload, UdfData } from '@xrm-master/organization-level/Interfaces/Interface';
import { NavigationUrls, OrgLevel, OrgLevelCode, RequiredStrings, ToastMessages, ValidationMessages } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonService } from '@xrm-shared/services/common.service';
import { IDropdownOption } from '@xrm-shared/models/common.model';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	public AddEditOrganizationLevelForm: FormGroup;
	public sectorDropDownList:IDropdownOption[];
	public SectorLabel: string = RequiredStrings.Sector;
	public OrgLevelName: string = OrgLevel.One;
	public OrgLevelID: string = OrgLevelCode.One;
	private uKey: string;
	private isDublicateName: boolean = false;
	private OrgLevel1Details: OrganizationLevel;
	private isPersistToast:boolean = false;
	public entityId: number = XrmEntities.OrgLevel1;
	public sectorId: number = magicNumber.zero;
	public udfRecordID: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.Add;
	private udfData: PreparedData[];
	private unsubscribe$: Subject<void> = new Subject<void>();


	constructor(
    private loaderService: LoaderService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private customValidators: CustomValidators,
    private eventlog: EventLogService,
    private sectorService: SectorService,
    public udfCommonMethods: UdfCommonMethods,
    private toasterService: ToasterService,
    private localizationService: LocalizationService,
    private organizationLevelService: OrganizationLevelService,
	private cdr: ChangeDetectorRef,
	private commonGridViewService: CommonService
	) {

  	this.AddEditOrganizationLevelForm = this.formBuilder.group({
  		SectorId: [
				null,
				[
					this.customValidators.RequiredValidator(
						ValidationMessages.PleaseSelectData,
						[{ Value: this.SectorLabel, IsLocalizeKey: true }]
					)
				]
			],
  		OrganizationName: [
  			null,
  			[
  				this.customValidators.RequiredValidator(ValidationMessages.PleaseEnterData, [{ Value: this.OrgLevelName, IsLocalizeKey: true }]),
  				this.customValidators.MaxLengthValidator(magicNumber.hundred)
  			]
  		],
  		ClientPayStaffingDirectly: [false],
  		uKey: [null],
  		OrganizationCode: [null],
  		SectorName: []
  	});
	}

	ngOnInit():void {
  		this.AddEditOrganizationLevelForm.controls['SectorId'].valueChanges
  			.pipe(takeUntil(this.unsubscribe$))
  			.subscribe((val: IDropdownOption|null) => {
  			if (val && !this.isEditMode)
  				this.onChangeSector(val);
  		});
		this.getCombinedData();
	}

	private getCombinedData():void {
		const id = this.activatedRoute.snapshot.params['id'],
			sectorObservable = this.sectorService.getSectorDropDownListByOrgLevelType(magicNumber.one),
			clientObservable = this.organizationLevelService.getConfigureClient(),
			org1Observable = (id != RequiredStrings.EmptyString && id != null)
				? this.organizationLevelService.getOrgLvl1Byukey(id)
				: of(null);
		forkJoin([
			sectorObservable,
			clientObservable,
			org1Observable
		]).pipe(takeUntil(this.unsubscribe$))
			.subscribe(([sectorList, clientDetails, org1]) => {
				if(sectorList.Data)
					this.sectorDropDownList = sectorList.Data;
				this.SectorLabel = clientDetails.Data?.OrganizationLabel ?? RequiredStrings.Sector;
				this.setOrgLevel1Details(org1);
				this.clearAndSetValidators();
			});
	}
	private clearAndSetValidators():void {
		this.AddEditOrganizationLevelForm.get('SectorId')?.clearValidators();
  		this.AddEditOrganizationLevelForm.get('SectorId')?.setValidators(this.customValidators.RequiredValidator(ValidationMessages.PleaseSelectData, [{ Value: this.SectorLabel, IsLocalizeKey: true }]));
  		this.AddEditOrganizationLevelForm.get('SectorId')?.updateValueAndValidity();
	}

	private setOrgLevel1Details(data1: GenericResponseBase<OrganizationLevel>|null):void {
  		if (data1?.Succeeded && data1.Data) {
  			this.isEditMode = true;
  			this.uKey = data1.Data.UKey;
  			this.OrgLevel1Details = data1.Data;
  			const data = this.OrgLevel1Details;
  			this.AddEditOrganizationLevelForm.patchValue({
  				OrganizationCode: data.OrganizationCode,
  				OrganizationName: data.OrganizationName,
  				SectorName: data.SectorName,
  				ClientPayStaffingDirectly: data.ClientPayStaffingDirectly=="Yes",
  				SectorId: {
  					Text: data.SectorName,
  					Value: data.SectorId.toString()
  				}
  			});
  			this.AddEditOrganizationLevelForm.updateValueAndValidity();
  			this.actionTypeId = ActionType.Edit;
  			this.sectorId = data.SectorId;
  			this.updateOrgLevelDetails(this.sectorId);
  			this.recordUKey = this.OrgLevel1Details.UKey;
  			this.udfRecordID = this.OrgLevel1Details.Id;
  			this.updateEventLog();
  		}
	}

	private setParentData(): void{
		const parentData: ParentData = {
			recordCode: this.OrgLevel1Details.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrgLevel1Details.Disabled,
			recordId: this.OrgLevel1Details.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel1ParentData.next(parentData);
	}


	ngOnDestroy(): void {
  		this.AddEditOrganizationLevelForm.reset();
  		if (!this.isPersistToast) {
  			this.toasterService.resetToaster();
  		}
  		this.isEditMode = false;
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private updateOrgLevelDetails(sectorId: number):void {
		this.organizationLevelService
			.getOrgLevelNameBySectorId(sectorId, magicNumber.one)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				  if (res.Succeeded) {
					this.OrgLevelName = res.Data?.OrgName
						?res.Data.OrgName
						:OrgLevel.One;
					this.clearAndSetValidator();
					if(!this.isEditMode){
						this.AddEditOrganizationLevelForm.controls[
							'ClientPayStaffingDirectly'
						].setValue(res.Data?.ClientPaysStaffingAgencyDirectly);
					}
					else{
						this.OrgLevelID = (res.Data?.OrgName != null && res.Data.OrgName != RequiredStrings.EmptyString.toString())
							? `${res.Data.OrgName} ID`
							: OrgLevelCode.One;
						this.setParentData();
					}
					this.cdr.detectChanges();
			  }
		  });
	}

	private clearAndSetValidator(): void{
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.clearValidators();
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.setValidators(this.customValidators.RequiredValidator( ValidationMessages.PleaseEnterData, [{ Value: this.OrgLevelName, IsLocalizeKey: true }]));
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.setErrors(this.customValidators.MaxLengthValidator(magicNumber.hundred));
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.updateValueAndValidity();
	}

	public onChangeSector(data: IDropdownOption | undefined):void {
  		this.sectorId = data?.Value ?? magicNumber.zero;
  		this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
  		this.updateOrgLevelDetails(this.sectorId);
  		this.loaderService.setState(false);
	}

	public checkOrgName():void {
  		this.AddEditOrganizationLevelForm.markAllAsTouched();
  		const sector =
    	  this.AddEditOrganizationLevelForm.controls['SectorId'].value.Value,
  		 name = this.AddEditOrganizationLevelForm.controls['OrganizationName'].value;
  		if (sector) {
  			if(name!="")
  			this.organizationLevelService
  				.CheckDuplicateOrganizationLevel1Name(sector, name.trim(), this.uKey)
				  .pipe(takeUntil(this.unsubscribe$))
  				.subscribe((data: GenericResponseBase<boolean>) => {
  					if (data.Succeeded){
  						this.isDublicateName = data.Data??true;
  						this.SubmitForm();
  					}
  				});
  			}
	}

	public getUdfData(data: UdfData):void {
  		this.udfData = data.data;
  		this.AddEditOrganizationLevelForm.addControl('udf', data.formGroup);
	}

	private addUpdate(reasonForUpdate: string = RequiredStrings.EmptyString):void {
		const data = this.prepateOrg1Data();
  		if (!this.isEditMode) {
			this.createOrg1(data);
			return;
  		}
  		delete data.SectorId;
  		data.UKey = this.uKey;
  		data.ReasonForChange = reasonForUpdate;
  		this.updateOrg1(data);
	}

	private prepateOrg1Data():SaveUpdatePayload {
		const data = this.AddEditOrganizationLevelForm.value;
  		data.SectorId = parseInt(this.AddEditOrganizationLevelForm.controls['SectorId'].value?.Value);
  		data.ClientPayStaffingDirectly =
    	  this.AddEditOrganizationLevelForm.controls[
    	  	'ClientPayStaffingDirectly'
    	  ].value;
  		for (const key in data) {
  			if (
				data[key] &&
				Object.prototype.hasOwnProperty.call(data[key], RequiredStrings.Text) &&
				Object.prototype.hasOwnProperty.call(data[key], RequiredStrings.Value)
  			) {
  				data[key] = data[key]?.Value;
  			}
  		}
  		delete data.uKey;
  		data.UdfFieldRecords = this.udfData;
		return data;
	}

	private createOrg1(data:SaveUpdatePayload):void {
		this.organizationLevelService.addOrgLvl1List(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrganizationLevel>) => {
				if (res.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel1HasBeenSavedSuccessfully);
					this.isPersistToast = true;
					this.route.navigate([`${NavigationUrls.Org1List}`]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
	}

	private updateOrg1(data:SaveUpdatePayload):void {
		this.organizationLevelService.updateOrgLvl1(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrganizationLevel>) => {
				if (res.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel1HasBeenSavedSuccessfully);
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.OrgLevel1Details.OrganizationName = data.OrganizationName;
					this.AddEditOrganizationLevelForm.markAsPristine();
					this.cdr.detectChanges();
					this.updateEventLog();
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
	}

	private updateEventLog():void {
  	this.eventlog.recordId.next(this.OrgLevel1Details.Id);
  	this.eventlog.entityId.next(XrmEntities.OrgLevel1);
  	this.eventlog.isUpdated.next(true);
	}

	private SubmitForm():void {
  		if (this.isDublicateName) {
			const message = this.localizationService.GetLocalizeMessage(OrgLevel.One),
  				orgDynamicParam: DynamicParam[] = [{ Value: message.toLowerCase(), IsLocalizeKey: true }];
  			this.toasterService.showToaster(
				ToastOptions.Error,
				this.localizationService.GetLocalizeMessage(ToastMessages.EnitityAlreadyExists, orgDynamicParam)
			);
  			return;
  		}
  		this.AddEditOrganizationLevelForm.markAllAsTouched();
  		if (!this.AddEditOrganizationLevelForm.valid) return;
  		this.addUpdate();
	}
}
