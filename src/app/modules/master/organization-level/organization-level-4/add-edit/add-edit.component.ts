import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject, takeUntil } from 'rxjs';
import { CustomValidators } from 'src/app/shared/services/custom-validators.service';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { NavigationUrls, OrgLevel, OrgLevelCode, RequiredStrings, ToastMessages, ValidationMessages } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { OrgLevelDetailsBySectorId, OrganizationLevel, ParentData, PreparedData, SaveUpdatePayload, UdfData } from '@xrm-master/organization-level/Interfaces/Interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonService } from '@xrm-shared/services/common.service';
import { IDropdownOption } from '@xrm-shared/models/common.model';
@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public AddEditOrganizationLevelForm: FormGroup;
	public SectorList: IDropdownOption[];
	public isEditMode: boolean = false;
	public isDublicateName: boolean = false;
	public OrgLevel4Details: OrganizationLevel;

	public entityId: number = XrmEntities.OrgLevel4;
	public sectorId: number = magicNumber.zero;
	public udfRecordId: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.Add;
	private udfData: PreparedData[];
	public SectorLabel:string = RequiredStrings.Sector;
	public orgLabelName:string = OrgLevel.Four;
	public OrgLevelID:string = OrgLevelCode.Four;
	private isPersistToast:boolean = false;
	private unsubscribe$: Subject<void> = new Subject<void>();


	constructor(
    private fb: FormBuilder,
    private customValidators: CustomValidators,
    private activatedRoute: ActivatedRoute,
    private organizationLevelService: OrganizationLevelService,
    private route: Router,
    private eventlog: EventLogService,
    private localizationService: LocalizationService,
    private sectorService: SectorService,
    private toasterService: ToasterService,
    public udfCommonMethods: UdfCommonMethods,
	private cdr: ChangeDetectorRef,
	private commonGridViewService:CommonService
	) {
		this.AddEditOrganizationLevelForm = this.fb.group({
			sectorId: [
				null,
				[this.customValidators.RequiredValidator(ValidationMessages.PleaseSelectData, [{ Value: this.SectorLabel, IsLocalizeKey: true }])]
			],
			OrganizationName: [
  			null,
  			[
  				this.customValidators.RequiredValidator( ValidationMessages.PleaseEnterData, [{ Value: this.orgLabelName, IsLocalizeKey: true }]),
  				this.customValidators.MaxLengthValidator(magicNumber.hundred)
  			]
  		],

			OrganizationCode: []
		});
	}

	ngOnInit(): void {
		this.AddEditOrganizationLevelForm.controls['sectorId'].valueChanges
			.pipe( (takeUntil(this.unsubscribe$)))
			.subscribe((val: IDropdownOption | null) => {
				if (val && !this.isEditMode) {
					this.onChangeSector(val);
				}
			});
		this.getCombinedData();
	}

	private getCombinedData():void {
		const id = this.activatedRoute.snapshot.params['id'],
			sectorObservable = this.sectorService.getSectorDropDownListByOrgLevelType(magicNumber.four),
			clientObservable = this.organizationLevelService.getConfigureClient(),
			org4Observable = (id != RequiredStrings.EmptyString && id != null)
				? this.organizationLevelService.getOrgLvl4Byukey(id)
				: of(null);
		forkJoin([
			sectorObservable,
			clientObservable,
			org4Observable
		]).pipe(takeUntil(this.unsubscribe$))
			.subscribe(([sectorList, clientDetails, org4]) => {
				if(sectorList.Data)
					this.SectorList = sectorList.Data;
				this.SectorLabel = clientDetails.Data?.OrganizationLabel ?? RequiredStrings.Sector;
				this.setOrgLevel4Details(org4);
				this.clearAndSetValidators();
			});
	}

	private clearAndSetValidators():void {
		this.AddEditOrganizationLevelForm.get('sectorId')?.clearValidators();
		this.AddEditOrganizationLevelForm.get('sectorId')?.setValidators(this.customValidators.RequiredValidator(ValidationMessages.PleaseSelectData, [{ Value: this.SectorLabel, IsLocalizeKey: true }]));
		this.AddEditOrganizationLevelForm.get('sectorId')?.updateValueAndValidity();
	}

	private setOrgLevel4Details(data1:GenericResponseBase<OrganizationLevel>|null):void {
		if(data1?.Succeeded && data1.Data)
		{
			this.isEditMode = true;
			this.OrgLevel4Details = data1.Data;
			this.actionTypeId = ActionType.Edit;
			this.udfRecordId = Number(this.OrgLevel4Details.Id);
			this.recordUKey = this.OrgLevel4Details.UKey;
			this.sectorId = Number(this.OrgLevel4Details.SectorId);
			this.updateEventLog();
			this.updateorgLabelName(this.sectorId);
			this.AddEditOrganizationLevelForm.patchValue({
				OrganizationName: this.OrgLevel4Details.OrganizationName,
				OrganizationCode: this.OrgLevel4Details.OrganizationCode,
				sectorId: {
					Text: this.OrgLevel4Details.SectorName,
					Value: this.OrgLevel4Details.SectorId
				}
			});
		}
	}

	private setParentData(): void{
		const parentData: ParentData = {
			recordCode: this.OrgLevel4Details.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrgLevel4Details.Disabled,
			recordId: this.OrgLevel4Details.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel4ParentData.next(parentData);
	}

	private updateEventLog():void {
		this.eventlog.isUpdated.next(true);
		this.eventlog.recordId.next(this.OrgLevel4Details.Id);
		this.eventlog.entityId.next(XrmEntities.OrgLevel4);
	}

	private updateorgLabelName(sectorId: number):void {
		this.organizationLevelService.getOrgLevelNameBySectorId(sectorId, magicNumber.four)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				if (res.Succeeded) {
					this.orgLabelName = res.Data?.OrgName ?? OrgLevel.Four;
					this.clearAndSetValidator();
					this.OrgLevelID = res.Data?.OrgName != null && res.Data.OrgName != RequiredStrings.EmptyString.toString()
						? `${res.Data.OrgName} ID`
						: OrgLevelCode.Four;
					this.cdr.detectChanges();
					this.setParentData();
				}
			});
	}

	private clearAndSetValidator(): void{
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.clearValidators();
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.setValidators(this.customValidators.RequiredValidator(ValidationMessages.PleaseEnterData, [{ Value: this.orgLabelName, IsLocalizeKey: true }]));
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.setErrors(this.customValidators.MaxLengthValidator(magicNumber.hundred));
		this.AddEditOrganizationLevelForm.get('OrganizationName')?.updateValueAndValidity();
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

	public onChangeSector(data: IDropdownOption | undefined):void {
		this.sectorId = data?.Value ?? magicNumber.zero;
		this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
		if (!this.isEditMode) {
			this.updateorgLabelName(this.sectorId);
		}
		this.cdr.detectChanges();
	}

	public checkOrgName():void {
		this.AddEditOrganizationLevelForm.markAllAsTouched();
		const sector =
      this.AddEditOrganizationLevelForm.controls['sectorId'].value.Value,
	   name = this.AddEditOrganizationLevelForm.controls['OrganizationName'].value;
		if (sector) {
			if(name!=""){
				this.organizationLevelService
					.CheckDuplicateOrganizationLevel4Name(
						sector,
						name.trim(),
						this.OrgLevel4Details?.UKey
					).pipe(takeUntil(this.unsubscribe$))
					.subscribe((data:GenericResponseBase<boolean>) => {
						if (data.Succeeded) {
							this.isDublicateName = data.Data ?? true;
							this.submitForm();
						}
					});
			}
		}
	}


	public getUdfData(data: UdfData):void {
		this.udfData = data.data;
		this.AddEditOrganizationLevelForm.addControl('udf', data.formGroup);
	}

	private addUpdate(reasonforupdate: string = RequiredStrings.EmptyString):void {
		const data = this.prepareOrg4Data();
		if (this.isEditMode) {
			data.UKey = this.OrgLevel4Details.UKey;
			data.ReasonForChange = reasonforupdate;
			this.updateOrg4(data);
		} else {
			this.createOrg4(data);
			return;
		}
		this.isPersistToast = false;
	}

	private prepareOrg4Data():SaveUpdatePayload {
		const data = this.AddEditOrganizationLevelForm.value;
		data.sectorId =
      this.AddEditOrganizationLevelForm.controls['sectorId'].value.Value;
		data.organizationName =
      this.AddEditOrganizationLevelForm.controls['OrganizationName'].value;
		data.UdfFieldRecords = this.udfData;
		return data;
	}

	private updateOrg4(data:SaveUpdatePayload):void {
		this.organizationLevelService.updateOrgLvl4(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrganizationLevel>) => {
				if (res.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel4HasBeenSavedSuccessfully);
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.OrgLevel4Details.OrganizationName=data.OrganizationName;
					this.updateEventLog();
					this.AddEditOrganizationLevelForm.markAsPristine();
					this.cdr.detectChanges();
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
	}

	private createOrg4(data:SaveUpdatePayload):void {
		this.organizationLevelService.addOrgLvl4List(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrganizationLevel>) => {
				if (res.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel4HasBeenSavedSuccessfully);
					this.isPersistToast = true;
					this.route.navigate([`${NavigationUrls.Org4List}`]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
	}

	private submitForm():void {
		if (this.isDublicateName) {
			const message = this.localizationService.GetLocalizeMessage(OrgLevel.Four),
				orgDynamicParam: DynamicParam[] = [{ Value: message.toLowerCase(), IsLocalizeKey: false }];
  			this.toasterService.showToaster(
				ToastOptions.Error,
				this.localizationService.GetLocalizeMessage(ToastMessages.EnitityAlreadyExists, orgDynamicParam)
			);
  			return;
  	}
		this.AddEditOrganizationLevelForm.markAllAsTouched();
		if (this.AddEditOrganizationLevelForm.valid) {
			this.addUpdate();
		}
	}
}
