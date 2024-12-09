import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationPaths } from '../route-constants/route-constants';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ExpenseTypeService } from 'src/app/services/masters/expense-type.service';
import { ExpenseTypeAddEdit } from '@xrm-core/models/expense-type/add-Edit/expense-type-add-edit';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {
	public expenseTypeData: ExpenseTypeAddEdit;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		public localizationService: LocalizationService,
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private expenseTypeService: ExpenseTypeService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(){
		this.activatedRoute.params.pipe(switchMap((param) => {
			return this.expenseTypeService.getExpenseTypeByUkey(param['id']);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((response: GenericResponseBase<ExpenseTypeAddEdit>) => {
			if(isSuccessfulResponse(response)){
				this.expenseTypeData = response.Data;
				this.expenseTypeService.holdData.next({'Disabled': this.expenseTypeData.Disabled, 'RuleCode': this.expenseTypeData.ExpenseCode, 'Id': this.expenseTypeData.Id});
			}
		});
		this.cdr.markForCheck();
	}

	public backToList():void {
		this.router.navigate([`${NavigationPaths.list}`]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
