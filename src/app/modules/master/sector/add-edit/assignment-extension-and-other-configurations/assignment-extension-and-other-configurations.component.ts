import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { IAssignmentExtAndOtherConfigFM } from './utils/formModel';
import { patchAssignmentExtAndOtherConfig } from './utils/patch-assignment-ext-config';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IRadioGroupModel } from '@xrm-shared/models/common.model';
@Component({
	selector: 'app-assignment-extension-and-other-configurations',
	templateUrl: './assignment-extension-and-other-configurations.component.html',
	styleUrls: ['./assignment-extension-and-other-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush

})
export class AssignmentExtensionAndOtherConfigurationsComponent implements OnInit, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() ShowAll: boolean = false;

	public isEditMode: boolean;
	public assignmentExtAndOtherConfigForm: FormGroup<IAssignmentExtAndOtherConfigFM>;
	public ExtensionAfterMSP: IRadioGroupModel | null | undefined;
	public tooltipTitleParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];

	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private sectorService: SectorService,
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.assignmentExtAndOtherConfigForm = this.childFormGroup.get('AssignmentExtensionAndOtherConfiguration') as FormGroup;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe(({ExtUserGroups}: SectorAllDropdowns) => {
				this.ExtensionAfterMSP = ExtUserGroups;
				this.cdr.markForCheck();
			});

		if (this.isEditMode) {
			this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$))
				.subscribe(({AssignmentExtensionAndOtherConfiguration}: Sector) => {
					patchAssignmentExtAndOtherConfig(AssignmentExtensionAndOtherConfiguration, this.assignmentExtAndOtherConfigForm);
					this.cdr.markForCheck();
				});
		}
	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
