import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevisionService } from '../service/revision.service';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { RevisionStatus } from '../service/revision-status.enum';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { AssingmentDetailsService } from '../../assignment-details/service/assingmentDetails.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { RevisionData, StatusData, Timeresponse } from '@xrm-master/role/Generictype.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-revision-review',
	templateUrl: './revision-review.component.html',
	styleUrls: ['./revision-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevisionReviewComponent implements OnInit, OnDestroy {
	@Input() public Ukey: string;
	@Input() public assingmentId: number|null;
	@Output() public revisionProcess = new EventEmitter<string>();
	public isCommentRequired = false;
	public timeExpense: Timeresponse|null;
	public entityId=XrmEntities.AssignmentRevision;
	public revisionObject: RevisionData;
	public revisionForm: FormGroup;
	public statusData: StatusData = {
  	items: []
	};
	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private revisionService: RevisionService,
        private location: Location,
        private customValidatorService: CustomValidators,
        private toasterService: ToasterService,
        private assignmentService: AssingmentDetailsService,
        private localizationService: LocalizationService,
		private cd:ChangeDetectorRef
	) {
  	this.revisionForm= this.fb.group({
  		uKey: '',
  		revisedDate: [],
  		revisionAction: '',
  		comment: ['']
  	});
	}

	ngOnInit(): void {
  	if(!this.Ukey)
  		this.Ukey = this.activatedRoute.snapshot.params['id'];

  	if(this.Ukey)
  		this.getRevisionId();
  	this.toasterService.resetToaster();
	}
	private getRevisionId() {
		this.revisionService.fetchRevisionDetails(this.Ukey, true, this.assingmentId).pipe(takeUntil(this.unsubscribe$))
			.subscribe(({ revisionObject, timeExpense, statusData }) => {
				this.revisionObject = revisionObject;
				this.timeExpense = timeExpense;
				this.statusData = statusData;
			});
	}
	public navigate(){
  	if(this.assingmentId == null || this.assingmentId == undefined)
  		this.location.back();
  	else
  		this.assignmentService.setRevisionPageIndex(magicNumber.one, this.assingmentId, this.Ukey, false);
	}


	public approveRevision(){
		this.isCommentRequired=false;
		this.clearCommentValidator();
		this.revisionForm.markAllAsTouched();
		  this.revisionForm.updateValueAndValidity();
		if(this.revisionForm.valid)
		{
			  if(this.timeExpense?.TimeMaxWeekendingDate && this.revisionObject.RevisionDetails.RevisedRateEffentiveDate){
				  const result =this.revisionService.compareTimeEntryDate(
					this.timeExpense.TimeMaxWeekendingDate,
					this.revisionObject.RevisionDetails.RevisedRateEffentiveDate
				);
				if(result != '')
				  {
					  this.toasterService.displayToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(result));
					  return;
				  }
				  this.patchValue();
			  }
			  else{
				  this.patchValue();
			  }
		}
	  }
	  patchValue(){
		  const payload = this.revisionForm.value;
		  payload.uKey = this.Ukey;
		  payload.revisedDate = "";
		  payload.revisionAction = RevisionStatus.approved;
		  this.revisionService.submitRevisionPayload(payload).pipe(takeUntil(this.unsubscribe$))
			  .subscribe((response: GenericResponseBase<null>) => {
				if(!response.Succeeded){
					  this.showToaster(response.Message, ToastOptions.Error);
				  }
				  else {
					  this.revisionProcess.emit('approved');
					  this.showToaster(response.Message, ToastOptions.Success);
					  this.navigate();
				  }
			  });
	  }

	public declineRevision(){
  	this.isCommentRequired=true;
  	this.setCommentValidator();
  	this.revisionForm.markAllAsTouched();
  	if(this.revisionForm.valid)
  	{
  		const payload = this.revisionForm.value;
  		payload.uKey = this.Ukey;
  		payload.revisionAction = RevisionStatus.declined;
  		this.revisionService.submitRevisionPayload(payload).pipe(takeUntil(this.unsubscribe$)).subscribe((response: GenericResponseBase<null>) => {
  			if(!response.Succeeded){
  				this.showToaster(response.Message, ToastOptions.Error);
  			}
  			else {
  				this.revisionProcess.emit('decline');
  				this.showToaster(response.Message, ToastOptions.Success);
  				this.navigate();
  			}
  		});
  	}
	}

	private clearCommentValidator(){
  	this.revisionForm.get('comment')?.clearValidators();
  	this.revisionForm.get('comment')?.updateValueAndValidity();
	}

	private setCommentValidator(){
  	this.revisionForm.get('comment')?.clearValidators();
  	this.revisionForm.get('comment')?.setValidators(this.customValidatorService.RequiredValidator('PleaseEnterComment'));
  	this.revisionForm.get('comment')?.updateValueAndValidity();
	}

	private showToaster(message: string, type: ToastOptions) {
  	this.toasterService.displayToaster(type, message);
	}

	ngOnDestroy(): void {
  	this.unsubscribe$.next();
  	this.unsubscribe$.complete();
  	if (this.toasterService.isRemovableToaster)
  		this.toasterService.resetToaster();
	}

}

