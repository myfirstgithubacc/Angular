import {
	Component,
	Injectable,
	Input,
	Output
} from '@angular/core';
import {
	DialogService,
	DialogRef
} from '@progress/kendo-angular-dialog';

import { ConfirmationpopupService } from './Confirmation-popup.service';
import { DynamicParam } from './Localization/DynamicParam.interface';
import { LocalizationService } from './Localization/localization.service';

@Component({
	selector: 'dialog-service',
	template: ``
})
@Injectable({
	providedIn: 'root'
})
export class DialogServices {

  @Input() public Message: string = '';
  public AcceptBtn: string = '';
  public DeclineBtn: string = '';
  popupType: string = '';
  dialogsuccess: DialogRef | null | undefined;
  dialogerror: DialogRef | null | undefined;
  dialogconfirmation: DialogRef | null | undefined;
  dialogconfirmationtext: DialogRef | null | undefined;
  constructor(
    private localizationService: LocalizationService,
    private ConfirmationpopupSer: ConfirmationpopupService,
    private DialogSer: DialogService
  ) { }

  // eslint-disable-next-line max-params
  public showConfirmation(
  	message: string,
  	acceptBtnName: string,
  	declineBtnName: string,
  	actionName?: string,
  	messageLocalizedParam: DynamicParam[] = [],
  	acceptBtnLocalizedParam: DynamicParam[] = [],
  	declinedBtnLocalizedParam: DynamicParam[] = []
  ): void {
  	this.Message = message;
  	this.AcceptBtn = acceptBtnName;
  	this.DeclineBtn = declineBtnName;

  	this.Message = this.localizationService.GetLocalizeMessage(
  		message,
  		messageLocalizedParam
  	);
  	this.AcceptBtn =
      this.localizationService.GetLocalizeMessage(acceptBtnName, acceptBtnLocalizedParam);
  	this.DeclineBtn =
      this.localizationService.GetLocalizeMessage(declineBtnName, declinedBtnLocalizedParam);

  	if (this.dialogconfirmation) {
  		this.dialogconfirmation.close();
  	}
  	const dialog: DialogRef = this.DialogSer.open({
  		title: ' ',
  		content: ConfirmationPopupComponent,
  		actions: [
  			{ text: this.AcceptBtn, themeColor: 'primary' },
  			{ text: this.DeclineBtn }
  		],
  		width: 420,
  		minWidth: 250
  	}),
  		userInfo = dialog.content.instance as DialogServices;
  	this.dialogconfirmation = dialog;

  	userInfo.Message = this.Message;

  	// eslint-disable-next-line @typescript-eslint/no-explicit-any
  	dialog.result.subscribe((result:any) => {
  		  if (
  			result.text.toLowerCase().includes(acceptBtnName.toLocaleLowerCase())
  		) {
  			this.ConfirmationpopupSer.setonconfirm(actionName);
  			actionName = '';
  		}
  	});
  }

  public showSuccess(
  	message: string,
  	messageLocalizedParam: DynamicParam[] = []
  ): void {

  	this.Message = message;
  	this.Message = this.localizationService.GetLocalizeMessage(
  		message,
  		messageLocalizedParam
  	);

  	if (this.dialogsuccess) {
  		this.dialogsuccess.close();
  	}

  	const dialog: DialogRef = this.DialogSer.open({
  		title: ' ',
  		content: SuccessPopupComponent,
  		actions: [{ text: 'OK', themeColor: 'primary' }],
  		width: 420,
  		minWidth: 250
  	}),
  		userInfo = dialog.content.instance;
  	this.dialogsuccess = dialog;
  	userInfo.Message = this.Message;
  	dialog.result.subscribe(() => {
  			dialog.close();
  	});
  }

