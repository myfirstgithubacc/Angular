import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevisionService } from '../service/revision.service';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { RevisionStatus } from '../service/revision-status.enum';
import { Subject, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { AssingmentDetailsService } from '../../assignment-details/service/assingmentDetails.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RevisionData, StatusData } from '@xrm-master/role/Generictype.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-revision-withdraw',
	templateUrl: './revision-withdraw.component.html',
	styleUrls: ['./revision-withdraw.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevisionWithdrawComponent implements OnInit, OnDestroy {

	@Input() public Ukey: string;
	@Input() public assingmentId: number|null;
	@Output() public revisionProcess = new EventEmitter<string>();
	public isCommentRequired = true;
	public revisionObject: RevisionData;
	public revisionForm: FormGroup;
	public entityId=XrmEntities.AssignmentRevision;
	public statusData: StatusData = {
		items: []
	};
	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
private activatedRoute: ActivatedRoute,
   private toasterService: ToasterService,
   private revisionService: RevisionService,
   private location: Location,
   private fb: FormBuilder,
   private customValidatorService: CustomValidators,
   private assignmentService: AssingmentDetailsService
	) {
		this.revisionForm= this.fb.group({
  		uKey: '',
  		revisedDate: [],
  		revisionAction: '',
  		comment: ['']
  	});
	}

	ngOnInit(): void {
		if(this.Ukey==null || this.Ukey==undefined)
			this.Ukey = this.activatedRoute.snapshot.params['id'];

		if(this.Ukey)
			this.getRevisionId();
	}

	getRevisionId() {
		this.revisionService.fetchRevisionDetails(this.Ukey, false, this.assingmentId).pipe(takeUntil(this.unsubscribe$))
			.subscribe(({ revisionObject, statusData }) => {
				this.revisionObject = revisionObject;
				this.statusData = statusData;
		  });
	  }

	navigate(){
		if(this.assingmentId == null || this.assingmentId == undefined)
			this.location.back();
		else
			this.assignmentService.setRevisionPageIndex(magicNumber.one, this.assingmentId, this.Ukey, false);
	}

	withdraw(){
		this.revisionForm.controls['comment']?.setValidators(this.customValidatorService.RequiredValidator('PleaseEnterComment'));
		this.revisionForm.controls['comment'].updateValueAndValidity();
		this.revisionForm.markAllAsTouched();
  		this.revisionForm.updateValueAndValidity();
		if(this.revisionForm.valid)
		{
			const payload = this.revisionForm.value;
			payload.uKey = this.Ukey;
			payload.revisionAction = RevisionStatus.withdraw;
			this.revisionService.submitRevisionPayload(payload)
				.pipe(takeUntil(this.unsubscribe$)).subscribe((response: GenericResponseBase<null>) => {
					if(!response.Succeeded){
						this.showToaster(response.Message, ToastOptions.Error);
					}
					else {
						this.revisionProcess.emit('withdraw');
						this.showToaster(response.Message, ToastOptions.Success);
						this.navigate();
					}
				});
		}
	}

	showToaster(message: string, type: ToastOptions) {
		this.toasterService.displayToaster(type, message);
	}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		if (this.toasterService.isRemovableToaster)
			this.toasterService.resetToaster();
	}
}
