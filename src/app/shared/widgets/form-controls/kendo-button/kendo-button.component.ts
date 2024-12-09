import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { Subscription, Subject, takeUntil } from 'rxjs';
@Component({selector: 'app-kendo-button',
	templateUrl: './kendo-button.component.html',
	styleUrls: ['./kendo-button.component.scss'],
	providers: [AuthCommonService],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoButtonComponent implements OnInit, OnChanges {
	@Input() buttonName: string = '';

	@Input() buttonIcon: string = '';

	@Input() isDisable: boolean;

  @Input() xrmEntityId: number = magicNumber.zero;
  @Input() subEntityType: string|undefined;

	@Input() dynamicParams: DynamicParam[] = [];

	@Input() buttonLocalizeParam: DynamicParam[] = [];

	@Output() Click: EventEmitter<boolean> = new EventEmitter<boolean>();

	private unsubscribe$ = new Subject<void>();
	constructor(private localizationService: LocalizationService, private commonService: AuthCommonService, private cd: ChangeDetectorRef) { }

	isRendered: boolean =true;

	public ngOnInit(): void {

		if(this.xrmEntityId != Number(magicNumber.zero))
			this.manageAuthorization();
	}

	ngOnChanges(changes: SimpleChanges): void {

		if(changes['subEntityType'] != null)
		{
			if(changes['subEntityType'].currentValue != changes['subEntityType'].previousValue)
				if(this.xrmEntityId != Number(magicNumber.zero))
				{
					this.manageAuthorization();
				}
		}
	}

	manageAuthorization(): void {
		this.commonService.getCreateAuthPermission(this.xrmEntityId, this.subEntityType).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: {isViewable: boolean}) =>
			{
				this.isRendered=res.isViewable;
				this.cd.markForCheck();
			});
	}

	onclick() { this.Click.emit(true); }

	getObject() {

		if (this.buttonLocalizeParam.length == Number(magicNumber.zero)) return null;
		return this.localizationService.GetParamObject(this.buttonLocalizeParam);
	}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	  }
}
