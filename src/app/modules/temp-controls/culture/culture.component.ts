import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StepperActivateEvent } from '@progress/kendo-angular-layout/stepper/events/activate-event';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { TimerangeWidget } from '@xrm-shared/widgets/form-controls/kendo-timerange/kendo-timerange.interface';

@Component({selector: 'app-culture',
	templateUrl: './culture.component.html',
	styleUrls: ['./culture.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class CultureComponent implements OnInit {

	public form: FormGroup;
	countryId: any = magicNumber.one;
	entityId = XrmEntities.LaborCategory;
	public columnOptions: any = [];
	public actionSet: any;
	public laborCategoryList: any;
	public pageSize = magicNumber.zero;
	public tabOptions: any;
	public selectedTabName: any;

	isEditMode: boolean = true;

	selectedTime: string = '';

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

	// weekday picker code start--------------------------------------->
	selectedDays = [
		{ day: 'Monday', isSelected: false },
		{ day: 'Tuesday', isSelected: true },
		{ day: 'Wednesday', isSelected: false },
		{ day: 'Thursday', isSelected: false },
		{ day: 'Friday', isSelected: false }
	];

	// Method to capture the selected time
	updateSelectedTime(selectedTime: string) {
		this.selectedTime = selectedTime;
		console.log('Selected Time:', this.selectedTime);
	}

	updateDayInfo(selectedDays: any) {
		this.selectedDays = selectedDays;
		console.log('Selected Days:', this.selectedDays);
	}


	// weekday picker code end--------------------------------------->


	// Stepper-Code-start--------------------------------------------------------------------->

	public currentStep = 0;
	public steps = [
		{
			label: 'Create',
			optional: true
		},
		{
			label: 'Approval Process (Ongoing)',
			isValid: false,
			optional: true
		},
		{
			label: 'Candidate Submission',
			disabled: false,
			optional: true

		},
		{
			label: 'Closed',
			isValid: true,
			optional: true
		}
	];

	// Event handler for stepChanged event
	onStepChanged(stepIndex: number) {
		// Handle step change logic here, e.g., updating the currentStep property
		console.log('Step changed');
		this.currentStep = stepIndex;
		if (this.currentStep === this.steps.length) {
			// Call the onStepperCompleted method when the current step is 3
			this.onStepperCompleted();
		}
	}

	// Method to handle the completed event
	onStepperCompleted() {
		// Implement your logic when the stepper is completed
		console.log('Stepper completed');
		// Perform actions like submitting data or navigating to another page
	}

	// Method to handle the canceled event
	onStepperCanceled() {
		// Implement your logic when the stepper is canceled
		console.log('Stepper canceled');
		// Perform actions like resetting the form or navigating back
	}

	handleActivateEvent(event: StepperActivateEvent) {
		// Handle the activate event here
		console.log('Akash Activate :', event);
	}

	// Stepper-code-end--------------------------------------------------------------------------->

	public stateLabel: any = null;
	public zipLable: any = null;

	constructor(
		private formBuilder: FormBuilder,
		private customValidators: CustomValidators,
		private cdr: ChangeDetectorRef,
		private gridService: GridViewService,
		private gridConfiguration: GridConfiguration,
		private localizationSrv: LocalizationService
	) {

		this.form = this.formBuilder.group({
			country: [null, customValidators.RequiredValidator()],
			zipCode: [null, [customValidators.RequiredValidator(), customValidators.PostCodeValidator(this.countryId)]],
			phone: [null, [customValidators.RequiredValidator(), customValidators.FormatValidator()]],
			endtimecontrol: [{ value: null, disabled: false }, [this.customValidators.RequiredValidator()]],
			weekdaycontrol: [{ value: null, disabled: false }, [this.customValidators.RequiredValidator()]],
			phoneExt: [null, [customValidators.RequiredValidator(), customValidators.FormatValidator()]],
			time: [null, [customValidators.RequiredValidator(), customValidators.FormatValidator()]]
		});



	}

	dynamicParam: DynamicParam[] = [{ IsLocalizeKey: false, Value: "Sector " }];
	public valueItems = [
		{ text: 'India', value: '+91' },
		{ text: 'Canada', value: '+1' },
		{ text: 'FromSector', value: '+61', dynamicParam: this.dynamicParam }
	];

	public listItems = [
		{ Text: '1', Value: '1' },
		{ Text: '2', Value: '2' },
		{ Text: '3', Value: '3' },
		{ Text: '4', Value: '4' },
		{ Text: '8', Value: '8' },
		{ Text: '10', Value: '10' }
	];

	ngOnInit(): void {
		this.getColumnData();
		this.getActionSet();
		this.getTabOptions();
	}

	onCountryChange(item: any) {
		if (item == undefined)
			this.countryId = '0';
		else
			this.countryId = item.Value;

		this.stateLabel = this.localizationSrv.GetCulture(CultureFormat.StateLabelLocalizedKey, this.countryId);
		this.zipLable = this.localizationSrv.GetCulture(CultureFormat.ZipLabelLocalizedKey, this.countryId);

		this.cdr.detectChanges();

	}

	submitForm() {
		this.form.get('phone')?.setValue('1234567890');
		this.form.markAllAsTouched();

	}

	// #region Grid

	onView = (dataItem: any) => { };
	onEdit = (dataItem: any) => { };
	onActivateDeactivateAction = () => { };

	private getColumnData() {
		this.gridService.getColumnOption(this.entityId).subscribe((res: any) => {
			if (res.Succeeded) {
				this.columnOptions = res.Data.map((e: any) => {
					e.fieldName = e.ColumnName;
					e.columnHeader = e.ColumnHeader;
					e.visibleByDefault = e.SelectedByDefault;
					return e;
				});
			}
		});
	}

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit, this.onActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			}
		];
	}

	public getTabOptions() {
		this.tabOptions = {
			bindingField: dropdown.Disabled,
			tabList: [
				{
					tabName: dropdown.Active,
					favourableValue: false,
					selected: true
				},
				{
					tabName: dropdown.Inactive,
					favourableValue: true
				},
				{
					tabName: dropdown.All,
					favourableValue: dropdown.All
				}
			]
		};
	}

	public selectedTab($event: any) {
		this.selectedTabName = $event;
	}

	public onAllActivateDeactivateAction(event: any, lists: any) {

	}

	// #endregion grid

}
