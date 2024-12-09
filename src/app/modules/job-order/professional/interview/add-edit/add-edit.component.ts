import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Subject, takeUntil } from 'rxjs';
import { InterviewRequestService } from '../../services/interview-request.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrl: './add-edit.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent {
	public InterviewRequestForm: FormGroup;
	public interviewTypeList: any = [{ Text: "Telephonic", Value: '318' }, { Text: "Online", Value: '319' }, { Text: "In Person", Value: '317' }];
	public timeZoneTypeList: any = [{ Text: "Mountain Time", Value: '1' }, { Text: "Arizona Time", Value: '2' }, { Text: "Pacific Time", Value: '3' }];
	public interviewSlotColumn = [
		{
			colSpan: 2,
			columnName: 'Interview Type',
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'interviewType',
					defaultValue: this.interviewTypeList,
					isEditMode: true,
					isDisable: false,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					placeholder: ''
				}
			]
		},
		{
			colSpan: 2,
			columnName: 'Date',
			controls: [
				{
					controlType: 'date',
					controlId: 'Interviewdate',
					dataType: 'string',
					dateFormat: "MM/dd/yyyy",
					defaultValue: new Date(),
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			colSpan: 2,
			columnName: 'Start Time',
			controls: [
				{
					controlType: 'time',
					controlId: 'startTime',
					defaultValue: new Date(),
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			colSpan: 2,
			columnName: 'End Time',
			controls: [
				{
					controlType: 'time',
					controlId: 'endTime',
					defaultValue: new Date(),
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			colSpan: 2,
			columnName: 'Time Zone',
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'timeZone',
					defaultValue: this.timeZoneTypeList,
					isEditMode: true,
					isDisable: false,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					placeholder: ''
				}
			]
		}
	];

	public interviewSlotColumnConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'Interview Slot',
		secondColumnName: 'AddMore',
		deleteButtonName: '',
		noOfRows: 0,
		itemSr: true,
		itemLabelName: 'Slot',
		firstColumnColSpan: 0,
		lastColumnColSpan: 0,
		isAddMoreValidation: false,
		isVisibleAsterick: true,
		asterikAllRows: true
	};

	public submittalData: any;
	private interViewSlotData: any;
	public prefilledData: any = [
		{"interviewType": null, "date": null, "startTime": null, "endTime": null, "timeZone": null},
		{"interviewType": null, "date": null, "startTime": null, "endTime": null, "timeZone": null},
		{"interviewType": null, "date": null, "startTime": null, "endTime": null, "timeZone": null}
	 ];
	private unsubscribeAll$: Subject<void> = new Subject<void>();

	constructor(
        private activatedRoute: ActivatedRoute,
		private formBuilder: FormBuilder,
		private interviewService: InterviewRequestService,
		private customValidators: CustomValidators
	){
		this.InitializeForm();
	};

	ngOnInit(): void {
		this.handleRouteParams();
	};

	private InitializeForm() {
		this.InterviewRequestForm = this.formBuilder.group({
			"AdditionalInterviewDetail": [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'DocumentType', IsLocalizeKey: true }])]],
			"Comment": [null]
		});
	}

	private handleRouteParams(): void {
		this.activatedRoute.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((param) => {
			if (param['uKey'] != null) {
				this.getSubittalDetailById(param['uKey']);
			}
		});
	}

	private getSubittalDetailById(uKey: string){
		this.interviewService.getSubmittalDetailsbyUkey(uKey).pipe(takeUntil(this.unsubscribeAll$)).
			subscribe((res: GenericResponseBase<any>) => {
				if (res.Succeeded && res.Data) {
					this.submittalData = res.Data;
					this.interviewService.interviewDataSubject.next({
						'CandidateName': res.Data.FullName,
						'SubmittalCode': res.Data.SubmittalCode,
						'Ukey': uKey
					});
				}
			});
	}

	public getinterviewSlot(list: any) {
		console.log("adarsh", list)
		this.interViewSlotData = list.getRawValue();
	}

	private createAddPaylaod(){
		const addPaylaod = {
			"entityId": XrmEntities.InterviewRequest,
			"recordId": 1683,
			"AdditionalInterviewDetails": this.InterviewRequestForm.get('AdditionalInterviewDetail')?.value,
			"interviewDetailAddDtos": this.interViewSlotData,
			"interviewCommentAddDtos": {
				  "comment": this.InterviewRequestForm.get('Comment')?.value
			}
		};
		return addPaylaod;
	}

	public navigate(){}

	public submitForm(){
		console.log("save paylaod", this.createAddPaylaod());
	};
}
