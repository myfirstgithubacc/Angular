import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import {
	ControlContainer,
	FormControl,
	FormGroupDirective
} from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { SafePipe } from 'src/app/shared/pipes/safe-pipe.pipe';
import { eyeDimension, eyeOffDimension } from '@xrm-shared/icons/xrm-icon-library/xrm-icon-library.component';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-textbox',
	templateUrl: './textbox.component.html',
	styleUrls: ['./textbox.component.scss'],
	viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
	providers: [SafePipe, AuthCommonService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoTextboxComponent implements OnInit, DoCheck {
	public formControl!: FormControl;
	public eyeStyle: string = 'eye-off';
	dimension = eyeOffDimension;
	public passwordType: boolean = false;
	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() specialCharactersAllowed: string[] = [];
	@Input() specialCharactersNotAllowed: string[] = [];
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() labelLocalizeParam: DynamicParam[] = [];
    @Input() xrmEntityId: number = magicNumber.zero;
	@Input() fieldName: string | null = null;
	@Input() entityType : string= '';
	@Input() label: string = '';
	@Input() placeholder: string = '';
	@Input() type: string;
	@Input() isRequired: boolean = false;
	@Input() maxCharacters: number = magicNumber.oneFifty;
	@Input() isEditMode: boolean = false;
	@Input() isHtmlContent: boolean = false;
	@Input() tooltipTitle: string;
	@Input() tooltipVisible: boolean;
	@Input() addOnLabelText: string = '';
	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Output() onChangeTextBox = new EventEmitter<any>();
	@Output() onBlurTextBox = new EventEmitter<any>();
	@Output() onFocusTextBox = new EventEmitter<any>();
	@Output() inputBlurTextBox = new EventEmitter<any>();
	@Output() inputFocusTextBox = new EventEmitter<any>();
	@Output() FocusOutTextBox = new EventEmitter<any>();
	@Input()
	set controlName(value: any) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
	private valueChangesSubscription!: Subscription;
	@Input() listControlName: FormControl;
	isRendered: boolean = true;
	cssClassName: string = '';
	public dummydata = '<script>hi</script>';
	constructor(
private parentF: FormGroupDirective,
		private commonService: AuthCommonService, private cd: ChangeDetectorRef
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		this.manageAuthorization();
	}

	ngDoCheck(): void {
		if((this.formControl?.touched && !this.formControl?.valid) || (this.listControlName?.touched && !this.listControlName?.valid)){
			this.cd.markForCheck();
		}
	}

	onChange(e: any) {
		this.onChangeTextBox.emit(e);
	}
	onBlur(e: any) {
		this.onBlurTextBox.emit(e);
	}
	onFocus(e: any) {
		this.onFocusTextBox.emit(e);
	}
	inputFocus(e: any) {
		this.inputFocusTextBox.emit(e);
	}
	inputBlur(e: any) {
		this.inputBlurTextBox.emit(e);
	}
	onfocusout(e: any) {
		this.FocusOutTextBox.emit(e.target.value);
	}
	restrictWord(e: any) {
		this.onChangeTextBox.emit(e);
	}
	eyeOnOff() {
		if (this.eyeStyle == 'eye-off') {
			this.eyeStyle = 'eye';
			this.type = 'text';
			this.dimension = eyeDimension;
		} else {
			this.eyeStyle = 'eye-off';
			this.type = 'password';
			this.dimension = eyeOffDimension;
		}
	}

	ngOnInit(): void {
		this.manageAuthorization();
		if(this.type == 'password'){
			this.eyeStyle = 'eye-off';
			this.passwordType = true;
		}else{
			this.passwordType = false;
		}
		this.valueChangesSubscription = this.formControl?.valueChanges.subscribe(() => {
			this.cd.markForCheck();
		});
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

	isVisibleorEditable(result: any) {
		if (result == null && this.isEditMode) {
			this.isEditMode = false;
			return;
		}
		if (this.isEditMode) {
			this.isRendered = result.isViewable;
			if (!this.isRendered)
				return;
			if (result.isModificationAllowed)
				this.isEditMode = false;
			if (!result.ModificationAllowed)
				this.formControl.clearValidators();
		}
	}
	ngOnDestroy() {
		this.valueChangesSubscription?.unsubscribe();
	}
}
