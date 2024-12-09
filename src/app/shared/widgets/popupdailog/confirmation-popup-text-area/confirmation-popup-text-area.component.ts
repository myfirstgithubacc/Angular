import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogRef, DialogContentBase } from "@progress/kendo-angular-dialog";
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
@Component({selector: 'app-confirmation-popup-text-area',
	templateUrl: './confirmation-popup-text-area.component.html',
	styleUrls: ['./confirmation-popup-text-area.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationPopupTextAreaComponent extends DialogContentBase implements OnInit {
	public messageTitle: string = '';
	public reasonValue: string = '';
	public ReasonUpdate: FormGroup;
	public maxCounts: number = magicNumber.twoHundred;
	public textareaPlaceHolder: string = 'Reason_For_Change';

	constructor(private fb: FormBuilder, override dialog: DialogRef, private cdr: ChangeDetectorRef) {
		super(dialog);
	}

	public getTextareaValue() {
		this.reasonValue = this.ReasonUpdate.value.ReasonForUpdate;
	}

	ngOnInit(): void {
		this.ReasonUpdate = this.fb.group({
			ReasonForUpdate: ['']
		});
	}

}

