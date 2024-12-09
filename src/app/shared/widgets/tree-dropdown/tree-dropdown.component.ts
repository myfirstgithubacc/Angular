import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { DropdownItem, Label, TreeNode } from '@xrm-shared/models/tree-dropdown.model';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';

@Component({selector: 'app-tree-dropdown',
	templateUrl: './tree-dropdown.component.html',
	styleUrls: ['./tree-dropdown.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeDropdownComponent implements OnChanges {

	@Input() drpList: DropdownItem[] = [];
	 @Input() labels!: Label;

	@Input() treeValues: TreeNode[] | undefined = [];

	@Input() isTooltipVisibile: boolean;

	@Input() tooltipTitle: string;

	@Input() set controlName(value: string) {
		this.treeDropdownForm = this.parentF.form.get(value) as FormGroup;
	}

	@Output() DrpChanged: EventEmitter<DropdownItem> = new EventEmitter<DropdownItem>();

	treeDropdownForm: FormGroup;

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private customValidator: CustomValidators,
		private parentF: FormGroupDirective
	) {
		this.treeDropdownForm = this.fb.group({
			Dropdown: [null, [this.customValidator.RequiredValidator]],
			TreeValue: [null]
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.treeValues = changes["treeValues"].currentValue;
	}

	drpChanged(data:DropdownItem) {
		this.DrpChanged.emit(data);
	}
}
