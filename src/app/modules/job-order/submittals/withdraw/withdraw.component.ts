import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { CurrentPage, NavigationUrls, StatusId, ToastMessages } from '../services/Constants.enum';
import { SubmittalCommonResponse, WithdrawPayload } from '../services/Interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmittalsService } from '../services/submittals.service';
import { Subject, takeUntil } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { SubmittalsDataService } from '../services/submittalsData.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SubmitalViewComponent } from '../view/view.component';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

@Component({
	selector: 'app-withdraw',
	templateUrl: './withdraw.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawComponent implements OnDestroy {
  @ViewChild('child') childComponent: SubmitalViewComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private submittalService: SubmittalsService,
    private submittalDataService: SubmittalsDataService,
    private toasterService: ToasterService,
    private router: Router,
    private localisationService: LocalizationService
  ) { }

  public currentPage = CurrentPage.Withdraw;
  public submittalViewForm: FormGroup;
  public isButtonDisable: boolean = false;
  public entityId = XrmEntities.Submittal;
  private unsubscribe$: Subject<void> = new Subject<void>();


  public withdrawForm(): void{
  	this.submittalViewForm = this.submittalDataService.getSubmittalViewForm();
  	const control = this.submittalViewForm.get('staffingComment'),
  		uKey = this.activatedRoute.snapshot.params['id'],
  		withdrawPayload: WithdrawPayload = {
  			UKey: uKey,
  			StatusId: StatusId.Withdrawn,
  			Comment: control?.value
  		};
  	if(control?.invalid){
  		control.markAsTouched();
  		this.childComponent.cdr.detectChanges();
  		return;
  	}

  	this.submittalService.withdrawSubmittal(withdrawPayload)
  		.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<SubmittalCommonResponse>) => {
  			if(res.Succeeded && res.Data){
  				this.toasterService.showToaster(
  					ToastOptions.Success,
  					this.localisationService.GetLocalizeMessage(
  						ToastMessages.SubmittalHasBeenWithdrawnSuccessfully,
  						[this.submittalDataService.makeDynamicParam(res.Data.SubmittalCode, false)]
  					)
  				);
  				this.isButtonDisable = true;
  				this.submittalViewForm.get('staffingComment')?.disable();
  				this.navigateBack();
  			}
  			else{
  				this.toasterService.showToaster(ToastOptions.Error, res.Message);
  			}
  		});

  }

  public navigateBack(): void{
	  if (history.state.isCameFromProfReq) {
		  this.router.navigate([`${NavigationUrls.SubmittalDetails}${history.state.requestUkey}`]);
	  }
	  else {
		  this.router.navigate([`${NavigationUrls.List}`]);
	  }
  }

  ngOnDestroy(): void {
  	this.unsubscribe$.next();
  	this.unsubscribe$.complete();
  }

}
