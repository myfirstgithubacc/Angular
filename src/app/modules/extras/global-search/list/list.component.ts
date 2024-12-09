import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GlobalSearchService } from '@xrm-shared/services/global-search.service';
import { HttpStatusCode } from '@angular/common/http';
import { firstValueFrom, of, Subject, takeUntil } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPathAssignments, NavigationPathCandidate, NavigationPathRequests } from '../route-constants/route';
import { ActionButtons } from '../action-buttons/action-buttons';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { AdvanceSearchComponent } from '@xrm-widgets';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ColumnOption } from '@xrm-master/user/interface/user';
import { dropdownModel } from '@xrm-core/models/dropdown.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CandidatePool } from '@xrm-core/models/candidate-pool/candidate-pool.model';
import { IAssignmentDetails } from 'src/app/modules/contractor/assignment-details/interfaces/interface';
import { RequestDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { Store } from '@ngxs/store';
import { RemoveAdvAppliedFilterData } from '@xrm-core/store/advance-filter/actions/adv-filter.actions';
@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalListComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('advanceSearch') advanceSearch: AdvanceSearchComponent;
	@ViewChild('searchTextBox') textBox: TextBoxComponent;
	public FilteredList:unknown;
	public searchTypeForm: FormGroup;
	public searchTypeList: dropdownModel[] = [];
	public columnOptions: ColumnOption[];
	public entityId = 0;
	public entityName = '111';
	public searchText: string = '';
	public pageSize: number = magicNumber.zero;
	private destroyAllSubscription$ = new Subject<void>();
	public tabOptions = {};
	private assignmentActionSet: IActionSetModel[] = [];
	private candidateActionSet: IActionSetModel[] = [];
	private liRequestActionSet: IActionSetModel[] = [];
	public actionSet: any;
	public manageActionSets: ManageGridActionSet[] = [];

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private globalSearchService: GlobalSearchService,
    private gridService: GridViewService,
		private cdr: ChangeDetectorRef,
		private store: Store,
    private route: Router,
		private actionButtons: ActionButtons
	){
		this.searchTypeForm = this.fb.group({
			searchType: [XrmEntities.LightIndustrialRequest]
		});
	}

	async ngOnInit(): Promise<void> {
		await this.getRadioButtons();
		this.getColumnData();
		this.getPageSizeData();
		this.getActionSet();
	}

	ngAfterViewInit(){
		this.initiateSearchText();
		this.textBox.focus();
	}

	getCurrentActionSet(){
		return this.actionSet[this.entityId];
	}
	getManagedActionSet():ManageGridActionSet[] {
		if(this.entityId === XrmEntities.LightIndustrialRequest){
			return [
				{
					ColumnName: 'IsAllowedToEdit',
					ColumnValue: false,
					ActionTitles: ['Edit']
				},
				{
					ColumnName: 'IsReviewActionRequired',
					ColumnValue: false,
					ActionTitles: ['Review Request']
				},
				{
					ColumnName: 'IsAllowedToBroadcast',
					ColumnValue: false,
					ActionTitles: ['Broadcast']
				},
				{
					ColumnName: 'IsAllowedToFill',
					ColumnValue: false,
					ActionTitles: ['Fill a Request']
				}
			];
		}
		else
			return [];
	}

	getAdvanceSearchAPI(){
		   if(this.entityId == XrmEntities.Assingments){
			return 'assgmt-advance-search-drpdwn/';
		   }
		   if(this.entityId == XrmEntities.LightIndustrialRequest){
		   	return 'lireq/select-paged';
		   }
		   if(this.entityId == XrmEntities.CandidatePool){
		   	return 'cand-pool/getdropdown';
		   }
		return '';
	}

	async getRadioButtons(){
		try{

			const data = await firstValueFrom(this.globalSearchService.getAuthorizeModules());
			this.entityId = data.Data[0].Id;
			this.entityName = data.Data[0].Name;
			if(data){
				const radio = data.Data.map((ele: {Text: string, Name: string, Value: string, Id: string}) => {
					ele.Text = ele.Name;
					ele.Value = ele.Id;
					return ele;
				});

				this.searchTypeList = radio;
				this.searchTypeForm.controls['searchType'].patchValue(this.searchTypeList[0].Value);
			}
		}
		catch (error)
		{
			console.log(error);
		}
	}

	private getColumnData() {
		 this.globalSearchService.getColumnCaptions(this.entityId, '', magicNumber.seventyThree).subscribe((res: GenericResponseBase<GridColumnCaption[]>) => {
			this.columnOptions = res.Data?.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			}) ?? [];
		});

	}

	getActionSet(){
		this.liRequestActionSet = this.actionButtons.LiRequestActionItems(
			this.onViewRequest,
			this.onEditRequest,
			this.onBroadcast,
			this.onReview,
			this.onFillRequest
		);

		this.candidateActionSet = this.actionButtons.CandidateActionItems(
			this.onViewCandidate,
			this.onEditCandidate
		);

		this.assignmentActionSet = this.actionButtons.AssignmentsActionItems(
			this.onViewContractor,
			this.onEditContractor,
			this.onViewAssignment,
			this.onEditAssignment,
			this.onShiftCalendar
		);

		this.actionSet = {
			52: this.assignmentActionSet,
			44: this.candidateActionSet,
			23: this.liRequestActionSet
		  };

	}

	getBindingField(){

		if(this.entityId === XrmEntities.CandidatePool){
			return "Disabled";
		}

		return "StatusId";
	}

	private getPageSizeData() {

		this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscription$)).
			subscribe((res: GenericResponseBase<{ PageSize: number }>) => {
				if (res.StatusCode === Number(HttpStatusCode.Ok)) {
					const Data = res.Data;
					this.pageSize = Data?.PageSize ?? magicNumber.ten;
				}
			});
	}

	initiateSearchText(){
		this.globalSearchService.headerSearchTextObs.pipe(takeUntil(this.destroyAllSubscription$)).
			subscribe((data: {searchText: string, module: number}) => {
				if(data.searchText){
					this.search(data.searchText);
					this.textBox.value = data.searchText;
					if(this.textBox.value !== ''){
						this.textBox.showClearButton = true;
					}
					else{
						this.textBox.showClearButton = false;
					}
					this.onChangeSearchType(data.module);
					this.searchTypeForm.controls['searchType'].patchValue(data.module);
				}
			});
	}

	OnFilterTriggered(filteredData: unknown) {
		this.FilteredList = filteredData;
	}

	onChangeSearchType(e:number){
		this.entityId = e;
		this.store.dispatch(new RemoveAdvAppliedFilterData(e.toString(), '', '73')).pipe((err) => {
			return of('');
		});
		this.getColumnData();
		this.getPageSizeData();
		this.cdr.markForCheck();
	}

	valueChangeTextBox(e: string){
		if(e == ''){
			this.search(e);
		}
	}

	public getTabOption() {
		return {
			bindingField: this.entityId === XrmEntities.Assingments
				? 'IsPreviousAssignment'
				:'Disabled',
			tabList: [
				{
					tabName: 'All',
					favourableValue: 'All'
				}
			]
		};
	}

	OnEnterPress(event: KeyboardEvent, e: string) {
		if (event.key.toLowerCase() == 'enter') {
			this.search(e);
		}
	}

	search(e: string){
		this.searchText = e;
		this.store.dispatch(new RemoveAdvAppliedFilterData(this.entityId.toString(), '', '73')).pipe((err) => {
			return of('');
		});
	}

	// function to be passed on to grid action buttons

	public onViewRequest = (dataItem: RequestDetails) => {
		this.route.navigate([`${NavigationPathRequests.view}/${dataItem.Ukey}`]);
	};

	public onEditRequest = (dataItem: RequestDetails) => {
		this.route.navigate([`${NavigationPathRequests.edit}/${dataItem.Ukey}`]);
	};

	public onBroadcast = (dataItem: RequestDetails) => {
		this.route.navigate([`${NavigationPathRequests.broadcast}/${dataItem.Ukey}`]);
	};

	public onReview = (dataItem: RequestDetails) => {
		this.route.navigate([`${NavigationPathRequests.review}/${dataItem.Ukey}`]);
	};

	public onFillRequest = (dataItem: RequestDetails) => {
		this.route.navigate([`${NavigationPathRequests.fillrequest}/${dataItem.Ukey}`]);
	};

	public onViewCandidate = (dataItem: CandidatePool) => {
		this.route.navigate([`${NavigationPathCandidate.view}/${dataItem.UKey}`]);
	};

	public onEditCandidate = (dataItem: CandidatePool) => {
		this.route.navigate([`${NavigationPathCandidate.edit}/${dataItem.UKey}`]);
	};

	public onViewAssignment = (dataItem: IAssignmentDetails) => {
		this.route.navigate([`${NavigationPathAssignments.viewAssinghment}/${dataItem.UKey}`]);
	};

	public onEditAssignment = (dataItem: IAssignmentDetails) => {
		this.route.navigate([`${NavigationPathAssignments.editAssignment}/${dataItem.UKey}`]);
	};

	public onViewContractor = (dataItem: IAssignmentDetails) => {
		this.globalSearchService.getContractorUkey(dataItem.ContractorId)
			.pipe(takeUntil(this.destroyAllSubscription$))
			.subscribe((res: GenericResponseBase<{UKey: string}>) => {
				this.route.navigate([`${NavigationPathAssignments.viewContractor}/${res.Data?.UKey}`]);
			});
	};

	public onEditContractor = (dataItem: IAssignmentDetails) => {
		this.globalSearchService.getContractorUkey(dataItem.ContractorId)
			.pipe(takeUntil(this.destroyAllSubscription$))
			.subscribe((res: GenericResponseBase<{UKey: string}>) => {
				this.route.navigate([`${NavigationPathAssignments.editContractor}/${res.Data?.UKey}`]);
			});
	};

	public onShiftCalendar = (dataItem: IAssignmentDetails) => {
		this.route.navigate([`${NavigationPathAssignments.shift}/${dataItem.UKey}`]);
	};

	// ends here

	ngOnDestroy(): void {
		this.destroyAllSubscription$.next();
		this.destroyAllSubscription$.complete();
		this.globalSearchService.headerSearchText.next({
			searchText: this.searchText,
			module: this.searchTypeForm.controls['searchType'].value
		});
	}

}


