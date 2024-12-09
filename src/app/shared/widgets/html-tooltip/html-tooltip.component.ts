import { ChangeDetectorRef, Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Position } from '@progress/kendo-angular-tooltip';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
@Component({selector: 'app-html-tooltip',
	templateUrl: './html-tooltip.component.html',
	styleUrls: ['./html-tooltip.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HtmlTooltipComponent {
	@Input() label: string = '';
	@Input() position: Position;
 	@Input() popoverBody: string = '';

	@Input() labelLocalizeParam: DynamicParam[] = [];

	@Input() popoverbodyLocalizeParam: DynamicParam[] = [];

	constructor(private localizationService: LocalizationService, private cdr: ChangeDetectorRef) { }

	 public getObject(array: DynamicParam[]): object | null {
		if (array.length == magicNumber.zero) return null;
		return this.localizationService.GetParamObject(array);
	}

}
