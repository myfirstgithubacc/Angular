import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { CustomValidators } from 'src/app/shared/services/custom-validators.service';
import {	
	DialogService
} from '@progress/kendo-angular-dialog';
import { ConfirmationPopupTextAreaComponent } from '@xrm-shared/widgets/popupdailog/confirmation-popup-text-area/confirmation-popup-text-area.component';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Offset, PopupRef, PopupService } from '@progress/kendo-angular-popup';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { TimerangeWidget } from '@xrm-shared/widgets/form-controls/kendo-timerange/kendo-timerange.interface';
import { KendoTimerangeComponent } from '@xrm-widgets';

@Component({selector: 'app-controls',
	templateUrl: './controls.component.html',
	styleUrls: ['./controls.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class ControlsComponent {
	JsonData: any[] = [];
	public params: DynamicParam[] = [
		{ Value: 'LaborCategory', IsLocalizeKey: true },
		{ Value: 'lsingh', IsLocalizeKey: false },
		{ Value: 'Welcome@1', IsLocalizeKey: false },
	];
	@ViewChild('anchor') anchor: any;
	gridView: any;
	animate: any = {
		type: 'slide',
		direction: 'down',
		duration: 200,
	};
	htmlTootipValue = `<ul class="tooltip-format">
  <li><strong> Single PO :</strong> Select this option if only one purchase order
    is issued by the Client for all CLPs in this Sector, i.e. a blanket PO.
  </li>
  <li><strong> Multiple PO :</strong> Select this option if the Client will be
  issuing different purchase orders for each CLP or groups of CLPs.</li>
</ul>`
	toolTipValue = "You can provide a custom template for the content of the Tooltip.";
	public listItems: any[];
	public RadioGroup = [
		{ text: 'Male', value: '1', tooltipVisible: true, tooltipTitle: 'R1' },
		{ text: 'Female', value: '2', tooltipVisible: true, tooltipTitle: 'R2' },
		{ text: 'Other', value: '3', tooltipVisible: true, tooltipTitle: 'R3' },
	];
	public multiselectdropdown = [
		{ Text: 'apple', Value: '1' },
		{ Text: 'boll', Value: '2' },
		{ Text: 'cat', Value: '3' },
		{ Text: 'dog', Value: '4' },
		{ Text: 'horse', Value: '5' },
		{ Text: 'zebra', Value: '6' },
		{ Text: 'Tesla', Value: '7' }
	];
	isEdit: boolean = false;
	isFormSubmitted: boolean = false;
	show: boolean = false;
	dynamicParam: DynamicParam[] = [];
	TestReactiveForm: FormGroup;

	public margin = { horizontal: -25, vertical: -120 };
	opened: boolean;
	animation: any;
	offset: Offset = { left: 100, top: 100 };
	public Dtrange = { start: new Date(), end: new Date() };
	public minDate: Date = new Date(2023, 0, 1);
	public maxDate: Date = new Date(2023, 11, 31);

	time: Date = new Date('2021-07-28 17:55:11');
	testData = `<ul class="tooltip-format">
 <li><strong> Single PO :</strong> Select this option if only one purchase order
   is issued by the Client for all CLPs in this Sector, i.e. a blanket PO.
 </li>
</ul>`;

	public timeRange: TimerangeWidget = {
		startTime: new Date(),
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		endTime: new Date(),
		label1: 'Start Time',
		label2: 'End Time',
		isAllowPopup: true,
		RenderMode: false,
		DefaultInterval: 60,
		AllowAI: false,
		isEditMode: true,
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

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		public popup: DialogPopupService,
		private customValidator: CustomValidators,
		private _DialogServices: DialogService,
		private popupService: PopupService

	) {
		this.TestReactiveForm = this.fb.group({
			name: ['3', [Validators.required]],
			email: [
				null,
				[
					customValidator.RequiredValidator('This field is mandatory.'),
					customValidator.EmailValidator('email is not valid'),
				]
			],
			gender: ['2', [Validators.required]],
			language: [
				[
					{ Text: 'b', Value: '2' },
					{ Text: 'c', Value: '1' },
				],
				[Validators.required],
			],
			phone: [1000000, [customValidator.DecimalValidator()]],
			Date: [new Date(), [Validators.required]],
			time: [{ value: null, disabled: false }, [this.customValidator.RequiredValidator()]],
			endtimeRange: [{ value: null, disabled: false }, [this.customValidator.RequiredValidator()]],
			message: ['Acro India', [Validators.required]],
			isChecked: [true, [Validators.required]],
			isSwitched: ['Yes', [Validators.required]],
			startdate: [null, [Validators.required]],
			enddate: [null, [Validators.required]],
			numberic: [null],
			textBoxDisable: [{ value: '', disabled: true }],
		});

		this.setValidators();

		this.listItems = [
			{ Text: 'X-Small', Value: '1' },
			{ Text: 'Small', Vvalue: '3' },
			{ Text: 'X-large', Value: '4' },
		];

		this.animation = {
			duration: 500,
			type: 'slide',
			direction: 'left',
		};
	}
	private popupRef: PopupRef | null;

	getTime(event: any) {
		console.log(event);
	}
	startTimeValueChange1(event: any) {
		console.log(event);
	}

	public togglePopup(anchor: ElementRef | HTMLElement): void {
		if (this.popupRef) {
			this.popupRef.close();
			this.popupRef = null;
		} else {
			console.log("ds")
			this.popupRef = this.popupService.open({
				anchor: anchor,
				content: KendoTimerangeComponent
			});
		}
	}
	
	ngAfterViewInit() {
		this.anchor = this.anchor.nativeElement;
	}
	public labelLocalizeParam: DynamicParam[] = [
		{
			Value: 'Sector',
			IsLocalizeKey: true,
		},
	];
	public buttons = [
		{
			text: 'YesActivate', value: 1, themeColor: 'primary', btnLocalizaedParam: this.labelLocalizeParam
		},
		{
			text: 'NoActivate', value: 2, btnLocalizaedParam: this.labelLocalizeParam
		}
	]

	public localizeParam: DynamicParam[] = [
		{ Value: 'LaborCategory', IsLocalizeKey: true },
		{ Value: 'lsingh', IsLocalizeKey: false },
		{ Value: 'Welcome@1', IsLocalizeKey: false },
	];

	showPopup1() {
		let buttons = [
			{ text: "EntityId", value: 1, btnLocalizaedParam: this.labelLocalizeParam }
		];

		this.popup.showConfirmation('IsRfxSowRequired', buttons, this.localizeParam);

	}
	OnInput(event: any) {
		console.log(event);
	}

	public valueChange(value: any): void {
		console.log('valueChange - ', value);
	}
	dateChangeValue(event: any) {
		console.log(this.Dtrange);
	}
	private setValidators(): void {
		let nameControl = this.TestReactiveForm.get('name');
		let emailControl = this.TestReactiveForm.get('email') as FormControl;

		nameControl?.valueChanges.subscribe((result) => {
			let controlList: FormControl[] = [emailControl];
			result.text === 'Large'
				? this.customValidator.AddCascadeRequiredValidator(controlList)
				: this.customValidator.RemoveCascadeRequiredValidator(controlList);
		});
	}

	save() {
		this.TestReactiveForm.markAllAsTouched();
		console.log(this.TestReactiveForm.value);
	}
	confirmMessagePopup() {
		const dialog = this._DialogServices.open({
			title: '',
			content: ConfirmationPopupTextAreaComponent,
			actions: [{ text: 'Yes' }, { text: 'No' }],
		});
		const textAreaValue = dialog.content
			.instance as ConfirmationPopupTextAreaComponent;

		textAreaValue.messageTitle = 'Title message';
		textAreaValue.maxCounts = 10;
		dialog.result.subscribe((s: any) => {
			if (s.text === 'Yes') {
				alert(textAreaValue.ReasonUpdate.controls['ReasonForUpdate'].value);
			} else {
				null;
			}
		});
	}
	public onToggle(): void {
		this.show = !this.show;
	}

	public close(status: string): void {
		console.log(`Dialog result: ${status}`);
		this.opened = false;
	}

	public open(): void {
		
		this.animation = {
			myAnimation: true,
			duration: 300,
			type: 'slide',
			direction: 'left',
		};
		this.opened = true;
	}
	
}
