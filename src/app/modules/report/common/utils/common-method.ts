import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { DialogButton } from '@xrm-master/user/interface/user';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { ReportDataService } from 'src/app/services/report/report.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ReportNavigationPaths } from '../../constants/route-path';
import { ReportType } from '../../constants/enum-constants';

@Injectable({
	providedIn: 'root'
})

export class NavigationService {
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
    private dialogService: DialogPopupService,
    private reportDataService: ReportDataService,
    private route: Router
	) {}

	backToBaseDataEntity(options: { isCustomReport: boolean, isGridChanged?: boolean, isEditMode?: boolean, isCopyOfPredefined?:boolean, isCopyMode?:boolean}) {
		const { isGridChanged = false, isEditMode = false, isCopyOfPredefined, isCopyMode } = options;
		let isCustomReport = options.isCustomReport,
			routePath: string;
		this.dialogService.resetDialogButton();
		if(isCopyOfPredefined){
			isCustomReport = false;
		}
		if (isCustomReport) {
			routePath = isEditMode || isCopyMode
				? ReportNavigationPaths.list
				: ReportNavigationPaths.addEdit.customReport.baseData;
		} else {
			routePath = `/xrm/report/report-library/pre-defined-report/parameter-selection`;
		}
		if(isGridChanged && !isEditMode){
			this.dialogService.showConfirmation('ConfirmChangeBaseDataEntity', PopupDialogButtons.YesNoOnly);
			this.dialogService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: DialogButton) => {
				if (data.value === Number(magicNumber.fourteen)) {
					this.reportDataService.setStepperData.next({ currentStep: magicNumber.zero });
					this.route.navigate([routePath]);
				}
			});
		}
		else{
			this.reportDataService.setStepperData.next({ currentStep: magicNumber.zero });
			this.route.navigate([routePath]);
		}
	}

	destroySubscriptions() {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.dialogService.resetDialogButton();
	}
}
