import { Component, Input, OnDestroy, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject } from 'rxjs';
@Component({
	selector: 'app-configure-msp-process-activity',
	templateUrl: './configure-msp-process-activity.component.html',
	styleUrls: ['./configure-msp-process-activity.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigureMspProcessActivityComponent implements OnInit, OnDestroy {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get the form is in edit mode or add mode
	@Input() isEditMode: boolean;

	// basic details child form
	public configureMSPProcessActivityForm: FormGroup;

	// get location whole data
	@Input() public locationDetails: any;

	// get sector whole data
	@Input() public sectorDetails: any;

	private unsubscribe$ = new Subject<void>();

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['sectorDetails']) {
			const data = changes['sectorDetails'].currentValue;
			this.getSectorDetailsById(data);
		}
		if (changes['locationDetails']) {
			const data = changes['locationDetails'].currentValue;
			this.getLocationDetailsById(data);
		}
	}

	private getSectorDetailsById(data: any) {
		if (data) {
			this.sectorDetails = data;
			this.patchBasicDetails(data);
		}
	}

	private getLocationDetailsById(data: any) {
		if (data) {
			this.locationDetails = data;
			this.patchBasicDetails(data);
		}
	}

	ngOnInit(): void {
		// get only location details formgroup from parent form and bind that in child
		this.configureMSPProcessActivityForm = this.childFormGroup.get('configureMSPProcessActivity') as FormGroup;
	}

	private patchBasicDetails(data: any) {
		const alternateConfigControl = this.configureMSPProcessActivityForm.controls['alternateConfigureMspProcessActivity'];

		if (!this.isEditMode) {
			// if user has turn switch on then patch whole data of sector
			if (alternateConfigControl.value && (this.sectorDetails?.ConfigureMspProcessActivity?.SectorUkey ||
				this.locationDetails?.AltMSPProcessActivityConfigs)) {
				this.onAlternateConfigureMspProcessActivityChange(true);
			}
		} else {
			alternateConfigControl.patchValue(this.locationDetails?.AltMSPProcessActivityConfigs ?? false);
			if (alternateConfigControl.value && (this.sectorDetails?.ConfigureMspProcessActivity?.SectorUkey ||
				this.locationDetails?.AltMSPProcessActivityConfigs)) {
				this.onAlternateConfigureMspProcessActivityChange(true);
			}
		}
	}


	/**
	 * configure msp process activity configuration section
	 * @param getBooleanValue
	 */

	public onAlternateConfigureMspProcessActivityChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchAlternateConfigureMspProcessActivityChange();
		} else {
			this.configureMSPProcessActivityForm.controls['skipProcessSubmittalByMsp'].setValue(false);
			this.configureMSPProcessActivityForm.controls['hideNTERateFromRequisitionLibrary'].setValue(false);
			this.configureMSPProcessActivityForm.controls['skipLIRequestProcessbyMSP'].setValue(false);
			this.onSkipLIRequestProcessbyMSPChange(false);
		}
	}

	private patchAlternateConfigureMspProcessActivityChange() {
		setTimeout(() => {
			this.patchConfigureMspProcessActivityForm();
		}, magicNumber.hundred);
		if (this.shouldSkipLIRequestProcess()) {
			this.onSkipLIRequestProcessbyMSPChange(true);
		}
	}

	private patchConfigureMspProcessActivityForm() {
		this.configureMSPProcessActivityForm.patchValue({
			skipProcessSubmittalByMsp: this.getFormValue(
				this.locationDetails?.SkipProcessSubmittalByMsp,
				this.sectorDetails?.ConfigureMspProcessActivity?.IsSkipProcessSubByMsp
			),
			hideNTERateFromRequisitionLibrary: this.getFormValue(
				this.locationDetails?.HideNTERateFromReqLib,
				this.sectorDetails?.ConfigureMspProcessActivity?.HideNteRatefromCopyReqLib
			),
			skipLIRequestProcessbyMSP: this.getFormValue(
				this.locationDetails?.SkipLIRequestProcessbyMSP,
				this.sectorDetails?.ConfigureMspProcessActivity?.IsSkipLIRequestProcessByMsp
			)
		});
	}

	private getFormValue(locationValue: any, sectorValue: any): boolean {
		return this.isEditMode
			? (locationValue || false)
			: (sectorValue || false);
	}

	private shouldSkipLIRequestProcess(): boolean {
		return this.getFormValue(
			this.locationDetails?.SkipLIRequestProcessbyMSP,
			this.sectorDetails?.ConfigureMspProcessActivity?.IsSkipLIRequestProcessByMsp
		);
	}


	public onSkipLIRequestProcessbyMSPChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchSkipLIRequestProcessbyMSP();
		} else {
			this.configureMSPProcessActivityForm.controls['autoBroadcastForLIRequest'].setValue(false);
		}
	}

	private patchSkipLIRequestProcessbyMSP() {
		setTimeout(() => {
			this.configureMSPProcessActivityForm.patchValue({
				autoBroadcastForLIRequest: (this.isEditMode
					? this.locationDetails?.AutoBroadcastForLIRequest || false
					: (this.sectorDetails?.ConfigureMspProcessActivity?.IsAutoBroadcastForLiRequest || false))
			});
		}, magicNumber.hundred);
	}
	// end CONFIGURE MSP PROCESS ACTIVITY


	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
