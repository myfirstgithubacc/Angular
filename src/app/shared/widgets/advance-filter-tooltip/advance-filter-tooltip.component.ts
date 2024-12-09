
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Position } from '@progress/kendo-angular-tooltip';
import { LocalizationObject, SelectedAdvanceFilter } from '@xrm-shared/models/manage-advance-filter.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { controltype } from '@xrm-shared/services/common-constants/controltypes';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-advance-filter-tooltip',
	templateUrl: './advance-filter-tooltip.component.html',
	styleUrls: ['./advance-filter-tooltip.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvanceFilterTooltipComponent implements OnInit {
	public controltype = controltype;
	@Input() label: string;
	@Input() position: Position;
	@Input() labelLocalizeParam: DynamicParam[] = [];
	@Input() popoverbodyLocalizeParam: DynamicParam[] = [];
	@Input() AppliedfilterCount: number;
	@Input() SelectedAdvanceFilter: SelectedAdvanceFilter[];
	@Input() entityId: XrmEntities | null = null;
	@Output() clickOnAppliedFilter: EventEmitter<boolean>;

	public xrmEntityId: typeof XrmEntities;
	public sectorEntityId = XrmEntities.Sector;

	constructor(private localizationService: LocalizationService) { }

	ngOnInit(): void {
		this.xrmEntityId = XrmEntities;
	}

	private getObject(array: DynamicParam[]): LocalizationObject | null {
		if (array.length == Number(magicNumber.zero)) return null;
		return this.localizationService.GetParamObject(array);
	}

	public getDataFromFilter() {
		this.clickOnAppliedFilter.emit(true);
	}

	public TransformLocalizedKey(key: string): string {
		const hardcoded: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
		return this.localizationService.GetLocalizeMessage(key, hardcoded);
	}

	public transformTime(time: string) {
		const dateTime: Date | null = this.getDateAndTime(time);
		return this.localizationService.TransformTime(dateTime);
	}

	public transformDate(date: string) {
		const dateTime: Date | null = this.getDateAndTime(date);
		return this.localizationService.TransformDate(dateTime);
	}

	// only for sector
	public transformLocalizedKey(key: string): string {
		if (this.entityId === XrmEntities.Sector && key === 'SectorCode') {
			key = 'SectorId';
		}
		const hardcoded: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
		return this.localizationService.GetLocalizeMessage(key, hardcoded);
	}


	private getDateAndTime(val: string): Date | null {
		if (!val)
			return null;
		const components = val.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) (AM|PM)/);
		if (!components) {
			// Handle invalid input format
			return null;
		}
		// eslint-disable-next-line one-var
		const isoString = this.getISODateTime(components[1], components[2], components[3], components[4], components[5], components[6]);
		return new Date(Date.parse(isoString));
	}

	// eslint-disable-next-line max-params
	private getISODateTime(month: string, day: string, year: string, hours: string, minutes: string, ampm: string): string {
		// eslint-disable-next-line no-nested-ternary
		const newHours = (ampm === 'PM' && parseInt(hours, 10) !== Number(magicNumber.tweleve))
			? parseInt(hours, 10) + magicNumber.tweleve
			: (hours === '12' && ampm === 'AM')
				? '00'
				: hours;

		return `${year}-${month}-${day}T${newHours}:${minutes}`;
	}
	public getColumnHeader(item: SelectedAdvanceFilter): string {
		if (!item.dynamicParam)
			return this.localizationService.GetLocalizeMessage(item.columnHeader);
		const dynamicParam: DynamicParam[] = [];
		item.dynamicParam.split(',').map((key: string) => {
			dynamicParam.push({ Value: key, IsLocalizeKey: true });
		});
		return this.localizationService.GetLocalizeMessage(item.columnHeader, dynamicParam);
	}
}
