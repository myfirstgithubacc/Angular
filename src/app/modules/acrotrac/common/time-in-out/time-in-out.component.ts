/* eslint-disable max-lines-per-function */
/* eslint-disable one-var */

import { DatePipe } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	Renderer2
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
	animation,
	GetMealBreakData,
	MealBreakStatusEnum,
	MealBreakTypeConst,
	MealBreakType,
	MealBreakPenaltyConfiguration
} from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject } from 'rxjs';
import { TimeAdjustmentService } from 'src/app/services/acrotrac/time-adjustment.service';
import { DayData, DaysOfWeek, getDefaultDayData, MealBreak, MealBreakDetail, mealBreakSubmitData} from '../../Time/timesheet/adjustment-manual/enum';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { addOneDay, areDatesEqual, calculateTotalMin, convertDateStringToTimeString, convertMinutesToHours, convertToDate, getDateSixDaysBefore, subtractOneDayUsingDate, validateMealEntryDates } from './time-in-out-function';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { flashManagerIcon } from '@progress/kendo-svg-icons';

@Component({
	selector: 'app-time-in-out',
	templateUrl: './time-in-out.component.html',
	styleUrls: ['./time-in-out.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeInOutComponent implements OnInit, OnDestroy, AfterViewInit {
	@Input() Ukey: string;
	@Input() public isTimeDetails: boolean = false;
	@Input() public isShow: boolean = false;
	@Input() selectedDate: string = '';
	@Input() weekEndingDate: string;
	@Output() public onClose = new EventEmitter<boolean>();
	@Input() day: DaysOfWeek;
	@Input() timeId: number;
	@Output() apply = new EventEmitter<any>();
	@Input() mealBreakConfigurationData:GetMealBreakData;
	@Input() isManual: boolean = false;
	public isNext: boolean = false;
	public isPrevDisabled: boolean = false;
	public isNextDisabled: boolean = false;
	public TimeInOutForm: FormGroup;
	public mealBreakType = MealBreakTypeConst;
	public totalTimeHours: string | null | number | undefined;
	public restBreaksTaken: boolean = false;
	public saveData: boolean = false;
	public show: boolean = false;
	private ngUnsubscribe = new Subject<void>();
	public dayWiseData: Record<string, any> = {};
	public MealBreakStatusEnums = MealBreakStatusEnum;
	public isPartial: boolean = true;
	@Input() data: Record<DaysOfWeek, DayData>= {
		Sunday: getDefaultDayData(),
		Monday: getDefaultDayData(),
		Tuesday: getDefaultDayData(),
		Wednesday: getDefaultDayData(),
		Thursday: getDefaultDayData(),
		Friday: getDefaultDayData(),
		Saturday: getDefaultDayData()
	};
	public mealBreakNumber = ["1stMealBreak", "2ndMealBreak", "3rdMealBreak"];
	public mealBreakGroup = ["FirstMealGroup", "SecondMealGroup", "ThirdMealGroup"];
	public mealBreakId = [magicNumber.oneEightyOne, magicNumber.oneEightyTwo, magicNumber.oneEightyThree];
	private mealBreakConfigs: MealBreakPenaltyConfiguration[];
	public animation: animation = {
		type: 'slide',
		direction: 'left',
		duration: magicNumber.zero
	};

	// eslint-disable-next-line max-params
	constructor(
		public commonHeaderIcon: CommonHeaderActionService,
		private toasterService: ToasterService,
		private fb: FormBuilder,
		private renderer: Renderer2,
		private timeAdjustService: TimeAdjustmentService,
		private cdr: ChangeDetectorRef,
		private customValidators: CustomValidators,
		private datePipe: DatePipe,
		private localizationService:LocalizationService
	) {
		this.initializeForm();
	}

	ngOnInit(): void {
		this.getDatabyId(this.selectedDate);
	}

	ngAfterViewInit(){
		this.afterIntialization();
		this.cdr.markForCheck();
	}


	private afterIntialization(){
		this.addMealBreakControls(this.mealBreakConfigurationData.NumberOfMealBreak);
		this.TimeInOutForm.get('EntryDate')?.setValue(this.selectedDate);
		this.mealBreakConfigs = this.mealBreakConfigurationData.MealBreakPenaltyConfigurations;
		this.patchFormValues();
		this.cdr.detectChanges();
	}
	   patchFormValues(): void {
		try{
			if (this.data[this.day].EntryDate
			) {
				let entryTimeIn = this.data[this.day].EntryTimeIn;
				let entryTimeOut = this.data[this.day].EntryTimeOut;

				if (typeof entryTimeIn === 'string') {
				  entryTimeIn = new Date(`1970-01-01T${this.convertTo24Hour(entryTimeIn)}`);
				}


				if (typeof entryTimeOut === 'string') {
				  entryTimeOut = new Date(`1970-01-01T${this.convertTo24Hour(entryTimeOut)}`);
				}
				// Patch non-array fields
				this.TimeInOutForm.patchValue({
					Id: [magicNumber.zero],
					EntryTimeIn: entryTimeIn,
					EntryTimeOut: entryTimeOut,
					IsRestBreakUsed: this.data[this.day].IsRestBreakUsed,
					IsMealBreakUsed: this.data[this.day].IsMealBreakUsed,
					TotalMealBreakHours: this.data[this.day].TotalMealBreakHours,
					TotalBillableHours: this.data[this.day].TotalBillableHours,
					PenaltyHours: this.data[this.day].PenaltyHours,
				 MealBreakDetails: this.data[this.day].MealBreakDetails
				});

		  }
		  this.calculatePenaltyHours(this.TimeInOutForm.get('IsRestBreakUsed')?.value);
		  this.calculateTotalBillableHours();
		}
		catch(e){
			console.error(e);
		}
		this.cdr.markForCheck();
	   }


	convertTo24Hour(time: string): string {
		const [timePart, modifier] = time.split(' ');
		 let [hours, minutes] = timePart.split(':');

		if (hours === '12') {
	  hours = modifier === 'AM'
				?
				 '00' :
				  '12';
		} else if (modifier === 'PM') {
	  hours = (parseInt(hours, magicNumber.ten) + magicNumber.tweleve).toString();
		}

		return `${hours}:${minutes}`;
	}

	private initializeForm() {
		this.TimeInOutForm = this.fb.group({
			EntryDate: [null],
			EntryTimeIn: [null, this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'TimeIn', IsLocalizeKey: true }])],
			EntryTimeOut: [null, this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'TimeOut', IsLocalizeKey: true }])],
			IsMealBreakUsed: [false],
			IsRestBreakUsed: [false],
			PenaltyHours: [Number(magicNumber.zero)],
			TotalMealBreakHours: [Number(magicNumber.zero)],
			TotalBillableHours: [Number(magicNumber.zero)],
			MealBreakDetails: this.fb.array([])
		});
	}

	addMealBreakControls(count: number|null): void {
		const mealMealBreaksArray = this.TimeInOutForm.get('MealBreakDetails') as FormArray;
		if(count){
			for (let i = Number(magicNumber.zero); i < count; i++) {
		  mealMealBreaksArray.push(new FormGroup({
					"Id": new FormControl(magicNumber.zero),
					"MealBreakId": new FormControl(''),
					"MealBreakTypeId": new FormControl(magicNumber.twoEightyFive),
					"MealBreakTime": new FormControl(Number(magicNumber.zero)),
					"MealSwitch": new FormControl(false),
					"MealIn": new FormControl(null),
					"MealOut": new FormControl(null)
		  }));
			}
		}
		this.cdr.detectChanges();
	}

	get mealBreakDetails(): FormArray {
		return this.TimeInOutForm.get('MealBreakDetails') as FormArray;
	}

	public getMealBreakControlName(arrayIndex: number, controlName: string): FormControl {
		return this.mealBreakDetails.at(arrayIndex).get(controlName) as FormControl;
	}

	public getMealBreakControlValue(arrayIndex: number, controlName: string) {
		return this.getMealBreakControlName(arrayIndex, controlName).value;
	}

	 public getControlValue(controlName:string){
		return this.getControlName(controlName).value;
	 }

	 public getControlName(controlName:string){
		return this.TimeInOutForm.get(controlName) as FormControl;
	 }

	public onMealTimeChange(index:number, type:string, event:Date){
		try {
			if(!this.getControlValue('EntryTimeIn') || !this.getControlValue('EntryTimeOut')){
				this.getControlName('EntryTimeIn').markAsTouched();
				this.getControlName('EntryTimeOut').markAsTouched();
				this.getMealBreakControlName(index, 'MealIn').setValue(null);
				this.getMealBreakControlName(index, 'MealOut').setValue(null);
				return;
			}
			if(this.getControlValue('EntryTimeIn') && this.getControlValue('EntryTimeOut')){
				this.validateMealInMealOut(index, type, event);
			}
		} catch (error) {
			console.log("error", error);
		}
	}

	validateMealInMealOut(index: number, type: string, event: Date) {
		const entryIn = this.getControlValue('EntryTimeIn');
		const entryOut = this.getControlValue('EntryTimeOut');
		const mealIn = this.getMealBreakControlValue(index, 'MealIn');
		const mealOut = this.getMealBreakControlValue(index, 'MealOut');

		const isMealIn = type === String(MealBreakType.MealIn);
		const mealTime = isMealIn
		 ? mealIn
		  : mealOut;
		const mealControl = this.getMealBreakControlName(index, isMealIn
			 ? 'MealIn'
			  : 'MealOut');

		this.validateMealTimeWithDateHandling({
			entryIn: entryIn,
			entryOut: entryOut,
			mealIn: mealIn,
			mealOut: mealOut,
			type: type,
			index: index
		}, mealControl);
	}

	validateMealTimeWithDateHandling(
		time: { entryIn: Date, entryOut: Date, mealIn: Date, mealOut: Date, type: string, index: number },
		control: FormControl
	) {
		const { entryIn, entryOut, mealIn, mealOut, type } = time;
		let normalizedEntryOut = entryOut;
		if (entryOut <= entryIn) {
			normalizedEntryOut = new Date(entryOut);
			normalizedEntryOut.setDate(normalizedEntryOut.getDate() + magicNumber.one);
		}
		let isNextDayOut = false;
		const extractTime = (date: Date) =>
			date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
		let isValid = true;
		const mealBreakTypeLabel = this.getMealBreakTypeLabel(time.index);

		if(extractTime(entryIn) > extractTime(entryOut)){
			isNextDayOut = true;
		}

		if(extractTime(mealIn) <= extractTime(entryIn)){
			control.setErrors({	error: true, message: this.localizationService.GetLocalizeMessage('MealBreakNotWithinWorkingHours', [{ Value: mealBreakTypeLabel, IsLocalizeKey: false }])});
			return;
		}
		else{
			control.setErrors(null);
		}

		isValid = this.mealInErrorChecks({mealIn, mealOut, entryIn, entryOut}, isNextDayOut);

		if (type === String(MealBreakType.MealIn)) {
			if (extractTime(entryIn) < extractTime(normalizedEntryOut)) {
				if (extractTime(mealIn) <= extractTime(entryIn) || extractTime(mealIn) > extractTime(normalizedEntryOut)) {
					isValid = false;
				}
			}
			else if (!isNextDayOut && !(extractTime(mealIn) > extractTime(entryIn) || extractTime(mealIn) <= extractTime(normalizedEntryOut))) {
				isValid = false;
			}
		}
		if (type === String(MealBreakType.MealOut)) {
			if (extractTime(entryIn) < extractTime(normalizedEntryOut)) {
				if (extractTime(mealOut) <= extractTime(entryIn) || extractTime(mealOut) >= extractTime(normalizedEntryOut)) {
					isValid = false;
				}
			}
			else if (!isNextDayOut && !(extractTime(mealOut) >= extractTime(entryIn) || extractTime(mealOut) < extractTime(entryOut))) {
				isValid = false;
			}
		}


		const totalMin = calculateTotalMin(mealIn, mealOut);

		if (!isValid) {
			control.setErrors({	error: true, message: this.localizationService.GetLocalizeMessage('MealBreakNotWithinWorkingHours', [{ Value: mealBreakTypeLabel, IsLocalizeKey: false }])});
		}
		else if(totalMin === magicNumber.zero){
			control.setErrors({error: true, message: 'MealInOutCannotBeSame' });
		}
		else {
			control.setErrors(null);
			this.checkAndSetOverlapErrors({ mealIn: mealIn, mealOut: mealOut, type: type, index: time.index }, control);
		}

		this.cdr.markForCheck();
	}

	mealInErrorChecks(checks: {mealIn: Date, mealOut: Date, entryIn: Date, entryOut: Date}, nextDayCheck: boolean){
		const { mealIn, mealOut, entryIn, entryOut} = checks,
		 extractTime = (date: Date) =>
				date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
		if(mealIn != null && mealOut != null){
			if(extractTime(mealIn) < extractTime(entryIn)){
				return false;
			}
			if (extractTime(mealIn) > extractTime(mealOut)){
				return false;
			}

			if(extractTime(entryOut) < extractTime(entryIn)){
				if(extractTime(entryIn) <= extractTime(mealIn)){
					return true;
				}
			}
			else if((extractTime(entryIn) <= extractTime(mealIn)) && (extractTime(mealOut) <= extractTime(entryOut))){
				if(extractTime(mealIn) < extractTime(mealOut)){
					return true;
				}
			}
			else
				return false;
		};
		return true;
	}

	getMealBreakTypeLabel(index: number): string {
		switch (index) {
			case magicNumber.zero:
				return '1st Meal Break';
			case magicNumber.one:
				return '2nd Meal Break';
			case magicNumber.two:
				return '3rd Meal Break';
			default:
				return `Meal Break ${index + magicNumber.one}`;
		}
	}

	public checkMealBreakType(index: number, controlName: string) {
		const mealBreakValue = this.getMealBreakControlValue(index, controlName);
		return mealBreakValue === MealBreakStatusEnum.Taken || mealBreakValue === MealBreakStatusEnum.Partial;
	}


	checkAndSetOverlapErrors1(i: number, mealControl: string, formArray: FormArray): void {
		const mealMealBreaksArray = formArray,
		 controls = mealMealBreaksArray.controls;
		controls.forEach((ctrl) => {
		  ctrl.setErrors(null);
		});

		const mealTime = controls[i].get(mealControl)?.value;

		if (!mealTime) {
		  return;
		}

		for (let j = Number(magicNumber.zero); j < controls.length; j++) {
		  if(j!=i){
		 const mealIn2 = controls[j].get('MealIn')?.value;
		  const mealOut2 = controls[j].get('MealOut')?.value;
		  if (!mealIn2 || !mealOut2) continue;
		  if (mealTime >= mealIn2 && mealTime <= mealOut2) {
					this.setOverlapError(i, j, mealControl);
		  }
		  else{
					this.getMealBreakControlName(i, mealControl).
						setErrors(null);
		  }
		  }
		}
	  }

	// eslint-disable-next-line max-lines-per-function
	checkAndSetOverlapErrors(
		time: { mealIn: Date, mealOut: Date, type: string, index: number },
		control: FormControl
	): void {
		const { mealIn, mealOut, type } = time;
		let isValid = true;
		const mealMealBreaksArray = this.TimeInOutForm.get('MealBreakDetails') as FormArray;
		const controls = mealMealBreaksArray.controls;
		controls.map((ctrl: any) => {
			ctrl.get('MealIn').setErrors(null);
			ctrl.get('MealOut').setErrors(null);
		});
		let indexOfMealBreak = 0;
		const previousMeals = this.getPreviousMealBreaks(time.index),
			nextMeals = this.getNextMealBreaks(time.index, mealMealBreaksArray.value.length);

		if(mealIn != null && mealOut != null){


			nextMeals.forEach((nextMeal, index) => {
				if(nextMeal.mealIn){

					if (mealIn >= nextMeal.mealOut) {
						isValid = false;
					}
					if (mealOut >= nextMeal.mealIn) {
						isValid = false;
					}
					if(mealIn >= nextMeal.mealOut){
						isValid = false;
					}
					else if (mealIn > mealOut){
						isValid = false;
					}

					if (Date.parse(`${nextMeal.mealIn}`)){
						indexOfMealBreak = index + magicNumber.one;
					}
				}

			});

			previousMeals.forEach((prevMeal, index) => {
				if (mealIn <= prevMeal.mealOut && mealIn >= prevMeal.mealIn) {
					isValid = false;
				}
				if (mealOut >= prevMeal.mealIn && mealOut <= prevMeal.mealOut) {
					isValid = false;
				}
				if(mealIn <= prevMeal.mealOut){
					isValid = false;
				}
				else if (mealIn > mealOut){
					isValid = false;
				}

				if (Date.parse(`${prevMeal.mealIn}`)){
					indexOfMealBreak = index;
				}
			});

		}
		else if(mealIn != null && mealOut == null){
			nextMeals.forEach((nextMeal, index) => {
				if(nextMeal.mealIn){

					if(mealIn >= nextMeal.mealIn){
						isValid = false;
					}
				}
				if (Date.parse(`${nextMeal.mealIn}`)){
					indexOfMealBreak = index + magicNumber.one;
				}
			});
			previousMeals.forEach((prevMeal, index) => {
				if(mealIn <= prevMeal.mealIn || mealIn <= prevMeal.mealOut){
					isValid = false;
				}
				if (Date.parse(`${prevMeal.mealIn}`)){
					indexOfMealBreak = index;
				}
			});
		}
		else{
			nextMeals.forEach((nextMeal, index) => {
				if(nextMeal.mealIn){

					if(mealOut >= nextMeal.mealIn){
						isValid = false;
					}
				}
				if (Date.parse(`${nextMeal.mealIn}`)){
					indexOfMealBreak = index + magicNumber.one;
				}
			});
			previousMeals.forEach((prevMeal, index) => {

				if(mealOut <= prevMeal.mealOut){
					isValid = false;
				}
				if (Date.parse(`${prevMeal.mealIn}`)){
					indexOfMealBreak = index;
				}
			});
		}

		let mealBreakTypeLabel ='';
		mealBreakTypeLabel = this.getMealBreakTypeLabel(time.index);
		let previousMealLabel = '';
		previousMealLabel = this.getMealBreakTypeLabel(indexOfMealBreak);
		this.TimeInOutForm.markAllAsTouched();
		if (!isValid) {
			control.setErrors({ error: true, message: this.localizationService.GetLocalizeMessage(
				'MealBreakOverLappingValidation',
				[
					{ Value: mealBreakTypeLabel, IsLocalizeKey: false },
					{ Value: previousMealLabel, IsLocalizeKey: false }
				]
			) });
			control.markAsDirty();
			this.cdr.markForCheck();
		}
	}

	getPreviousMealBreaks(currentIndex: number) {
		if(currentIndex === Number(magicNumber.zero)){
			return [];
		}
		const previousMealBreaks = [];
		for (let i = 0; i < currentIndex; i++) {
			const mealIn = this.getMealBreakControlValue(i, 'MealIn');
			const mealOut = this.getMealBreakControlValue(i, 'MealOut');
			previousMealBreaks.push({ mealIn, mealOut });
		}
		return previousMealBreaks;
	}

	getNextMealBreaks(currentIndex: number, length: number) {
		const nextMealBreaks = [];
		if((currentIndex + magicNumber.one) === length){
			return [];
		}
		for (let i = currentIndex + magicNumber.one; i < length; i++) {
			const mealIn = this.getMealBreakControlValue(i, 'MealIn');
			const mealOut = this.getMealBreakControlValue(i, 'MealOut');
			nextMealBreaks.push({ mealIn, mealOut });
		}
		return nextMealBreaks;
	}

	  private setOverlapError(i: number, j: number, mealControl: string): void {
		this.getMealBreakControlName(i, mealControl).
			setErrors({ error: true, message: this.localizationService.GetLocalizeMessage(
				'MealBreakOverLappingValidation',
				[
					{Value: this.mealBreakGroup[i], IsLocalizeKey: false},
					{Value: this.mealBreakGroup[j], IsLocalizeKey: false}
				]
			)});
	  }


	public checkMealTakenTypes(event: number, index: number): void {
		try {
			if (event == Number(MealBreakStatusEnum.NotTaken) || event == Number(MealBreakStatusEnum.Waived)) {
				// const radio = this.get
				['MealIn', 'MealOut', 'MealBreakTime'].forEach((controlName) => {
			  const control = this.getMealBreakControlName(index, controlName),
			  value = this.getMealBreakControlValue(index, controlName);
					if(event == Number(MealBreakStatusEnum.Waived)){
						this.setWaivePartialValidations(event, index);
					}
			  if(controlName == 'MealBreakTime'){
						if(this.TimeInOutForm.get('TotalMealBreakHours')?.value){
							const totalMealBreakHours = this.TimeInOutForm.get('TotalMealBreakHours')?.value - value;
							this.TimeInOutForm.get('TotalMealBreakHours')?.setValue(totalMealBreakHours);
						}

						control.setValue(0.00);

						const mealMealBreaksArray = this.TimeInOutForm.get('MealBreakDetails') as FormArray;
						const controls = mealMealBreaksArray.controls;

						const entryIn = this.getControlValue('EntryTimeIn');
						const entryOut = this.getControlValue('EntryTimeOut');

						controls.forEach((ele, ind) => {
							const mealIn = this.getMealBreakControlValue(ind, 'MealIn');
							const mealOut = this.getMealBreakControlValue(ind, 'MealOut');

							['MealIn', 'MealOut'].forEach((type) => {
								const name = this.getMealBreakControlName(ind, type);
								this.validateMealTimeWithDateHandling({
									entryIn,
									entryOut,
									mealIn,
									mealOut,
									type,
									index: ind
								}, name);
							});
						});

			  }
			  else{
						control.setValue(null);
			  }

			  control.clearValidators();
			  control.updateValueAndValidity();
				});
		  }
		  if(event == Number(MealBreakStatusEnum.Waived) || event === Number(MealBreakStatusEnum.Partial)){
				this.setWaivePartialValidations(event, index);
		  }
			this.TimeInOutForm.markAllAsTouched();
			this.calculatePenaltyHours(this.TimeInOutForm.get('IsRestBreakUsed')?.value);
			this.cdr.detectChanges();
		} catch (error) {
			console.log("error", error);
		}
	}

	private setWaivePartialValidations(event: number, index: number){
		const total= this.getTheDifferenceofTime(),
			RestrictWaiveOffHours = this.mealBreakConfigs[index].RestrictWaiveOffHours;
		if(total && total > RestrictWaiveOffHours){
			this.getMealBreakControlName(index, 'MealBreakTypeId').setErrors({
				error: true,
				message: event === Number(MealBreakStatusEnum.Waived)
					? this.localizationService.GetLocalizeMessage('MealBreakCannotBeWaived', [{Value: String(RestrictWaiveOffHours), IsLocalizeKey: false}])
					: this.localizationService.GetLocalizeMessage('MealBreakCannotBePartial', [{Value: String(RestrictWaiveOffHours), IsLocalizeKey: false}])
			});
			if(event === Number(MealBreakStatusEnum.Partial)){
				this.isPartial = true;
			}
		}else{
			this.getMealBreakControlName(index, 'MealBreakTypeId').setErrors(null);
		}
		this.cdr.markForCheck();

	}

	public changeMealBreakValue(event:boolean){
		if(event){
			this.TimeInOutForm.markAllAsTouched();
			this.TimeInOutForm.get('TotalMealBreakHours')?.setValue(this.mealBreakConfigurationData.DefaultBreakDuration);
		}
		else{
			this.TimeInOutForm.markAsUntouched();
			this.TimeInOutForm.get('TotalMealBreakHours')?.setValue(magicNumber.zeroDotZeroZero);
		}
	}

	public resetFormExceptEntryTimes(event: Date | null) {
		if(event){
			this.setDefaultValues();
		}
	  }

	private setDefaultValues(): void{
		const mealMealBreaksArray = this.TimeInOutForm.get('MealBreakDetails') as FormArray;

		if (mealMealBreaksArray.length > Number(magicNumber.zero)) {
			mealMealBreaksArray.controls.forEach((mealBreakControl) => {
				  mealBreakControl.patchValue({
					MealBreakTime: 0,
					MealIn: null,
					MealOut: null,
					MealBreakTypeId: magicNumber.twoEightyFive
				  });
			});
		  }

		  this.TimeInOutForm.patchValue({
			IsMealBreakUsed: false,
			IsRestBreakUsed: false,
			PenaltyHours: Number(magicNumber.zero),
			TotalMealBreakHours: Number(magicNumber.zero),
			TotalBillableHours: Number(magicNumber.zero)
		  });
	}

	public totalHoursCalculate() {
		const totalHours = this.getTheDifferenceofTime();
		this.cdr.markForCheck();
		this.totalTimeHours = totalHours?.toFixed(magicNumber.two);
		this.TimeInOutForm.get('TotalBillableHours')?.setValue(this.totalTimeHours);
	}

	public calculatePenaltyHours(restBreak: boolean){
		let restBreakPenalty:number | null = 0,
			mealBreakPenalty:number | null = 0;
		const totalHours = this.getTheDifferenceofTime();
		if(this.mealBreakConfigurationData.RestBreakPenalty && this.mealBreakConfigurationData.RestBreakMinimumHours && !restBreak){
			if(totalHours && totalHours > this.mealBreakConfigurationData.RestBreakMinimumHours){
				restBreakPenalty = this.mealBreakConfigurationData.RestBreakPenaltyHours;
			}
		}
		if (this.mealBreakConfigurationData.MealBreakPenalty) {
			for (let i = Number(magicNumber.zero); i < this.mealBreakConfigs.length; i++) {
			  if (totalHours && totalHours > this.mealBreakConfigs[i].MinimumHoursWorked) {
				 const totalMinutes = this.getMealBreakControlValue(i, 'MealBreakTime');
					if (totalMinutes < this.mealBreakConfigs[i].MandatoryBreak &&
						 this.checkItisTaken(this.getMealBreakControlValue(i, 'MealBreakTypeId'))){
					  mealBreakPenalty = this.mealBreakConfigurationData.MealBreakPenaltyHours;
					  break;
					} else {
				  mealBreakPenalty = magicNumber.zero;
					}
			  }
			}
		  }
		const PenaltyHours = (restBreakPenalty?? magicNumber.zero) + (mealBreakPenalty?? magicNumber.zero);
		this.TimeInOutForm.get('PenaltyHours')?.setValue(PenaltyHours);

	}

	checkItisTaken(value:number){
		return value == Number(MealBreakStatusEnum.Taken) ||
		value == Number(MealBreakStatusEnum.NotTaken);
	}

	getTheDifferenceofTime() {
		const entryTimeIn = this.TimeInOutForm.get('EntryTimeIn')?.value,
		  entryTimeOut = this.TimeInOutForm.get('EntryTimeOut')?.value;
		if (!entryTimeIn || !entryTimeOut) {
		  return;
		}

		const date1 = new Date(entryTimeIn);
		const date2 = new Date(entryTimeOut);
		if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
		  return 0.00;
		}
		if (date2 < date1) {
		  date2.setDate(date2.getDate() + 1);
		}
		const differenceInMilliseconds = date2.getTime() - date1.getTime();
		const differenceInHours = differenceInMilliseconds / (Number(magicNumber.oneThousand) * 3600);
		return Math.round(differenceInHours * 100) / 100;
	  }


	takeRestBreak(event: boolean, type:string) {
		if(event){
			this.TimeInOutForm.markAllAsTouched();
			this.calculatePenaltyHours(event);
		}else{
			this.TimeInOutForm.markAsUntouched();
		}
	}

	calculateTotalBillableHours(){
		let billableHours = Number(magicNumber.zero);
		const totalHours = this.getTheDifferenceofTime();
		if(totalHours){
			billableHours = (totalHours) - Number(convertMinutesToHours(this.TimeInOutForm.get('TotalMealBreakHours')?.value));
			if(billableHours >= Number(magicNumber.zero)){
				this.TimeInOutForm.get('TotalBillableHours')?.setValue(billableHours);
			}
			this.TimeInOutForm.controls['EntryTimeOut'].setErrors(null);
		}
		else if (totalHours === magicNumber.zero)
		{
			this.TimeInOutForm.controls['EntryTimeOut'].setErrors({error: true, message: 'TimeInOutCannotBeSame'});
		}
		return billableHours;
	}

	public calculateTotalMealInandMealOut(index:number){
		const mealIn = this.getMealBreakControlValue(index, 'MealIn'),
			mealOut = this.getMealBreakControlValue(index, 'MealOut'),
			totalMin = calculateTotalMin(mealIn, mealOut);
		if(totalMin || totalMin === magicNumber.zero){
			this.getMealBreakControlName(index, 'MealBreakTime').setValue(totalMin);
			this.calculateTotalMealBreakMin();
		}
	}

	private calculateTotalMealBreakMin(){
		let totalMealBreakTime = Number(magicNumber.zero);
		const mealMealBreaksArray = this.TimeInOutForm.get('MealBreakDetails') as FormArray;
		if(mealMealBreaksArray.value.length > magicNumber.zero){
			mealMealBreaksArray.value.forEach((mealBreak:{MealBreakTime:number}) => {
				if (mealBreak.MealBreakTime !== null) {
				  totalMealBreakTime += mealBreak.MealBreakTime;
				}
			  });
		}
		this.TimeInOutForm.get("TotalMealBreakHours")?.setValue(totalMealBreakTime);
		this.calculateTotalBillableHours();
	}

	  public calculateMealBreakUsedMinutes(event:number){
		this.TimeInOutForm.get('TotalMealBreakHours')?.setValue(event);
		this.calculateTotalBillableHours();
	  }

	public getDatabyId(date:string){
		if(areDatesEqual(date, this.weekEndingDate)){
			this.isNextDisabled = true;
			this.isPrevDisabled = false;
		}
		else if(areDatesEqual(date, getDateSixDaysBefore(this.weekEndingDate))){
			this.isNextDisabled = false;
			this.isPrevDisabled = true;
		}
		else{
			this.isNextDisabled = false;
			this.isPrevDisabled = false;
		}
	}

	public prev(Date: string) {
		this.TimeInOutForm.markAllAsTouched();
		this.isNext = false;
		this.saveData = false;
		if(this.TimeInOutForm.valid && this.TimeInOutForm.dirty){
			this.saveData = true;
		}
		else if(this.TimeInOutForm.pristine){
			this.clearPreviousErrors();
			this.AddValidators();
			this.moveToPreviousDate(Date);
		}
	}


	private moveToPreviousDate(Date: string) {
		this.selectedDate = subtractOneDayUsingDate(Date);
		this.getDatabyId(this.selectedDate);

		this.day = this.datePipe.transform(this.selectedDate, 'EEEE') as DaysOfWeek;
		const entry = this.timeAdjustService.getData().find((item: any) =>
			item.EntryDate === this.selectedDate);

		if (entry) {
			this.patchFormValues();
		} else {
			this.TimeInOutForm.patchValue({
				EntryTimeIn: null,
				EntryTimeOut: null
			  });
			this.setDefaultValues();
			this.TimeInOutForm.get('EntryDate')?.setValue(this.selectedDate);
		}
	}

	clearPreviousErrors(){
		this.TimeInOutForm.controls['EntryTimeIn'].clearValidators();
		this.TimeInOutForm.controls['EntryTimeOut'].clearValidators();
		this.TimeInOutForm.updateValueAndValidity();
		this.TimeInOutForm.markAsUntouched();
	}

	AddValidators(){
		const validatorFn = (param: string) => {
			return this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: param, IsLocalizeKey: true }]);
		};

		this.TimeInOutForm.controls['EntryTimeIn'].addValidators([validatorFn('TimeIn')]);
		this.TimeInOutForm.controls['EntryTimeOut'].addValidators([validatorFn('TimeOut')]);
		this.TimeInOutForm.updateValueAndValidity();
	}

	public next(Date: string) {
		this.TimeInOutForm.markAllAsTouched();
		this.isNext = true;
		this.saveData = false;
		if(this.TimeInOutForm.valid && this.TimeInOutForm.dirty){
			this.saveData = true;
		}
		else if(this.TimeInOutForm.pristine){
			this.clearPreviousErrors();
			this.AddValidators();
			this.moveToNextDate(Date);
		}
	}


	private moveToNextDate(Date: string) {
		this.TimeInOutForm.markAsPristine();
		this.selectedDate = addOneDay(Date);
		this.getDatabyId(this.selectedDate);
		this.day = this.datePipe.transform(this.selectedDate, 'EEEE') as DaysOfWeek;
		const entry = this.timeAdjustService.getData().find((item: any) =>
			item.EntryDate === this.selectedDate);

		if (entry) {
			this.patchFormValues();
		} else {
			this.TimeInOutForm.patchValue({
				EntryTimeIn: null,
				EntryTimeOut: null
			  });
			this.setDefaultValues();
			this.TimeInOutForm.get('EntryDate')?.setValue(this.selectedDate);
		}
		this.isShow = true;
	}


	private applyMealBreakValidation(): void {
		const mealMealBreaksArray = this.TimeInOutForm.get('MealBreakDetails') as FormArray;

		mealMealBreaksArray.controls.forEach((control: AbstractControl) => {
			if (control instanceof FormGroup) {
				const mealBreakTypeId = control.get('MealBreakTypeId')?.value;

				if (mealBreakTypeId === MealBreakStatusEnum.Taken || mealBreakTypeId === MealBreakStatusEnum.Partial) {
					control.get('MealIn')?.setValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'TimeIn', IsLocalizeKey: true }]));
					control.get('MealOut')?.setValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'TimeOut', IsLocalizeKey: true }]));
				} else {
					control.get('MealIn')?.clearValidators();
					control.get('MealOut')?.clearValidators();
				}

				control.get('MealIn')?.updateValueAndValidity();
				control.get('MealOut')?.updateValueAndValidity();
			}
		});
		this.cdr.markForCheck();
	}

	ApplyFilterForNxtPrev() {
		try {
			this.TimeInOutForm.get('EntryDate')?.setValue(this.selectedDate);
			this.applyMealBreakValidation();
			if(this.TimeInOutForm.valid){
				const newObject = Object.assign({}, this.TimeInOutForm.value);
				this.timeAdjustService.setData(this.convertMethod(newObject));
				this.apply.emit({
					data: this.timeAdjustService.getData(),
					obj: this.TimeInOutForm.value
				});
			}
			else{
				this.TimeInOutForm.markAllAsTouched();
			}
		} catch (error) {
			console.log("error", error);
		}
		this.cdr.markForCheck();
	}

	ApplyFilter() {
		this.applyMealBreakValidation();
		if(this.TimeInOutForm.valid){
			const newObject = Object.assign({}, this.TimeInOutForm.value);
			this.timeAdjustService.setData(this.convertMethod(newObject));
			this.apply.emit({
				data: this.timeAdjustService.getData(),
				obj: this.TimeInOutForm.value
			});

			this.cancel();
		}
		else{
			this.TimeInOutForm.markAllAsTouched();
		}
		this.cdr.markForCheck();
	}

	public ClearTimeInOut(){
		this.TimeInOutForm.controls['EntryTimeIn'].patchValue(null);
		this.TimeInOutForm.controls['EntryTimeOut'].patchValue(null);
		this.setDefaultValues();
	}

	private convertMethod(data: mealBreakSubmitData) {
		data.EntryTimeIn = data.EntryTimeIn && convertDateStringToTimeString(data.EntryTimeIn);
		data.EntryTimeOut = data.EntryTimeOut && convertDateStringToTimeString(data.EntryTimeOut);
		data.TotalMealBreakHours = Number(convertMinutesToHours(data.TotalMealBreakHours));
		data.TotalBillableHours = Number((data.TotalBillableHours).toFixed(magicNumber.two));
		data.MealBreakDetails = this.mealBreakConfigurationData.AllowInOutMealBreak
		  ? data.MealBreakDetails.map((e: MealBreakDetail, index: number) => {
			  const newMealBreakDetail = { ...e };
			  delete newMealBreakDetail.MealSwitch;
			  newMealBreakDetail.MealIn = newMealBreakDetail.MealIn && convertDateStringToTimeString(newMealBreakDetail.MealIn);
			  newMealBreakDetail.MealOut = newMealBreakDetail.MealOut && convertDateStringToTimeString(newMealBreakDetail.MealOut);
			  newMealBreakDetail.MealBreakId = this.mealBreakId[index];
			  return newMealBreakDetail;
			})
		  : [];
		return data;
	  }


	cancel() {
		this.isShow = false;
		this.onClose.emit(false);
	}

	getMethodtoConvertData(sourceData: MealBreak): any {
		return {
		  ...sourceData,
		  EntryDate: this.selectedDate,
		  EntryTimeIn: convertToDate(sourceData.EntryTimeIn),
		  EntryTimeOut: convertToDate(sourceData.EntryTimeOut),
		  MealBreakDetails: sourceData.MealBreakDetails.map((e: MealBreakDetail) => {
				return {
			  ...e,
			  MealIn: e.MealIn && convertToDate(e.MealIn),
			  MealOut: e.MealOut && convertToDate(e.MealOut)
				};
		  })
		};
	}

	copy(){
		const date = subtractOneDayUsingDate(this.selectedDate),
			day = this.datePipe.transform(date, 'EEEE') as DaysOfWeek;
  			this.day = day;
			  this.patchFormValues();

		if(this.data[this.day].EntryDate)
			this.TimeInOutForm.markAsDirty();

	}

	public closeDialog() {
		if (this.isNext) {
			this.moveToNextDate(this.selectedDate);
		} else {
			this.moveToPreviousDate(this.selectedDate);
		}
		this.clearPreviousErrors();
		this.AddValidators();
		this.saveData = false;
		this.renderer.removeClass(document.body, 'scrolling__hidden');
		this.TimeInOutForm.markAsPristine();
	}

	public saveDialogChanges() {
		this.TimeInOutForm.markAllAsTouched();
		if(this.TimeInOutForm.valid){
			this.ApplyFilterForNxtPrev();
			if (this.isNext) {
				this.moveToNextDate(this.selectedDate);
			} else {
				this.moveToPreviousDate(this.selectedDate);
			}
		}
		this.clearPreviousErrors();
		this.AddValidators();
		this.saveData = false;
		this.TimeInOutForm.markAsPristine();
	}


	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
