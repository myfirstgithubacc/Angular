import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoreServService } from './core-serv.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { Router } from '@angular/router';
import { NavigationPaths } from './constant/routes-constant';
import { ContractorData } from './constant/contractor-interface';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { Subject, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { IRecordButton, IStatusCardData } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-core-contractor-details',
	templateUrl: './core-contractor-details.component.html',
	styleUrls: ['./core-contractor-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreContractorDetailsComponent implements OnInit{
	public statusForm: FormGroup;
	public showHeader: boolean = true;
	public recordId: number;
	public recordStatus: string;
	public buttonSet: IRecordButton[];
	private isView: boolean;
	public entityId: number = XrmEntities.Contractor;
	public contractorData: ContractorData;
	public statusCardData:IStatusCardData = {
		items: [
			{
				item: '',
				title: 'ContractorName',
				cssClass: ['basic-title']
			},
			{
				item: '',
				title: 'ContractorID',
				cssClass: ['']
			}
		]
	  };
	private ngUnsubscribe$: Subject<void> = new Subject<void>();
	public listOfStatus = [
		{ Text: dropdown.Active, Value: dropdown.Active },
		{ Text: dropdown.Inactive, Value: dropdown.Inactive }
	];
	private onEdit = () => {
		this.route.navigate([`${NavigationPaths.addEdit}/${this.contractorData.UKey}`]);
		this.contractorService.showAddButtonContractor.next(true);

	};

	// eslint-disable-next-line max-params
	constructor(
    private formBuilder: FormBuilder,
    private coreService: CoreServService,
    private global: PageTitleService,
	private commonHeaderIcons: CommonHeaderActionService,
    private eventLog: EventLogService,
	private route:Router,
	public contractorService: ContractorService
	)
	{
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});
	}

	ngOnInit(){

		this.global.getRouteObs.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((url) => {
			this.isView = url.includes(NavigationPaths.view);
			this.showHeader = url !== NavigationPaths.list;
			this.updateButtonSet();
		});

		this.coreService.Contract.asObservable().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((items: ContractorData) => {
			this.contractorData = items;
			this.recordStatus = items.Disabled
				? dropdown.Inactive
				: dropdown.Active;
			this.statusCardData.items[magicNumber.zero].item = items.FullName;
			this.statusCardData.items[magicNumber.one].item = items.Code;
			this.statusCardData.items[magicNumber.two] = items.Disabled
				? { item: 'Inactive', cssClass: ['red-color'], title: 'Disabled' }
				: { item: 'Active', cssClass: ['green-color'], title: 'Disabled' };

			this.SetEventLogData();
		});
	}

	private updateButtonSet(){
		this.buttonSet = this.isView ?
			this.getButtonSet() :
			[];
	}

	private getButtonSet(){
		return [
			{
				status: dropdown.Active,
				items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
			},
			{
				status: dropdown.Inactive,
				items: this.commonHeaderIcons.commonActionSetOfEditIconToShowView(this.onEdit)
			}
		];
	}

	private SetEventLogData(){
		this.eventLog.recordId.next(this.contractorData.Id);
		this.eventLog.entityId.next(this.entityId);
	}

	ngOnDestroy(){
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

}
