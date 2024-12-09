import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NavigationPaths } from '../constants/routes-constants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { catchError, EMPTY, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AutoprocessConfigurationService } from 'src/app/services/masters/autoprocess-configuration.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { dropdown } from '@xrm-master/retiree-options/constant/retiree.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ExecutionDetails, Job, Schedule, TriggerDetailsColumnOption } from '@xrm-core/models/auto-process-configuration.model';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrl: './view.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy{
	public AddEditAutoProcessForm: FormGroup;
	public executionForm: FormGroup;
	private destroyAllSubscribtion$ = new Subject<void>();
	public pageSize: number = magicNumber.ten;
	public jobDetails: Job;
	public triggerColumnOptions: TriggerDetailsColumnOption[] = [];
	public jobName:string;
	public jobDescription:string;
	public executionHisCO: TriggerDetailsColumnOption[] = [];
	public executionDetails: ExecutionDetails[] = [];
	private executionUkey:string;
	public isEmailReq: boolean = false;
	public successEmail: string;
	public exceptionEmail: string;


	constructor(
		private router:Router,
		private activatedRoute: ActivatedRoute,
		private autoProcessServices: AutoprocessConfigurationService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef
	){

	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getJobById(param['id']);
					}
					return of(null);
				}),
				catchError((error: Error) => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
		this.triggerColumnOptions= this.autoProcessServices.triggerDeatilsColumnOption();
		this.executionHisCO = this.autoProcessServices.executionHisColumnOption();
	}

	private getJobById(id: string) : void {
		this.autoProcessServices.getJobById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<Job>) => {
				if(isSuccessfulResponse(data)){
					this.jobDetails = data.Data;
					this.jobName = data.Data.JobName;
					this.jobDescription= data.Data.JobDetails;
					this.isEmailReq = this.jobDetails.IsEmailRequired;
					this.successEmail = this.jobDetails.SuccessEmail;
					this.exceptionEmail = this.jobDetails.ExceptionEmail;
					this.executionUkey= data.Data.Ukey;
					this.autoProcessServices.jobsData.next({'Disabled': data.Data.Disabled, 'RuleCode': data.Data.Code, 'Id': data.Data.Id});
					this.jobDetails = this.jobDetails.Schedules.map((schedule: Schedule) =>
						({
							SchedulingType: schedule.SchedulingType,
							StartDate: schedule.StartDate,
							EndDate: schedule.EndDate,
							ScheduledTime: schedule.ScheduledTime,
							IntervalDay: schedule.DayInterval === Number(magicNumber.zero)
								? 'N/A'
								: schedule.DayInterval,
							ScheduledOn: schedule.ScheduledOn === ''
								? 'N/A'
								: schedule.ScheduledOn,
							Status: schedule.Status
						}));
					this.cdr.detectChanges();
					this.AddEditAutoProcessForm.patchValue({
						SuccessEmail: this.jobDetails.SuccessEmail || '',
						ExceptionEmail: this.jobDetails.ExceptionEmail || ''
					});

					this.AddEditAutoProcessForm.patchValue(this.jobDetails);
				}
			});
	}

	public executionHistoryData() {
		this.autoProcessServices.getExecutionHisById(this.executionUkey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<ExecutionDetails[]>) => {

				if (response.Succeeded && Array.isArray(response.Data)) {
					this.executionDetails = response.Data.map((detail) =>
						({
							ExecutedOn: detail.ExecutedOn,
							ExecutedTime: detail.ExecutedTime,
							Status: detail.Status
						}));

					this.executionForm.patchValue({ executionDetails: this.executionDetails });
					this.cdr.detectChanges();
				} else {
					this.executionDetails = [];
				}
			});
	}

	public tabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: dropdown.All,
				favourableValue: "All",
				selected: true
			}
		]
	};

	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Auto Process_${uniqueDateCode}`;

		return fileName;
	}

	public calculateDate(date: number): string {
		return date < Number(magicNumber.ten)
			? `0${date}`
			: date.toString();
	}

	public onBackClick(){
		this.router.navigate([NavigationPaths.list]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
