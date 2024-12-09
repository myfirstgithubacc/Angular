import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DropDownListComponent, DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { KendoTemplateDropdown } from './kendo-template-interface';
import { Dropdown, StartColor, TagVisibility } from '@xrm-shared/enums/dropdown.enum';
import { Subject, takeUntil } from 'rxjs';
@Component({
	selector: 'app-kendo-template-dropdown',
	templateUrl: './kendo-template-dropdown.component.html',
	styleUrls: ['./kendo-template-dropdown.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoTemplateDropdownComponent implements OnChanges, OnInit , DoCheck {
	 public formControl!: FormControl;
	 private unsubscribe$ = new Subject<void>();
	@Input() set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
		this.formControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.cdr.markForCheck();
		});
	}
	@ViewChild('dropdownlist', { static: false }) dropdownlist: DropDownListComponent;
	@Input() dropDownInterFace: KendoTemplateDropdown;
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() onSelectionChange: EventEmitter<any> = new EventEmitter<any>();
	public tagAlig = Dropdown;
	public color = StartColor;
	public tagVisibility = TagVisibility;
	public isDropDownListOpen: boolean = false;
	public defaultItem: any;
	constructor(private parentF: FormGroupDirective, protected cdr: ChangeDetectorRef) {
	}
	ngOnInit(): void {
		if (this.dropDownInterFace.placeholder != null) {
			this.defaultItem = { Text: this.dropDownInterFace.placeholder, Value: null };
		}
		else {
			this.defaultItem = null;
		}
	}
	ngOnChanges(changes: SimpleChanges): void {
		this.cdr.markForCheck();
		if (changes['dropDownInterFace.list'].currentValue) {
			this.dropDownInterFace.list = changes['dropDownInterFace.list'].currentValue;
		}
	}
	OnChange(event: any) {
		this.onChange.emit(event);
	}

	ngDoCheck() {
		const formControl = this.formControl,
			formValue = formControl.value;
		if (formControl.touched && (formValue == null || formValue.Value == null || formControl.invalid || formControl.valid )) {
			if (formValue != null && formValue.Value == null) {
				this.formControl.reset();
			}
			this.cdr.markForCheck();
		}
	}

	OnSelectChange(event:any)
	{
		this.onSelectionChange.emit(event);
	}
	public itemDisabled(itemArgs: { dataItem: any }) {
		return itemArgs.dataItem.isDisabledItem;
	}
	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
