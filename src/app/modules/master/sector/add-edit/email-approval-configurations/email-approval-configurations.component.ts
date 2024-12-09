import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { patchEmailApprovalConfig } from './utils/patch-email-approval-config';
import { IEmailApprovalConfigFM } from './utils/formModel';
import { SectorService } from 'src/app/services/masters/sector.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-email-approval-configurations',
	templateUrl: './email-approval-configurations.component.html',
	styleUrls: ['./email-approval-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailApprovalConfigurationsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() ShowAll: boolean = false;

	public emailApprovalConfigForm: FormGroup<IEmailApprovalConfigFM>;
	private destroyAllSubscribtion$ = new Subject<void>();
	private isEditMode: boolean;

	// eslint-disable-next-line max-params
	constructor(
		private store: Store,
		private el: ElementRef,
		private cdr: ChangeDetectorRef,
		private sectorService: SectorService
	) { }

	ngOnChanges() {
		this.isEditMode = this.formStatus;
	}

	ngOnInit(): void {
		if(!this.ShowAll){
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}

		this.emailApprovalConfigForm = this.childFormGroup.get('EmailApprovalConfiguration') as FormGroup<IEmailApprovalConfigFM>;

		if (this.isEditMode) {
			this.store.select(SectorState.sectorByUKey).pipe(take(Number(magicNumber.one)), takeUntil(this.destroyAllSubscribtion$)).
				subscribe(({EmailApprovalConfiguration}) => {
					patchEmailApprovalConfig(EmailApprovalConfiguration, this.emailApprovalConfigForm);
					this.cdr.markForCheck();
				});
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
