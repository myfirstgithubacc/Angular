import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrentPage, NavigationUrls, RequiredStrings, StatusId, ToastMessages } from '../services/Constants.enum';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { SubmittalsService } from '../services/submittals.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { DeclinePayload, ProcessPayload, SubmittalDetailsView, WithdrawByMspPayload } from '../services/Interfaces';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SubmittalsDataService } from '../services/submittalsData.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';

@Component({
	selector: 'app-process',
	templateUrl: './process.component.html'
})
export class ProcessComponent implements OnInit, OnDestroy {

	public submittalDeclineForm: FormGroup;
	public submittalWithdrawForm: FormGroup;

	public currentPage = CurrentPage.Process;
	public submittalViewForm: FormGroup;
	public isShowDnrLevel: boolean = false;
	public declineReasonList:DropdownItem[];
	public isForwardDisabled = false;
	public isDeclineDisabled = false;
	public isWithdrawDisabled = false;
	public isReceiveDisabled = false;
	private submittalViewData: SubmittalDetailsView;

	public RadioValues = [
		{ Text: RequiredStrings.Client, Value: magicNumber.twoHundredSeventySeven },
		{ Text: RequiredStrings.Sector, Value: magicNumber.twoHundredSeventyEight }
	];
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
      private submittalService: SubmittalsService,
      private toasterService: ToasterService,
      private router: Router,
	  private submittalDataService: SubmittalsDataService
	){
		this.submittalDeclineForm = this.submittalDataService.createSubmittalDeclineForm();
		this.submittalWithdrawForm = this.submittalDataService.createSubmittalWithdrawForm();
	}

	ngOnInit(): void {
		this.manageDnrOptions();
	}

	private manageDnrOptions(): void{
		this.submittalDeclineForm.get('switchDNR')?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((res:boolean) => {
			const control = this.submittalDeclineForm.get('radioDNR');
			if(res){
				this.isShowDnrLevel = true;
				control?.setValue(magicNumber.twoHundredSeventyEight);
			}
			else{
				this.isShowDnrLevel = false;
				control?.setValue(magicNumber.zero);
			}
		});
	}

	public manageButtons(submittalViewData: SubmittalDetailsView): void{
		this.submittalViewData = submittalViewData;
		const submittalStatus = submittalViewData.SubmittalStatusId;
		switch(submittalStatus){
			case Number(StatusId.Forwarded): {
				this.isReceiveDisabled = true;
				break;
			}
			case Number(StatusId.Declined): {
				this.isDeclineDisabled = true;
				this.isReceiveDisabled = true;
				break;
			}
			case Number(StatusId.Received): {
				this.isReceiveDisabled = true;
				break;
			}
			case Number(StatusId.Withdrawn): {
				this.isWithdrawDisabled = true;
				this.isDeclineDisabled = true;
				this.isForwardDisabled = true;
				this.isReceiveDisabled = true;
				break;
			}
		}
	}

	public forwardForm(): void{
		const forwardPayload: ProcessPayload = {
			SubmittalIds: [this.submittalViewData.SubmittalId]
		};
		this.submittalService.forwardSubmittal(forwardPayload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponseBase) => {
			this.showToastMessage(res, ToastMessages.SubmittalHasBeenForwardedSuccessfully);
		});
	}

	public declineForm(): void{
		this.getDeclineReasonList();
		this.submittalDeclineForm.reset();
	}

	public declineSubmittal(){
		this.submittalDeclineForm.markAllAsTouched();
		if(this.submittalDeclineForm.invalid){
			return;
		}
		const processPayload: DeclinePayload[] = [
			{
				SubmittalId: this.submittalViewData.SubmittalId,
				DeclineReasonId: this.submittalDeclineForm.get('declineReason')?.value.Value,
				AddToDnr: this.submittalDeclineForm.get('switchDNR')?.value ?? false,
				DnrOptions: this.submittalDeclineForm.get('radioDNR')?.value ?? magicNumber.zero,
				Comment: this.submittalDeclineForm.get('declineComment')?.value
			}
		];
		this.submittalService.declineSubmittal(processPayload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponseBase) => {
			this.showToastMessage(res, ToastMessages.SubmittalHasBeenDeclinedSuccessfully);
		});
	}

	private getDeclineReasonList(): void{
		const sectorId = this.submittalViewData.SectorId;
		this.submittalService.getDeclineReasonList(sectorId)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<DropdownItem[]>)=>{
				if(res.Succeeded && res.Data){
					this.declineReasonList = res.Data;
				}
			});
	}

	public receiveForm(): void{
		const processPayload: ProcessPayload = {
			SubmittalIds: [this.submittalViewData.SubmittalId]
		};
		this.submittalService.receiveSubmittal(processPayload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponseBase) => {
			this.showToastMessage(res, ToastMessages.SubmittalHasBeenReceivedSuccessfully);
		});
	}

	public withdrawForm(): void{
		this.getDeclineReasonList();
		this.submittalWithdrawForm.reset();
	}

	public withdrawSubmittalByMsp(): void{
		this.submittalWithdrawForm.markAllAsTouched();
		if(this.submittalWithdrawForm.invalid){
			return;
		}
		const payload: WithdrawByMspPayload = {
			Comment: this.submittalWithdrawForm.get('withdrawComment')?.value,
			SubmittalId: this.submittalViewData.SubmittalId,
			WithdrawReasonId: Number(this.submittalWithdrawForm.get('withdrawReason')?.value.Value)
		};
		this.submittalService.withdrawSubmittalByMsp([payload]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponseBase) => {
			this.showToastMessage(res, ToastMessages.SubmittalHasBeenWithdrawnSuccessfully);
		});
	}

	private showToastMessage(res:ApiResponseBase, message: string): void{
		if(res.Succeeded){
			this.toasterService.showToaster(
				ToastOptions.Success,
				message,
				[{Value: this.submittalViewData.SubmittalCode, IsLocalizeKey: false}]
			);
			this.navigateBack();
		}
		else{
			this.toasterService.showToaster(
				ToastOptions.Error,
				res.Message ?? RequiredStrings.EmptyString
			);
		}
	}

	public navigateBack(): void{
		if(history.state.isCameFromProfReq){
			this.router.navigate([`${NavigationUrls.SubmittalDetails}${history.state.requestUkey}`]);
		}
		else{
			this.router.navigate([`${NavigationUrls.List}`]);
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
