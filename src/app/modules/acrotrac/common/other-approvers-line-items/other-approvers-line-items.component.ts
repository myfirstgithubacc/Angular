
import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import {
	SelectableSettings
} from "@progress/kendo-angular-grid";
import { LineItemsObj, OriginalObj, UkeyData } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-other-approvers-line-items',
	templateUrl: './other-approvers-line-items.component.html',
	styleUrls: ['./other-approvers-line-items.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtherApproversLineItemsComponent implements OnInit {

  @Input() HeaderValues: Record<string, string | null> = {};
  @Input() FooterValues: OriginalObj;
  @Input() dayOrder: (keyof OriginalObj)[];
  @Input() ukeyData: UkeyData;

  public approverLineItems: LineItemsObj[] = [];

  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public selectableSettings: SelectableSettings;


  public showTooltip(e: MouseEvent): void {
  	const element = e.target as HTMLElement;
  	if (
  		(element.nodeName === "TD" || element.className === "k-column-title") &&
				element.offsetWidth < element.scrollWidth
  	) {
  		this.tooltipDir.toggle(element);
  	} else {
  		this.tooltipDir.hide();
  	}
  }

  ngOnInit(): void {
  	this.manipulateUkeyData(this.ukeyData);
  }

  private manipulateUkeyData(uData: UkeyData){
  	this.approverLineItems = uData.TimeAdjustmentChargeShift.reduce<LineItemsObj[]>((acc, chargeShift) => {
  		const filteredDetails = chargeShift.TimeAdjustmentDetails.filter((dayDetail) =>
  			dayDetail.InlineViewDisabled &&
			dayDetail.EntryType === 'Adjustment' &&
			dayDetail.TimeEntryId !== Number(magicNumber.zero));

  		filteredDetails.forEach((dayDetail) => {
  			const lineItemsObj: LineItemsObj = {
  				CostAccountingCodeName: chargeShift.CostAccountingName ?? '',
  				ApproverName: dayDetail.ApproverName,
  				ShiftName: chargeShift.ShiftName ?? '',
  				HourType: chargeShift.HoursTypeName ?? '',
  				Sunday: dayDetail.Sunday,
  				Monday: dayDetail.Monday,
  				Tuesday: dayDetail.Tuesday,
  				Wednesday: dayDetail.Wednesday,
  				Thursday: dayDetail.Thursday,
  				Friday: dayDetail.Friday,
  				Saturday: dayDetail.Saturday,
  				TotalHours: dayDetail.TotalHour
  			};

  			acc.push(lineItemsObj);
  		});

  		return acc;
  	}, []);

  	this.FooterValues = this.getLineItemTotal(this.approverLineItems);
  }


  public getLineItemTotal(list: LineItemsObj[]) {
  	return list.reduce((acc, curr) => {
	 acc.Sunday += curr.Sunday || magicNumber.zero;
	 acc.Monday += curr.Monday || magicNumber.zero;
	 acc.Tuesday += curr.Tuesday || magicNumber.zero;
	 acc.Wednesday += curr.Wednesday || magicNumber.zero;
	 acc.Thursday += curr.Thursday || magicNumber.zero;
	 acc.Friday += curr.Friday || magicNumber.zero;
	 acc.Saturday += curr.Saturday || magicNumber.zero;
	 acc.TotalHours += curr.TotalHours || magicNumber.zero;
	 return acc;
  	}, {
	 Sunday: magicNumber.zero, Monday: magicNumber.zero, Tuesday: magicNumber.zero,
	 Wednesday: magicNumber.zero, Thursday: magicNumber.zero, Friday: magicNumber.zero,
	 Saturday: magicNumber.zero, TotalHours: magicNumber.zero
  	});
  };


}
