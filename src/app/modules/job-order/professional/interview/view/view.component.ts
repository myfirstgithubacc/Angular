import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewRequestService } from '../../services/interview-request.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Subject, takeUntil } from 'rxjs';
import { InterviewComment, InterviewDetail, IinterviewDetailUkey, CardStatus } from '../../interface/interview.interface';
import { InterviewNavigationPaths } from '../../constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Column } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrl: './view.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
	public InterviewRequestForm: FormGroup;
	public isReviewMode: boolean = false;
	public isFinishMode: boolean = false;
	public isCancelMode: boolean = false;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public interviewUkeyDetails: IinterviewDetailUkey;
	public comments: InterviewComment[];
	private navigationPaths: any = InterviewNavigationPaths;
	public columnConfiguration = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		firstColumnName: 'Item',
		secondColumnName: 'Add More',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero
	};
	public populateAlternateData: InterviewDetail[];
	public populateScheduleData: InterviewDetail[];

	constructor(
		private fb:FormBuilder,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private route: Router,
		private toasterService: ToasterService,
		private interviewService: InterviewRequestService
	) {
		this.InterviewRequestForm = this.fb.group({
			interviewfieldName: [null],
			addalternateslotsfieldName: true,
			datefieldName: [null],
			timefieldName: [null],
			endfieldName: [null],
			timezonefieldName: [null],
			AdditionalinterviewfieldName: [null],
			CommentsfieldName: [null],
			StaffingCommentsfieldName: [null],
			confirmationfieldName: [null],
			visibleconfirmationfieldName: [null],
			switch2: [null]
		});
	}

	interviewTypeList: any = [{ Text: "Telephonic", Value: '1' }, { Text: "Online", Value: '2' }, { Text: "In Person", Value: '3' }];
	timeZoneTypeList: any = [{ Text: "Mountain Time", Value: '1' }, { Text: "Arizona Time", Value: '2' }, { Text: "Pacific Time", Value: '3' }];

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param != null || param != '') {
				this.getInterviewDetailByUkey(param["uKey"]);
			}
		});


		if(this.route.url == '/xrm/requisition/interview-request/review'){
			this.isReviewMode = true;
		}else{
			this.isReviewMode = false;
		}
		if(this.route.url == '/xrm/requisition/interview-request/interview-finish'){
			this.isFinishMode = true;
		}else{
			this.isFinishMode = false;
		}

		if(this.route.url == '/xrm/requisition/interview-request/interview-cancel'){
			this.isCancelMode = true;
		}else{
			this.isCancelMode = false;
		}
	}

	private getInterviewDetailByUkey(ukey: string){
		this.interviewService.getInterviewDetailsbyUkey(ukey).pipe(takeUntil(this.destroyAllSubscriptions$)).
			subscribe((res: GenericResponseBase<IinterviewDetailUkey>) => {
				if (res.Succeeded && res.Data) {
					this.cdr.markForCheck();
					this.interviewUkeyDetails = res.Data;
					this.comments = this.interviewUkeyDetails.InterviewComments;
					this.interviewService.interviewDataSubject.next({
						'CandidateName': this.interviewUkeyDetails.CandidateName,
						'SubmittalCode': this.interviewUkeyDetails.SubmittalCode,
						'InterviewCode': this.interviewUkeyDetails.InterviewCode,
						'Status': this.interviewUkeyDetails.Status,
						'Ukey': this.interviewUkeyDetails.SubmittalUkey
					});
					this.populateAlternateData = this.alterData(this.interviewUkeyDetails.InterviewDetails.filter((obj) =>
							 obj.SlotType === CardStatus.Alternate.toString()));
					this.populateScheduleData = this.alterData(this.interviewUkeyDetails.InterviewDetails.filter((obj) =>
							 obj.SlotType === CardStatus.Schedule.toString()));
				}
			});
	}

	public alterData(data: InterviewDetail[]): InterviewDetail[] {
		return data.map((obj) => {
			Object.entries(obj).forEach(([key, value]) => {
				if (value) {
					if (key === 'InterviewDate') {
						obj[key] = this.localizationService.TransformDate(value);
					} else if (key === 'StartTime' || key === 'EndTime') {
						obj[key] = this.localizationService.TransformTime(value);
					}
				}
			});
			return obj;
		});
	}

	scroollToTop() {
		window.scrollTo(magicNumber.zero, magicNumber.zero);
	}


	submitForm(){
		this.InterviewRequestForm.markAllAsTouched();
		if (this.InterviewRequestForm.valid) {
			this.toasterService.showToaster(ToastOptions.Success, 'Interview Request has been saved successfully.');
			this.route.navigate([`/xrm/requisition/interview-request/list`]);
			this.scroollToTop();
		}
	}

	submitForm2(){
		this.InterviewRequestForm.markAllAsTouched();
		if (this.InterviewRequestForm.valid) {
			this.toasterService.showToaster(ToastOptions.Success, 'Interview Request has been finished successfully.');
			this.route.navigate([`/xrm/requisition/interview-request/list`]);
			this.scroollToTop();
		}
	}

	submitForm3(){
		this.InterviewRequestForm.markAllAsTouched();
		if (this.InterviewRequestForm.valid) {
			this.toasterService.showToaster(ToastOptions.Success, 'Interview Request has been canceled successfully.');
			this.route.navigate([`/xrm/requisition/interview-request/list`]);
			this.scroollToTop();
		}
	}

	public navigate() {
		this.route.navigate([this.navigationPaths.list]);
	}

	public interviewGridColumns: Column[] = [
		{
			colSpan: magicNumber.one,
			columnName: 'Interview Slot',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'SlotNumber',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'Interview Type',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'InterviewMode',
					requiredMsg: '',
					isEditMode: true
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'Date',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'InterviewDate',
					requiredMsg: '',
					isEditMode: false,
					isDisable: false
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'StartTime',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'StartTime',
					isEditMode: false,
					isDisable: false,
					requiredMsg: ''
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'EndTime',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'EndTime',
					isEditMode: false,
					isDisable: false,
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		},
		{
			colSpan: magicNumber.two,
			columnName: 'TimeZone',
			controls: [
				{
					controlType: 'listLabel',
					controlId: 'TimeZone',
					isEditMode: false,
					isDisable: false,
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		}
	];

}
