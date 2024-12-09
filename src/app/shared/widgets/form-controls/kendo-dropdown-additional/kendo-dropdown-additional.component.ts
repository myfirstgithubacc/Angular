import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { from, Subject, takeUntil } from 'rxjs';
import { delay, switchMap, map, tap } from 'rxjs/operators';
import {
	FormControl,
	FormGroupDirective
} from '@angular/forms';
import { ComboBoxComponent, DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { IList, IListDataType } from '@xrm-shared/Utilities/list.interface';
import { IPredefinedListItem } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { DropdownItem } from 'src/app/modules/job-order/light-industrial/models/broadcast.model';
import { ListItem } from '@progress/kendo-angular-dateinputs/timepicker/models/list-item.interface';

@Component({selector: 'app-kendo-dropdown-additional',
	templateUrl: './kendo-dropdown-additional.component.html',
	styleUrls: ['./kendo-dropdown-additional.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoDropdownAdditionalComponent implements OnChanges, OnInit {
	public formControl!: FormControl;
	private unsubscribe$ = new Subject<void>();
	@Input() set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
		this.formControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.cdr.markForCheck();
		});
	}
	@Input() listControlName: FormControl;
	@Input() isSingleSelect: boolean = false;
	@Input() list: IListDataType[] = [];
	@Input() isRequired: boolean = false;
	@Input() label: string = '';
	@Input() placeholder: string = '';
	@Input() isEditMode: boolean = false;
	@Input() isDisabled: boolean= false;
	@Input() isValuePrimitiveAllowed: boolean;
	@Input() tooltipTitle: string='';
	@Input() tooltipVisible: boolean = false;

	@Input() specialCharactersAllowed: string[] = [];

	@Input() specialCharactersNotAllowed: string[] = [];

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() singleItemautoLable: boolean = false;
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() isHtmlContent: boolean = false;
	@Input() xrmEntityId: number = magicNumber.zero;
	@Input() fieldName: string | null = null;
	@Input() entityType: string = '';
	@Input() helpTexts: string[] = [];

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	isRendered: boolean = true;

	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() focus: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild('comboBox') comboBox: ComboBoxComponent;
	selectedValue: any = null;

	public data: IList[];

	constructor(private parentF: FormGroupDirective, protected cdr: ChangeDetectorRef, private commonService: AuthCommonService) {
		this.data = this.list.slice();
	}

	ngOnInit(): void {
		if (this.listControlName) {
			this.listControlName.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((a: any) => {
				if (a) {
					const val = this.list.filter((b: { Text: string }) =>
						b.Text === a);
					if (val.length > magicNumber.zero) {
						this.listControlName.setValue(val[0]);
					}
					else {
						this.comboBox.blur();
						this.comboBox.toggle(false);
					}
				}

			});
		}
		if (this.xrmEntityId == Number(magicNumber.zero) || this.fieldName == null)
			return;
		this.manageAuthorization();
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.parentF.form.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((a: any) => {
			if (this.formControl.value != null && this.formControl.value != undefined && this.formControl.value != '') {
				this.data = [this.formControl.value];
			}
		});
		if ((changes['list'].currentValue.length == magicNumber.one || this.list.length == magicNumber.one) && this.singleItemautoLable) {
			this.isEditMode = true;
			this.formControl.setValue(changes['list'].currentValue[0]);
		}

		this.manageAuthorization();
	}

	manageAuthorization() {
		const result = this.commonService.manageAuthentication({
			xrmEntityId: this.xrmEntityId,
			entityType: this.entityType,
			fieldName: this.fieldName
		});
		this.isVisibleorEditable(result);
	}

	isVisibleorEditable(result: any) {
		if (result && this.isEditMode) {
			this.isRendered = result.isViewable;
			if (!this.isRendered)
				return;
			this.isEditMode = !result.isModificationAllowed;
			if (!result.ModificationAllowed)
				this.formControl.clearValidators();
		}
	}

	clearValidatorsDeligate() {
		this.formControl.clearValidators();
	}

	OnChange(event: any) {
		this.onChange.emit(event);
	}

	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};


	onComboBoxClick(): void {
		this.comboBox.toggle(!this.comboBox.isOpen);
	}
	onClosed(): void {
		/* Due to this reason (blue), search data is not working properly
		   this.comboBox.blur(); */
	}

	ngAfterViewInit() {
		const contains = (value: any) =>
			(s: any) =>
				s.Text.toLowerCase().indexOf(value.toLowerCase()) !== -1;
		this.comboBox.filterChange.asObservable()
			.pipe(
		  switchMap((value) =>
					from([this.list]).pipe(
			  tap(() =>
							this.comboBox.loading = true),
			  delay(magicNumber.hundred),
			  map((data) =>
							data.filter(contains(value)))
					)),
		  takeUntil(this.unsubscribe$)
			)
			.subscribe((x) => {
		  this.data = x;
		  this.comboBox.loading = false;
			});

	}
	ngOnDestroy(): void {

		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	  }

}
