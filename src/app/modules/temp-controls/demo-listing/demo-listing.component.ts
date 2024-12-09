import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { IntlService, NumberFormatOptions } from '@progress/kendo-angular-intl';
import { PopupRef, PopupService } from '@progress/kendo-angular-popup';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { ConfirmationpopupService } from '@xrm-shared/services/Confirmation-popup.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import {
	ListViewComponent
} from '@xrm-shared/widgets/list-view/list-view.component';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Tooltip } from '@xrm-shared/widgets/tooltip/tooltip.interface';
import { SectorService } from 'src/app/services/masters/sector.service';
import { DynamicChildLoaderDirective } from './dynamiccomponent.directive';
import { ViewComponent } from './view/view.component';
import { AdEditComponent } from './ad-edit/ad-edit.component';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
@Component({
	selector: 'app-demo-listing',
	templateUrl: './demo-listing.component.html',
	styleUrls: ['./demo-listing.component.scss']
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoListingComponent extends HttpMethodService implements OnInit, AfterViewInit {
	@ViewChild('listview', { static: true }) listview: ListViewComponent;
	@ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;
	public JsonData: any;

	//aanotherValue : string ="InterviewAvailabilityToolTip";
	// AnotherValue(){
	// 	return this.aanotherValue;
	// }
	// anotherValueLocalizeParam: DynamicParam[] = [{ IsLocalizeKey: 'PoValidationMessage', Value: 'Value1' }];

	public value: Date = new Date(2000, 2, 10);
	public value1: any = 12345643242;
	public numberformatOption: NumberFormatOptions = {
		style: "currency"

	};
	public actionSet: any;
	private popupRef: PopupRef | null;
	public isSelected: boolean;
	public columnOptions: any;
	public dropdownForm: FormGroup;
	public extraButton: any;
	public path: any = '/xrm/temp/listing-add-edit';
	public listingData: any;
	public popoverBodyData = `<ul>
  <li>Coffee</li>
  <li>Tea
    <ul>
      <li>Black tea</li>
      <li>Green tea</li>
    </ul>
  </li>
  <li>Milk</li>
</ul>`;


	// eslint-disable-next-line max-lines-per-function, max-params
	constructor(
		private sector: SectorService,
		private _Router: Router,
		private widget: WidgetServiceService,
		private dialogService: DialogService,
		private localizationService: LocalizationService,
		private fb: FormBuilder,
		private popupService: PopupService,
		public intl: IntlService,
		public translate: TranslateService,
		public popup: DialogPopupService,
		private datePipe: DatePipe,
		private http: HttpClient,
		public _ConfirmationpopupService: ConfirmationpopupService,
		private customValidators: CustomValidators,

		private viewContainerRef: ViewContainerRef
	) {
		super(http);
		this.daterange = this.fb.group({
			letdateRangePicker: [new Date('06/12/2023')],
			letdateRangePicker1: [new Date('06/12/2023')],
			radiobutton: ['ds'],
			masked: ['3598841233'],
			phone: ['1 1', customValidators.RequiredValidator()],
			phoneExt: ['1 1', customValidators.RequiredValidator()],
			maskedTextbox: ['', customValidators.PostCodeValidator(1)],
			maskedTextbox1: ['12342423423423'],
			NoOfPreviousWeekending: [1212121212121],
			clockBufferToSetReportingDate: [new Date('2024-05-14T17:30:00.000Z').getxrmDatetime()]
		});

		this.JsonData = [
			{
				control: 'multidd',
				list: ['Pitney Bowes Inc.'],
				controlName: 'sector',
				label: 'Sector'
			},
			{
				control: 'multidd',
				list: ['Call Center', 'Administrative', 'Spokane Call Center'],
				controlName: 'labor_category',
				label: 'Labor Category'
			},
			{
				control: 'multidd',
				list: [
					'Accounting Assistant',
					'Administrative Assistant',
					'Accountant 2'
				],
				controlName: 'job_category',
				label: 'job Category'
			},
			{
				control: 'radio',
				list: ['Indirect', 'Direct'],
				controlName: 'type',
				label: 'Contract Type'
			},
			{
				control: 'radio',
				list: ['Yes', 'No'],
				controlName: 'ot_eligibility',
				label: 'OT Eligibility'
			}
		];

		this.actionSet = [
			{ icon: 'eye', color: 'dark-blue-color', title: 'View', fn: this.onView },
			{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit },
			{
				icon: ['x', 'check'],
				title: 'Active',
				fn: this.onActiveChange
			}
			//  ,{look:"k-icon k-i-edit", title:"Suspend",fn:this.other}
		];

		this.columnOptions = [
			{
				fieldName: 'ProductID',
				columnHeader: 'Id',
				visibleByDefault: true,
				width: 60
			},
			{
				fieldName: 'ProductName',
				columnHeader: 'Product Name',
				visibleByDefault: true,
				width: 200
			},

			{
				fieldName: 'UnitPrice',
				columnHeader: 'Unit Price',
				visibleByDefault: true
			},

			{
				fieldName: 'CategoryName',
				columnHeader: 'Category Name',
				visibleByDefault: true
			}
		];
		this.extraButton = [
			{ icon: 'k-icon k-font-icon k-i-eye', type: griHeaderType.copy },
			{ icon: 'k-icon k-font-icon k-i-edit', type: griHeaderType.paste }
		];

	}

	currentDate = new Date();
	ESTTimeZone: Date;
	getDate(e: any) {
		/* console.log('e', e);
		   console.log('e', this.daterange.value.clockBufferToSetReportingDate); */

		console.log('Before timezone', new Date().toLocaleString());

		/* console.log('EST timezone', new Date().getxrmEstDatetime());
		    console.log('After timezone ', new Date().getxrmDateWithTime('11:20 PM').toLocaleTimeString());
		     tmzone=this.timezone.convertToEST(dt);
		     console.log("orginal time", dt);
		    console.log('After timzone', tmzone); */

	}

	getLinkParam(event: any) {
		// alert(event);
	}
	public orgDynamicParam: DynamicParam[] = [{ Value: 'Guddu', IsLocalizeKey: false }];
	public statusCardData = {
		items: [
			{
				title: 'Expense ID',
				titleDynamicParam: [],
				item: 'EXPSE98989903',
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: '/revenue',
				linkParams: ''
			},
			{
				title: 'Contractor',
				titleDynamicParam: [],
				item: 'ActualShiftWageRate',
				itemDynamicParam: this.orgDynamicParam,
				cssClass: ['basic-code'],
				isLinkable: false,
				link: '/revenue',
				linkParams: ''
			},
			{
				title: 'Assignment ID',
				titleDynamicParam: [],
				item: 'ASGNT98787868',
				itemDynamicParam: [],
				cssClass: ['basic-code'],
				isLinkable: true,
				link: '/revenue',
				linkParams: '#assignmentDetails'
			},
			{
				title: 'Weekending Date',
				titleDynamicParam: [],
				item: '1/14/2024',
				itemDynamicParam: [],
				cssClass: ['basic-code'],
				isLinkable: false,
				link: '/revenue',
				linkParams: ''
			},
			{
				title: 'Total Amount',
				titleDynamicParam: [],
				item: '300.00 (USD)',
				itemDynamicParam: [],
				cssClass: ['basic-code'],
				isLinkable: false,
				link: '/revenue',
				linkParams: ''
			},
			{
				title: 'Status',
				titleDynamicParam: [],
				item: 'Partially Approved',
				itemDynamicParam: [],
				cssClass: ['basic-code'],
				isLinkable: false,
				link: '/revenue',
				linkParams: '',
				isedit: true
			}
		]
	};


	@ViewChild(DynamicChildLoaderDirective, { static: true })
		dynamicChild!: DynamicChildLoaderDirective;

	private loadDynamicComponent(a: any) {
		if (a == 21) {
			this.vc.createComponent(AdEditComponent);
		} else {
			this.vc.createComponent(ViewComponent);

		}
	}

	actionClicked(e: any) {
		console.log(e);
	}

	public range = {
		start: new Date(2018, 10, 4),
		end: new Date(2018, 10, 10)
	};

	getBlurData(event: any) {
		this.Post('/biscl/save', this.daterange.get('clockBufferToSetReportingDate')?.value).subscribe((data: any) => {
			// console.log('data', data);
		});
		console.log("event", this.daterange.get('clockBufferToSetReportingDate')?.value);

	}

	add() {
		/* const utcDate = new Date(this.daterange.get('letdateRangePicker')?.value.toUTCString());
		   const utcDate = this.datePipe.transform(this.daterange.get('letdateRangePicker')?.value, 'yyyy-MM-dd'); */

		// this.daterange.get('clockBufferToSetReportingDate')?.patchValue(new Date());
		this.Post('/biscl/save', this.daterange.value).subscribe((data: any) => {
			// console.log('data', data);
		});
		// console.log(this.daterange.get('letdateRangePicker')?.value);
	}
	public listItems = [
		{ Text: 'X-Small', Value: '1' },
		{ Text: 'Small', Value: '3' },
		{ Text: 'X-large', Value: '4' },
		{ Text: 'XL-large', Value: '5' }
	];

	/* "dateRange1" : new Date("04/10/2000"),"dateRange2" : new Date("04/20/2000"),
	   "dateRange1" : new Date("04/10/2000"),"dateRange2" : new Date("04/20/2000"),
	   "dateRange1" : new Date("04/10/2000"),"dateRange2" : new Date("04/20/2000"),
	   "dateRange1" : new Date("04/10/2000"),"dateRange2" : new Date("04/20/2000"), */

	public prefilledData: any = [
		{ "currency1": 1239, "dateRange1": [new Date("02/04/2000"), new Date("02/11/2000")], "maskType1": "992111111", "dropdown1": 3, "dropdown121": 3, "checkbox1": true, "radiog": false, "dropdown7": "dsad", "text7": "dsad", "multi1": ['3'], "dropdown6": [{ icon: 'x', color: 'red-color' }, { icon: 'user-x', color: 'red-color' }, { icon: 'eye', color: 'navy-blue-color' }, { icon: 'edit-3', color: 'orange-color' }, { icon: 'user-plus', color: 'orange-color' }], "date1": new Date("02/11/2000") },
		{ "currency1": 4532, "dateRange1": [new Date("01/04/2000"), new Date("01/14/2000")], "maskType1": "992921111", "multi1": ['1'], "dropdown1": 3, "checkbox1": true, "dropdown7": "dsad", "checkbox6": "dsafds@gmail.com", "dropdown6": [{ icon: 'edit-3', color: 'orange-color' }, { icon: 'user-plus', color: 'orange-color' }], "date1": "02/11/2000" },
		{ "currency1": 4532, "dateRange1": [new Date("01/04/2000"), new Date("01/14/2000")], "maskType1": "992921111", "multi1": ['1'], "dropdown1": 3, "checkbox1": true, "dropdown7": "dsad", "checkbox6": "dsafds@gmail.com", "dropdown6": [{ icon: 'edit-3', color: 'orange-color' }, { icon: 'user-plus', color: 'orange-color' }], "date1": "02/11/2000" }
	];


	public dshgfjsdf: any;

	public column: any = [
		{
			colSpan: 4,
			columnWidth: '300px',
			columnName: 'Evaluation type',
			// childColumn: [{ name: 'child1', isAstrik: true }, { name: 'child2', isAstrik: true }, { name: 'child3', isAstrik: true }],
			asterik: true,
			tooltipVisible: true,
			tooltipTitile: 'Tooltip',
			controls: [
				{
					controlType: 'time',
					controlId: 'checkbox123',
					dataType: 'boolean',
					defaultValue: new Date(),
					isEditMode: true,
					isDisable: false,
					validators: [this.customValidators.RequiredValidator()]
				},
				{
					controlType: 'date',
					controlId: 'date123',
					dataType: 'boolean',
					defaultValue: new Date(),
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			colSpan: 4,
			columnWidth: '200px',
			// childColumn: [{ name: 'child1', isAstrik: true }, { name: 'child2', isAstrik: true }],
			columnName: 'Visible',
			controls: [
				{
					controlType: 'date',
					dataType: 'string',
					controlId: 'date1',
					label: "Date",
					isEditMode: false,
					dateFormat: "MM/dd/yyyy",
					maxDate: new Date('11/31/2000'),
					minDate: new Date('3/10/1999'),
					validators: [this.customValidators.RequiredValidator()],
					isDisable: false
				},
				/* {
				   	controlType: 'maskTypeWithExtension',
				   	dataType: 'string',
				   	controlId: 'maskTypeWithExtension1',
				   	defaultValue: '',
				   	isEditMode: true,
				   	label: "Contact Number",
				   	isExtension: true,
				   	validators: [this.customValidators.RequiredValidator()],
				   	isDisable: false,
				   },
				   {
				     controlType: 'radio',
				     controlId: 'radiog1',
				     dataType: 'boolean',
				     defaultValue: false,
				     isEditMode: true,
				     isDisable: false,
				     placeholder: '--select--',
				     requiredMsg: 'dropdown Field is Required',
				     validators: [this.customValidators.RequiredValidator()],
				   },
				   {
				     controlType: 'text',
				     controlId: 'text7',
				     defaultValue: 'dsad',
				     dataType: 'string',
				     isEditMode: true,
				     isDisable: false,
				     isSpecialCharacterAllowed: true, */

				//   specialCharactersAllowed: ['@'],

				/*   specialCharactersNotAllowed: ['#'],
				     maxlength: 10,
				     placeholder: '--select--',
				     requiredMsg: 'dropdown Field is Required',
				     validators: [this.customValidators.RequiredValidator()],
				   }, */
				{
					controlType: 'multi_select_dropdown',
					controlId: 'multi1',
					defaultValue: this.listItems,
					dataType: 'string',
					isEditMode: true,
					isDisable: false,
					isSpecialCharacterAllowed: true,

					specialCharactersAllowed: ['@'],

					specialCharactersNotAllowed: ['#'],
					maxlength: 10,
					placeholder: '--select--',
					requiredMsg: 'dropdown Field is Required',
					validators: [this.customValidators.RequiredValidator()]
				}
			]
		},
		{
			colSpan: 2,
			columnWidth: '200px',
			columnName: 'Actions',
			controls: [
				{
					controlType: 'action',
					controlId: 'dropdown6'
				}
			]
		}
	];

	/* public decimals = 1;
	   public value = 4;
	   public format = 'n4'; */

	public itemLabel: DynamicParam[] = [
		{
			Value: 'Sector',
			IsLocalizeKey: true
		}
	];

	public columnConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: false,
		firstColumnName: 'ItemNumber',
		secondColumnName: 'Add More',
		deleteButtonName: 'Delete',
		noOfRows: 0,
		itemSr: true,
		itemLabelName: 'BenefitAdder',
		itemlabelLocalizeParam: this.itemLabel,
		firstColumnColSpan: 0,
		lastColumnColSpan: 0,
		isAddMoreValidation: true,
		isVisibleAsterick: true,
		asterikIndex: 1,
		asterikAllRows: false
	};
	numeric(list: any) {
		console.log('listlist', list);
	}
	arr = [0, 1];
	arr1: any = [];
	getFormStatus(e: any) {
		setTimeout(() => {
			this.widget.updateFormObs.subscribe((ed: any) => {

			});
			console.log('g', e.value);
			this.arr1 = e.value;
			this.widget.setFormData(e.value);
			console.log('this.widget.getFormData()', this.widget.getFormData());
			this.arr.map((data: any, i: any) => {
				e.at(data)
					.get('checkbox1')
					?.disable({ onlySelf: true, emitEvent: false });
			});
		}, 100);

		/* this.myForm.get('fields') as FormArray
		   e.controls.forEach((group: FormGroup) => {
		     console.log("group", group)
		     let isNotApproved = group.get('checkbox1') as FormControl;
		     isNotApproved.disable()
		   });
		   if (this.fsdf) { */

		// }

		/* if (Object.keys(e).length != 0) {
		     // alert("s") */

		/* }
		   e.at(0).get('checkbox1')?.disable() */

		/* alert("f")
		   console.log("formg", e) */
	}
	switchEvent1(e: any) {

	}

	switchEvent(e: any) {
		console.log('???', e);
		/* console.log("eeeeeeeee", e.formData.value.fields)
		   console.log("eeeeeeeee", e) */

		// ************** enable disable controls validation : - ****************


		// ************** patchValue of Controls :-  ******************


		// ************* particular setValue enable or disable controls :- ****************

		/* e.formData.at(e.index).get('dropdown1')?.disable()
		   e.formData.at(e.index).get('dropdown1')?.setValue('fdsfsdfjd')
		   e.formData.at(e.index).get('dropdown1')?.enable() */

		// ************* you can get value after disable :- ****************

		// console.log("e.formData.getRawValue()", e.formData.getRawValue())

		// ******** not in use  ************

		const a = {
			index: e.index,
			removeIndex: [0, 1],
			hiddenControls: ['addmore-radio'],
			visibleControls: []
		};
		this.widget.listViewData.next(a);

		// ********  not in use  *************
	}
	blurOnMask(e: any) {

	}

	ngAfterViewInit() {
		this.loadDynamicComponent(1);
	}
	SaveList()
	{
 		console.log("Rajiv", this.widget.getFormData());
	}
	updateRow(e: any) {
		const removeRow = this.prefilledData.length - e,
		 addRow = e - this.prefilledData.length,
		 objects: any = [];
		if (this.prefilledData.length >= e) {
			this.prefilledData = this.prefilledData.splice(
				0,
				this.prefilledData.length - removeRow
			);
		} else {
			for (let x = 0; x < addRow; x++) {
				objects.push({
					dropdown1: 3,
					dropdown121: 3,
					checkbox1: true,
					radiog: false,
					dropdown7: 'dsad',
					text7: 'dsad',
					multi1: [3],
					dropdown5: false
				});
			}
			this.prefilledData = [...this.prefilledData, ...objects];
		}
	}
	public labelLocalizeParam: DynamicParam[] = [
		{
			Value: 'Sector',
			IsLocalizeKey: true
		},
	];
// my code.
	public additionallabelLocalizeParam: DynamicParam[] = [
		{
		  Value: 'ShiftName',
		  IsLocalizeKey: true
		},
		{
		  Value: 'ReasonType',
		  IsLocalizeKey: true
		},
		{
		  Value: 'DtBill',
		  IsLocalizeKey: true
		}
	  ];

	tabOptions = {
		bindingField: 'active',
		tabList: [
			{
				tabName: 'All',
				favourableValue: '_default_',
				selected: true
			},
			{
				tabName: 'Inactive',
				favourableValue: false
			},
			{
				tabName: 'Active',
				favourableValue: true
			}
		]
	};

	private buttons = [
		{
			text: 'YesActivate',
			value: 1,
			themeColor: 'primary',
			btnLocalizaedParam: this.labelLocalizeParam
		},
		{
			text: 'NoActivate',
			value: 2,
			btnLocalizaedParam: this.labelLocalizeParam
		}
	];
	private buttons1 = [
		{
			text: 'YesActivate',
			value: 3,
			themeColor: 'primary',
			btnLocalizaedParam: this.labelLocalizeParam
		},
		{
			text: 'NoActivate',
			value: 4,
			btnLocalizaedParam: this.labelLocalizeParam
		}
	];
	private buttons2 = [
		{
			text: 'YesActivate',
			value: 5,
			themeColor: 'primary',
			btnLocalizaedParam: this.labelLocalizeParam
		},
		{
			text: 'NoActivate',
			value: 6,
			btnLocalizaedParam: this.labelLocalizeParam
		}
	];

	showPopup() {
		this.daterange.markAllAsTouched();
		const dynaminParam: DynamicParam[] = [
			{
				Value: 'Sector',
				IsLocalizeKey: true
			}
		];
		this.popup.showConfirmation(
			'DoYouWantToActivateThisSector',
			this.buttons,
			dynaminParam
		);
	}

	showSuccessPopup() {
		const dynaminParam: DynamicParam[] = [
			{
				Value: 'Sector',
				IsLocalizeKey: true
			}
		];
		this.popup.showSuccess(
			'DoYouWantToActivateThisSector',
			this.buttons1,
			dynaminParam
		);
	}

	showErrorPopup() {
		const dynaminParam: DynamicParam[] = [
			{
				Value: 'Sector',
				IsLocalizeKey: true
			}
		];
		this.popup.showError(
			'DoYouWantToActivateThisSector',
			this.buttons2,
			dynaminParam
		);
	}

	OnClick(isClicked: any) {
		this._Router.navigate(['/xrm/temp/listing-add-edit']);
	}
	OnFilter(formValue: any) {

	}
	daterange: FormGroup;

	public tooltipData: Tooltip = {
		label: 'labelKey',
		value: 'valueKey',
		tooltipPosition: 'right',
		tooltipTitle: 'titleKey',
		content: true,
		tooltip: true
	};
	/* public RadioGroup = ['MSP', 'Hiring Manager'];
	   selectDeselect(e: any){
	     console.log("eeeeeeeeeeeeee",e)
	     if(e.type == 'Hiring Manager'){
	       this.isSelected = !this.isSelected;
	     }
	   } */
	gridHeaderBtnEvent(e: any) {
		this.sector.getAllSector().subscribe((data: any) => {
			const dialogRef: DialogRef = this.dialogService.open({
				content: CopyDialogComponent
				/* preventAction: (ev, dialog) => {
				     const copyFormGroup = (dialogRef.content.instance as CopyDialogComponent)
				       .copyFormGroup;
				     if (!copyFormGroup.valid) {
				       // formGroup.get.markAsTouched();
				     }
				     return !copyFormGroup.valid;
				   } */
			});

		});
	}
	getData(e: any) {
		// this.prefilledData = e
	}
	ngOnInit() {
		/* this.daterange.valueChanges.subscribe((data: any) => {
		   	console.log('dddd', data);
		   }); */
		const a = {
			index: 1,
			removeIndex: [0, 1],
			hiddenControls: ['addmore-radio'],
			visibleControls: []
		};
		this.widget.listViewData.next(a);
		this.widget.dataPersistObs.subscribe((y: any) => {
			this.prefilledData = [...this.prefilledData, ...y];
		});
		this.dropdownForm.patchValue({
			data111: { Value: '4s' }
		});

		/* let c = {
		     disableControls: ['checkbox1']
		   }
		   this.widget.listViewData.next(c)
		   let b = this.widget._addMoreFormData.subscribe(data => {
		     if (Object.keys(data).length != 0) {
		       data.controls.map((group: FormGroup) => {
		         console.log("group", group)
		         let isNotApproved = group.get('checkbox1') as FormControl;
		         isNotApproved.setValue(false)
		       });
		       // console.log("bbbbbbbbbbb", data.at(0).get('checkbox1').disable())
		     }
		   }) */

		// b.unsubscribe()
		this.popup.dialogButtonObs.subscribe((data: any) => {
			// alert(data.value)
			if (data.value == 1) {
				// alert("1")
			} else {
				// alert("2")
			}
		});
	}
	ngOnDestroy() {
		console.log('this.arr1', this.arr1);
		this.widget.dataPersist.next(this.arr1); // <-- close impending subscriptions
	}
	onView = (dataItem: any) => {
		this._Router.navigate(['/xrm/temp/view']);
	};
	onEdit = (dataItem: any) => {
		// localStorage.setItem('editData',json.stringify())
		this._Router.navigate([`/xrm/temp/add-edit`]);

		// alert("Edit Cliked...")
	};
	onActiveChange = (action: string, dataItem: any) => {
		console.log(`${action} req: ${JSON.stringify(dataItem)}`);
	};
	other = (dataItem: any) => {
		alert('Other Clicked...');
	};
	public gridData: any[] = [
		{
			ProductID: 1,
			ProductName: 'Chai',
			UnitPrice: 18,
			CategoryName: 'Beverages'
		},
		{
			ProductID: 2,
			ProductName: 'Chang',
			UnitPrice: 19,
			CategoryName: 'Beverages'
		},
		{
			ProductID: 3,
			ProductName: 'Aniseed Syrup',
			UnitPrice: 10,
			CategoryName: 'Condiments'
		}
	];

	public bunit: string[] = ['Pitney Bowes - GEC'];
	public data: any[] = [
		{
			text: 'All',
			items: [
				{ text: 'Other (Pitney Bowes - GEC) (Pitney Bowes - GEC)' },
				{ text: 'Backfill (PB Presort Services Inc)' },
				{ text: 'Backfill (Pitney Bowes - GEC)' },
				{ text: 'Open Position(s) (Pitney Bowes - GEC)' },
				{ text: 'Other (PB Presort Services Inc)' },
				{ text: 'Special Project (PB Presort Services Inc)' },
				{ text: 'Special Project (PB Presort Services Inc)' },
				{ text: 'Special Project (PB Presort Services Inc)' },
				{ text: 'Special Project (PB Presort Services Inc)' }
			]
		}
	];
}
