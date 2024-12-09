import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Tooltip } from './tooltip.interface';
@Component({selector: 'tooltip',
	templateUrl: './tooltip.component.html',
	styleUrls: ['./tooltip.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {

  @Input() tooltipData: Tooltip;

}
