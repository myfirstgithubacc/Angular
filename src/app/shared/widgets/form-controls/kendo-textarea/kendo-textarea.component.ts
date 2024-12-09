import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-kendo-textarea',
	templateUrl: './kendo-textarea.component.html',
	styleUrls: ['./kendo-textarea.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoTextareaComponent {
	public formControl!: FormControl;

	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() label: string = '';
	@Input() placeholder: string = '';
	@Input() isRequired: boolean = false;
	@Input() isEditMode: boolean = false;
	@Input() isHtmlContent: boolean = false;
	@Input() maxCharacters: number = magicNumber.eightThousand;
	@Input() tooltipTitle: string = '';
	@Input() tooltipVisible: boolean = false;
	@Input() isDisable: boolean = false;
	@Input() specialCharactersAllowed: string[] = [];
	@Input() specialCharactersNotAllowed: string[] = [];
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() addOnLabelText: string = '';
	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Output() onChangeTextArea = new EventEmitter<any>();
	@Output() onBlurTextArea = new EventEmitter<any>();
	@Output() onFocusTextArea = new EventEmitter<any>();

	@Input() set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}

	@Input() listControlName: FormControl | null = null;
	@Input() allowBullets: boolean = false;
	public charachtersCount: number = magicNumber.zero;

	public counter: string;

	constructor(private parentF: FormGroupDirective, private cdr: ChangeDetectorRef) { }

	onChange(e: any) {
		this.charachtersCount = e.length;
		this.counter = `${this.charachtersCount}/${this.maxCharacters}`;
		this.onChangeTextArea.emit(e);
	}

	onBlur(e: any) {
		if (this.formControl) {
			const trimmedValue = this.formControl.value.trim();
			this.formControl.setValue(trimmedValue, { emitEvent: false });
			this.updateCharacterCount();
		  }
		  this.onChangeTextArea.emit(e);
		  console.log("onfocus");
	}

	onFocus(e: any) {
		this.onChangeTextArea.emit(e);
	}
	ngAfterContentChecked(): void {
		this.updateCharacterCount();
	}

	updateCharacterCount(): void {
		if (this.listControlName) {
			this.charachtersCount = this.listControlName.value
				? this.listControlName.value.length
				: magicNumber.zero;
		} else if (this.formControl?.value) {
			this.charachtersCount = this.formControl.value.length;
		} else {
			this.charachtersCount = 0;
		}
		this.counter = `${this.charachtersCount}/${this.maxCharacters}`;
		this.cdr.markForCheck();
	  }

	onPaste(event: ClipboardEvent): void {
		if (this.allowBullets) {
			this.handlePaste(event);
			this.formControl.markAsDirty();
		}
	}

	handlePaste(event: ClipboardEvent): void {
		event.preventDefault();
		const data = event.clipboardData?.getData('text');
		if (!data) return;

		const textarea = event.target as HTMLTextAreaElement,
		 { selectionStart, selectionEnd, value } = textarea;

		let processed = data.split(/\r?\n/).map((line) => {
			line = line.trim();
			const alphaCharacters = /^[^a-zA-Z0-9\s]/.test(line),
				nonAlphaCharacters = /^\d+[.)]\s/.test(line);
			if (alphaCharacters) {
				line = line.substring(1).trim();
				if (line) {
					return `* ${line}`;
				}
			} else if (nonAlphaCharacters) {
				return line;
			}
			return line;
		}).join('\n');
		const availableSpace = this.maxCharacters - (value.length - (selectionEnd - selectionStart));
		if (processed.length > availableSpace) {
			processed = processed.slice(magicNumber.zero, availableSpace);
		}
		const newValue = value.slice(magicNumber.zero, selectionStart) + processed + value.slice(selectionEnd);
		const finalValue = newValue.slice(magicNumber.zero, this.maxCharacters);
		textarea.value = finalValue;
		this.formControl.setValue(finalValue);
		this.onChangeTextArea.emit(finalValue);
		this.updateCharacterCount();
	}


}
