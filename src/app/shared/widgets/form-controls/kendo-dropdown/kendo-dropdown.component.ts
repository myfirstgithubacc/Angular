
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import {
	ControlContainer,
	FormControl,
	FormGroupDirective
} from '@angular/forms';
import { ComboBoxComponent, DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { IList } from '@xrm-shared/Utilities/list.interface';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LoadOnDemandService } from '@xrm-shared/services/load-on-demand.service';
import { debounceTime, delay, from, fromEvent, map, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
	selector: 'app-kendo-dropdown',
	templateUrl: './kendo-dropdown.component.html',
	styleUrls: ['./kendo-dropdown.component.scss'],
	viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
	providers: [AuthCommonService],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoDropdownComponent implements OnChanges, OnInit {
	public formControl!: FormControl;
	private unsubscribe$ = new Subject<void>();
	@Input() set controlName(value: string) {
		this.setFormControlName = value;
		this.formControl = this.parentF.form.get(value) as FormControl;
		this.formControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.cdr.markForCheck();
		});

	}
	@Input() listControlName: FormControl | null = null;
	@Input() version: string = 'old';
	@Input() valuePrimitive: boolean = false;
	@Input() isSingleSelect: boolean = false;
	@Input() list: ListItem[] | any = [];
	@Input() isRequired: boolean = false;
	@Input() label: string = '';
	@Input() placeholder: string = '';
	@Input() isEditMode: boolean = false;
	@Input() isDisabled: boolean;
	@Input() isValuePrimitiveAllowed: boolean;
	@Input() tooltipTitle: string = '';
	@Input() tooltipVisible: boolean = false;
	@Input() isAppend: boolean = false;
	@Input() specialCharactersAllowed: string[] = [];

	@Input() specialCharactersNotAllowed: string[] = [];

	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	@Input() singleItemautoLable: boolean = false;
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() isSpecialCharacterAllowed: boolean = true;
	@Input() isHtmlContent: boolean = false;
	@Input() xrmEntityId: XrmEntities | null = null;
	@Input() fieldName: string | null = null;
	@Input() entityType: string | null = null;
	@Input() helpTexts: string[] = [];

	@Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];
	@Input() getLoadSuccessfullData: boolean = false;
	isRendered: boolean = true;

	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() focus: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() onLoadSuccessfullData: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild('comboBox', { static: false })
	private comboBox!: ComboBoxComponent;
	// selectedValue: ListItem | null = null;
	public data: IList[];

	// for load on demand

	@Input() isLoadOnDemand: boolean = false;

	@Input() apiAddress: string | undefined | null = null;

	@Input() pageSize: number = Number(magicNumber.ten);

	@Output() scrollToBottom = new EventEmitter();

	pagingIndex: number;

	@Input() columnName: string | null = null;

	@Input() isLocalizedData: boolean = false;

	@Input() isAdvanceSearch: boolean = false;

	@Input() isApiGateway: boolean = false;

	@Input() userValues: string | null | any = null;

	@Input() searchText: string | null = null;
	// public controlInfo: any[] = [];
	public focusedControlId: string | null = null;
	public searchIndexReset: boolean = false;

	private numberZero = Number(magicNumber.zero);
	private numberTen = Number(magicNumber.ten);
	private alertTimeout: any;

	private setFormControlName: string;
	public searchIndex: number = magicNumber.zero;
	public exportClearTimeOut: any = null;
	// eslint-disable-next-line max-params
	constructor
		(
			private parentF: FormGroupDirective,
			protected cdr: ChangeDetectorRef,
			public loadOnDemandSrv: LoadOnDemandService,
			private commonService: AuthCommonService,
			private gridViewSrv: GridViewService
		) {
	}

	ngOnInit(): void {

		if (this.listControlName) {
			this.listControlName.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((a: string | ListItem | any) => {
				if (a) {
					a = typeof a === 'object'
						? a.Value
						: a;
					const val = this.list.filter((b: { Value: number }) =>
						b.Value === a);
					if (val.length > magicNumber.zero) {
						this.listControlName?.setValue(val[0]);
					}
					else {
						this.comboBox.blur();
						this.comboBox.toggle(false);
					}
				}

			});
		}

		if (!this.xrmEntityId || this.fieldName == null)
			return;

		this.manageAuthorization();
	}

	ngDoCheck(): void {
		if ((this.formControl?.touched && !this.formControl?.valid) || (this.listControlName?.touched && !this.listControlName?.valid)) {
			this.cdr.markForCheck();
		}
	}

	ngOnChanges(changes: SimpleChanges): void {

		this.parentF.form.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((a: string) => {
			this.data = this.list;

		});

		if (this.isLoadOnDemand && this.apiAddress) {
			this.list.length = 0;

			if (!this.pageSize) {
				this.pageSize = this.numberTen;
			}
			else if (this.pageSize && this.pageSize < this.numberTen) {
				this.pageSize = this.numberTen;
			}
		}

		if ((changes['list']?.currentValue?.length == magicNumber.one || this.list?.length == magicNumber.one) && this.singleItemautoLable) {
			this.isEditMode = true;
			this.formControl.setValue(changes['list'].currentValue[0]);
		}

		this.appendToList();
		this.manageAuthorization();

		if (changes['userValues']?.currentValue) {
			this.manageLoadOnDemand(false, false);
		}

	}


	public getControlName() {
		return this.setFormControlName;
	}

	public close() {
		if (this.focusedControlId === this.getControlName()) {
			this.focusedControlId = null;
		}
		this.setInitialIndex();
	}

	public setInitialIndex() {
		this.searchText = "";
		this.searchIndex = 0;
		this.loadOnDemandSrv.managePage(this.getControlName(), false);
		this.loadOnDemandSrv.manageIndexing(this.getControlName(), this.numberZero);
	}

	public appendToList() {
		if (this.isAppend) {
			const controlValue = this.listControlName?.value
				? this.listControlName.value
				: this.formControl.value;
			if (controlValue && this.list?.length) {
				const index = this.list.findIndex((a: { Value: any }) =>
					a.Value?.toString() === controlValue.Value?.toString());
				if (index < magicNumber.zero && controlValue?.Text && controlValue?.Value) {
					this.list.push({ Text: controlValue?.Text, Value: controlValue?.Value?.toString() });
				}
			}
		}
	}

	public manageAuthorization() {
		const result = this.commonService.manageAuthentication({
			xrmEntityId: this.xrmEntityId,
			entityType: this.entityType,
			fieldName: this.fieldName
		});
		this.isVisibleorEditable(result);
	}

	public isVisibleorEditable(result: { isViewable: boolean; isModificationAllowed: boolean }) {
		if (result && this.isEditMode) {
			this.isRendered = result.isViewable;
			if (!this.isRendered)
				return;
			this.isEditMode = !result.isModificationAllowed;
			if (!result.isModificationAllowed)
				this.formControl.clearValidators();
		}
	}

	public clearValidatorsDeligate() {
		this.formControl.clearValidators();
	}

	public OnChange(event: ListItem | string | null) {
		this.manageLoadOnDemand(false, true);
		this.onChange.emit(event);
	}

	public onOpen() {
		this.focusedControlId = this.getControlName();
		this.exportClearTimeOut = setTimeout(() => {
			const kendoListScroll = document.querySelectorAll('.k-list-content');
			kendoListScroll.forEach((el) => {
				el.scrollTop = 0;
			});
		}, magicNumber.twoHundred);
	}

	public onBlur(evt: number) {
		if (this.focusedControlId === this.getControlName()) {
			this.focusedControlId = null;
		}
	}

	public openItem() {
		this.data = this.list;
		this.comboBox.toggle(true);
	}

	public onFocus(event: Event) {
		this.searchText = '';
		this.searchIndex = this.numberZero;

		this.focusedControlId = this.getControlName();
		this.manageLoadOnDemand();
		this.focus.emit(event);
	}

	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};

	public onComboBoxClick(): void {
		this.comboBox.toggle(!this.comboBox.isOpen);
	}

	public OnFilter(evt: string) {
		if (!this.focusedControlId)
			return;

		this.searchText = evt;
		this.searchIndex = 0;

		if (!this.isLoadOnDemand)
			return;

		this.manageLoadOnDemand(true);
	}

	@HostListener('window:click', ['$event.target'])
	public scroll() {
		if (!this.isLoadOnDemand || !this.apiAddress)
			return;

		const kendoListScroll = document.querySelectorAll('.k-list-content');
		kendoListScroll.forEach((el) => {
			fromEvent(el, 'scroll').pipe(debounceTime(magicNumber.twoHundred))
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((event) => {
					el.setAttribute('id', this.getControlName());
					const isScrolledToBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - magicNumber.ten;
					if (this.focusedControlId && isScrolledToBottom && el.getAttribute('id') === this.getControlName()) {

						this.searchIndex++;
						const currentScrollPosition = el.scrollTop;

						this.loadOnDemandSrv.manageIndexing(this.getControlName(), this.searchIndex);
						this.loadMoreRecord();

						el.scrollTop = currentScrollPosition;

					}
				});
		});
	}

	private manageLoadOnDemand(isFilter: boolean = false, isInitialCondition: boolean = false) {
		if (!this.isLoadOnDemand || !this.apiAddress)
			return;

		if (isInitialCondition) {
			this.list = this.loadOnDemandSrv.getInitialDataSet(this.getControlName());
			return;
		}

		if (!isFilter) {
			if (this.list.length == this.numberZero)
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

		this.gridViewSrv.loadDropdownDataOnDemand(this.apiAddress, pagingData, this.isApiGateway)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: any) => {
				if (res.Succeeded) {
					const newData = this.isLocalizedData
						? this.loadOnDemandSrv.transformData(res.Data[0].data)
						: res.Data[0].data;
					if(pagingData.pageIndex == magicNumber.zero) this.list=[];
					newData.map((item: any) => {
						this.list.push(item);
					});
					this.list = [...this.list];
					this.cdr.markForCheck();
					this.loadOnDemandSrv.manageLoader(this.getControlName(), false);
					this.loadOnDemandSrv.manageInitialDataSet(this.getControlName(), newData);
					if(this.getLoadSuccessfullData)
						this.onLoadSuccessfullData.emit(this.list);
				}
			});

	}

	ngAfterViewInit() {
		if (this.version == 'new') {
			const contains = (value: string) =>
				(s: ListItem) =>
					s.Text.toLowerCase().indexOf(value.toLowerCase()) !== -1;
			this.comboBox.filterChange.asObservable().pipe(switchMap((value) =>
				from([this.list]).pipe(
					tap(() =>
						this.comboBox.loading = true),
					delay(magicNumber.hundred),
					map((data) =>
						data.filter(contains(value)))
				))).pipe(takeUntil(this.unsubscribe$))
				.subscribe((x) => {
					this.data = x;
					this.comboBox.loading = false;
				});
		}
	}
	ngOnDestroy(): void {
		clearTimeout(this.exportClearTimeOut);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}

interface ListItem {
	Segment1: string;
	Segment2: string;
	Segment3: string | null;
	Segment4: string | null;
	Segment5: string | null;
	EffectiveStartDate: string;
	EffectiveEndDate: string;
	Description: string;
	Text: string;
	Value: string;
}
