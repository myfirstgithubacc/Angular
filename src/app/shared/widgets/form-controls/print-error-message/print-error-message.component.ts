import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-print-error-message',
	templateUrl: './print-error-message.component.html',
	styleUrls: ['./print-error-message.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintErrorMessageComponent {
	@Input('control') control: any;

	constructor(private localizationService: LocalizationService, private cdr: ChangeDetectorRef) {
	}

	getObject(data: any): string {
		if (data == null) return '';
		if (data.length == magicNumber.zero) return '';
		this.cdr.markForCheck();
		return this.localizationService.GetParamObject(data);
	}

	ngDoCheck() {
		this.cdr.markForCheck();
	}

}
