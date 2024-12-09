import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateDeclineReasonService } from 'src/app/services/masters/candidate-decline-reason.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CandidateDeclineReason } from '@xrm-core/models/candidate-decline-reason.model';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { NavigationPaths } from '../constant/routes-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { HttpStatusCode } from '@angular/common/http';
import { CommonService } from '@xrm-shared/services/common.service';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { CanDecRsnData, RFXSectorDetails } from '../constant/candidate-decline-reason-interface';
import { IDropdownOption, INavigationPathMap } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public sectorDropDownList: [];
	public canDecRsnData: CanDecRsnData;
	public navigationPaths: INavigationPathMap = NavigationPaths;
	private ngUnsubscribe$ = new Subject<void>();
	public addEditCanDecRsnForm:FormGroup;
	public sectorData: IDropdownOption[] = [];
	public Rfxswitchconfig: boolean;
	public ukey: string;
	public recordStatus: string;
	public entityId = XrmEntities.CandidateDeclineReason;
	public usedInRadio: IDropdownOption[];
	public isOnboardingCandidate: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private fb:FormBuilder,
    	public candidateDecrsnServc: CandidateDeclineReasonService,
    	private route: Router,
		private customValidators: CustomValidators,
		private toasterService: ToasterService,
		private eventLog: EventLogService,
		private toasterServc: ToasterService,
		private activatedRoute: ActivatedRoute,
		private commonSrv: CommonService,
		private cdr: ChangeDetectorRef

	) {
		this.initializeForm();
	}

	public initializeForm(){
		this.addEditCanDecRsnForm = this.fb.group({
			CandidateDeclineReason: [null, this.customValidators.RequiredValidator('PleaseEnterCandidateDeclineRsn')],
			candidateTypeId: [`${magicNumber.threeTwentySix}`],
			ProfessionalRequest: [false],
			LiRequest: [false],
			RfxSowRequest: [false],
			SectorId: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]]
		});
	}

	ngOnInit(): void {
		if (this.route.url == this.navigationPaths.addEdit) {
			this.isEditMode = false;
		} else {
			this.isEditMode = true;
			this.loadData();
		}
		this.getSectorList();
		this.getRadioList();
	}

	getRadioList(){
		this.candidateDecrsnServc.getUsedInRadio().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
			if(res.Data){
				this.usedInRadio = res.Data;
				this.cdr.markForCheck();
			}
		});
	}

	private loadData() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
				if (param['id']) {
					this.isEditMode = true;
					this.ukey = param['id'];
				}
				return this.candidateDecrsnServc.getCanDeclineRsnById(param['id']).pipe(takeUntil(this.ngUnsubscribe$));
			})
		).subscribe({
			next: (res: GenericResponseBase<CanDecRsnData>) => {
				if (res.Succeeded && res.Data) {
					this.canDecRsnData = res.Data;
					this.getById();
				}
			}
		});
	}

	public getById() {
		this.isEditMode = true;
		this.recordStatus = this.canDecRsnData.Disabled
			? dropdown.Inactive
			: dropdown.Active;
		this.getRfxData(this.canDecRsnData.SectorId);
		this.onChangeRadio(this.canDecRsnData.candidateTypeId.toString());
		this.patchvalue();

		this.candidateDecrsnServc.declinereasonSubject.next({
			"DeclineReasonID": this.canDecRsnData.Id,
			"Disabled": this.canDecRsnData.Disabled,
			"DeclineReasonCode": this.canDecRsnData.Code
		});
	}

	private getSectorList() {
		this.candidateDecrsnServc.getSectorDropDownList().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<IDropdownOption[]>) => {
				if (res.Succeeded && res.Data) {
					this.sectorData = res.Data;
				}
			}
		});
	}

	private getRfxData(id: number){
		this.candidateDecrsnServc.getRfxDataFromSector(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((data: GenericResponseBase<RFXSectorDetails>) => {
				if(data.Succeeded && data.Data){
					this.Rfxswitchconfig = data.Data.IsRfxSowRequired;
					this.cdr.markForCheck();
					if(!this.Rfxswitchconfig){
						this.addEditCanDecRsnForm.controls['RfxSowRequest'].setValue(false);
					}
				}
			});
	}

	onChangeRadio(e: string){
		const value = `${magicNumber.threeTwentySeven}`;
		this.isOnboardingCandidate = e == value;
		this.addEditCanDecRsnForm.controls['LiRequest'].patchValue(false);
		this.addEditCanDecRsnForm.controls['ProfessionalRequest'].patchValue(false);
		this.addEditCanDecRsnForm.controls['RfxSowRequest'].patchValue(false);
		if(e == value){
			this.addEditCanDecRsnForm.controls['ProfessionalRequest'].patchValue(true);
		}
		this.cdr.markForCheck();
	}

	patchvalue(){
		this.addEditCanDecRsnForm.patchValue({
			CandidateDeclineReason: this.canDecRsnData.CandidateDeclineReason,
			ProfessionalRequest: this.canDecRsnData.ProfessionalRequest,
			LiRequest: this.canDecRsnData.LiRequest,
			RfxSowRequest: this.canDecRsnData.RfxSowRequest,
			SectorId: this.canDecRsnData.SectorName,
			candidateTypeId: this.canDecRsnData.candidateTypeId
		});
	}

	public onChangeSectorDropdown(val: IDropdownOption | undefined) {
		if ( val != undefined){
			this.getRfxData(val.Value);
		}else{
			this.Rfxswitchconfig= false;
			this.addEditCanDecRsnForm.controls['RfxSowRequest'].setValue(false);
		}
	}

	public submitForm() {
		this.addEditCanDecRsnForm.markAllAsTouched();
		if (this.addEditCanDecRsnForm.valid) {
			if (this.isAtleastOneSwitchIsOn()) {
				if (this.isEditMode) {
					this.save();
					this.addEditCanDecRsnForm.markAsPristine();
				} else {
					this.save();
				}
			} else {
				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Error, 'ApplicableInValidationMessage');
			}
		}
	}

	private isAtleastOneSwitchIsOn(): boolean {
		return Object.keys(this.addEditCanDecRsnForm.controls)
			.some((x) =>
				this.addEditCanDecRsnForm.controls[x].value === true);
	}

	save(){
		this.addEditCanDecRsnForm.markAllAsTouched();
		if(this.isEditMode){
			const canDeclineRsnData:CandidateDeclineReason = new CandidateDeclineReason(this.addEditCanDecRsnForm.value);
			canDeclineRsnData.SectorId = this.addEditCanDecRsnForm.controls['SectorId'].value.Value;
			canDeclineRsnData.UKey=this.canDecRsnData.UKey;
			this.saveEditMode(canDeclineRsnData);
		}else{
			const canDeclineRsnData:CandidateDeclineReason = new CandidateDeclineReason(this.addEditCanDecRsnForm.value);
			canDeclineRsnData.SectorId = this.addEditCanDecRsnForm.controls['SectorId'].value.Value;
			this.saveAddMode(canDeclineRsnData);
		}
	};

	saveEditMode(canDeclineRsnData: CandidateDeclineReason){
		this.candidateDecrsnServc.updateCanDeclineRsn(canDeclineRsnData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: ApiResponseBase) => {
				this.toasterServc.resetToaster();
				if (data.StatusCode == HttpStatusCode.Conflict)
				{
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'CanDecRsnAlreadyExists');
				}
				else if (data.StatusCode === HttpStatusCode.Ok) {
					setTimeout(() => {
						this.toasterServc.showToaster(ToastOptions.Success, "CandidateDecRsnAddedSuccessfully");
					});
				} else {
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.Message ?? ''
					);
				}
				this.eventLog.isUpdated.next(true);
			}
		});
	}

	saveAddMode(canDeclineRsnData: CandidateDeclineReason){
		this.candidateDecrsnServc.addCanDeclineRsn(canDeclineRsnData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: ApiResponseBase) => {
				if (data.StatusCode == HttpStatusCode.Conflict)
				{
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'CanDecRsnAlreadyExists');
				}else if (data.StatusCode === HttpStatusCode.Ok) {
					this.commonSrv.resetAdvDropdown(this.entityId);
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, "CandidateDecRsnAddedSuccessfully");
					this.route.navigate([NavigationPaths.list]);
				}else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.Message ?? ''
					);
				}
			}
		});
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
		this.toasterServc.resetToaster();
	}

	ngOnDestroy(): void {
		if (this.isEditMode) {
			this.toasterServc.resetToaster();
		}
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();

	}


}


