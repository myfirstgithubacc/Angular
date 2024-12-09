import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { MenuService } from '@xrm-shared/services/menu.service';
import { AssingmentDetailsService } from '../../assignment-details/service/assingmentDetails.service';
import { Subject, takeUntil } from 'rxjs';
import { Column, ContractorData, LocOfficerData, NavigationData, NavigationPathsType, PoData } from '../constant/contractor-interface';
import { CoreServService } from '../core-serv.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { navigationUrls } from '../../assignment-details/constants/const-routes';

@Component({
	selector: 'app-contractor-view',
	templateUrl: './contractor-view.component.html',
	styleUrls: ['./contractor-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class ContractorViewComponent implements OnInit, OnDestroy {
	public navigationPaths: NavigationPathsType = NavigationPaths;
	public ukey: string;
	public ShowUserData: FormGroup;
	public contractorData: ContractorData;
	public recordId: string;
	public recordStatus: string;
	public statusForm: FormGroup;
	public entityID = XrmEntities.Contractor;
	public sectorIdUDF: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;
	public phExt: boolean = false;
	public isContractorInformationTabSelected: boolean = true;
	public poBreakdownData: PoData | null;
	public locationOfficerPrefilledData: LocOfficerData[];
	private ngUnsubscribe$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		public contractorService: ContractorService,
		public udfCommonMethods: UdfCommonMethods,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private menuService: MenuService,
		private assingmentDetailsService: AssingmentDetailsService,
		private cdr: ChangeDetectorRef,
		private coreServ: CoreServService
	) {
		this.ShowUserData = this.formBuilder.group({
			phoneControl: [null],
			phoneExt: [null]
		});
		this.statusForm = this.formBuilder.group({
			status: [null]
		});
	}

	ngOnInit(): void {
		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.ContractorEvent);
		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.Assingments);
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getById(param['id']);
				this.ukey = param['id'];
			}
		});
		this.assingmentDetailsService.navigationUrlCancel.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: NavigationData | null) => {
			if (data?.url && data.url.length > Number(magicNumber.zero)) {
				if (data?.isAssignDetailsTabSelected) {
					this.isContractorInformationTabSelected = false;
				} else {
					this.isContractorInformationTabSelected = true;
				}
			}
		});
		this.assingmentDetailsService.navigationUrlCancel.next(null);
	}

	private getById(id: string) {
		this.contractorService.getContractorById(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<ContractorData>) => {
				if (res.Succeeded && res.Data) {
					this.contractorData = res.Data;
					this.coreServ.Contract.next(this.contractorData);
					this.locationOfficerPrefilledData = this.contractorData.TenureDetails;
					this.recordId = this.contractorData.Code;
					this.recordUKey = this.contractorData.UKey;
					this.getContactPhoneNumber();
					this.statusForm.controls['status'].
						setValue({
							Text: this.recordStatus,
							Value: this.recordStatus
						});
				}
			}
		});
	}

	private getPOHoursBraekdownSummary(id: number) {
		this.contractorService.getHoursBreakdownData(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: GenericResponseBase<PoData>) => {
			if (res.Succeeded && res.Data) {
				this.poBreakdownData = res.Data;
				this.cdr.markForCheck();
			}
		});
	}

	public openPOCard(): void {
		this.getPOHoursBraekdownSummary(this.contractorData.Id);
	}

	private getContactPhoneNumber() {
		const phoneNumber = this.contractorData.WorkPhoneNo?.trim(),
			phoneExtension = this.contractorData.PhoneNoExtension?.trim();
		if (phoneNumber) {
			this.ShowUserData.controls['phoneControl'].patchValue(this.contractorData.WorkPhoneNo);
			if (phoneExtension) {
				this.phExt = true;
				this.ShowUserData.controls['phoneExt'].patchValue(this.contractorData.PhoneNoExtension);
			} else {
				this.phExt = false;
				this.ShowUserData.controls['phoneExt'].setValue('');
			}
		}
	}

	public navigate() {
		if (this.route.url.includes('global-search')) {
			this.route.navigate([navigationUrls.globalSearchList]);
		}
		else {
			this.route.navigate([this.navigationPaths.list]);
		}
	}

	public locationOfficerColumnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: true,
		Id: true,
		firstColumnName: '',
		secondColumnName: '',
		deleteButtonName: '',
		noOfRows: magicNumber.zero,
		itemSr: false,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero,
		isAddMoreValidation: false
	};

	public locationOfficerColumn: Column[] = [
		{
			colSpan: magicNumber.two,
			columnName: 'Sector',
			controls: [
				{
					controlType: 'text',
					controlId: 'SectorName',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureLimit',
			controls: [
				{
					controlType: 'number',
					controlId: 'TenureLimit',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureType',
			controls: [
				{
					controlType: 'text',
					controlId: 'TenureLimitTypeName',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureStartDate',
			controls: [
				{
					controlType: 'date',
					controlId: 'TenureStartDate',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TenureEndDate',
			controls: [
				{
					controlType: 'date',
					controlId: 'TenureEndDate',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.five,
			columnName: 'TenureCompleted',
			controls: [
				{
					controlType: 'text',
					controlId: 'TenureCompleted',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.five,
			columnName: 'AssignmentsCounts',
			controls: [
				{
					controlType: 'text',
					controlId: 'AssignmentCount',
					defaultValue: '',
					isEditMode: false,
					isDisable: false
				}
			]
		}
	];

	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}
