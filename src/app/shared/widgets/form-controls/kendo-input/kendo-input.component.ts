import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import {
	ControlContainer,
	FormControl,
	FormGroupDirective
} from '@angular/forms';
import { SafePipe } from '@xrm-pipes';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';

@Component({
	selector: 'app-kendo-input',
	templateUrl: './kendo-input.component.html',
	styleUrls: ['./kendo-input.component.scss'],
	viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
	providers: [SafePipe, AuthCommonService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoInputComponent implements OnInit {
	public formControl!: FormControl;

	@Input() isHtmlContent: boolean = false;
	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() specialCharactersAllowed: string[] = [];
	@Input() specialCharactersNotAllowed: string[] = [];
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() xrmEntityId: number = magicNumber.zero;
	@Input() fieldName: string | null = null;
	@Input() entityType: string = '';

	@Input() label: string = '';
	@Input() placeholder: string = '';
	@Input() type: string;
	@Input() isRequired: boolean = false;
	@Input() maxCharacters: number = magicNumber.oneFifty;
	@Input() isEditMode: boolean = true;
	@Input() tooltipTitle: string;
	@Input() tooltipVisible: boolean;

	@Output() onChangeTextBox = new EventEmitter<Event>();
	@Output() onBlurTextBox = new EventEmitter<Event>();
	@Output() onFocusTextBox = new EventEmitter<Event>();
	@Output() inputBlurTextBox = new EventEmitter<Event>();
	@Output() inputFocusTextBox = new EventEmitter<Event>();
	@Output() FocusOutTextBox = new EventEmitter<string>();
	@Input() controlName1: FormControl;
	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
	cssClassName: string = '';
	isRendered: boolean = true;

	constructor(private parentF: FormGroupDirective, private commonService: AuthCommonService, private cdr: ChangeDetectorRef) { }

	public onChange(e: Event) {
		this.onChangeTextBox.emit(e);
	}
	public onBlur(e: Event) {
		this.onBlurTextBox.emit(e);
	}
	public onFocus(e: Event) {
		this.onFocusTextBox.emit(e);
	}
	public inputFocus(e: Event) {
		this.inputFocusTextBox.emit(e);
	}
	public inputBlur(e: Event) {
		this.inputBlurTextBox.emit(e);
	}
	public onfocusout(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			this.FocusOutTextBox.emit(e.target.value);
		}
	}

	public restrictWord(e: Event) {
		this.onChangeTextBox.emit(e);
	}

	ngOnInit(): void {
		this.manageAuthorization();
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

	public isVisibleorEditable(result: AuthenticationResult | null) {
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

}
interface AuthenticationResult {
  isViewable: boolean;
  isModificationAllowed: boolean;
  ModificationAllowed:boolean;
}
