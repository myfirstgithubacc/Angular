import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';

@Component({
	selector: 'app-kendo-phone',
	templateUrl: './kendo-phone.component.html',
	styleUrls: ['./kendo-phone.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [AuthCommonService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoPhoneComponent implements OnInit, OnChanges {
	public phoneMask: string | null = null;
	public phoneExtMask: string | null = null;
	public controlValue: string = "";
	phoneControl: FormControl;
	phoneExtControl: FormControl;
	@Input() xrmEntityId: number = magicNumber.zero;
	@Input() fieldName: string | null = null;
	@Input() entityType: string = '';
	@Input() isMaskValidation:boolean=true;
	@Input() isExtension: boolean = false;
	@Input() isEditMode: boolean = true;
	@Input() isRequired: boolean = false;
	@Input() isHtmlContent: boolean = false;
	@Input() tooltipVisible: boolean = false;
	@Input() countryId: string |number;
	@Input() label: string;
	@Input() tooltipTitle: string;
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() listPhoneControlName: FormControl;
	@Input() listPhoneExtControlName: FormControl;
	@Input() addOnLabelText: string = '';
	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
	@Output() onPhoneChange = new EventEmitter<string>();
	@Output() onPhoneExtChange = new EventEmitter<string>();
	@Input()
	set phoneControlName(value: string) {
		this.phoneControl = this.parentF.form.get(value) as FormControl;
	}

    @Input()
	set phoneExtControlName(value: string) {
		this.phoneExtControl = this.parentF.form.get(value) as FormControl;
	}
    isRendered: boolean = true;

    constructor(
		private localizationService: LocalizationService,
		private customValidators: CustomValidators,
		private parentF: FormGroupDirective,
		private commonService: AuthCommonService,
		private cd: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
     	this.manageAuthorization();
    }

    ngDoCheck(): void {
    	if(this.phoneControl?.touched && !this.phoneControl?.valid){
    		this.cd.markForCheck();
    	}
    }

    ngOnChanges(): void {
     	this.manageAuthorization();
     	this.phoneControl = this.listPhoneControlName
     		? this.listPhoneControlName
     		: this.phoneControl;
     	this.phoneExtControl = this.listPhoneExtControlName
     		? this.listPhoneExtControlName
     		: this.phoneExtControl;
    	this.setPhoneNumberFormat();
	  }

    private setPhoneNumberFormat() {
     	if (!this.countryId)
     		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);

     	if (this.countryId) {
     		this.phoneMask = this.localizationService.GetCulture(CultureFormat.PhoneFormat, this.countryId);
     		this.phoneExtMask = this.localizationService.GetCulture(CultureFormat.PhoneExtFormat, this.countryId);
     	}
    }

    public manageAuthorization() {
     	if (this.xrmEntityId == Number(magicNumber.zero) || this.fieldName == null)
     		return;
     	const result = this.commonService.manageAuthentication({
     		xrmEntityId: this.xrmEntityId,
     		entityType: this.entityType,
     		fieldName: this.fieldName
     	});
     	this.isVisibleorEditable(result);
    }

    public isVisibleorEditable(result: ManageAuthResult) {
     	if (result == null && this.isEditMode) {
	  this.isEditMode = true;
	  return;
     	}
     	if (result && this.isEditMode) {
	  this.isRendered = result.isViewable;
	  if (!this.isRendered) return;
	  this.isEditMode = result.isModificationAllowed;
	  if (!result.ModificationAllowed && this.phoneControl) {
     			this.phoneControl.clearValidators();
	  }
    	}
    }

    public onValueChangePhone(event: string) {
     	this.onPhoneChange.emit(event);
    }

    public onValueChangePhoneExt(event: string) {
     	this.onPhoneExtChange.emit(event);
    }
}

interface ManageAuthResult {
	isViewable: boolean;
	isModificationAllowed: boolean;
	ModificationAllowed:boolean;
}
