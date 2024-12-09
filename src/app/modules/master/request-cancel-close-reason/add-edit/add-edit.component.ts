import { HttpStatusCode } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, forkJoin, iif, of, switchMap, takeUntil } from 'rxjs';
import { RequestCancelCloseRequestService } from 'src/app/services/masters/request-cancel-close-request.service';
import { ParentData, RQCCR, SaveUpdatePayload } from '../Interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonService } from '@xrm-shared/services/common.service';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { RqccrKeys, RqccrNavigationUrls, ToastMessages, ValidationMessages } from '../Enums.enum';


@Component({selector: 'app-reason-cancel-reason-add-edit',
	templateUrl: './add-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public entityId = XrmEntities.RequestCancelCloseReason;
	public allowCustom = true;
	public isEditMode: boolean = false;
	public isICSOWVisible: boolean = false;
	public form: FormGroup;
	private ukey: string;
	private rQCCRDetails: RQCCR;
	public sectorList:IDropdownOption[];
	private unsubscribe$: Subject<void> = new Subject<void>();
	private isPersistToast:boolean = false;

	constructor(
    private fb:FormBuilder,
    public rQCCRService: RequestCancelCloseRequestService,
    private toasterService: ToasterService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private eventlog: EventLogService,
    private localizationService: LocalizationService,
    private customValidator: CustomValidators,
	private cdr: ChangeDetectorRef,
	private commonGridViewService: CommonService
	) {
		this.form=this.fb.group({
			sectorId: [
				null,
				this.customValidator.RequiredValidator(
					ValidationMessages.PleaseSelectData,
					[{ Value: RqccrKeys.Sector, IsLocalizeKey: true }]
				)
			],
			cancelCloseReason: [
				null,
				this.customValidator.RequiredValidator(
					ValidationMessages.PleaseEnterData,
					[{ Value: RqccrKeys.CancelCloseReason, IsLocalizeKey: true }]
				)
			],
			professionalPsrRequest: [false],
			icSowRequest: [null],
			liRequest: [false]
		});
	}


	ngOnInit(): void {
		this.ukey = this.activatedRoute.snapshot.params['id'];
		if(this.ukey)
			this.isEditMode = true;
		forkJoin({
			sectorList: this.rQCCRService.GetSectorDropDownList(),
			requestDetails: iif(
			  () =>
					Boolean(this.ukey),
			  this.rQCCRService.getRequestCancelCloseRequestId(this.ukey),
			  of(null)
			)
		  }).pipe(takeUntil(this.unsubscribe$))
		  .subscribe((res:{ sectorList: GenericResponseBase<IDropdownOption[]>; requestDetails: GenericResponseBase<RQCCR> | null }) => {
				if(res.sectorList.Succeeded && res.sectorList.Data){
					this.sectorList = res.sectorList.Data;
				}
				if(res.requestDetails){
					this.setDetails(res.requestDetails);
				}
		  });

		this.form.controls['sectorId'].valueChanges.pipe(takeUntil(this.unsubscribe$), switchMap((val:IDropdownOption|null) => {
			if (val && !this.isEditMode){
				this.onChangeSector(val);
				return this.rQCCRService.checkRfxSow((val.Value).toString());
			}
			return of(null);
		})).subscribe((data:GenericResponseBase<boolean>|null) => {
			if(data?.Succeeded){
				this.isICSOWVisible = data.Data ?? true;
				this.cdr.detectChanges();
				const value = data.Data
					? false
					: null;
				this.form.get('icSowRequest')?.setValue(value);
			}
		});
	}

	ngOnDestroy(): void {
		if(!this.isPersistToast)
		 this.toasterService.resetToaster();

		this.unsubscribe$.next();
    	this.unsubscribe$.complete();
	}

	public onChangeSector(data: IDropdownOption | null):void {
		if(data==undefined)
		{
			this.form.controls[
				'icSowRequest'
			].setValue(null);
			this.isICSOWVisible = false;
		}
	}

	private setDetails(res:GenericResponseBase<RQCCR>):void {
		if(res.Succeeded && res.Data){
			this.rQCCRDetails=res.Data;
			this.rQCCRDetails.ProfessionalPsrRequest = this.rQCCRDetails.ProfessionalPsrRequest == RqccrKeys.Yes;

			if (this.rQCCRDetails.IcSowRequest === RqccrKeys.NA) {
				this.rQCCRDetails.IcSowRequest = null;
				this.isICSOWVisible = false;
			}
			else {
				this.rQCCRDetails.IcSowRequest = this.rQCCRDetails.IcSowRequest === RqccrKeys.Yes;
				this.isICSOWVisible = true;
			}
			this.rQCCRDetails.LiRequest = this.rQCCRDetails.LiRequest == RqccrKeys.Yes;
			this.form.patchValue({
				sectorId: {Text: this.rQCCRDetails.SectorName, Value: this.rQCCRDetails.SectorId.toString()},
				cancelCloseReason: this.rQCCRDetails.CancelCloseReason,
				professionalPsrRequest: this.rQCCRDetails.ProfessionalPsrRequest,
				icSowRequest: this.rQCCRDetails.IcSowRequest,
				liRequest: this.rQCCRDetails.LiRequest
			});
			this.updateEventLog();
			this.setParentData();
		}
		else
			this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
	}

	private setParentData(): void{
		const parentData:ParentData = {
			recordCode: this.rQCCRDetails.CancelCloseReasonCode,
			ukey: this.ukey,
			Disabled: this.rQCCRDetails.Disabled,
			recordId: this.rQCCRDetails.Id
		};
		this.rQCCRService.RQCCRParentData.next(parentData);
	}

	private updateEventLog():void {
		this.eventlog.recordId.next(this.rQCCRDetails.Id);
		this.eventlog.entityId.next(this.entityId);
		this.eventlog.isUpdated.next(true);
	}

	public checkDuplicate():void {
		this.form.markAllAsTouched();
		if(this.form.get('cancelCloseReason')?.value)
			this.rQCCRService.checkDuplicate(this.form.get('sectorId')?.value?.Value, this.form.get('cancelCloseReason')?.value, this.ukey)
				.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<boolean>) => {
					if(res.StatusCode == Number(HttpStatusCode.Ok))
					{
						if (res.Data) {
							const message = this.localizationService.GetLocalizeMessage(RqccrKeys.RequestCancelCloseReason).toLowerCase(),
								dynamicParam: DynamicParam[] = [{Value: message, IsLocalizeKey: false}];
							this.showMessage(false, ToastMessages.EnitityAlreadyExists, dynamicParam);
						}
						else {
							this.submitForm();
						}
					}
					else
						this.toasterService.showToaster(ToastOptions.Error, res.Message);
				});
	}


	private showMessage(isSuccuess: boolean, message: string, dynamicParam: DynamicParam[]|null):void {
		if(dynamicParam)
		{
			this.toasterService.showToaster(isSuccuess ?
				ToastOptions.Success :
				ToastOptions.Error, this.localizationService.GetLocalizeMessage(message, dynamicParam));
		}
		else
			this.toasterService.showToaster(isSuccuess ?
				ToastOptions.Success :
				ToastOptions.Error, this.localizationService.GetLocalizeMessage(message));
	}

	private submitForm():void {
		this.form.markAllAsTouched();
		if(!this.form.valid)
			return;
		if(!this.checkIsAnyOfTrue())
		{
			this.showMessage(false, this.localizationService.GetLocalizeMessage(RqccrKeys.SelectAtLeastOneApplicableIn), null);
			return;
		}
		const payload = this.prepareDataforRQCCR();
		if(!this.isEditMode)
		{
			this.createRQCCR(payload);
		}
		else
		{
			this.updateRQCCR(payload);
		}
	}

	private prepareDataforRQCCR():SaveUpdatePayload{
		const payload = this.form.value;
		payload.cancelCloseReason = payload.cancelCloseReason.trim();
		payload.sectorId = payload.sectorId.Value;
		return payload;
	}

	private createRQCCR(payload:SaveUpdatePayload):void {
		this.rQCCRService.addRequestCancelCloseRequest(payload)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<RQCCR>) => {
				if (res.Succeeded) {
					this.isPersistToast = true;
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.CreateCancelCloseReasonSuccess);
					this.route.navigate([RqccrNavigationUrls.List]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
				}
			});
	}

	private updateRQCCR(payload:SaveUpdatePayload):void {
		payload.uKey=this.rQCCRDetails.uKey;
		this.rQCCRService.updateRequestCancelCloseRequest(payload)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<RQCCR>) => {
				if (res.Succeeded) {
					this.form.markAsPristine();
					this.cdr.detectChanges();
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.CreateCancelCloseReasonSuccess);
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.rQCCRDetails.CancelCloseReason=payload.cancelCloseReason;
					this.updateEventLog();
				} else {
					this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
				}
			});
	}

	private checkIsAnyOfTrue():boolean {
		if(this.form.get('professionalPsrRequest')?.value || this.form.get('liRequest')?.value || (this.isICSOWVisible && this.form.get('icSowRequest')?.value))
			return true;
		else
			return false;
	}


}
