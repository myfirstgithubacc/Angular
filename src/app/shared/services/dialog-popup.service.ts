import {
	Component,
	EventEmitter,
	Injectable,
	Input,
	Output
} from '@angular/core';
import {
	DialogService,
	DialogRef,
	DialogCloseResult
} from '@progress/kendo-angular-dialog';
import { ConfirmationPopupTextAreaComponent } from '@xrm-widgets';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { DynamicParam } from './Localization/DynamicParam.interface';
import { LocalizationService } from './Localization/localization.service';
import { DialogActionButton } from '@xrm-shared/models/copy-dialog.model';
@Component({
	selector: 'dialog-service',
	template: ``
})

@Injectable({
	providedIn: 'root'
})

export class DialogPopupService {

  @Input() public Message: string = '';
  public AcceptBtn: string = '';
  public DeclineBtn: string = '';
  private unsubscribe$ = new Subject<void>();
  public popupType: string = '';
  public dialogsuccess: DialogRef | null | undefined;
  public dialogerror: DialogRef | null | undefined;
  public dialogconfirmation: DialogRef | null | undefined;
  public dialogconfirmationtext: DialogRef | null | undefined;
  public dialogInformation: DialogRef | null | undefined;
  public closeDialog = {close: true};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() OnCloseButton: EventEmitter<any> = new EventEmitter<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dialogButton = new BehaviorSubject<any>({});
  dialogButtonObs = this.dialogButton.asObservable();

  constructor(
    private localizationService: LocalizationService,
    private DialogServices: DialogService
  ) { }

