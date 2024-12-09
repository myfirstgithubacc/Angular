import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Subject, takeUntil } from 'rxjs';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { NavigationPaths } from './route-constants/route-constants';
import { TimeEntryCoreData } from '@xrm-core/models/acrotrac/time-entry/common-interface/common-core-data';

@Component({
	selector: 'app-core-timesheet',
	templateUrl: './core-timesheet.component.html',
	styleUrls: ['./core-timesheet.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoreTimesheetComponent {
	public entityId: number = magicNumber.zero;
	public statusForm: FormGroup;
	public showHeader: boolean = true;
	public currentStep = magicNumber.zero;
	public statusId: number;
	public isEditMode: boolean = false;
	public displaydata: IStatusCardData;
	private initialStatusCardData = {
		items: [
			{ title: 'TimeSheetId', cssClass: ['basic-title'], item: '' },
			{ title: 'ContractorName', cssClass: ['basic-code'], item: '' },
			{ title: 'AssignmentID', cssClass: ['basic-code'], isLinkable: true, linkParams: '#assignmentDetails', item: '' },
			{ title: 'Disabled', cssClass: ['basic-code'], item: '' }
		]
	};
	public statusCardData = JSON.parse(JSON.stringify(this.initialStatusCardData));
	private destroyAllSubscription$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private timeEntryService: TimeEntryService,
		private global: PageTitleService,
		private eventLog: EventLogService,
		private cdr: ChangeDetectorRef
	) {
		this.statusForm = this.formBuilder.group({
			status: [null]
		});
	}

	ngOnInit(): void {
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((url) => {
			this.showHeader = url !== NavigationPaths.list;
			this.cdr.markForCheck();
		});

		this.timeEntryService.dataRelease.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((res) => {
			if (res) {
				this.resetStatusCardData();
				this.handleScreenData(res);
				this.updateEventLog(res);
			} else {
				this.statusId = magicNumber.zero;
			}
			this.cdr.markForCheck();
		});
	}

	private handleScreenData(res: TimeEntryCoreData): void {
		switch (res.Screen) {
			case 'add':
				this.getStatusCardDataForAdd(res);
				this.statusId = magicNumber.zero;
				break;
			case 'edit':
				this.updateStatusCardDataForView(res);
				this.statusId = res.StatusId ?? magicNumber.zero;
				this.entityId = res.EntityId ?? magicNumber.zero;
				break;
		}
	}

	private updateEventLog(res: TimeEntryCoreData): void {
		if (res.Screen === 'edit') {
			this.eventLog.entityId.next(this.entityId);
			this.eventLog.recordId.next(res.Id);
		}
	}

	private updateStatusCardDataForView(res: TimeEntryCoreData): void {
		this.statusCardData.items[0].item = res.TimeEntryCode;
		this.statusCardData.items[1].item = res.ContractorName;
		this.statusCardData.items[2].item = res.AssignmentCode;
		this.statusCardData.items[3].item = res.StatusName;
		this.displayStatusCardData(this.statusCardData);
	}

	public getStatusCardDataForAdd(res: TimeEntryCoreData): void {
		this.statusCardData = {
			items: this.statusCardData.items.filter((item: IStatusCardItem) =>
				item.title !== 'TimeSheetId' && item.title !== 'Disabled').map((item: IStatusCardItem) => {
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

	private displayStatusCardData(data: IStatusCardData): void {
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
