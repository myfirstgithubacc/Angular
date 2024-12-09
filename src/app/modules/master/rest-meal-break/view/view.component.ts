import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { RestMealBreakService } from 'src/app/services/masters/rest-meal-break.service';
import { NavigationPaths } from '../route-constants/route-constants';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { RestMealBreakConfigurationAddEdit } from '@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-configuration-add-edit';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	standalone: true,
	imports: [CommonModule, SharedModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	@ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;

	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;

		if (
			(element.nodeName === 'TD' || element.className === 'k-column-title') &&
			element.offsetWidth < element.scrollWidth
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}

	public restMealBreakData: RestMealBreakConfigurationAddEdit;
	public selectableSettings: SelectableSettings;
	public magicNumber = magicNumber;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private router: Router,
		public localizationService: LocalizationService,
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private restMealBreakService: RestMealBreakService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.activatedRoute.params.pipe(switchMap((param) => {
			return this.restMealBreakService.getRestMealBreakConfigurationByUkey(param['id']);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBase<RestMealBreakConfigurationAddEdit>) => {
			if (isSuccessfulResponse(response)) {
				this.restMealBreakData = response.Data;
				this.restMealBreakService.holdData.next({ 'Disabled': this.restMealBreakData.Disabled, 'RuleCode': this.restMealBreakData.RuleCode, 'Id': this.restMealBreakData.Id });
			}
		});
		this.cdr.markForCheck();
	}

	public backToList(): void {
		this.router.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}