  resetDialogButton() {
  	this.dialogButton.next(null);
  }
  public showConfirmation(
  	message: string,
  	buttons: DialogActionButton[],
  	messageLocalizedParam: DynamicParam[] = []
  ): void {
  	this.Message = message;
  	this.Message = this.localizationService.GetLocalizeMessage(message, messageLocalizedParam);
  	buttons.forEach((item: DialogActionButton) => {
  		item.text = this.localizationService.GetLocalizeMessage(item.text, item.btnLocalizaedParam);
  	});
  	if (this.dialogconfirmation) {
  		this.dialogconfirmation?.close();
  	}
  	const dialog: DialogRef = this.DialogServices.open({
  		title: ' ',
  		content: ConfirmationPopupComponent,
  		actions: buttons,
  		width: 420,
  		minWidth: 250,
  		cssClass: "dailog dailog-center"
  	}),
  		userInfo = dialog.content.instance as DialogPopupService;
  	this.dialogconfirmation = dialog;

  	userInfo.Message = this.Message;

  	dialog.result.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
  		if (result instanceof DialogCloseResult) {
  			this.OnCloseButton.emit(this.closeDialog);
  			this.dialogButton.next("close");
  		} else {
  			this.dialogButton.next(result);
  		}
  	});

  }

  public showSuccess(
  	message: string,
  	buttons: DialogActionButton[],
  	messageLocalizedParam: DynamicParam[] = []
  ): void {

  	buttons.forEach((item: DialogActionButton) => {
  		item.text = this.localizationService.GetLocalizeMessage(item.text, item.btnLocalizaedParam);
  	});

  	this.Message = this.localizationService.GetLocalizeMessage(message, messageLocalizedParam);

  	if (this.dialogsuccess) {
  		this.dialogsuccess.close();
  	}

  	const dialog: DialogRef = this.DialogServices.open({
  		title: ' ',
  		content: SuccessPopupComponent,
  		actions: buttons,
  		width: 420,
  		minWidth: 250,
  		cssClass: "confirmation-popupclass"
  	}),
  		userInfo = dialog.content.instance;
  	this.dialogsuccess = dialog;

  	userInfo.Message = this.Message;

	  dialog.result.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
  		if (result instanceof DialogCloseResult) {
  			this.OnCloseButton.emit(this.closeDialog);
  		} else {
  			this.dialogButton.next(result);
  		}
  	});
  }

  public showError(message: string, buttons: DialogActionButton[], messageLocalizedParam: DynamicParam[] = []): void {
  	this.Message = message;
  	if (this.dialogerror) {
  		this.dialogerror.close();
  	}

  	this.Message = this.localizationService.GetLocalizeMessage(message, messageLocalizedParam);

  	buttons.forEach((item: DialogActionButton) => {
  		item.text = this.localizationService.GetLocalizeMessage(item.text, item.btnLocalizaedParam);
  	});
  	const dialog: DialogRef = this.DialogServices.open({
  		title: ' ',
  		content: ErrorPopupComponent,
  		actions: buttons,
  		width: 420,
  		minWidth: 250,
  		cssClass: "confirmation-popupclass"
  	}),
  	 userInfo = dialog.content.instance as DialogPopupService;
  	userInfo.Message = this.Message;
	  dialog.result.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
  		if (result instanceof DialogCloseResult) {
  			this.OnCloseButton.emit(this.closeDialog);
  		} else {
  			this.dialogButton.next(result);
  		}
  	});
  }

  public showConfirmationwithTextArea(
  	message: string,
  	buttons: DialogActionButton[],
  	messageLocalizedParam: DynamicParam[] = []
  ): void {
  	if (this.dialogconfirmationtext) {
  		this.dialogconfirmationtext.close();
  	}
  	this.Message = this.localizationService.GetLocalizeMessage(message, messageLocalizedParam);
  	buttons.forEach((item: DialogActionButton) => {
  		item.text = this.localizationService.GetLocalizeMessage(item.text, item.btnLocalizaedParam);
  	});
  	const dialog: DialogRef = this.DialogServices.open({
  		title: ' ',
  		content: ConfirmationPopupTextAreaComponent,
  		actions: buttons,
  		width: 420,
  		minWidth: 250,
  		cssClass: "confirmation-popupclass"
  	}),
  		userInfo = dialog.content.instance as ConfirmationPopupTextAreaComponent;
  	this.dialogconfirmationtext = dialog;

  	userInfo.messageTitle = this.Message;

	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	  dialog.result.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
  		if (result instanceof DialogCloseResult) {
  			this.OnCloseButton.emit(this.closeDialog);
  		} else {
  			result.reasonValue = userInfo.reasonValue;
  			this.dialogButton.next(result);
  		}
  	});
  }

  public showInformation(
  	message: string,
  	buttons: DialogActionButton[],
  	messageLocalizedParam: DynamicParam[] = []
  ): void {
  	this.Message = message;
  	this.Message = this.localizationService.GetLocalizeMessage(message, messageLocalizedParam);
  	buttons.forEach((item: DialogActionButton) => {
  		item.text = this.localizationService.GetLocalizeMessage(item.text, item.btnLocalizaedParam);
  	});
  	if (this.dialogInformation) {
  		this.dialogInformation.close();
  	}
  	const dialog: DialogRef = this.DialogServices.open({
  		title: ' ',
  		content: InformationPopupComponent,
  		actions: buttons,
  		width: 420,
  		minWidth: 250,
  		cssClass: "confirmation-popupclass"
  	}),
  		userInfo = dialog.content.instance as DialogPopupService;
  	this.dialogInformation = dialog;
  	userInfo.Message = this.Message;

	  dialog.result.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
  		if (result instanceof DialogCloseResult) {
  			this.OnCloseButton.emit(this.closeDialog);
  		} else {
  			this.dialogButton.next(result);
  		}
  	});
  }

  ngOnDestroy() {
  	this.unsubscribe$.next();
  	this.unsubscribe$.complete();
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
export class ConfirmationPopupTextAreaComponent1 {
	public Message: string = '';
	public ReasonForUpdate: string = '';
}

@Component({
	selector: 'inform-popup',
	// templateUrl: './confirmation-popup.component.html',
	template: `<img src="assets/icon/xrm-icons/primary-circle-exclamation.svg" class="popup-xrm-icon dailog__icon">
    <h3 class="dailog__title text-center">{{ Message }}</h3> `
})

export class InformationPopupComponent {
	public Message: string = '';
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


