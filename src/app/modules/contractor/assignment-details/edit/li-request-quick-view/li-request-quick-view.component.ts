import { Component, Input, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { IDynamicLabel, RequestDetail } from '../../interfaces/interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';

@Component({selector: 'app-li-request-quick-view',
	templateUrl: './li-request-quick-view.component.html',
	styleUrls: ['./li-request-quick-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiRequestQuickViewComponent {
    @Input() LIRequestData: RequestDetail;
    @Input() dynamicLabelName: IDynamicLabel[];

    constructor(private localization: LocalizationService){}

    public getDynamicLabelName(key:string){
    	return this.dynamicLabelName.find((x: IDynamicLabel) =>
    		x.Text==key);
    }

    public getDateLocalization(value: string): string{
    	return this.localization.TransformDate(value);
    }

}
