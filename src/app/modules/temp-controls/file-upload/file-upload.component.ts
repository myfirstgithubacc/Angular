import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { dropdownModel } from '@xrm-core/models/dropdown.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { NotifierService } from '@xrm-shared/services/notifier.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';

@Component({selector: 'app-file-upload',
	templateUrl: './file-upload.component.html',
	styleUrls: ['./file-upload.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit {

	// #region declaration area

	public form: FormGroup;
	skipOnChanges = false;
	fileControl: FormControl;
	selectedFiles: File[] = [];
	// showTable: boolean = false;
	extensionsAllow: FileRestrictions = {
		allowedExtensions: []
	};
	isMultipleUpload: false;
	ex = ['.docx', '.pdf'];

	public ddlValue = [{ Text: 'Resume', Value: '2' }];

	public checked = false;
	isChecked: boolean = false;
	data: dropdownModel[] = [];
	selectedData: dropdownModel[] = [];
	public listDDTreeData: any;

	htmlTootipValue = `<ul>
  <li><strong> Single PO :</strong> Select this option if only one purchase order
    is issued by the Client for all CLPs in this Sector, i.e. a blanket PO.
  </li>
  <li><strong> Multiple PO :</strong> Select this option if the Client will be
  issuing different purchase orders for each CLP or groups of CLPs.</li>
</ul>`;

	public daysInfo = [
		{ day: 'Monday', isSelected: false },
		{ day: 'Tuesday', isSelected: true },
		{ day: 'wednesday', isSelected: false },
		{ day: 'Thursday', isSelected: false },
		{ day: 'Friday', isSelected: false }
	];

	public timeRange = {
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		label1: 'Start Time',
		label2: 'End Time',
		DefaultInterval: 60,
		AllowAI: false,
		startisRequired: true,
		endisRequired: true,
		starttooltipVisible: true,
		starttooltipTitle: 'string',
		starttooltipPosition: 'string',
		starttooltipTitleLocalizeParam: [],
		startlabelLocalizeParam: [],
		startisHtmlContent: true,
		endtooltipVisible: true,
		endtooltipTitle: 'string',
		endtooltipPosition: 'string',
		endtooltipTitleLocalizeParam: [],
		endlabelLocalizeParam: [],
		endisHtmlContent: true
	};

	selectedTime:any;

	// #endregion declaration area

	// eslint-disable-next-line max-params
	constructor(
private fb: FormBuilder, private validators: CustomValidators,
		private toasterService: ToasterService, private notifierService: NotifierService
	) {
		this.form = this.fb.group({
			files: ['', [this.validators.RequiredValidator()]],
			terms: [null],
			text: [null],
			ddData: [{ Text: 'Resume', Value: '2' }],
			switch: [{value: false, disabled: true}],
			startTimeControlName: [null, [this.validators.RequiredValidator()]],
			endTimeControlName: [new Date(), [this.validators.RequiredValidator()]]
		});
	 }

	 checkDisable(){
		this.form.get('switch')?.enable();
		console.log(this.form);
		console.log(this.form.get('startTimeControlName')?.setValue(new Date()));
		console.log(this.form.getRawValue());
	 }

	ngOnInit(): void {

		// setTimeout(() => {
        //   this.ddlValue = [{ Text: 'Resume', Value: '2' }, { Text: 'Resume', Value: '3' },{ Text: 'Resume', Value: '4' }, { Text: 'Resume', Value: '5' }];
		// }, 50000);

		this.form.get('startTimeControlName')?.setValue(new Date());
		this.data = [];

		this.selectedData.push({
			Value: '1',
			Text: "Furniture"
		});

		this.data.push({
			Value: '1',
			Text: "Furniture",
			items: [
				{ Text: "Tables & Chairs", Value: '2' },
				{
					Text: "Sofas", Value: '3', items: [
						{ Text: "Bean Bag", Value: '4' },
						{ Text: "Armchair", Value: '5' },
						{ Text: "Modular", Value: '7' }
					]
				},
				{ Text: "Occasional", Value: '8' }
			]
		});

		this.data.push({
			Text: 'Decor', Value: '9', items: [
				{ Text: "Bed Linen", Value: '10' },
				{ Text: "Curtains & Blinds", Value: '11' },
				{ Text: "Carpets", Value: '12' }
			]
		});

	}

	getStatus(e: any){

		this.skipOnChanges = true;
		console.log("cancel" ,e);
		if(e){
			// this.daysInfo = [
			// 	{ day: 'Monday', isSelected: false },
			// 	{ day: 'Tuesday', isSelected: true },
			// 	{ day: 'wednesday', isSelected: false },
			// 	{ day: 'Thursday', isSelected: false },
			// 	{ day: 'Friday', isSelected: false }
			// ];
		}
	}

	updateDayInfo(selectedDays:any) {
		this.daysInfo = selectedDays;
		console.log('Selected Days:', this.daysInfo);
	  }

	updateSelectedTime(selectedTime: string) {
		this.selectedTime = selectedTime;
		console.log('Selected Time:', this.selectedTime);
	}

	saveFile() {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		this.selectedFiles = this.form.value;
	}
	GetExtension(e: any) {
		console.log(e);
	}
	chkChange(e: any) {
		this.isMultipleUpload = this.form.get('terms')?.value;
	}

	showSuccess() {
		this.toasterService.showToaster(ToastOptions.Success, this.htmlTootipValue, [], true, false, undefined, 10);
	}

	showError() {
		this.toasterService.showToaster(ToastOptions.Error, 'ReasonForRequestAddedSuccessully', [], false);
	}

	showInfo() {
		this.toasterService.showToaster(ToastOptions.Information, 'ReasonForRequestAddedSuccessully', [], false);
	}

	showWarning() {
		this.toasterService.showToaster(ToastOptions.Warning, 'ReasonForRequestAddedSuccessully', [], false);
	}

	ngOnDestroy() {
		this.toasterService.resetToaster();
	}

	getData(value: any) {
		this.listDDTreeData = value;
	}
	getWeekData(e: any){
		console.log(e);
	}
}
