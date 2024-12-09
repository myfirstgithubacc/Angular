import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataObject, SystemMessageDataToUpdate } from '@xrm-core/models/Configure-client/system-messages.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SystemMessageFormControl } from '@xrm-master/configure-client/Common/enums';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-system-messages',
	templateUrl: './system-messages.component.html',
	styleUrls: ['./system-messages.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemMessagesComponent implements OnInit, OnDestroy {

  @Input() form: FormGroup;

  public sowReq: boolean;

  private destroyAllSubscribtion$ = new Subject<void>();

  constructor(
    private configureClient: ConfigureClientService,
    private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private scrollService: WindowScrollTopService
  ){
  	this.scrollService.scrollTop();
  }

  ngOnInit(): void {

  	this.getSystemMessages();

  	this.configureClient.updateObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {reasonForChange: string, update: boolean}) => {
  		if(res.update){
  			this.updateSystemMessages(res.reasonForChange);
  		}
  	});

  	this.configureClient.sowReqObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: boolean) => {
  			this.sowReq = res;
  		});
  }

  private getSystemMessages(){
  	this.configureClient.getSystemMessages().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
  		next: (data: ApiResponse) => {
  			this.form.patchValue({
  				submitBidMessage: data.Data[0].Message,
  				exceptionMessage: data.Data[1].Message,
  				onBoardingConfirmationMessage: data.Data[2].Message,
  				exceptionApproverMessage: data.Data[3].Message,
  				timeExpenseApproverMessage: data.Data[4].Message,
  				timeEntryMessage: data.Data[5].Message,
  				expenseEntryMessage: data.Data[6].Message,
  				sowAcceptanceMessage: data.Data[7].Message,
  				sowTimeExpenseEntryMessage: data.Data[8].Message,
  				sowTimeExpenseApproverMessage: data.Data[9].Message
  			});
  			this.cdr.markForCheck();
  		},
  		error: () => {
  			// no action for now
  		}
  	});
  }

  private updateSystemMessages(reasonforChange: string): void {
  	const systemMessageListdata: DataObject[] = [],
  	systemMessageFormControls = [
  			{ localizedKey: 'SubmitBidMessage', control: SystemMessageFormControl.SubmitBidMessage },
  			{ localizedKey: 'RequestExceptionMessage', control: SystemMessageFormControl.RequestExceptionMessage },
  			{ localizedKey: 'SupplierOnBoardingConfirmationMessage', control: SystemMessageFormControl.SupplierOnBoardingConfirmationMessage },
  			{ localizedKey: 'ExceptionApproverPopupMessage', control: SystemMessageFormControl.ExceptionApproverPopupMessage },
  			{ localizedKey: 'TimeExpenseApproverMessage', control: SystemMessageFormControl.TimeExpenseApproverMessage },
  			{ localizedKey: 'TimeEntryMessage', control: SystemMessageFormControl.TimeEntryMessage },
  			{ localizedKey: 'ExpenseEntryMessage', control: SystemMessageFormControl.ExpenseEntryMessage },
  			{ localizedKey: 'SOWAcceptanceMessage', control: SystemMessageFormControl.SOWAcceptanceMessage },
  			{ localizedKey: 'SOWTimeExpenseEntryMessage', control: SystemMessageFormControl.SOWTimeExpenseEntryMessage },
  			{ localizedKey: 'SOWTimeExpenseApproverMessage', control: SystemMessageFormControl.SOWTimeExpenseApproverMessage }
  	],
  		systemMessageData: SystemMessageDataToUpdate = {
  		systemMessageList: systemMessageListdata,
  		reasonForChange: reasonforChange
  	};

  	systemMessageFormControls.forEach((value, index) => {
  		if (!this.form.controls[value.control].pristine) {
  			systemMessageListdata.push({
  				id: index + magicNumber.one,
  				localizedKey: value.localizedKey,
  				message: this.form.controls[value.control].value
  			});
  		}
  	});
  	this.updateSystemMessageUsingService(systemMessageData);
  }

  private updateSystemMessageUsingService(systemMessageData : SystemMessageDataToUpdate)
  {
  	this.configureClient.updateSystemMessages(systemMessageData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
  		next: (data: GenericResponseBase<null>) => {
  				this.localizationService.Refresh();
  				this.configureClient.toMove.next({ApiResponse: data, move: true});
  		},
  		error: () => {
  			// nothing for now
  		}
  	});
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  }
}
