import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { IOvertimeHour } from '@xrm-core/models/user-defined-field-config/udf-config-addedit.model';
import { IRadioItem } from '@xrm-shared/Utilities/radio.interface';
import { INumberDropdown } from '@xrm-shared/models/common.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';

@Component({selector: 'app-kendo-radio-button',
	templateUrl: './kendo-radio-button.component.html',
	styleUrls: ['./kendo-radio-button.component.scss'],
	providers: [AuthCommonService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoRadioButtonComponent implements OnInit {
	public formControl!: FormControl;
	public isRendered: boolean = true;
	@Input() RadioGroup:any;
	@Input() label: string = '';
	@Input() isRequired: boolean = false;
	@Input() isEditMode: boolean = false;
	@Input() isHtmlContent: boolean = false;
	@Input() isSelected: boolean;
	@Input() tooltipTitle: string;
	@Input() name: string;
	@Input() tooltipVisible: boolean;
	@Input() addOnLabelText: string = '';
	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
	@Input() listControlName: FormControl;
	@Input() xrmEntityId: number = magicNumber.zero;
	@Input() fieldName: string | null = null;
	@Input() entityType: string = '';
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Output() onChangeRadio = new EventEmitter();
	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}

	constructor(private parentF: FormGroupDirective, private commonService: AuthCommonService, private cd: ChangeDetectorRef) { }

	ngOnInit(): void {
  	this.manageAuthorization();
	}

	ngDoCheck(): void {
		if((this.formControl?.touched && !this.formControl?.valid) || (this.listControlName?.touched && !this.listControlName?.valid)){
			this.cd.markForCheck();
		}
	}

	manageAuthorization() {
		if (this.xrmEntityId as magicNumber == magicNumber.zero || this.fieldName == null)
			return;
		const result = this.commonService.manageAuthentication({
			xrmEntityId: this.xrmEntityId,
			entityType: this.entityType,
			fieldName: this.fieldName
		});
		this.isVisibleorEditable(result);
	}

	isVisibleorEditable(result: AuthenticationResult | null) {
		if (result == null && this.isEditMode) {
			this.isEditMode = false;
			return;
		}
		if (result && this.isEditMode) {
			this.isRendered = result.isViewable;
			if (!this.isRendered)
				return;
			this.isEditMode = !result.isModificationAllowed;
			if (!result.ModificationAllowed)
				this.formControl.clearValidators();
		}
	}

	getTextValue(): string {
		let index: number;
		if (this.formControl.value != null) {
			index = this.RadioGroup.findIndex((a:any) =>
				a.Value == this.formControl.value);
			return this.RadioGroup[index].Text;
		}
		else if (this.listControlName.value != null) {
			index = this.RadioGroup.findIndex((a:any) =>
				a.Value == this.listControlName.value);
			return this.RadioGroup[index].Text;
		}
		return '';
	}

	onChange() {
	   if(this.listControlName) {
			this.onChangeRadio.emit(this.listControlName.value);
	   }
	   else{
			this.onChangeRadio.emit(this.formControl.value);
	   }
	}
}
interface AuthenticationResult {
  isViewable: boolean;
  isModificationAllowed: boolean;
  ModificationAllowed:boolean
}
