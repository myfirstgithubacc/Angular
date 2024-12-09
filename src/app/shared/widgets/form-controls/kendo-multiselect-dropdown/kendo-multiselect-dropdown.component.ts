/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, Renderer2 } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DropDownFilterSettings, MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { debounceTime, delay, distinctUntilChanged, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Observable, Subject, Subscription, from, fromEvent, of, takeUntil } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LoadOnDemandService } from '@xrm-shared/services/load-on-demand.service';
import { IList, IListDataType } from '@xrm-shared/Utilities/list.interface';

@Component({selector: 'app-kendo-multiselect-dropdown',
	templateUrl: './kendo-multiselect-dropdown.component.html',
	styleUrls: ['./kendo-multiselect-dropdown.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoMultiselectDropdownComponent implements OnInit, OnChanges {
	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};
	public parentFormSubscription: Subscription;
	public formControl!: FormControl;
	public searchControl: string = "";
	public scrolled: boolean = false;
	public hasData: boolean = true;
	public itemIndex = magicNumber.one;
	public itemPageSize = magicNumber.ten;
	public listData: IList[] = [];
	public loadingData:boolean =false;
	public data: IList[] = [];
	public searchIndex: number = magicNumber.zero;

	@ViewChild('multiselect') public multiselect: MultiSelectComponent;
	@ViewChild('multiselectElement', { read: ElementRef }) public multiselectElement: ElementRef;


	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() version: string = 'old';
	@Input() isSearchableMode: boolean = false;
	@Input() specialCharactersAllowed: string[] = [];

	@Input() specialCharactersNotAllowed: string[] = [];

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() label: string = '';

	@Input() placeholder: string = '';

	@Input() sortingDropdown: boolean = true;

	@Input() isSearchWithStart: boolean = false;

	@Input() list: any=[];

	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();

	@Output() onFilter: EventEmitter<any> = new EventEmitter<any>();

	@Input() isRequired: boolean;

	@Input() isEditMode: boolean = false;

	@Input() isDisabled: boolean;

	@Input() tooltipTitle: string;

	@Input() tooltipVisible: boolean;

	@Input() isHtmlContent: boolean = false;

	@Input() helpTexts: string[] = [];

	@Input() addOnLabelText: string = '';

	@Output() onFocus: EventEmitter<any> = new EventEmitter<any>();

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
	setFormControlName: any;
	popup: boolean;
	@Input()
	set controlName(value: string) {
		this.setFormControlName = value;
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
	@Input() listControlName: FormControl;

	@Input() isLocalizedData: boolean = false;

	@Input() isLoadOnDemand: boolean = false;

	@Input() apiAddress: string | null = null;

	@Input() isApiGateway: boolean = false;

	@Input() xrmEntityId: number | null = null;

	@Input() pageSize: number = Number(magicNumber.ten);

	@Input() entityType: string | null = null;

	@Output() scrollToBottom = new EventEmitter();

	@Input() columnName: string | null = null;

	@Input() isAdvanceSearch: boolean = false;

	@Input() userValues: string | null | any = null;
	private unsubscribe$ = new Subject<void>();
	private searchText: string | null = null;
	public controlInfo: any[] = [];
	private numberZero = Number(magicNumber.zero);
	private numberTen = Number(magicNumber.ten);
	private alertTimeout: any;
	public isLoadingMore: boolean = false;
	private searchSubject = new Subject<string>();
	constructor(
		private parentF: FormGroupDirective, private gridViewSrv: GridViewService,
		private cdr: ChangeDetectorRef, public loadOnDemandSrv: LoadOnDemandService,
		private renderer: Renderer2
	) {
	}

	ngOnInit(): void {

		this.filterSettings.operator = this.isSearchWithStart
			? 'startsWith'
			: 'contains';

		this.setupSearchSubscription();
	}
	private setupSearchSubscription() {
		this.searchSubject.pipe(
		  debounceTime(magicNumber.two),
		  distinctUntilChanged(),
		  switchMap((searchText) => {
				this.isLoadingMore = true;
				this.list = [];
				this.loadOnDemandSrv.manageIndexing(this.getControlName(), this.numberZero);
				return this.loadFilteredData(searchText);
		  }),
		  takeUntil(this.unsubscribe$)
		).subscribe();
	  }

	  private loadFilteredData(searchText: string): Observable<any> {
		const pagingData: any = {
		  byPassLoader: true,
		  entityId: this.xrmEntityId,
		  entityType: this.entityType,
		  columnName: this.columnName,
		  pageSize: this.pageSize,
		  searchText: searchText,
		  userValues: this.userValues,
		  pageIndex: this.loadOnDemandSrv.getPageIndex(this.getControlName())
		};

		return this.gridViewSrv.loadDropdownDataOnDemand(this.apiAddress, pagingData, this.isApiGateway).pipe(
		  tap((res: any) => {
				if (res.Succeeded) {
			  const newData = this.isLocalizedData
						? this.loadOnDemandSrv.transformData(res.Data[0].data)
						: res.Data[0].data;

			  this.list = newData;
			  this.loadOnDemandSrv.manageInitialDataSet(this.getControlName(), newData);
			  this.loadOnDemandSrv.managePage(this.getControlName(), newData.length < this.pageSize);
				}
		  }),
		  finalize(() => {
				this.isLoadingMore = false;
				this.cdr.detectChanges();
		  })
		);
	  }

	focusedControlId: any = null;
	searchIndexReset: boolean;
	getControlName() {
		return this.setFormControlName;
	}

	close() {
		this.popup = false;
		if (this.focusedControlId === this.getControlName()) {
			this.focusedControlId = null;
		}
		this.setInitialIndex();
	}
	setInitialIndex() {
		this.searchText = "";
		this.searchIndex = 0;
		this.loadOnDemandSrv.managePage(this.getControlName(), false);
		this.loadOnDemandSrv.manageIndexing(this.getControlName(), 0);
	}

	open() {
		this.focusedControlId = this.getControlName();
		setTimeout(() => {
			const kendoListScroll = document.querySelectorAll('.k-list-content');
			kendoListScroll.forEach((el) => {
				el.scrollTop = 0;
			});
		}, magicNumber.twoHundred);
	}

	focus() {
		this.searchText = '';
		this.searchIndex = this.numberZero;

		this.focusedControlId = this.getControlName();
		this.manageLoadOnDemand();
		this.onFocus.emit();

		if (this.version == "new" && !this.isLoadOnDemand) {
			this.multiselect.toggle(false);
		}
	}

	public valueChange(value: any): void {
		this.searchText = '';
	}


	@HostListener('window:click', ['$event.target'])
	scroll() {
		if (!this.isLoadOnDemand || !this.apiAddress)
			return;

		const kendoListScroll = document.querySelectorAll('.k-list-content');
		kendoListScroll.forEach((el) => {
			fromEvent(el, 'scroll').pipe(debounceTime(magicNumber.twoHundred)).pipe(takeUntil(this.unsubscribe$))
				.subscribe((event) => {
					el.setAttribute('id', this.getControlName());
					const isScrolledToBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - magicNumber.ten;
					if (this.focusedControlId && isScrolledToBottom && el.getAttribute('id') === this.getControlName()) {

						this.searchIndex++;
						const currentScrollPosition = el.scrollTop;

						if (this.loadOnDemandSrv.isLastPage(this.getControlName()))
							return;

						this.loadOnDemandSrv.manageIndexing(this.getControlName(), this.searchIndex);
						this.loadMoreRecord();
						setTimeout(() => {
							el.scrollTop = el.scrollHeight-magicNumber.threeHundredTwenty;
						  }, magicNumber.fifty);

					}
				});
		});
	}


	ngAfterViewInit() {
		if (this.version == 'new' && !this.isLoadOnDemand) {
			const contains = (value: any) =>
				(s: any) =>
					s.Text.toLowerCase().indexOf(value.toLowerCase()) !== magicNumber.minusOne;
			this.multiselect.filterChange
				.asObservable()
				.pipe(switchMap((value) =>
					from([this.list]).pipe(
						tap(() =>
							(this.multiselect.loading = true)),
						delay(magicNumber.hundred),
						map((data) =>
							data.filter(contains(value)))
					))).pipe(takeUntil(this.unsubscribe$))
				.subscribe((x) => {
					this.data = x;
					this.multiselect.loading = false;
				});
		}
		if (this.multiselectElement) {
			this.renderer.listen(this.multiselectElement.nativeElement, 'click', (event: Event) => {
			  this.onMultiselectClick(event);
			});
		  }
    }
	onMultiselectClick(event: Event) {
		if (event.target === this.multiselectElement.nativeElement) {
			if (this.multiselect) {
				this.multiselect.focus();
				this.popup=!this.popup;
				this.multiselect.toggle(this.popup);
				
		  }
		}
	  }
	ngOnChanges(changes: SimpleChanges): void {
		if (this.isLoadOnDemand && this.apiAddress) {
			this.list.length = 0;

			if (!this.pageSize) {
				this.pageSize = this.numberTen;
			}
			else if (this.pageSize && this.pageSize < this.numberTen) {
				this.pageSize = this.numberTen;
			}
		}

		this.parentF.form.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((a: any) => {
			if (this.formControl.value != null && this.formControl.value != undefined && this.formControl.value != '' && this.version == 'new') {
				this.data = this.formControl.value;
			}
		});
		if (changes['list'].currentValue?.length > magicNumber.zero) {
			this.list = changes['list'].currentValue;
		}
	}

	OnChange(event: any) {
		this.onChange.emit(event);
		this.manageLoadOnDemand(false, true);
	}


	OnFilter(evt: any) {
		if (!this.focusedControlId) return;

		this.searchText = evt;
		this.searchIndex = 0;
		this.onFilter.emit(evt);
		
		if(!this.isLoadOnDemand) {
			this.manageLoadOnDemand(true);
		}
		else {
			this.searchSubject.next(evt);
		}

	}

	public onValueChange(evt: any) {
		if (this.isLoadOnDemand && this.apiAddress) {
			let values: any[] = [];
			evt.map((item: any) => {
				const isExists = values.some((x: any) =>
					x.Value == item.Value);
				if (isExists) {
					values = values.filter((x: any) =>
						x.Value != item.Value);
				}
				else {
					values.push(item);
				}
			});

			this.formControl.setValue(values);
			if(values.length === 0) {
				this.setInitialIndex();
			}
		}
	}

	private manageLoadOnDemand(isFilter: boolean = false, isInitialCondition: boolean = false) {
		if (!this.isLoadOnDemand || !this.apiAddress)
			return;

		if (isInitialCondition) {
			this.list = this.loadOnDemandSrv.getInitialDataSet(this.getControlName());
			return;
		}

		if (!isFilter && this.list.length == this.numberZero) {
			this.loadOnDemandSrv.manageIndexing(this.getControlName(), this.numberZero);
			this.loadMoreRecord();
			return;
		}

		this.list = [];
		this.loadOnDemandSrv.manageIndexing(this.getControlName(), this.numberZero);
		clearTimeout(this.alertTimeout);


		// Set a new timeout for 0.5 seconds
		this.alertTimeout = setTimeout(() => {
			this.loadMoreRecord();
		}, magicNumber.fiveHundred);

	}

	private loadMoreRecord() {
		if (this.isLoadingMore) return;
		this.isLoadingMore = true;
		const pagingData: any = {
			byPassLoader: true,
			entityId: this.xrmEntityId,
			entityType: this.entityType,
			columnName: this.columnName,
			pageSize: this.pageSize,
			searchText: this.searchText,
			userValues: this.userValues,
			pageIndex: this.loadOnDemandSrv.getPageIndex(this.getControlName())
		};

		this.loadOnDemandSrv.manageLoader(this.getControlName(), true);
		this.gridViewSrv.cancelloadDropdownDataOnDemandRequest();

		this.gridViewSrv.loadDropdownDataOnDemand(this.apiAddress, pagingData, this.isApiGateway).pipe(
			finalize(() => {
			  this.isLoadingMore = false;
			  this.loadOnDemandSrv.manageLoader(this.getControlName(), false);
			  this.cdr.detectChanges();
			}),
			takeUntil(this.unsubscribe$)
		)
		    .subscribe((res: any) => {
				if (res.Succeeded) {

					const newData = this.isLocalizedData
							? this.loadOnDemandSrv.transformData(res.Data[0].data)
							: res.Data[0].data,
						newlist: any[] = [];

					newData.map((item: any) => {
						const isExists = this.list.some((x: any) =>
							x.Value === item.Value);
						if (!isExists) {
							newlist.push(item);
						}
					});

					this.list = [...this.list, ...newlist];

					// this.loadOnDemandSrv.manageLoader(this.getControlName(), false);
					this.loadOnDemandSrv.manageInitialDataSet(this.getControlName(), newData);
					this.loadOnDemandSrv.managePage(this.getControlName(), newData.length < this.pageSize);
				}
				this.cdr.markForCheck();
			});

	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();

	}

}
