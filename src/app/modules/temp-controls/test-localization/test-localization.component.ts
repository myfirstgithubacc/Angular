import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { DialogServices } from '@xrm-shared/services/dialogue.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Product } from './model';
import { products } from './products';
import { CreateFormGroupArgs } from '@progress/kendo-angular-grid';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';


@Component({selector: 'app-test-localization',
  templateUrl: './test-localization.component.html',
  styleUrls: ['./test-localization.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestLocalizationComponent implements OnInit {
  public listItems: any[];
  public list: DynamicParam[] = [];
  TestReactiveForm: FormGroup;
  isEdit: boolean;
  memberId = { a1: 200, a2: 201 };
  extensionsAllow: FileRestrictions = {
    allowedExtensions: [],
  };
  public clientConfigureType: any = [
    { Text: 'National', Value: 'National' },
    { Text: 'International', Value: 'International' },
  ];
  message = '';

  public products: Product[] = products;
  public formGroup: FormGroup = this.fb.group({
    ProductID: null,
    ProductName: '',
    UnitPrice: null,
    UnitsInStock: null,
    Discontinued: false,
  });



  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    const item = args.isNew ? new Product() : args.dataItem;

    this.formGroup = this.fb.group({
      ProductID: item.ProductID,
      ProductName: [item.ProductName, Validators.required],
      UnitPrice: item.UnitPrice,
      UnitsInStock: [
        item.UnitsInStock,
        Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,3}')]),
      ],
      Discontinued: item.Discontinued,
    });

    return this.formGroup;
  }

  addItem() {
    console.log(this.myForm)
    const newItem = this.fb.group({
      letdateRangePicker: [new Date('06/12/2023'), this.customValidator.RequiredValidator()],
      letdateRangePicker1: [new Date('06/20/2023'), this.customValidator.RequiredValidator()],
      check: [false, this.customValidator.RequiredValidator()],
      drop: [null, this.customValidator.RequiredValidator()],
      datePicker: [new Date('6/13/2023'), this.customValidator.RequiredValidator()],
      switch: [true,],
      text: ['ankit', this.customValidator.RequiredValidator()],
      numeric: [100, this.customValidator.RequiredValidator()],
      files: ['', [this.customValidator.RequiredValidator()]],
      multi: [null, this.customValidator.RequiredValidator()],
      radio: [null, this.customValidator.RequiredValidator()],
      textArea: ['asdfghjklzxcvbnm,qwertyuiop', this.customValidator.RequiredValidator()],
      dateTimePicker: [new Date('06/13/2023 13:00'), this.customValidator.RequiredValidator()],
      phone: ['3625462361', this.customValidator.RequiredValidator()],
      phone1: ['36254623671', this.customValidator.RequiredValidator()],
      phoneExt: ['98989'],
      name: ['asasassa', this.customValidator.RequiredValidator()],
    });

    this.myArray.push(newItem);
  }

  removeItem(index: number) {
    this.myArray.removeAt(index);
  }
  myForm: FormGroup;
  myArray: FormArray;


  public column = [
    {
      colSpan: 2,
      columnName: "Linked Screen",
      controlsType: 'label',
      controlId: "label1",
    },
    {
      colSpan: 1,
      columnName: "Applies To",
      controlsType: 'switch',
      controlId: "switch1",
    },
    {
      colSpan: 3,
      columnName: "Parent Screen",
      controlsType: 'dropdown',
      controlId: "dropdown1",
      placeholder: '--Select--'
    },
    {
      colSpan: 3,
      columnName: "Visible To",
      controlsType: 'multi_select_dropdown',
      controlId: "multidropdown1",
      placeholder: '--Select--'
    },
    {
      colSpan: 3,
      columnName: "Editing Allowed By",
      controlsType: 'multi_select_dropdown',
      controlId: 'multidropdown2',
      placeholder: '--Select--'
    }
  ]

  public lableText = ['Organization 1', 'Professional Request', 'LI Request', 'CLP'];

  public columnConfiguration = {
    firstColumn: false,
    lastColumn: false,
    noOfRows: 3
  }


  public localizeParam: DynamicParam[] = [
    { Value: 'LaborCategory', IsLocalizeKey: true },
    { Value: 'lsingh', IsLocalizeKey: false },
    { Value: 'Welcome@1', IsLocalizeKey: false },
  ];

  public labelLocalizeParam: DynamicParam[] = [
    {
      Value: 'Sector',
      IsLocalizeKey: true,
    }
  ];

  constructor(
    private localizationService: LocalizationService,
    private fb: FormBuilder,
    private customValidator: CustomValidators,
    private dialogService: DialogServices,
    private dislogPopupService: DialogPopupService
  ) {
    this.createFormGroup = this.createFormGroup.bind(this);


    this.TestReactiveForm = this.fb.group({
      sector: [null, [customValidator.RequiredValidator()]],
      name: [null],
      address: [null],
      mobile: [
        null,
        [
          customValidator.RequiredValidator('EntityId', this.labelLocalizeParam),
          customValidator.IsNumberValidator(),
          customValidator.NoSpaceValidator(),
        ],
      ],

      Email: [null, customValidator.MultiEmailValidator(null, [], ['Gmail.com'])],


      Rank: [null, customValidator.MultiEmailValidator(null, [], [])],
      // Email: [null, customValidator.MultiEmailValidator()],


      TDate: [new Date()]
    });

    let msg = this.localizationService.GetLocalizeMessage(
      'IsRfxSowRequired',
      this.localizeParam
    );
    console.log(msg);

    this.listItems = [
      { Text: 'X-Small', Value: '1' },
      { Text: 'Small', Value: '2' },
      { Text: 'Large', Value: '3' },
      { Text: 'X-large', Value: '4' },
    ];
  }
  getControl(index: number) {
    const myArray = this.myForm.get('myArray') as FormArray;
    return myArray.at(index) as FormGroup;
  }

  ngOnInit() {

    this.localizationService.GetCulture(CultureFormat.StateLabel, 8);
    this.myForm = this.fb.group({
      myArray: this.fb.array([])
    });

    this.myArray = this.myForm.get('myArray') as FormArray;
    this.dislogPopupService.dialogButtonObs.subscribe(data => {
      console.log("data", data.reasonValue)
    })
    let nameControl = this.TestReactiveForm.controls['name'];
    let mobileControl = this.TestReactiveForm.controls['mobile'];
    let addressControl = this.TestReactiveForm.controls['address'];

    mobileControl.addValidators(
      this.customValidator.CompareValidator(nameControl)
    );

    addressControl.addValidators(
      this.customValidator.CompareValidator(nameControl)
    );
  }

  printFormData() {
    console.log(this.myForm.get('myArray') as FormArray);
  }

  onNameSelect(e: any) {
    let val = e.Text;

    let nameControl = this.TestReactiveForm.controls['Rank'];
    let controlList: AbstractControl[] = [nameControl];

    val === 'Small'
      ? this.customValidator.AddCascadeRequiredValidator(controlList)
      : this.customValidator.RemoveCascadeRequiredValidator(controlList);
  }

  submit() {

    console.log(">", this.TestReactiveForm)

    this.localizationService.GetLocalizeMessage('SectorName', this.labelLocalizeParam);


    let buttons = [
      { text: "EntityId", value: 1, btnLocalizaedParam: this.labelLocalizeParam }
    ];

    this.dislogPopupService.showConfirmation('IsRfxSowRequired', buttons, this.localizeParam);

  }

  getObj(): any {
    return this.localizationService.GetParamObject(this.localizeParam);
  }

  getMsg(): string {
    return this.localizationService.GetLocalizeMessage(
      'IsRfxSowRequired',
      this.localizeParam
    );
  }

  showConfirmPopup() {

    this.dialogService.showConfirmation(
      'DoYouWantToActivateThisSector',
      'YesActivate',
      'YesDeactivate',
      '',
      this.labelLocalizeParam
    );
  }

  showConfirmPopupWithTextArea() {
    let buttons = [
      { text: "EntityId", value: 1, btnLocalizaedParam: this.labelLocalizeParam }
    ];
    this.dislogPopupService.showConfirmationwithTextArea(
      'DoYouWantToActivateThisSector',
      buttons,
      this.labelLocalizeParam
    );
  }

  showMessage() {
    this.dialogService.showSuccess(
      'DoYouWantToActivateThisSector',
      this.localizeParam
    );
  }
  
  showSuccess() {
    this.showMessage();
  }
  
  showError() {
    this.showMessage();
  }
  
}
