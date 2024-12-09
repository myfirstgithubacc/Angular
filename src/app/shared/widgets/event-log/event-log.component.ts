/* eslint-disable max-lines-per-function */
/* eslint-disable no-magic-numbers */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { DataBindingDirective, GridComponent } from '@progress/kendo-angular-grid';
import { MaskFormatPipe } from '@xrm-shared/pipes/mask-format.pipe';
import { ExpansionPanelActionEvent, ExpansionPanelComponent } from '@progress/kendo-angular-layout';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { AuditLogs, EventData } from './models/event-log.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ColumnValueType } from '@xrm-shared/services/Localization/column-value-type.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Data } from '@angular/router';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { AuditLogDataItem } from '@xrm-shared/models/event.model';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';

@Component({
	selector: 'event-log',
	templateUrl: './event-log.component.html',
	styleUrls: ['./event-log.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventLogComponent implements OnInit, OnChanges {
	@ViewChild(DataBindingDirective)
		dataBinding!: DataBindingDirective;
	@ViewChild('auditLog') auditLog: ElementRef;
	@ViewChild('searchBox', { static: false }) searchBox: TextBoxComponent;
	@ViewChild('grid') grid: GridComponent;
	@Input() entityId: number;
	@Input() recordId: number | any;
	@Input() unitType: string;
	@Input() isSegment: boolean = false;
	@Input() allSegmentList: { LocalizedKey: string }[] = [];
	public entity: number;
	public isupdated: boolean = true;
	public isupdateSubscription: Subscription;
	public expanded: boolean = false;
	public record: number;
	public eventLogData: EventData[];
	private data: AuditLogDataItem[] = [];
	public gridView!: any[];
	public mySelection: string[] = [];
	public buttonCount = magicNumber.two;
	public sizes = [magicNumber.ten, magicNumber.twenty, magicNumber.fifty];
	public dateFormat: string = '';
	public dateTimeFormat: string = '';
	public currencyFormat: string = '';
	public decimalPlaces = magicNumber.zero;
	public cultureCode: string | null = 'en-US';
	public cultureArray: string[] = ['date', 'time', 'datetime', 'html', 'number'];
	public phoneMask: string = '';
	private yesText: string = 'Yes';
	private noText: string = 'No';
	private activateText: string = 'Activate';
	private deActivateText: string = 'Deactivate';
	public timeCultureEnum = CultureFormat.TimeFormat;
	countryId: string | null;
	currencyCode: string;
	private unsubscribe$ = new Subject<void>();
	public expandedDetailKeys: number[] = [];
	expandDetailsBy = (dataItem: Data): number => {
		return this.gridView.indexOf(dataItem);
	};


	// eslint-disable-next-line max-params
	constructor(
		private services: EventLogService,
		private cd: ChangeDetectorRef,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private maskFormat: MaskFormatPipe,
		private eRef: ElementRef,
		private sessionSrv: SessionStorageService

	) {
		this.dateFormat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		this.dateTimeFormat = this.localizationService.GetCulture(CultureFormat.DateTimeFormat);
		this.cultureCode = this.sessionSrv.get(CultureFormat[CultureFormat.ClientCultureCode]);
	}

	ngOnInit(): void {
		this.countryId = this.sessionSrv.get(CultureFormat[CultureFormat.CountryId]);
		this.currencyCode = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
		this.yesText = this.localizationService.GetLocalizeMessage(this.yesText);
		this.noText = this.localizationService.GetLocalizeMessage(this.noText);
		this.activateText = this.localizationService.GetLocalizeMessage(this.activateText);
		this.deActivateText = this.localizationService.GetLocalizeMessage(this.deActivateText);

		this.isupdateSubscription = this.services.isUpdated.pipe(takeUntil(this.unsubscribe$))
			.subscribe((d) => {
				if (d) {

					this.expanded = false;
					this.expandedDetailKeys = [];
					this.searchBox.value = '';
					this.grid.pageChange.emit({
						skip: 0,
						take: 10
					});
					this.loadData();
				};
			});

	}

	ngOnChanges(changes: SimpleChanges): void {
		this.entity = changes['entityId'].currentValue;
		this.record = changes['recordId'].currentValue;
	}


	// Panel Bar Expand Collapse Actions.
	public onAction(event: ExpansionPanelActionEvent): void {
		// refresh

		this.services.recordIdObs.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data) => {
				this.record = data;
			});

		// eslint-disable-next-line one-var
		this.services.entityIdObs.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data) => {
				this.entity = data;
			});

		try {
			if (event.action === 'expand' && this.isupdated) {
				this.expandedDetailKeys = [];
				this.loadData();
				this.expanded = true;
			} else if (event.action === 'collapse') {
				this.expandedDetailKeys = [];
				this.services.isUpdated.next(false);
				this.expanded = false;
				this.searchBox.value = '';
				this.grid.pageChange.emit({
					skip: 0,
					take: 10
				});
			}
		}
		catch (ex) {
			console.log(ex);
		}
	}

	// binding in grid
	public bind(data: EventData[]): void {
		const fieldTransformations: Record<string, Record<string, string>> = {
			'Disabled': { 'True': 'Deactivate', 'False': 'Activate' },
			'ClientPaysStaffingAgencyDirectly': { 'True': 'Yes', 'False': 'No' }
		};
		data.forEach((e: EventData) => {
			e.AuditLogs.forEach((f: AuditLogs) => {

				const field = f.Field??'',
					oldValue = f.OldValue??'',
					newValue = f.NewValue??'';

				if (field in fieldTransformations) {
					f.OldValue = fieldTransformations[field][oldValue] || oldValue;
					f.NewValue = fieldTransformations[field][newValue] || newValue;
				}
			});
		});
		this.gridView = data;
		this.cd.detectChanges();
	}

	public onFilter(inputValue: string): void {
		if (inputValue.length == Number(magicNumber.zero)) {
			this.expandedDetailKeys = [];
			this.gridView = this.data;
			return;
		}

		this.gridView = [];
		this.data.map((item: AuditLogDataItem) => {
			const data = this.filterItem(item, inputValue);
			if (data) {
				this.expandedDetailKeys = [];
				this.gridView.push(data);
				this.grid.pageChange.emit({
					skip: 0,
					take: 10
				});
			}
		});
	}

	private loadData() {
		if (!this.entity) {
			return;
		}
		this.services.getEventLogData(this.entity, this.record).pipe(takeUntil(this.unsubscribe$))
			.subscribe((result: ApiResponse) => {
				this.data = this.transformData(result.Data);
				this.gridView = this.data;
				this.services.isUpdated.next(false);
				this.cdr.detectChanges();
			});
	}


	private containsSubstring(input: any, target: string) {
		if (input == null || input.length == Number(magicNumber.zero))
			return false;
		input = input.toString().toLowerCase();
		return input.includes(target.toLowerCase());
	}

	private filterItem(item: any, inputValue: string) {
		const containsInItem = Object.keys(item).some((k) =>
				this.containsSubstring(item[k], inputValue)),
			logs = item.AuditLogs.filter((log: any) =>
				Object.keys(log).some((k) =>
					this.containsSubstring(log[k], inputValue)));

		if (containsInItem)
			return item;

		if (logs.length > magicNumber.zero) {
			const duplicateItem = {
				...item,
				AuditLogs: logs
			};
			return duplicateItem;
		}

		return null;
	}

	// eslint-disable-next-line no-shadow
	public hasSubSection(auditLogs: any[]): boolean {
		return auditLogs.some((log) =>
			log.SubSection);


	}

	public containsHTMLTags(input: string): boolean {
		const element = document.createElement('div');
		element.innerHTML = input;
		// eslint-disable-next-line no-magic-numbers
		return element.getElementsByTagName('*').length > Number(magicNumber.zero);
	}

	public phoneFormat(countryId: string | null, val: string | null | undefined) {

		if (!countryId || !val)
			return val;

		val = val.trim();
		const phoneExtMask = this.localizationService.GetCulture(CultureFormat.PhoneExtFormat, countryId),
			value = val.split(","),
			phoneVal = value[0]?.trim(),
			phoneExtVal = value[1]?.trim();

		let result = '';
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (val.indexOf(',') == magicNumber.minusOne || val.endsWith(',')) {
			result = this.localizationService.TransformData(phoneVal, CultureFormat.PhoneFormat, countryId);
		}

		if (phoneExtVal)
			result = (`${this.localizationService.TransformData(phoneVal, CultureFormat.PhoneFormat, countryId)} ${this.localizationService.GetLocalizeMessage('PhoneExt')} ${this.maskFormat.transform(phoneExtVal, phoneExtMask)}`);

		return result;
	}

	// eslint-disable-next-line max-lines-per-function
	private transformData(data: AuditLogDataItem[]): AuditLogDataItem[] {
		const result: AuditLogDataItem[] = [],
			dynamicParam: DynamicParam[] = [
				{ Value: this.currencyCode, IsLocalizeKey: false },
				{ Value: this.unitType, IsLocalizeKey: false }
			];

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		data.filter((aItem: AuditLogDataItem) => {
			aItem.UserGroup = this.localizationService.GetLocalizeMessage(aItem.UserGroup);
			aItem.Action = this.localizationService.GetLocalizeMessage(aItem.Action);
			aItem.Device = this.localizationService.GetLocalizeMessage(aItem.Device);
			aItem.ActionDate = this.localizationService.TransformData(aItem.ActionDate, CultureFormat.DateFormat);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			aItem.AuditLogs.filter((bItem: AuditLogs) => {
				const countryId = bItem.CountryId ?? this.localizationService.GetCulture(CultureFormat.CountryId),
					zipLabelLocalizedKey = this.localizationService.GetCulture(CultureFormat.ZipLabelLocalizedKey, countryId),
					stateLabelLocalizedKey = this.localizationService.GetCulture(CultureFormat.StateLabelLocalizedKey, countryId);

				switch (bItem.ValueType) {
					case ColumnValueType[ColumnValueType.Date]:
					{
						bItem.OldValue = this.localizationService.TransformData(bItem.OldValue, CultureFormat.DateFormat);
						bItem.NewValue = this.localizationService.TransformData(bItem.NewValue, CultureFormat.DateFormat);
						break;
					}
					case ColumnValueType[ColumnValueType.Time]:
					{
						bItem.OldValue = this.localizationService.TransformData(bItem.OldValue, CultureFormat.TimeFormat);
						bItem.NewValue = this.localizationService.TransformData(bItem.NewValue, CultureFormat.TimeFormat);
						break;
					}
					case ColumnValueType[ColumnValueType.Phone]:
						bItem.OldValue = this.phoneFormat(this.countryId, bItem.OldValue);
						bItem.NewValue = this.phoneFormat(this.countryId, bItem.NewValue);
						break;
					case ColumnValueType[ColumnValueType.Number]:
						bItem.OldValue = this.localizationService.TransformNumber(bItem.OldValue, magicNumber.two, countryId);
						bItem.NewValue = this.localizationService.TransformNumber(bItem.NewValue, magicNumber.two, countryId);
						break;
					case ColumnValueType[ColumnValueType.Boolean]:
						bItem.OldValue = this.getBooleanValue(bItem.OldValue, bItem.Field);
						bItem.NewValue = this.getBooleanValue(bItem.NewValue, bItem.Field);
						break;
					case ColumnValueType[ColumnValueType.Zip]:
						bItem.Field = this.localizationService.GetLocalizeMessage(zipLabelLocalizedKey);
						break;
					case ColumnValueType[ColumnValueType.State]:
						bItem.Field = this.localizationService.GetLocalizeMessage(stateLabelLocalizedKey);
						break;
				}

				if(this.isSegment && this.allSegmentList.length) {
					const segmentField = bItem.Field,
						segmentIndex = bItem.Field?.indexOf("Segment");
					if (segmentIndex !== -1 && segmentIndex !== undefined) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const indexNumber: string | undefined = segmentField?.substring(segmentIndex + "Segment".length);
						if(`Segment${indexNumber}` === bItem.Field) {
							bItem.Field =
							this.localizationService.GetLocalizeMessage(this.allSegmentList[parseInt(indexNumber??'') -1]?.LocalizedKey??bItem.Field);
						} else if (this.unitType) {
							bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field, dynamicParam);
						} else {
							bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field);
						}
					} else if (this.unitType) {
						bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field, dynamicParam);
					} else {
						bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field);
					}
				} else if(bItem.Field == 'PreferredSector') {
					bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field, [{ Value: 'Sector', IsLocalizeKey: true }]);
				} else if (this.unitType) {
					bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field, dynamicParam);
				} else {
					bItem.Field = this.localizationService.GetLocalizeMessage(bItem.Field);
				}
				bItem.Section = this.localizationService.GetLocalizeMessage(bItem.Section);
				bItem.SubSection = this.localizationService.GetLocalizeMessage(bItem.SubSection);

			});

			result.push(aItem);
		});

		return result;
	}

	private getBooleanValue(value: string | null | undefined, fieldName: string | null | undefined) {
		const trueText = fieldName == 'Disabled'
				? this.activateText
				: this.yesText,
			falseText = fieldName == 'Disabled'
				? this.deActivateText
				: this.noText;

		return value && value.toLowerCase() == 'true'
			? trueText
			: falseText;
	}


	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
