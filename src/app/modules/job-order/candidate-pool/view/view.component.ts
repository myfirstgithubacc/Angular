import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { CandidatePoolService } from 'src/app/services/masters/candidate-pool.service';
import { backgroundChcekIdEnum, drugScreenIdEnum } from '@xrm-shared/services/common-constants/static-data.enum';
import { LightIndustrialPopupService } from '../../light-industrial/services/light-industrial-popup.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { CandidatePoolAddEdit } from '@xrm-core/models/candidate-pool/add-edit/candidate-pool-add-edit.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CandidatePoolPreferableAssignmentType } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-assign.model';
import { CandidatePoolPreferableSector } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-sector.model';
import { CandidatePoolPreferableLocation } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-location.model';
import { ParentEntity } from '../../Constants/ParentEntity.enum';
import { SubmittalsPopUpService } from '../../submittals/services/submittals-pop-up.service';
@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {

	@Input() backFromPopup: boolean = false;
	@Input() parentEntity: ParentEntity = ParentEntity.CandidatePool;
	public contactNumberForm: FormGroup;
	public isExtensionVisible: boolean = false;
	public candidatePool: CandidatePoolAddEdit;
	private PreferableSectors: CandidatePoolPreferableSector[];
	private PreferredAssignmentTypes: CandidatePoolPreferableAssignmentType[];
	private PreferredLocations: CandidatePoolPreferableLocation[];
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public entityId: number = XrmEntities.CandidatePool;
	public sectorIdUDF: number = magicNumber.zero;
	public recordUkey: string = '';
	public actionTypeId: number = ActionType.View;
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = magicNumber.ninetyFive;
	public processingId: number = magicNumber.three;
	public candidatePoolId: number = magicNumber.zero;
	public backgroundCheckId: number = backgroundChcekIdEnum.Completed;
	public drugScreen: number = drugScreenIdEnum.Completed;
	public drugScreenName: number = drugScreenIdEnum.None;
	public workDetails: string = '';
	public dateFormat: string;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private activatedRoute: ActivatedRoute,
		private toasterService: ToasterService,
		public route: Router,
		private formBuilder: FormBuilder,
		public udfCommonMethods: UdfCommonMethods,
		private candidatePoolService: CandidatePoolService,
		private liPopupService: LightIndustrialPopupService,
		private sessionStore: SessionStorageService,
		private cdr: ChangeDetectorRef,
		private sbmtlPopUpService: SubmittalsPopUpService
	) {
		this.contactNumberForm = this.formBuilder.group({
			contactNumber: [null],
			contactNumberExt: [null]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(switchMap((param) => {
			this.recordUkey = param['id'];
			return this.candidatePoolService.getAllCandidatePoolByUkey(this.recordUkey);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBase<CandidatePoolAddEdit>) => {
			this.getCandidatePoolByUkey(response);
			this.cdr.markForCheck();
		});
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}

	private getCandidatePoolByUkey(response: GenericResponseBase<CandidatePoolAddEdit>): void {
		if (isSuccessfulResponse(response)) {
			this.candidatePool = response.Data;
			this.candidatePoolId = response.Data.Id;
			this.candidatePoolService.holdData.next({'Disabled': this.candidatePool.Disabled, 'Code': this.candidatePool.Code, 'Id': this.candidatePool.Id});
			this.PreferableSectors = this.candidatePool.PreferredSectors;
			this.PreferredLocations = this.candidatePool.PreferredLocations;
			this.PreferredAssignmentTypes = this.candidatePool.PreferredAssignmentTypes;
			this.contactNumberForm.get('contactNumber')?.setValue(this.candidatePool.ContactNumber ?? '');
			this.contactNumberForm.get('contactNumberExt')?.setValue(this.candidatePool.PhoneNumberExt ?? '');
			this.isExtensionVisible = this.candidatePool.PhoneNumberExt != null;
			this.workDetails = this.formatedText(this.candidatePool.WorkDetails?? '');
		}

	}

	private formatedText(input: string ): string {
		const delimiter = '----------------------------',
		      parts = input.split(delimiter),
		      formattedParts = parts.map((part) =>
			                   part.trim()),
		      formattedText = formattedParts.join(`<br>${delimiter}<br>`);
		return formattedText;
	}

	public getPreferableSectorsNames(): string {
		return this.PreferableSectors.map((v: { SectorName: string }) =>
			v.SectorName).join(', ');
	}

	public getPreferredAssignmentTypesNames(): string {
		return this.PreferredAssignmentTypes.map((v: { AssignmentName: string }) =>
			v.AssignmentName).join(', ');
	}

	public getPreferredLocations(): string {
		return this.PreferredLocations.map((v: { LocationName: string }) =>
			v.LocationName).join(', ');
	}

	public navigatetolist(): void {
		this.liPopupService.closeDialogView();
	}

	public navigate(): void {
		if (this.route.url.includes('global-search')) {
			this.route.navigate(['/xrm/landing/global-search']);
		}
		else{
			this.route.navigate(['/xrm/job-order/candidate-pool/list']);
		}
	}

	public navigateToSbmtlList(): void{
		this.sbmtlPopUpService.navigateToSbmtlList();
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
