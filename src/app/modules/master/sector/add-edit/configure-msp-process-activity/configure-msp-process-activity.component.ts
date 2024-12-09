
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { Subject, take, takeUntil } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { patchConfigMSPProcessActivity } from './utils/patch-config-msp-process';
import { IConfigMSPProcessActivityFM } from './utils/formModel';
import { SectorService } from 'src/app/services/masters/sector.service';

@Component({
	selector: 'app-configure-msp-process-activity',
	templateUrl: './configure-msp-process-activity.component.html',
	styleUrls: ['./configure-msp-process-activity.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush

})
export class ConfigureMspProcessActivityComponent implements OnInit, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;

	public isEditMode: boolean;
	public ConfiMSPProcessActivityForm: FormGroup<IConfigMSPProcessActivityFM>;
	public isSwitchSkipLIRequestMSP: boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(private store: Store, private el: ElementRef, private cdr: ChangeDetectorRef, private sectorService: SectorService) { }

	ngOnChanges() {
		this.isEditMode = this.formStatus;
		if (this.reload) {
			this.switchSkipLIRequestMSP(this.ConfiMSPProcessActivityForm.controls.IsSkipLIRequestProcessByMsp.value);
		}
	}

	ngOnInit(): void {
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}
		this.ConfiMSPProcessActivityForm = this.childFormGroup.get('ConfigureMspProcessActivity') as FormGroup<IConfigMSPProcessActivityFM>;
		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({ConfigureMspProcessActivity}) => {
				patchConfigMSPProcessActivity(ConfigureMspProcessActivity, this.ConfiMSPProcessActivityForm);
				this.switchSkipLIRequestMSP(ConfigureMspProcessActivity.IsSkipLIRequestProcessByMsp);
				this.cdr.markForCheck();
			});
	}

	private AddMode() {
		this.switchSkipLIRequestMSP(this.ConfiMSPProcessActivityForm.controls.IsSkipLIRequestProcessByMsp.value);
	}

	public switchSkipLIRequestMSP(toggle: boolean): void {
		this.isSwitchSkipLIRequestMSP = toggle;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
