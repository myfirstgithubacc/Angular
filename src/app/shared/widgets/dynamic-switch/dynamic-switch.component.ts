import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TreeNode } from '@xrm-shared/models/dynamic-switch.model';

@Component({selector: 'app-dynamic-switch',
	templateUrl: './dynamic-switch.component.html',
	styleUrls: ['./dynamic-switch.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicSwitchComponent {
	@Input() formGroup: FormGroup;
	@Input() switchData: string[];
	treeData: TreeNode[] =
		[
			{
				text: "All",
				items: [
					{
						text: "Four",
						value: "4"
					},
					{
						text: "Five",
						value: "5"
					}
				]
			}
		];
	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) { }

	public onTreeChecked(data: string) {
	}

}
