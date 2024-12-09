import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { IFormatPlaceholder } from '@xrm-shared/Utilities/placeholder.interface';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';


@Component({
	selector: 'app-kendo-timepicker',
	templateUrl: './kendo-timepicker.component.html',
	styleUrls: ['./kendo-timepicker.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoTimepickerComponent implements OnInit, OnChanges {
	public formControl!: FormControl;
  @Input() label: string = '';
  @Input() isRequired: boolean;
  @Input() isEditMode: boolean = false;
  @Input() isHtmlContent: boolean = false;
  @Input() isDisabled: boolean;
  @Input() tooltipTitle: string | undefined = '';
  @Input() tooltipVisible: boolean;
  @Input() addOnLabelText: string = '';
  @Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
  @Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
  @Input() labelLocalizeParam: DynamicParam[] = [];
  @Input()
  set controlName(value: string) {
  	this.formControl = this.parentF.form.get(value) as FormControl;
  }
  @Input() listControlName: FormControl;
  @Input() timeFormat: string = '';

  @Output() blur = new EventEmitter<any>();
  @Output() focus = new EventEmitter<any>();
  @Output() open = new EventEmitter<any>();
  @Output() close = new EventEmitter<any>();
  @Output() valueChange = new EventEmitter<any>();

  timeFormatEnum = CultureFormat.TimeFormat;
  placeholderFormat: IFormatPlaceholder;
  customClass: string = '';
  dynamicColor: string = '#383c40';

  constructor(
    private parentF: FormGroupDirective,
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  	if (this.timeFormat.length == Number(magicNumber.zero))
  		this.timeFormat = this.localizationService.GetCulture(CultureFormat.TimeFormat);

  	this.placeholderFormat = this.localizationService.GetCulture(CultureFormat.DatePlaceholder);
  	if (this.listControlName) {
  		if (isNaN(this.listControlName?.value)) {
  			this.listControlName.setValue(null);
  		}
  	} else if (isNaN(this.formControl?.value)) {

  		this.formControl.setValue(null);
  	}
  }

  onBlur(e: any) {

  	this.blur.emit(e);
  }

  onFocus(e: any) {
  	this.focus.emit(e);
  }

  onOpen(e: any) {

  	this.open.emit(e);
  }

  onClose(e: any) {

  	this.close.emit(e);
  }
  ngOnChanges() {
  	this.addCustomClass();
  }
  addCustomClass() {
    if (this.formControl?.value) {
      this.customClass = 'custom-highlight-dark';
      this.dynamicColor = '#383c40';
    } else {
      this.customClass = 'custom-highlight-light';
      this.dynamicColor = '#bfbfbf';
    }
    this.cdr.detectChanges();
  }
  onValueChange(e: any) {
  	this.valueChange.emit(e);
  	this.addCustomClass();
  }

  ngDoCheck() {
  	this.addCustomClass();
  }

}
