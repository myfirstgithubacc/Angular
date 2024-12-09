import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationPaths } from '../constant/routes-constant';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { StaffingAgencyGatewayService } from 'src/app/services/masters/staffing-agency-gateway.service';
import { SectorDetails, SectorValues, StaffingAgencyData } from '../constant/status-enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { IDropdown } from '@xrm-shared/models/common.model';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {

	public staffingAgencyData: StaffingAgencyData;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }, {Value: 'LaborCategory', IsLocalizeKey: true}];
	public stateLabel:string='';
	public zipLabel:string='';
	public localizeParamZip: DynamicParam[]=[];
	public localizeParamState: DynamicParam[]=[];
	public openRightPanel: boolean= false;
	public existingUkey:string;
	public entityId: number = XrmEntities.StaffingAgency;
	public sectorIdUDF: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;
	public statusForm: FormGroup;
	public showPhoneExt: FormGroup;
	public recordId: number | string;
	public recordStatus: string;
	public ukey: string;
	public laborCategory: SectorValues;
	public primaryExt:boolean = false;
	public altExt:boolean = false;
	public acctExt:boolean = false;
	private ngUnsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		public udfCommonMethods: UdfCommonMethods,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		private formBuilder: FormBuilder,
		private toasterServc: ToasterService,
		private staffingGatewayServc:StaffingAgencyGatewayService
	) {
		this.statusForm = this.formBuilder.group({
			status: [null]
		});

		this.showPhoneExt = this.formBuilder.group({
			phoneControl: [null],
			phoneExt: [null],
			altPhoneControl: [null],
			altPhoneExt: [null],
			acctPhoneControl: [null],
			acctPhoneExt: [null]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getStaffingAgency(param['id']);
				this.ukey = param["id"];
			}
		});
		this.staffingGatewayServc.openRightPanel.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((dt:boolean) => {
			this.openRightPanel = dt;
		});
	}

	private getStaffingAgency(id: string) {
		this.staffingGatewayServc.getStaffingAgencyByUkey(id)
			.pipe(
				filter((res: GenericResponseBase<StaffingAgencyData>) =>
					res.Succeeded),
				tap((res: GenericResponseBase<StaffingAgencyData>) => {
					if(res.Succeeded && res.Data){
						this.staffingAgencyData = this.dateTransform(res.Data);
						this.recordId = res.Data.Code;
						this.staffingGatewayServc.Staffing.next(this.staffingAgencyData);
						this.recordStatus = res.Data.StaffingAgencyStatus;
						this.recordUKey = this.staffingAgencyData.UKey;
						this.handleLocalization(res.Data.CountryId);
						this.primaryPhone();
						this.altPhone();
						this.acctPhone();
						this.statusForm.controls['status']
							.setValue({
								Text: this.recordStatus,
								Value: this.recordStatus
							});
					}}),
				switchMap((dt: ApiResponse) => {
					const sectors = dt.Data.sowLaborCategories
						.map((e: SectorDetails, index: number) =>
							({
								Text: e.Text,
								Index: index,
								items: e.NewLaborCategories
									.filter((category) =>
										category.IsSelected)
									.map((category: IDropdown, childIndex: number) =>
										({
											Text: category.Text,
											Value: category.Value,
											Index: `${index}_${childIndex}`
										}))
							}))
						.filter((sector: {items:[]}) =>
							sector.items.length > Number(magicNumber.zero));
					this.laborCategory = sectors;
					return of(null);
				})
			)
			.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe();
	}

	public primaryPhone() {
		const phoneNumber = this.staffingAgencyData.PrimaryContactPhoneNumber?.trim(),
		 phoneExtension = this.staffingAgencyData.PrimaryPhoneExtension?.trim();
		if(phoneNumber){
			this.showPhoneExt.controls['phoneControl'].setValue(phoneNumber);
			if(phoneExtension){
				this.primaryExt = true;
				this.showPhoneExt.controls['phoneExt'].setValue(phoneExtension);
			}else {
				this.primaryExt = false;
				this.showPhoneExt.controls['phoneExt'].setValue('');
			}
		}
	}

	public altPhone() {
		const phoneNumber = this.staffingAgencyData.AlternateContactPhoneNumber?.trim(),
		 phoneExtension = this.staffingAgencyData.AlternatePhoneExtension?.trim();
		if(phoneNumber){
			this.showPhoneExt.controls['altPhoneControl'].setValue(phoneNumber);
			if(phoneExtension){
				this.altExt = true;
				this.showPhoneExt.controls['altPhoneExt'].setValue(phoneExtension);
			}else {
				this.altExt = false;
				this.showPhoneExt.controls['altPhoneExt'].setValue('');
			}
		}
	}

	public acctPhone() {
		const phoneNumber = this.staffingAgencyData.AccountingContactPhoneNumber?.trim(),
		 phoneExtension = this.staffingAgencyData.AccountingPhoneExtension?.trim();
		if(phoneNumber){
			this.showPhoneExt.controls['acctPhoneControl'].setValue(phoneNumber);
			if(phoneExtension){
				this.acctExt = true;
				this.showPhoneExt.controls['acctPhoneExt'].setValue(phoneExtension);
			}else {
				this.acctExt = false;
				this.showPhoneExt.controls['acctPhoneExt'].setValue('');
			}
		}
	}

	public handleLocalization(countryId: number | null) {
		if(countryId == null){
			this.zipLabel ='ZipLabel';
			this.stateLabel ='State';
		}else{
			this.stateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
			this.zipLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
			this.localizeParamZip.push({ Value: this.zipLabel, IsLocalizeKey: false });
			this.localizeParamState.push({ Value: this.stateLabel, IsLocalizeKey: false });
		}
	}

	private dateTransform(data: StaffingAgencyData) {
		data.GeneralLiabilityApprovalDate = this.localizationService.
			TransformDate(data.GeneralLiabilityApprovalDate);
		data.GeneralLiabilityExpirationDate = this.localizationService.
			TransformDate(data.GeneralLiabilityExpirationDate);
		data.AutoLiabilityApprovalDate = this.localizationService.
			TransformDate(data.AutoLiabilityApprovalDate);
		data.AutoLiabilityExpirationDate = this.localizationService.
			TransformDate(data.AutoLiabilityExpirationDate);
		data.WorkerCompApprovalDate = this.localizationService.
			TransformDate(data.WorkerCompApprovalDate);
		data.WorkerCompExpirationDate = this.localizationService.
			TransformDate(data.WorkerCompExpirationDate);
		return data;
	}

	public navigate(){
		this.route.navigate([NavigationPaths.list]);
	}

	public openRightSidePanel(existingUkey: string) {
		this.existingUkey = existingUkey;
		this.staffingGatewayServc.openRightPanel.next(true);
	}

	public closeOpenPanel(){
		this.openRightPanel = false;
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.staffingGatewayServc.openRightPanel.next(false);
	}
}
