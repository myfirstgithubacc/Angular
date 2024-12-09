import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectableSettings } from "@progress/kendo-angular-grid";
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Router } from '@angular/router';
import { NavigationUrls } from '../services/Constants.enum';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-interview-request',
	templateUrl: './interview-request.component.html'
})
export class InterviewRequestComponent implements OnInit, OnDestroy {

	public allowCustom: boolean = true;
	public isaddAlternateSlots: boolean = false;
	public InterviewRequestForm: FormGroup;
	public interviewTypeList: DropdownModel[] = [{ Text: "Telephonic", Value: '1' }, { Text: "Online", Value: '2' }, { Text: "In Person", Value: '3' }];
	public timeZoneTypeList: DropdownModel[] = [{ Text: "Mountain Time", Value: '1' }, { Text: "Arizona Time", Value: '2' }, { Text: "Pacific Time", Value: '3' }];

	public selectableSettings: SelectableSettings;

	public interviewGridData = [
		{
			interviewSlot: "Slot 1",
			interviewType: "",
			date: "",
			startTime: "",
			endTime: "",
			timeZone: ""
		},
		{
			interviewSlot: "Slot 2",
			interviewType: "",
			date: "",
			startTime: "",
			endTime: "",
			timeZone: ""
		},
		{
			interviewSlot: "Slot 3",
			interviewType: "",
			date: "",
			startTime: "",
			endTime: "",
			timeZone: ""
		}
	];

	public interviewGridData2 = [
		{
			interviewSlot: "Slot 1",
			interviewType: "",
			date: "",
			startTime: "",
			endTime: "",
			timeZone: ""
		},
		{
			interviewSlot: "Slot 2",
			interviewType: "",
			date: "",
			startTime: "",
			endTime: "",
			timeZone: ""
		},
		{
			interviewSlot: "Slot 3",
			interviewType: "",
			date: "",
			startTime: "",
			endTime: "",
			timeZone: ""
		}
	];

	constructor(
		private fb: FormBuilder,
		private toasterService: ToasterService,
		private router: Router
	) {
		this.InterviewRequestForm = this.fb.group({
			interviewfieldName: [null],
			addalternateslotsfieldName: [null],
			datefieldName: [null],
			timefieldName: [null],
			endfieldName: [null],
			timezonefieldName: [null],
			AdditionalinterviewfieldName: [null],
			CommentsfieldName: [null],
			StaffingCommentsfieldName: [null],
			confirmationfieldName: [null],
			visibleconfirmationfieldName: [null]
		});
	}

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
	}

	public addAlternateSlotsModel(e: string) {
		if (!e) {
			this.isaddAlternateSlots = false;
		} else {
			this.isaddAlternateSlots = true;
		}
	}

	public navigateBack(): void {
		this.router.navigate([`${NavigationUrls.List}`]);
	}

	public cancelInterview(): void {
		this.toasterService.showToaster(ToastOptions.Success, 'Interview Cancel has been saved successfully.');
	}

	public candidateNotAvailable(): void {
		this.toasterService.showToaster(ToastOptions.Success, 'Interview has been Cancel due to Candidate Not Available.');
	}

	public submitForm(): void {
		this.InterviewRequestForm.markAllAsTouched();
		if (this.InterviewRequestForm.valid) {
			this.toasterService.showToaster(ToastOptions.Success, 'Interview Request has been saved successfully.');
		}
	}

}
