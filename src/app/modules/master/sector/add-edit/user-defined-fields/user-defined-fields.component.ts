import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';

@Component({
	selector: 'app-user-defined-fields',
	templateUrl: './user-defined-fields.component.html',
	styleUrls: ['./user-defined-fields.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDefinedFieldsComponent implements OnInit, AfterViewInit,  OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() isSubmitted: boolean;
	@Input() ShowAll: boolean = false;

	public entityId: number = XrmEntities.Sector;
	public sectorId: number = magicNumber.zero;
	public recordId: number | undefined | null = magicNumber.zero;
	public recordUKey: string | undefined | null = '';
	public actionTypeId: number = ActionType.Add;
	public formUserDefined: FormGroup;

	private isEditMode: boolean;
	private udfData: IPreparedUdfPayloadData[];
	private UdfFieldRecords: FormArray;
	private destroyAllSubscribtion$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private sectorService: SectorService,
		private store: Store,
		public udfCommonMethods: UdfCommonMethods,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }

	ngAfterViewInit(): void {
		if(this.isSubmitted && this.UdfFieldRecords?.invalid) {
			this.UdfFieldRecords?.markAllAsTouched();
		}
	}


	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.formUserDefined = this.childFormGroup.get('UserDefineFields') as FormGroup;
		this.UdfFieldRecords = this.formUserDefined.controls['UdfFieldRecords'] as FormArray;

		if (this.isEditMode) {
			this.store.select(SectorState.sectorByUKey).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: Sector) => {
				this.recordId = data.Id ?? data.SectorId;
				this.recordUKey = data.SectorUkey;
				this.actionTypeId = ActionType.Edit;
				this.cdr.markForCheck();
			});
		}

	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;
	}

	getUdfData(data: { data: IPreparedUdfPayloadData[], formGroup: FormGroup }) {
		this.udfData = data.data;

		this.formUserDefined.setControl('udf', data.formGroup);
		this.bindUDFWithParent(this.udfData);
	}

	private bindUDFWithParent(records: IPreparedUdfPayloadData[]) {
		this.UdfFieldRecords.clear();

		records.forEach((row) => {
			this.UdfFieldRecords.push(this.fb.group({
				'recordId': [row.recordId],
				'recordUKey': [row.recordUKey],
				'sectorId': [row.sectorId],
				'udfConfigId': [row.udfConfigId],
				'udfDateValue': [row.udfDateValue],
				'udfId': [row.udfId],
				'udfIntegerValue': [row.udfIntegerValue],
				'udfNumericValue': [row.udfNumericValue],
				'udfTextValue': [row.udfTextValue],
				'xrmEntityId': [row.xrmEntityId]
			}));
		});
	}

	ngOnDestroy() {
		this.sectorService.dataPersistUdfdata.next(this.udfData);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
