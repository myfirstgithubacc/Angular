import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from 'src/app/shared/services/custom-validators.service';
import { OrganizationLevelService } from '../../service/organization-level.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { OrgLevelDetailsBySectorId, OrganizationLevel, ParentData, PreparedData, SaveUpdatePayload, UdfData } from '@xrm-master/organization-level/Interfaces/Interface';
import { NavigationUrls, OrgLevel, OrgLevelCode, RequiredStrings, ToastMessages, ValidationMessages } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { IDropdownOption } from '@xrm-shared/models/common.model';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public AddEditOrganizationLevelForm: FormGroup;
	public sectorDropDownList: IDropdownOption[];
	public isEditMode: boolean = false;
	private isDublicateName: boolean = false;
	private OrgLevel2Details: OrganizationLevel;
	public SectorLabel:string = RequiredStrings.Sector;
	public orgLabelName:string = OrgLevel.Two;
	public OrgLevelID:string = OrgLevelCode.Two;
	private isPersistToast:boolean = false;
	public entityId: number = XrmEntities.OrgLevel2;
	public sectorId: number = magicNumber.zero;
	public udfRecordID: number = magicNumber.zero;
	public recordUKey: string = RequiredStrings.EmptyString;
	public actionTypeId: number = ActionType.Add;
	private udfData: PreparedData[];
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
    private fb: FormBuilder,
    private customValidators: CustomValidators,
    private activatedRoute: ActivatedRoute,
    private organizationLevelService: OrganizationLevelService,
    public sector: SectorService,
    private toasterService: ToasterService,
    private eventLog: EventLogService,
    private sectorService: SectorService,
    public udfCommonMethods: UdfCommonMethods,
    private localizationService: LocalizationService,
    private route: Router,
	private cdr: ChangeDetectorRef,
	private commonGridViewService: CommonService

	) {
		this.AddEditOrganizationLevelForm = this.fb.group({
			sectorId: [
				null, [
					this.customValidators.RequiredValidator(
						ValidationMessages.PleaseSelectData,
						[{ Value: this.SectorLabel, IsLocalizeKey: true }]
					)
				]
			],
			OrganizationName: [
				null,
				[
					this.customValidators.RequiredValidator(ValidationMessages.PleaseEnterData, [{ Value: this.orgLabelName, IsLocalizeKey: true }]),
  				this.customValidators.MaxLengthValidator(magicNumber.hundred)
				]
			],
			OrganizationCode: []
		});
	}

	ngOnInit(): void {
		this.getCombinedData();
		this.AddEditOrganizationLevelForm.controls[
			'sectorId'
		].valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val: IDropdownOption|null) => {
			if (val && !this.isEditMode) {
				this.onChangeSector(val);
			}
		});
	}

	private setParentData(): void{
		const parentData: ParentData = {
			recordCode: this.OrgLevel2Details.OrganizationCode,
			uKey: this.recordUKey,
			Disabled: this.OrgLevel2Details.Disabled,
			recordId: this.OrgLevel2Details.Id,
			recordCodeLabel: this.OrgLevelID
		};
		this.organizationLevelService.OrgLevel2ParentData.next(parentData);
	}

	private getCombinedData():void {
		const id = this.activatedRoute.snapshot.params['id'],
			sectorObservable = this.sectorService.getSectorDropDownListByOrgLevelType(magicNumber.two),
			clientObservable = this.organizationLevelService.getConfigureClient(),
			org2Observable = (id != RequiredStrings.EmptyString && id != null)
				? this.organizationLevelService.getOrgLvl2Byukey(id)
				: of(null);
		forkJoin([
			sectorObservable,
			clientObservable,
			org2Observable
		]).pipe(takeUntil(this.unsubscribe$))
			.subscribe(([sectorList, clientDetails, org2]) => {
				if(sectorList.Data)
					this.sectorDropDownList = sectorList.Data;
				this.SectorLabel = clientDetails.Data?.OrganizationLabel ?? RequiredStrings.Sector;
				this.setOrgLevel2Details(org2);
				this.clearAndSetValidators();
			});
	}

	private clearAndSetValidators():void {
		this.AddEditOrganizationLevelForm.get('SectorId')?.clearValidators();
  		this.AddEditOrganizationLevelForm.get('SectorId')?.setValidators(this.customValidators.RequiredValidator(ValidationMessages.PleaseSelectData, [{ Value: this.SectorLabel, IsLocalizeKey: true }]));
  		this.AddEditOrganizationLevelForm.get('SectorId')?.updateValueAndValidity();
	}

	private setOrgLevel2Details(data1:GenericResponseBase<OrganizationLevel>|null):void {
		if(data1?.Succeeded && data1.Data){
			this.isEditMode = true;
			this.OrgLevel2Details = data1.Data;
			this.actionTypeId = ActionType.Edit;
			this.recordUKey = this.OrgLevel2Details.UKey;
			this.udfRecordID = Number(this.OrgLevel2Details.Id);
			this.sectorId = Number(this.OrgLevel2Details.SectorId);
			this.updateEventLog();
			this.AddEditOrganizationLevelForm.patchValue({
				OrganizationName: this.OrgLevel2Details.OrganizationName,
				OrganizationCode: this.OrgLevel2Details.OrganizationCode,
				sectorId: {
					Text: this.OrgLevel2Details.SectorName,
					Value: this.OrgLevel2Details.SectorId
				}
			});
			this.updateOrgLevelDetails(this.sectorId);
		}
	}

	private updateOrgLevelDetails(sectorId: number):void {
		this.organizationLevelService
			.getOrgLevelNameBySectorId(sectorId, magicNumber.two)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<OrgLevelDetailsBySectorId>) => {
				if (res.Succeeded) {
					this.orgLabelName = res.Data?.OrgName ?? OrgLevel.Two;
					this.clearAndSetValidator();
					this.OrgLevelID =
            		res.Data?.OrgName != null && res.Data.OrgName != RequiredStrings.EmptyString.toString()
            			? `${res.Data.OrgName} ID`
            			: OrgLevelCode.Two;
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

	ngOnDestroy():void {
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
		if(!this.isEditMode){
			this.updateOrgLevelDetails(this.sectorId);
		}
		this.cdr.detectChanges();
	}

	public checkOrgName():void {
		this.AddEditOrganizationLevelForm.markAllAsTouched();
		const sector = this.AddEditOrganizationLevelForm.controls['sectorId'].value.Value,
		 name = this.AddEditOrganizationLevelForm.controls['OrganizationName'].value;
		if (sector) {
			if(name!="")
				this.organizationLevelService
					.CheckDuplicateOrganizationLevel2Name(
						sector,
						name.trim(),
						this.OrgLevel2Details?.UKey
					).pipe(takeUntil(this.unsubscribe$))
					.subscribe((data: GenericResponseBase<boolean>) => {
						if (data.Succeeded) {
							this.isDublicateName = data.Data ?? true;
							this.submitForm();
						}
					});
		}
	}

	public getUdfData(data: UdfData):void {
		this.udfData = data.data;
		this.AddEditOrganizationLevelForm.addControl('udf', data.formGroup);
	}

	private addUpdate(reasonforupdate: string = RequiredStrings.EmptyString):void {
		const data = this.prepateOrg2Data();
		if (this.isEditMode) {
			data.UKey = this.OrgLevel2Details.UKey;
			data.ReasonForChange = reasonforupdate;
			this.updateOrg2(data);
		} else {
			this.createOrg2(data);
		}
		this.isPersistToast = false;
	}

	private prepateOrg2Data():SaveUpdatePayload {
		const data = this.AddEditOrganizationLevelForm.value;
		data.sectorId =
      this.AddEditOrganizationLevelForm.controls['sectorId'].value.Value;
		data.OrganizationName =
      this.AddEditOrganizationLevelForm.controls['OrganizationName'].value;
		data.UdfFieldRecords = this.udfData as [];
		return data;
	}

	private createOrg2(data:SaveUpdatePayload):void {
		this.organizationLevelService.addOrgLvl2List(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrganizationLevel>) => {
				if (res.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel2HasBeenSavedSuccessfully);
					this.isPersistToast = true;
					this.route.navigate([`${NavigationUrls.Org2List}`]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
				}
				return;
			});
	}

	private updateOrg2(data:SaveUpdatePayload):void {
		this.organizationLevelService.updateOrgLvl2(data)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<OrganizationLevel>) => {
				if (res.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel2HasBeenSavedSuccessfully);
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.OrgLevel2Details.OrganizationName = data.OrganizationName;
					this.updateEventLog();
					this.AddEditOrganizationLevelForm.markAsPristine();
					this.cdr.detectChanges();
				} else {
					this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
				}
			});
	}

	private updateEventLog():void {
		this.eventLog.recordId.next(this.OrgLevel2Details.Id);
		this.eventLog.entityId.next(XrmEntities.OrgLevel2);
		this.eventLog.isUpdated.next(true);
	}

	private submitForm():void {
		if(this.isDublicateName){
			const message = this.localizationService.GetLocalizeMessage(OrgLevel.Two),
				orgDynamicParam : DynamicParam[] = [{ Value: message.toLowerCase(), IsLocalizeKey: false }];
  		this.toasterService.showToaster(
				ToastOptions.Error,
				this.localizationService.GetLocalizeMessage(ToastMessages.EnitityAlreadyExists, orgDynamicParam)
			);
		}
		this.AddEditOrganizationLevelForm.markAllAsTouched();
		if (this.AddEditOrganizationLevelForm.valid && !this.isDublicateName) {
			this.addUpdate();
		}
	}
}
