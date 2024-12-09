import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DropDownFilterSettings, MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { from, Subject, Subscription, takeUntil } from 'rxjs';

@Component({selector: 'app-kendo-multiselect-additional',
	templateUrl: './kendo-multiselect-additional.component.html',
	styleUrls: ['./kendo-multiselect-additional.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoMultiselectAdditionalComponent implements OnInit, OnChanges, AfterViewInit {
	private unsubscribe$ = new Subject<void>();
	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};
	public data:any[]=[];
	public formControl!: FormControl;
	@ViewChild('multiselect') public multiselect: MultiSelectComponent;
	@Input() isSpecialCharacterAllowed: boolean = true;

	@Input() specialCharactersAllowed: string[] = [];

	@Input() isSearchableMode: boolean = false;

	@Input() specialCharactersNotAllowed: string[] = [];

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() label: string = '';

	@Input() placeholder: string = '';

	@Input() sortingDropdown: boolean = true;

	@Input() isSearchWithStart: boolean = false;

	@Input() list: { Text: string; Value: number; }[];

	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();

	@Output() onFilter: EventEmitter<any> = new EventEmitter<any>();

	@Input() isRequired: boolean;

	@Input() isEditMode: boolean = false;

	@Input() isDisabled: boolean;

	@Input() tooltipTitle: string = '';

	@Input() tooltipVisible: boolean = false;

	@Input() isHtmlContent: boolean = false;

	@Input() helpTexts: string[] = [];

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
	public multiSelectSubs: Subscription;

	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}

	@Input() listControlName: FormControl;

	constructor(private parentF: FormGroupDirective, private cdr: ChangeDetectorRef) {
	}

	ngOnChanges(changes: SimpleChanges): void {

		if (changes['list'].currentValue?.length > magicNumber.zero) {
			this.data = changes['list'].currentValue;
		}
	}

	ngOnInit(): void {

		this.filterSettings.operator = this.isSearchWithStart
			? 'startsWith'
			:'contains';
	}

	focus() {
		if(this.isSearchableMode){
			this.multiselect.toggle(false);
		}
	}

	OnChange(event: any) {
		this.onChange.emit(event);
	}


	OnFilter(evt: any) {
		this.onFilter.emit(evt);
	}
	ngAfterViewInit() {
		if (this.isSearchableMode) {
			const contains = (value: any) =>
				(s: any) =>
		  s.Text.toLowerCase().indexOf(value.toLowerCase()) !== magicNumber.minusOne;
			this.multiSelectSubs=this.multiselect.filterChange
		  .asObservable()
		  .pipe(switchMap((value) =>
			  from([this.list]).pipe(
						tap(() =>
							(this.multiselect.loading = true)),
						delay(magicNumber.hundred),
						map((data) =>
						 data.filter(contains(value)))
			  )))
			  .pipe(takeUntil(this.unsubscribe$))
			  .subscribe((x) => {
					this.data = x;
					this.multiselect.loading = false;
		  });
		}
	}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
