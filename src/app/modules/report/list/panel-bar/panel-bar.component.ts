import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { PanelBarItemModel } from "@progress/kendo-angular-layout";
import { PanelBarSelectEvent } from "@progress/kendo-angular-layout/panelbar/events/select-event";
import { ReportFolderAddEdit, ReportFolderList } from "@xrm-core/models/report/report-folder-list";
import { GenericResponseBase, isSuccessfulResponse } from "@xrm-core/models/responseTypes/generic-response.interface";
import { DialogButton } from "@xrm-master/user/interface/user";
import { ToastOptions } from "@xrm-shared/enums/toast-options.enum";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { PopupDialogButtons } from "@xrm-shared/services/common-constants/popup-buttons";
import { ToasterService } from "@xrm-shared/services/toaster.service";
import { SharedModule } from "@xrm-shared/shared.module";
import { map, shareReplay, Subject, take, takeUntil } from "rxjs";
import { ReportDataService } from 'src/app/services/report/report.service';
import { DialogPopupService } from "@xrm-shared/services/dialog-popup.service";
import { Router } from "@angular/router";
import { ManageFolderComponent } from "../../common/manage-folder/manage-folder.component";


@Component({
	selector: 'ReportPanelBar',
	standalone: true,
	imports: [SharedModule],
	templateUrl: './panel-bar.component.html',
	styleUrl: './panel-bar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportPanelBarComponent implements OnInit, OnChanges, OnDestroy {
	@Input('FolderPermission') isManageFolderPermission: boolean = false;
	@Output() onPanelChange = new EventEmitter();
	@Output() changeEntityTypeAndUserValues = new EventEmitter();

	public reportView: PanelBarItemModel[] = [
		{
			"disabled": false,
			"expanded": false,
			"focused": false,
			"icon": "",
			"iconClass": "",
			"id": "RV1",
			"imageUrl": "",
			"selected": false,
			"title": "MyReports",
			'children': [
				{
					"disabled": false,
					"expanded": false,
					"focused": false,
					"icon": "",
					"iconClass": "",
					"id": "1",
					"imageUrl": "",
					"selected": false,
					"title": "My Exclusive Reports",
					'children': [],
					'content': undefined
				}
			],
			'content': undefined
		},
		{
			"disabled": false,
			"expanded": true,
			"focused": false,
			"icon": "",
			"iconClass": "",
			"id": "RV2",
			"imageUrl": "",
			"selected": false,
			"title": "Shared",
			'children': [],
			'content': undefined
		}
	];
	public reportLibraryView: PanelBarItemModel[] = [
		{
			"disabled": false,
			"expanded": false,
			"focused": false,
			"icon": "",
			"iconClass": "",
			"id": "1",
			"imageUrl": "",
			"selected": true,
			"title": "All",
			'children': [],
			'content': undefined
		},
		{
			"disabled": true,
			"expanded": false,
			"focused": true,
			"icon": "",
			"iconClass": "",
			"id": "2",
			"imageUrl": "",
			"selected": false,
			"title": "Favorite",
			'children': [],
			'content': undefined
		},
		{
			"disabled": false,
			"expanded": false,
			"focused": true,
			"icon": "",
			"iconClass": "",
			"id": "3",
			"imageUrl": "",
			"selected": false,
			"title": "Scheduled",
			'children': [],
			'content': undefined
		},
		{
			"disabled": true,
			"expanded": false,
			"focused": true,
			"icon": "",
			"iconClass": "",
			"id": "4",
			"imageUrl": "",
			"selected": false,
			"title": "Recent",
			'children': [],
			'content': undefined
		}
	];
	public openDialog: boolean;
	public isEditMode: boolean;
	public Remove: boolean = false;
	public payload:ReportFolderAddEdit;
	private destroyAllSubscribtion$ = new Subject<void>();


	// eslint-disable-next-line max-params
	constructor(
		private cdr: ChangeDetectorRef,
		private toasterService: ToasterService,
		private reportDataService: ReportDataService,
		private dialogService: DialogPopupService,
		private route: Router
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		console.log(changes);
	}

	// eslint-disable-next-line max-lines-per-function
	ngOnInit(): void {
		this.reportDataService.getFolderList().pipe(map((response) => {
			return this.mapFunctions().add(response);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
			this.handleFolderListData(response);
			this.cdr.markForCheck();
		});

		if (this.route.url == "/xrm/report/report-library/list/Edit") {
			this.Remove = true;
		}
		else {
			this.Remove = false;
		}
		this.dialogService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data) => {
				if(data?.value == Number(magicNumber.twentyThree) && data?.ukey){
					this.reportDataService.deleteFolder(data.ukey).pipe(takeUntil(this.destroyAllSubscribtion$))
						.subscribe((res:GenericResponseBase<ReportFolderAddEdit>) => {
							if(isSuccessfulResponse(res)){
								this.fetchFolderList();
								this.selectAllPanelTab();
								this.toasterService.showToaster(ToastOptions.Success, 'ReportDeletionSuccess', [{ Value: data.FolderName?.toLocaleLowerCase(), IsLocalizeKey: true }]);
								this.cdr.markForCheck();
							}
							else if(!isSuccessfulResponse(res)){
								this.toasterService.showToaster(ToastOptions.Error, res.Message);
							}
						});
				}
			});
	}

	public folderAdd(): void {
		this.toasterService.resetToaster();
		this.openDialog = true;
		this.isEditMode = false;
	}

	public folderEdit(items: any) : void {
		const { FolderName, FolderId, Description, ShareWithName, UKey, SharedRoleIds, Id } = items,
			folderPayload = { FolderName, FolderId, Description: Description ?? '', ShareWithName, UKey, SharedRoleIds, Id};
		this.payload = folderPayload;
		this.isEditMode = true;
		this.openDialog = true;
	}

	public folderDelete(items: any) : void {
		const buttons:any = PopupDialogButtons.YesDeleteDontDelete;
		buttons[0].FolderName = items.FolderName;
		buttons[0].ukey = items.UKey;
		this.toasterService.resetToaster();
		this.dialogService.resetDialogButton();
		this.dialogService.showConfirmation('AreYouSureYouWantToDeleteTheFolder', buttons, [{ Value: items.FolderName, IsLocalizeKey: true }]);
	}

	private selectAllPanelTab() {
		this.reportLibraryView[0].selected = true;
		this.panelsOperations().onlyOnePanelIsSelected('reportLibrary');
		this.setGridDataForEntityTypeAndUserValues('report', null, 'All');
	}

	private fetchFolderList(responseType:string = 'add'): void {
		this.reportDataService.getFolderList().pipe(map((response) => {
			if(responseType === 'add') {
				return this.mapFunctions().add(response);
			} else if(responseType === 'edit') {
				return this.mapFunctions().edit(response);
			} else {
				return response;
			}
		}), takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ReportFolderList[]>) => {
				this.handleFolderListData(res);
				this.cdr.markForCheck();
			});
	}

	private mapFunctions = () => {
		const transformFolderResponse = (folderRes: GenericResponseBase<ReportFolderList[]>, setSelected: boolean = false):
		 GenericResponseBase<ReportFolderList[]> => {
			if (folderRes.Data) {
				const newResponse: ReportFolderList[] = folderRes.Data.map((res, index) =>
					({
						"disabled": false,
						"expanded": false,
						"focused": false,
						"icon": "",
						"iconClass": "",
						"id": res.Id.toString(),
						"Id": res.Id,
						"imageUrl": "",
						"selected": setSelected
							? false
							: this.reportView[1]?.children[index]?.selected ?? false,
						"title": res.FolderName,
						'children': [],
						'content': undefined,
						"UKey": res.UKey,
						"FolderId": res.Id,
						"FolderName": res.FolderName,
						"Description": res.Description,
						"ShareWithName": res.ShareWithName,
						"SharedRoleIds": res.SharedRoleIds
					}));
				folderRes.Data = newResponse;
			}
			return folderRes;
		};

		return {
			'edit': (folderRes: GenericResponseBase<ReportFolderList[]>) =>
				transformFolderResponse(folderRes),
			'add': (folderRes: GenericResponseBase<ReportFolderList[]>) =>
				transformFolderResponse(folderRes, true)
		};
	};

	private handleFolderListData(FolderListRes: GenericResponseBase<ReportFolderList[]>) {
		if(isSuccessfulResponse(FolderListRes)) {
			this.reportView[1].children = FolderListRes.Data;
		}
	}

	private panelsOperations = () => {
		return {
			'reportViewPanelMarkSelect': (id: string) => {
				this.reportView.forEach((item) => {
					item.selected = (item.id == id);
					if(!item.selected) {
						item.children.forEach((childItem) => {
							childItem.selected = (childItem.id == id);
						});
					}
				});
			},
			'emitEntityType': (entityType: string) => {
				this.onPanelChange.emit(entityType);
			},
			'changeEntityTypeAndUserValues': (panelBar: string, selectedId:string|null, selectedValue:string) => {
				let entityType = 'All',
					userValues = null;
				if(panelBar !== 'reportLibrary') {
					entityType = 'All';
					userValues = selectedId;
				} else {
					entityType = selectedValue;
					userValues = null;
				}
				this.changeEntityTypeAndUserValues.emit({'EntityType': entityType, 'UserValues': userValues});
			},
			'onlyOnePanelIsSelected': (panelBar:string) => {
				if (panelBar === 'reportLibrary') {
					this.reportView = this.reportView.map((panelItems) => {
						return {
							...panelItems, selected: false,
							children: panelItems.children.map((childrenItems) => {
								return { ...childrenItems, selected: false };
							})
						};
					});
				} else {
					this.reportLibraryView = this.reportLibraryView.map((panelItems) => {
						return { ...panelItems, selected: false };
					});
				}
			}
		};
	};

	public onPanelTabChange({item}: PanelBarSelectEvent, panelBar:string) {
		console.log(item);
		if(panelBar === 'report') {
			this.panelsOperations().reportViewPanelMarkSelect(item.id);
		}
		// if panel selects shared and my reports then it will not hit api...
		if(item.id !== 'RV1' && item.id !== 'RV2') {
			this.setGridDataForEntityTypeAndUserValues(panelBar, item.id, item.title);
		}
		this.panelsOperations().onlyOnePanelIsSelected(panelBar);
		this.cdr.markForCheck();
	}

	private setGridDataForEntityTypeAndUserValues(panelName:string, selectedPanelId:string|null, selectedPanelTitle:string) {
		this.panelsOperations().changeEntityTypeAndUserValues(panelName, selectedPanelId, selectedPanelTitle);
		this.panelsOperations().emitEntityType(selectedPanelTitle);
	}

	public getFolderList(folderResponseType:string) : void {
		this.fetchFolderList(folderResponseType);
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.dialogService.resetDialogButton();
		this.toasterService.resetToaster();
	}

}
