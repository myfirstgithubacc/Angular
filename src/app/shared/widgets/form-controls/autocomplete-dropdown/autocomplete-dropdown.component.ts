import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective } from '@angular/forms';
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Observable, delay, map, tap, Subject, takeUntil} from "rxjs";

@Component({
	selector: 'app-autocomplete-dropdown',
	templateUrl: './autocomplete-dropdown.component.html',
	styleUrls: ['./autocomplete-dropdown.component.scss'],
	viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteDropdownComponent implements AfterViewInit{
  @Input() list: string[];
  @Input() virtual: {itemHeight: number, pageSize: number} = { itemHeight: 28, pageSize: 8 };
  private unsubscribe$ = new Subject<void>();
	@Input() searchValueLength :number = magicNumber.three;
	@Input() isEditMode: boolean = false;
	@Input() label: string = '';
	@Input() listControlName: FormControl;
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() tooltipTitle: string;
	@Input() placeholder: string = '';
	@Input() tooltipVisible: boolean;
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() isHtmlContent: boolean = false;

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

	@Input() isRequired: boolean = false;
	@Output() onChange: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
  @ViewChild('autocomplete', { static: false })
	public autocomplete: AutoCompleteComponent;
  public listItems: Observable<string[]>;
  public data : any[] = [];
  public formControl!: FormControl;

	@Input() set controlName(value: string) {
  	this.formControl = this.parentF.form.get(value) as FormControl;
  	this.formControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
  		this.cdr.markForCheck();
  	});
  }

	constructor(private parentF: FormGroupDirective, protected cdr: ChangeDetectorRef) { }

	ngAfterViewInit() {
		const contains = (searchTerm: string) =>
		 (item: string) =>
				item.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;

		this.autocomplete.filterChange.asObservable()
			.pipe(
				tap(() => 
					this.autocomplete.loading = true),
				delay(magicNumber.hundred),
				map((searchTerm: string) =>
					this.list.filter(contains(searchTerm)))
			).pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
				this.data = data;
				this.autocomplete.loading = false;
			});
	}

	OnChange(event: any) {
		this.onChange.emit(event);
	}

	onFocus(){
		this.autocomplete.toggle(false);
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}