  // eslint-disable-next-line max-params
  public showConfirmationwithTextArea(
  	message: string,
  	acceptBtnName: string,
  	declineBtnName: string,
  	actionName?: string,
  	messageLocalizedParam: DynamicParam[] = [],
  	acceptBtnLocalizedParam: DynamicParam[] = [],
  	declinedBtnLocalizedParam: DynamicParam[] = []
  ): void {
  	// alert(actionName)
  	this.Message = message;
  	this.AcceptBtn = acceptBtnName;
  	this.DeclineBtn = declineBtnName;
  	if (this.dialogconfirmationtext) {
  		this.dialogconfirmationtext?.close();
  	}

  	this.Message = this.localizationService.GetLocalizeMessage(
  		message,
  		messageLocalizedParam
  	);
  	this.AcceptBtn =
      this.localizationService.GetLocalizeMessage(acceptBtnName, acceptBtnLocalizedParam);
  	this.DeclineBtn =
      this.localizationService.GetLocalizeMessage(declineBtnName, declinedBtnLocalizedParam);

  	const dialog: DialogRef = this.DialogSer.open({
  		title: ' ',
  		content: ConfirmationPopupTextAreaComponent,
  		actions: [
  			{ text: this.AcceptBtn, themeColor: 'primary' },
  			{ text: this.DeclineBtn }
  		],
  		width: 420,
  		minWidth: 250
  	}),
  		userInfo = dialog.content.instance as DialogServices;
  	this.dialogconfirmationtext = dialog;

  	userInfo.Message = this.Message;

  	dialog.result.subscribe((result) => {
  			this.ConfirmationpopupSer.setonconfirm(actionName);
  			actionName = '';
  	});
  }

  public showError(message: string, messageLocalizedParam: DynamicParam[] = []): void {
  	this.Message = message;
  	if (this.dialogerror) {
  		this.dialogerror?.close();
  	}

  	this.Message = this.localizationService.GetLocalizeMessage(
  		message,
  		messageLocalizedParam
  	);

  	const dialog: DialogRef = this.DialogSer.open({
  		title: ' ',
  		content: ErrorPopupComponent,
  		actions: [{ text: 'OK', themeColor: 'primary' }],
  		width: 420,
  		minWidth: 250
  	}),
  		userInfo = dialog.content.instance as DialogServices;
  	userInfo.Message = this.Message;

  	dialog.result.subscribe((result) => {
  		dialog.close();
  	});
  }
}
@Component({
	selector: 'confirm-popup',
	// templateUrl: './confirmation-popup.component.html',
	template: `<img src="assets/icon/xrm-icons/primary-circle-question-mark.svg" class="popup-xrm-icon dailog__icon">
    <h3 class="dailog__title text-center">{{ Message }}</h3> `
})
export class ConfirmationPopupComponent {
	public Message: string = '';
}
@Component({
	selector: 'confirmtextarea-popup',
	// templateUrl: './confirmation-popup.component.html',
	template: `<img src="assets/icon/xrm-icons/primary-circle-question-mark.svg" class="popup-xrm-icon dailog__icon">
    <h3 class="dailog__title text-center">{{ Message }}</h3>
    <label class="w-100">
      <textarea
        [rows]="4"
        class="custom-suffix w-100"
        placeholder="Reason for Update"
      ></textarea>
    </label>
  `
})
export class ConfirmationPopupTextAreaComponent {
	public Message: string = '';
	public ReasonForUpdate: string = '';
}

@Component({
	selector: 'success-popup',
	// templateUrl: './confirmation-popup.component.html',
	template: `<img src="assets/icon/xrm-icons/primary-circle-check.svg" class="popup-xrm-icon dailog__icon">
    <h3 class="dailog__title text-center">{{ Message }}</h3> `
})
export class SuccessPopupComponent {
	public Message: string = '';
}

@Component({
	selector: 'error-popup',
	// templateUrl: './confirmation-popup.component.html',
	template: `<img src="assets/icon/xrm-icons/primary-circle-xmark.svg" class="popup-xrm-icon dailog__icon">
    <h3 class="dailog__title text-center">{{ Message }}</h3> `
})
export class ErrorPopupComponent {
	public Message: string = '';
}
