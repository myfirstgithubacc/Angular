import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { Subject, forkJoin, take, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { ConfigureClientDeclarations, SaveAction } from '../Common/declarations';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { BasicDetailsComponent } from './basic-details/basic-details.component';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { addEditForm, passwordPolicyForm, systemMessageForm } from '../Common/formgroup';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { TranslateService } from '@ngx-translate/core';
@Component({
	selector: 'app-edit',
	templateUrl: './edit.component.html',
	styleUrls: ['./edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy{

	public toUpdate: boolean = false;

	public reasonForChange: string;

	public basic: BasicDetailsComponent;

	public currentStep : number = magicNumber.zero;

	public steps = ConfigureClientDeclarations.Steps;

	private destroyAllSubscribtion$ = new Subject<void>();

	public addEditConfigureClientForm: FormGroup;

	public systemMessageForm: FormGroup;

	public passwordPolicyForm: FormGroup;

	public staffingAgencyForm: FormGroup;

	public locationOfficerformStatus: FormGroup;

	public securityClearanceformStatus: FormGroup;

	private btnPressed: number = magicNumber.zero;

	private pointerEvent: StepperActivateEvent;

	private fromWhereStepChange: string;

	constructor(
    private formBuilder: FormBuilder,
    private validators: CustomValidators,
		private toasterService : ToasterService,
		private scrollOnTop : WindowScrollTopService,
    private eventLogService: EventLogService,
    private configureClient: ConfigureClientService,
    private dialogService: DialogPopupService,
		private cdr: ChangeDetectorRef,
		private translate: TranslateService
	) {
  	this.addEditConfigureClientForm = addEditForm(this.formBuilder, this.validators);

  	this.systemMessageForm = systemMessageForm(this.formBuilder, this.validators);

		this.passwordPolicyForm = passwordPolicyForm(this.formBuilder, this.validators);

  	this.staffingAgencyForm = this.formBuilder.group({
  		staffingAgencyArrayform: this.formBuilder.array([])
  	});

  	this.locationOfficerformStatus = this.formBuilder.group({
  		locationOfficers: this.formBuilder.array([])
  	});

  	this.securityClearanceformStatus = this.formBuilder.group({
  		securityClearanceList: this.formBuilder.array([])
  	});
	}

	ngOnInit() {
		this.eventLogService.entityId.next(XrmEntities.ConfigureClient);
  	this.eventLogService.recordId.next(null);

  	this.dialogService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: SaveAction) => {
			if (data.value == Number(magicNumber.four)) {
				const previousStep: number = this.currentStep;
				if(this.fromWhereStepChange === 'stepper')
				{
					this.currentStep = this.pointerEvent.index;
				}
				else
				{
					this.currentStep += this.btnPressed;
				}
				this.cdr.markForCheck();
				this.markPreviousStepFormPristine(previousStep);
			} else if (data.value == Number(magicNumber.three)) {
				this.saveFormDataStepWise(data.reasonValue);
			}
			this.dialogService.resetDialogButton();
  		});
  	this.currentStep = magicNumber.zero;
	  this.translateStepperLabels();
	  this.translate.onLangChange.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.translateStepperLabels();
		});
		this.scrollOnTop.scrollTop();
		this.cdr.markForCheck();
	}

	private showDialogueConfirmationWithTextArea()
	{
  	this.dialogService.showConfirmationwithTextArea(
  		'DoYouWantToUpdateTheClientConfiguration',
  		PopupDialogButtons.SaveWithCancel
  	);
	}

	public isupdateButtonEnableOrDisable(yourCurrentStep: number) {

		const form = this.selectForm(this.currentStep);

		if(yourCurrentStep === Number(magicNumber.five)){
			return false;
		}

		return !form.pristine;
	}

	private markPreviousStepFormPristine(previousStep: number): void {

		const form = this.selectForm(previousStep);
		form.markAsPristine();
	}

	public onNextAndPreviousClick(num: number): void {
  	this.toasterService.resetToaster();
  	this.btnPressed = num;
  	this.fromWhereStepChange = 'nextAndPrevious';

		const form = this.selectForm(this.currentStep);

		this.onstepChangeAndNextAndPreviousClickForm(this.pointerEvent, false, num, form);

	}

	private onstepChangeAndNextAndPreviousClickForm(pointerEvt: StepperActivateEvent, isStepperPressed:boolean, btnPressed:number, Form: FormGroup)
	{
		Form.markAllAsTouched();

		if(Form.valid){

			if (!Form.pristine )
			{
				this.showDialogueConfirmationWithTextArea();
			}
			else if(isStepperPressed)
			{
				this.currentStep = pointerEvt.index;
			}
			else
			{
				this.currentStep += btnPressed;
			}
			this.cdr.markForCheck();
		}
	}

	public stepChangeFn(e: StepperActivateEvent) {
  	this.toasterService.resetToaster();
  	this.fromWhereStepChange = 'stepper';
  	this.pointerEvent = e;

		const form = this.selectForm(this.currentStep);

		e.preventDefault();
		this.onstepChangeAndNextAndPreviousClickForm(e, true, magicNumber.zero, form);
	}

	public submit(): void {

  	this.toasterService.resetToaster();
  	this.btnPressed = 0;
  	this.fromWhereStepChange = "";
		const form = this.selectForm(this.currentStep);

		form.markAllAsTouched();
		if(form.valid)
			this.saveFormDataStepWise('');
	}

	public selectForm(step: number){
		switch (step) {

  		case magicNumber.zero:
  				return this.addEditConfigureClientForm;

  		case magicNumber.one:
  				return this.systemMessageForm;

  		case magicNumber.two:
  				return this.securityClearanceformStatus;

  		case magicNumber.three:
  				return this.staffingAgencyForm;

  		case magicNumber.four:
  				return this.locationOfficerformStatus;

  		case magicNumber.six:
  				return this.passwordPolicyForm;

			default:
				return this.addEditConfigureClientForm;
  	}
	}

	private saveFormDataStepWise(reasonForChange: string) {

  	this.configureClient.update.next({reasonForChange: reasonForChange, update: true});

  	this.scrollOnTop.scrollTop();

  	this.configureClient.toMoveObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {ApiResponse: GenericResponseBase<null> | null, move: boolean}) => {
  			if(res.ApiResponse)
				{
					if(res.ApiResponse.StatusCode == Number(HttpStatusCode.Ok)){
  					this.toasterService.showToaster(ToastOptions.Success, 'ClientConfigurationHasBeenUpdatedSuccessfully');
  					this.configureClient.update.next({reasonForChange: '', update: false});
						this.eventLogService.isUpdated.next(true);
  					if(res.move){
  						if(this.fromWhereStepChange === 'stepper')
  							this.currentStep = this.pointerEvent.index;
  						else
  							this.currentStep += this.btnPressed;
  					}
  				}
  				else{
  					this.toasterService.showToaster(ToastOptions.Error, res.ApiResponse.Message);
  				}
					this.configureClient.toMove.next({ApiResponse: null, move: false});
					this.btnPressed = magicNumber.zero;
				}
				else if(res.move){
					if(this.fromWhereStepChange === 'stepper')
						this.currentStep = this.pointerEvent.index;
					else
						this.currentStep += this.btnPressed;
				}
				this.cdr.markForCheck();
  	});

  	this.oNSubmitMakeAllFormPristineAndTouched();
	}

	private oNSubmitMakeAllFormPristineAndTouched()
	{
  	this.addEditConfigureClientForm.markAsPristine();
  	this.systemMessageForm.markAsPristine();
  	this.securityClearanceformStatus.markAsPristine();
  	this.staffingAgencyForm.markAsPristine();
  	this.passwordPolicyForm.markAsPristine();
  	this.locationOfficerformStatus.markAsPristine();
  	this.pointerEvent.preventDefault();
	}

	private translateStepperLabels() {
		const translationObservables = this.steps.map((step) => {
			return this.translate.stream(step.label).pipe(take(magicNumber.one));
		  });

		  forkJoin(translationObservables).subscribe((translatedLabels) => {
			translatedLabels.forEach((label, index) => {
			  this.steps[index].label = label;
			});

		  });
	}

	ngOnDestroy(): void {
  	this.toasterService.resetToaster();
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
	}
}

