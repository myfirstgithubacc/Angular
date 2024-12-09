import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-kendo-checkbox',
	templateUrl: './kendo-checkbox.component.html',
	styleUrls: ['./kendo-checkbox.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoCheckboxComponent implements OnChanges {
	public formControl!: FormControl;

	@Input() label: string = '';

	@Input() isRequired: boolean;

	@Input() isEditMode: boolean = false;

	@Input() tooltipTitle: string = '';

	@Input() tooltipVisible: boolean = false;

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() listControlName: FormControl | undefined;

	@Input() isHtmlContent: boolean = false;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}

	constructor(private parentF: FormGroupDirective, private cdr: ChangeDetectorRef) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isEditMode'].currentValue) {
			if (this.listControlName) {
				this.listControlName.disable();
			} else {
				this.formControl.disable();
			}
		}
	}

}
