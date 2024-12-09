/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subscription, Subject, takeUntil } from 'rxjs';

@Component({selector: 'app-toaster',
	templateUrl: './toaster.component.html',
	styleUrls: ['./toaster.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToasterComponent implements OnInit {

	public text = '';
	public cssClass = '';
	public iconCssClass = '';
	public isShow: boolean = false;
	public isHtml: boolean = false;
	public dynamicParam: DynamicParam[] = [];
	private unsubscribe$ = new Subject<void>();
  @Input() isOnComponent: boolean = false;
  private timeoutId: any;

  public toasterArray: any[] = [];

  constructor(
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  	this.toasterService.toasterSettingObs.pipe(takeUntil(this.unsubscribe$))
  		.subscribe((res) => {
  		if (res == null || res == undefined) {
  			this.toasterArray.length = 0;
  				this.cdr.markForCheck();
  			return;
  		}
  		this.toasterArray = res;
  		this.autoHideToast(this.toasterArray[0].toasterId, this.toasterArray[0].timeSpan);
		  this.cdr.markForCheck();
  	});
  }

  getObject(object: DynamicParam[]) {
  	if (object.length == Number(magicNumber.zero)) return null;
  	return this.localizationService.GetParamObject(object);
  }

  closeToast(toasterId: string) {
  	this.toasterArray = this.toasterArray.filter((x) =>
  		x.toasterId != toasterId);
  	this.toasterService.resetToaster(toasterId);
  }

  openRightPannel(toasterId: string) {
  	this.toasterService.openRightPannel(toasterId);
  }

  autoHideToast(toasterId: string, timeSpan: number) {
  	if ((timeSpan) == Number(magicNumber.zero))
  		return;

  	timeSpan = timeSpan * Number(magicNumber.oneThousand);

  	this.timeoutId = setTimeout(() => {
  		this.closeToast(toasterId);
  		this.cdr.markForCheck();
  	}, timeSpan);

  }
  ngOnDestroy(): void {
  	this.unsubscribe$.next();
  	this.unsubscribe$.complete();
  	if(this.timeoutId) clearTimeout(this.timeoutId);
  }
}
