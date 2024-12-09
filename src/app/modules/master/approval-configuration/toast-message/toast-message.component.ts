import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({selector: 'app-toast-message',
	templateUrl: './toast-message.component.html',
	styleUrls: ['./toast-message.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastMessageComponent{
	toggleOffcanvas() {
		throw new Error('Method not implemented.');
	}
  @Input() existingUkey: string;
  @Input() showToast:boolean =false;

  open:boolean = false;

  public openView():void{
  	this.open= true;
  }


}
