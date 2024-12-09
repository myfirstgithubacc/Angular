import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';

@Component({
	selector: 'app-kendo-switch',
	templateUrl: './kendo-switch.component.html',
	styleUrls: ['./kendo-switch.component.scss'],
	providers: [AuthCommonService],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoSwitchComponent implements OnInit, DoCheck {
	public formControl!: FormControl;

	@Input() isRequired: boolean;

	@Input() label: string = '';

	@Input() isEditMode: boolean = true;

	@Input() isDiable: boolean = false;

	@Input() isDisable: boolean;

	@Input() onLabel: string = 'ON';

	@Input() offLabel: string = 'OFF';

	@Input() tooltipTitle: string | undefined = '';

	@Input() tooltipVisible: boolean = false;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() isHtmlContent: boolean = false;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Output() onChangeSwitch = new EventEmitter();

	@Output() onBlurSwitch = new EventEmitter<Event>();

	@Output() onFocusSwitch = new EventEmitter<Event>();
	@Input() xrmEntityId: number = magicNumber.zero;
	@Input() entityType: string = '';
	@Input() fieldName: string | null = null;
	isRendered: boolean = true;
	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}

	@Input() listControlName: any;

	constructor(private parentF: FormGroupDirective, private commonService: AuthCommonService, private cdr: ChangeDetectorRef) { }

	ngOnChanges() {
		if (this.isDisable) {
			this.formControl.disable({ onlySelf: true });
		}
	}

	ngDoCheck() {
		if ((this.formControl?.touched && this.formControl?.invalid) || (this.listControlName?.touched && !this.listControlName?.valid)) {
			this.cdr.markForCheck();
		}
		if (this.formControl?.value !== undefined) {
			this.cdr.markForCheck();
		}
	}

	onChange(e: Event) {
		this.onChangeSwitch.emit(e);
		this.cdr.markForCheck();
	}

	onBlur(e: Event) {
		this.onChangeSwitch.emit(e);
	}

	onFocus(e: Event) {
		this.onChangeSwitch.emit(e);
	}

	ngOnInit() {
		this.manageAuthorization();
	}

	manageAuthorization() {
		if (this.xrmEntityId == Number(magicNumber.zero) || this.fieldName == null)
			return;
		const result = this.commonService.manageAuthentication({
			xrmEntityId: this.xrmEntityId,
			entityType: this.entityType,
			fieldName: this.fieldName
		});
		this.isVisibleorEditable(result);
	}

	isVisibleorEditable(result: ManageAuthResult) {
		if (result == null && this.isEditMode) {
			this.isEditMode = true;
			return;
		}
		if (result && this.isEditMode) {
			this.isRendered = result.isViewable;
			if (!this.isRendered)
				return;
			this.isEditMode = result.isModificationAllowed;
			if (!result.ModificationAllowed)
				this.formControl.clearValidators();
		}
	}
}
interface ManageAuthResult {
	isViewable: boolean;
	isModificationAllowed: boolean;
	ModificationAllowed: boolean;
}
