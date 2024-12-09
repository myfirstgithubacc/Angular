import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'currency-widgets',
	templateUrl: './currency-widgets.component.html',
	styleUrls: ['./currency-widgets.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyWidgetsComponent {
  @Input() currency: string;
  @Input() value: number;
  @Input() tooltipVisible: boolean;
  @Input() tooltipTitle: string;

  @Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
  @Input() labelLocalizeParam: DynamicParam[] = [];

  @Input() tooltipTitleParams: DynamicParam[] = [];
  @Input() labelParams: DynamicParam[] = [];

  constructor(private cdr: ChangeDetectorRef) { }

}
