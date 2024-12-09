/* eslint-disable one-var */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Renderer2 } from '@angular/core';
import { GetMealBreakData, MealBreak, MealBreakDetail } from '../adjustment-manual/enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { TimeAdjustmentService } from 'src/app/services/acrotrac/time-adjustment.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { addOneDay, areDatesEqual, getDateSixDaysBefore, subtractOneDayUsingDate } from '../../../common/time-in-out/time-in-out-function';
import { INumberDropdown } from '@xrm-shared/models/common.model';


@Component({
	selector: 'app-in-out-view',
	templateUrl: './in-out-view.component.html',
	styleUrl: './in-out-view.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InOutViewComponent implements OnInit {
	public data: MealBreak;
	public numbers = ["1st", "2nd", "3rd", "4th", "5th"];
	@Input() isShow: boolean= false;
	@Input() timeId:number = magicNumber.zero;
	@Input() selectedDate:string = '';
	@Input() weekEndingDate:any;
	@Input() mealBreakConfigurationData:GetMealBreakData;
	public mealBreakNumber = ["1stMealBreak", "2ndMealBreak", "3rdMealBreak"];
	public isPrevDisabled: boolean = false;
	public isNextDisabled: boolean = false;
	public MealBreakStatusEnum:INumberDropdown[] = [
		{ Value: Number(magicNumber.twoEightyFive), Text: "NotTaken"},

		{Value: Number(magicNumber.twoEightySix), Text: "Taken"
		},
		{
			Value: Number(magicNumber.twoEightySeven), Text: "Partial"
		},

		{
			Value: Number(magicNumber.twoEightyEight), Text: "Waived"
		}

	];


	constructor(
				private timeServ: TimeAdjustmentService,
				private cdr: ChangeDetectorRef,
				private renderer: Renderer2
	){
		this.renderer.addClass(document.body, 'scrolling__hidden');
	}

	ngOnInit(){
		this.getDatabyId(this.selectedDate);
	}

	public convertTo12HourFormat(timeString: string | undefined | null){
		if(!timeString){
			return '';
		}
		if(timeString.includes("hh:mm:ss")){
			return '';
		}
		const [hours, minutes] = timeString.split(':');
			 let hoursNum = parseInt(hours);
		// eslint-disable-next-line one-var
		const period = hoursNum >= Number(magicNumber.tweleve)
			? 'PM'
			: 'AM';
		hoursNum = hoursNum % Number(magicNumber.tweleve) ||Number(magicNumber.tweleve);
		return `${hoursNum}:${minutes} ${period}`;
	  }


	 public Cancel(){
		this.isShow = false;
		this.renderer.removeClass(document.body, 'scrolling__hidden');
	  }

	  public convertMealBreakInMin(hours: number): number {
		let min = Number(magicNumber.zero);
		if(hours > Number(magicNumber.zero)){
			min = Math.round(magicNumber.sixty * (hours));
		}
		return min;
	}

	  public getDatabyId(date:string){
		  this.timeServ.getInOutViewDetails(this.timeId, date).subscribe((res:GenericResponseBase<MealBreak>) => {
		       	if(isSuccessfulResponse(res)){
	   		this.data = res.Data;
				if (areDatesEqual(this.selectedDate, this.weekEndingDate)) {
					this.isNextDisabled = true;
					this.isPrevDisabled = false;
					this.cdr.markForCheck();
				}

				else if (areDatesEqual(this.selectedDate, getDateSixDaysBefore(this.weekEndingDate))) {
					this.isNextDisabled = false;
					this.isPrevDisabled = true;
					this.cdr.markForCheck();
				} else {
					this.isNextDisabled = false;
					this.isPrevDisabled = false;
					this.cdr.markForCheck();
				}

		   		this.data.MealBreakDetails.flatMap((d:MealBreakDetail) => {
		   			d.MealBreakTypeId = this.getValueOfMealBreak(Number(d.MealBreakTypeId));
		   		});
	   	}

		   });
	  }

	public getValueOfMealBreak(id:number | null){
		let data: {Text: string, Value: number} | undefined;
		if(id){
			data = this.MealBreakStatusEnum.find((item:INumberDropdown) => {
				return Number(item.Value) === id;
			});
		}
		return data?.Text || null;

	  }

	  	 public prev(Date:string){
		this.selectedDate = subtractOneDayUsingDate(Date);
		this.getDatabyId(this.selectedDate);
	  }

	 public next(Date:string){
		this.selectedDate = addOneDay(Date);
		this.getDatabyId(this.selectedDate);
	  }


}

