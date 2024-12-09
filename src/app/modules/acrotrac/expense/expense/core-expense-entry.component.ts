import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Subject, takeUntil } from 'rxjs';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { NavigationPaths } from './route-constants/route-constants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { ExpenseEntryCoreData } from '@xrm-core/models/acrotrac/common/common-core-data';

@Component({selector: 'app-core-expense',
	templateUrl: './core-expense-entry.component.html',
	styleUrls: ['./core-expense-entry.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreExpenseEntryComponent implements OnInit, OnDestroy {
	public entityId: number = XrmEntities.Expense;
	public statusForm: FormGroup;
	public showHeader: boolean = true;
	public currentStep = magicNumber.zero;
	public statusId: number;
	public isEditMode: boolean = false;
	public displaydata: IStatusCardData;
	private initialStatusCardData = {
		items: [
		  { title: 'ExpenseEntryCode', cssClass: ['basic-title'], item: '' },
		  { title: 'ContractorName', cssClass: ['basic-code'], item: '' },
		  { title: 'AssignmentID', cssClass: ['basic-code'], isLinkable: true, linkParams: '#assignmentDetails', item: '' },
		  { title: 'TotalAmount', item: 'DynamicCurrency', itemDynamicParam: [{ Value: '0.00', IsLocalizeKey: false }, { Value: 'USD', IsLocalizeKey: false }], cssClass: ['basic-code'] },
		  { title: 'Disabled', cssClass: ['basic-code'], item: '' }
		]
	  };
	public statusCardData = JSON.parse(JSON.stringify(this.initialStatusCardData));
	private destroyAllSubscription$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private expenseEntryService: ExpenseEntryService,
		private global: PageTitleService,
		private eventLog: EventLogService
	) {
		this.statusForm = this.formBuilder.group({
			status: [null]
		});
	}

	ngOnInit(): void {
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((url) => {
			this.showHeader = url !== NavigationPaths.list;
		});

		this.expenseEntryService.dataRelease.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((res) => {
			if (res) {
				this.resetStatusCardData();
				this.handleScreenData(res);
				this.updateEventLog(res);
			  } else {
				this.statusId = magicNumber.zero;
			  }
		});
	}

	private handleScreenData(res: ExpenseEntryCoreData): void {
		switch (res.Screen) {
		  case 'add':
				this.getStatusCardDataForAdd(res);
				this.statusId = magicNumber.zero;
				break;
		  case 'edit':
				this.updateStatusCardDataForEdit(res);
				this.statusId = res.StatusId ?? magicNumber.zero;
				break;
		  case 'view':
				this.updateStatusCardDataForView(res);
				this.statusId = res.StatusId ?? magicNumber.zero;
				break;
		}
	  }

	  private updateEventLog(res: ExpenseEntryCoreData): void {
		if (res.Screen === 'view' || res.Screen === 'edit') {
		  this.eventLog.entityId.next(this.entityId);
		  this.eventLog.recordId.next(res.Id);
		}
	  }

	private updateStatusCardDataForEdit(res: ExpenseEntryCoreData): void {
		this.statusCardData = {
			items: this.statusCardData.items.filter((item:IStatusCardItem) =>
				item.title !== 'TotalAmount').map((item:IStatusCardItem) => {
				switch (item.title) {
					case 'ExpenseEntryCode':
						item.item = res.ExpenseEntryCode ?? '';
						break;
					case 'ContractorName':
						item.item = res.ContractorName ?? '';
						break;
					case 'AssignmentID':
						item.item = res.AssignmentCode ?? '';
						break;
					case 'Disabled':
						item.item = res.StatusName ?? '';
				}
				return item;
			})
		};
		this.displayStatusCardData(this.statusCardData);
	}

	private updateStatusCardDataForView(res: ExpenseEntryCoreData): void {
		this.statusCardData.items[0].item = res.ExpenseEntryCode;
		this.statusCardData.items[1].item = res.ContractorName;
		this.statusCardData.items[2].item = res.AssignmentCode;
		this.statusCardData.items[3].itemDynamicParam = res.TotalAmount;
		this.statusCardData.items[4].item = res.StatusName;
		this.displayStatusCardData(this.statusCardData);
	}

	public getStatusCardDataForAdd(res: ExpenseEntryCoreData): void {
		this.statusCardData = {
			items: this.statusCardData.items.filter((item:IStatusCardItem) =>
				item.title !== 'TotalAmount' && item.title !== 'ExpenseEntryCode' && item.title !== 'Disabled' ).map((item:IStatusCardItem) => {
				switch (item.title) {
					case 'ContractorName':
						item.item = res.ContractorName ?? '';
						break;
					case 'AssignmentID':
						item.item = res.AssignmentCode ?? '';
						break;
				}
				return item;
			})
		};
		this.displayStatusCardData(this.statusCardData);
	}

	private displayStatusCardData(data: IStatusCardData ): void {
		this.displaydata = data;
	}

	private resetStatusCardData(): void {
		this.statusCardData = JSON.parse(JSON.stringify(this.initialStatusCardData));
	}

	ngOnDestroy(): void {
		this.destroyAllSubscription$.next();
		this.destroyAllSubscription$.complete();
	}
}
