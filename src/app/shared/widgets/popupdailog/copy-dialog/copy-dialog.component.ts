/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit, Renderer2, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { DialogData } from '@xrm-shared/models/copy-dialog.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
@Component({selector: 'app-copy-dialog',
	templateUrl: './copy-dialog.component.html',
	styleUrls: ['./copy-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyDialogComponent extends DialogContentBase implements OnInit {

	@Input() isCopy: boolean = true;
	// you will get all the changed in the dropdown from this observable
	private unsubscribe$ = new Subject<void>();
	copyFormGroup: FormGroup;
	formGroup!: FormGroup;
	copydialogdata: any[] = [];
	title = '';
	isMultipleUpload: false;
	treeData: any;
	public expandedKeys: string[] = [];
	// Replace with appropriate type if known
	public data: string;
	// Replace with appropriate type if known

	// eslint-disable-next-line max-params
	constructor(
		private renderer: Renderer2,
		public override dialog: DialogRef,
		private copyItemService: CopyItemService,
		private fb: FormBuilder,
		private customValidator: CustomValidators,
	 private	toasterservice:ToasterService
	) {

		super(dialog);
		this.formGroup = this.fb.group({});
		this.createDynamicForm();


	}

	private createDynamicForm() {
		this.formGroup = this.fb.group({});
		this.copydialogdata.forEach((data: DialogData) => {
			if (data.type === 'upload') {
				if (!data.notRequired) {
					this.formGroup.addControl(
						data.controlName,
						new FormControl([''], this.customValidator.RequiredValidator(data?.validationMessage, data?.validationMessageDynamicParam))
					);

				}
				else {
					this.formGroup.addControl(data.controlName, new FormControl(['']));
				}
			}
			if (data.type == "dropdown") {
				if (!data.notRequired) {
					this.formGroup.addControl(
						data.controlName,
						new FormControl(null, this.customValidator.RequiredValidator(data?.validationMessage, data?.validationMessageDynamicParam))
					);

				}
				else {
					this.formGroup.addControl(data.controlName, new FormControl(null));
				}
				if (data.IsTreePresent) {
					this.formGroup.addControl("TreeValues", new FormControl(null, this.customValidator.RequiredValidator()));
				}
				else {
					this.formGroup.addControl("TreeValues", new FormControl(null));
				}
			}
		});
	}

	buttonClicked = false;
	selectedTree = [];
	isTreeAvailable = false;

	public getData() {
		return this.data;
	}

	ngOnInit(): void {
		this.toasterservice.resetToaster();
		this.createDynamicForm();
		this.copyItemService.submitButtonClickedObs.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: boolean) => {
				if (this.isTreeAvailable) {
					this.buttonClicked = data;
				}
			});
		this.toasterservice.notPopup.next(false);
	}


	public close() {
		this.renderer.removeClass(document.body, 'scrolling__hidden');
		const lastToaster = this.toasterservice.data[this.toasterservice.data.length - magicNumber.one];
		if (lastToaster && lastToaster.cssClass === 'alert__danger') {
			// Reset the toaster with the specified toasterId
			this.toasterservice.resetToaster(lastToaster.toasterId);
		}
		this.dialog.close();
	}

	public DrpChanged(event: any, controlName: string) {
		this.isTreeAvailable = true;
		const obj = {
			controlName: controlName,
			change: event
		};
		this.copyItemService.setChanges(obj);
	}

	public onTreeChecked(event: any) {
		this.selectedTree = event;
		this.formGroup.patchValue({ TreeValues: event });
	}

	ngOnDestroy(){
		this.toasterservice.notPopup.next(true);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
interface CopyDialogData {
  type: 'upload' | 'dropdown';
  notRequired?: boolean;
  controlName: string;
  validationMessage?: string;
  validationMessageDynamicParam?: string;
  IsTreePresent?: boolean;
}
