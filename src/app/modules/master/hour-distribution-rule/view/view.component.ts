import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { NavigationPaths } from '../route-constants/route-constants';
import { Subject, takeUntil } from 'rxjs';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { PreDefinedSchedules } from '@xrm-shared/services/common-constants/static-data.enum';
import { HourDistributionRuleAddEdit } from '@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-add-Edit.model';
import { isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

// eslint-disable-next-line no-shadow
export enum operatorenum {
	GreaterThan = '>',
	LessThan = '<',
	Equal = '=',
	LessThanOrEqual = '<=',
	GreaterThanOrEqual = '>=',
}

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ViewComponent implements OnInit {
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
	public operator: any = {
		'1': operatorenum.GreaterThan,
		'2': operatorenum.LessThan,
		'3': operatorenum.Equal,
		'4': operatorenum.LessThanOrEqual,
		'5': operatorenum.GreaterThanOrEqual
	};

	public hourDistributionRuleData: HourDistributionRuleAddEdit;
	public selectableSettings: SelectableSettings;
	public magicNumber = magicNumber;

	private ukey: string;
	public preDefinedWorkScheduleId: number;
	private destroyAllSubscribtion$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private hourDistributionRuleService: HourDistributionRuleService,
		private activatedRoute: ActivatedRoute,
		private commonHeaderIcons: CommonHeaderActionService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.preDefinedWorkScheduleId = PreDefinedSchedules['9/80'];
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((param) => {
			this.hourDistributionRuleService.getHourDistributionRuleByUkey(param['id']).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
				if(isSuccessfulResponse(response)) {
					this.hourDistributionRuleData = response.Data;
					this.ukey = param['id'];
					this.createCommonHeader(this.hourDistributionRuleData);
					this.cdr.markForCheck();
				}
			});
		});
	}

	private createCommonHeader({Disabled, RuleCode, Id}: HourDistributionRuleAddEdit) {
		this.commonHeaderIcons.holdData.next({'Disabled': Disabled, 'RuleCode': RuleCode, 'Id': Id});
	}

	backToList() {
		this.router.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
