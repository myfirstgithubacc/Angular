import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { FileRestrictions, RemoveEvent, SelectEvent } from '@progress/kendo-angular-upload';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-kendo-fileselect',
	templateUrl: './kendo-fileselect.component.html',
	styleUrls: ['./kendo-fileselect.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class KendoFileselectComponent {

	public fileControl!: FormControl;

	@Input() fileExtAllow: FileRestrictions;

	@Input() fileSelectTheme: string = 'primary';

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	public myRestrictions: FileRestrictions = {

		allowedExtensions: ['.jpg', '.png']

	};

	@Input() multiple = false;

	@Input() isRequired: boolean = false;

	@Input() isDisabled: boolean = false;

	@Input() label: string = '';

	@Input() placeholder: string = '';

	@Input() tooltipTitle: string = '';

	@Input() tooltipVisible: boolean = false;

	@Input() dropFilesMessage: string = 'Drop your file here';

	@Input() fileselectMessage: string = 'Upload file';

	@Input() invalidFileExtensionMessage = 'File type not allowed.';

	@Input() invalidMaxFileSizeMessage = 'File size too large.';

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() isHtmlContent: boolean = false;

	@Output() onBlur = new EventEmitter<FocusEvent>();

	@Output() onFocus = new EventEmitter<FocusEvent>();

	@Output() onSelect = new EventEmitter<any>();

	@Output() onRemove = new EventEmitter<any>();

	@Output() onValueChange = new EventEmitter();

	@Input() set controlName(value: string) {

		this.fileControl = this.parentF.form.get(value) as FormControl;
	}

	@Input() listControlName: FormControl;

	constructor(private parentF: FormGroupDirective, private cdr: ChangeDetectorRef) { }

	ngOnChanges() {
		if (this.isDisabled) {
			this.fileControl.disable();
		}
	}
	public blur(): void {
		this.onBlur.emit();
	}

	public focus(): void {
		this.onFocus.emit();
	}

	public select(e: any): void {
		this.onValueChange.emit(e);
	}

	onFileSelected(event: any) {
		this.onSelect.emit(event);
	}

	public valueChange(): void {
		this.onValueChange.emit();
	}

	public remove(e: any): void {
		this.onRemove.emit(e);
	}

}
