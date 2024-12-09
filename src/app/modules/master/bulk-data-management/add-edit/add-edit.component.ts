import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BulkDataManagementService } from 'src/app/services/masters/bulk-data-management.service';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { DialogRef } from '@progress/kendo-angular-dialog/dialog/models/dialog-ref';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { FormGroup } from '@angular/forms';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { NavigationPaths } from '../constants/route';
import { Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { BulkDataRecord, ButtonType, DialogContentType } from '../constants/model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ITabOptions } from '@xrm-shared/models/common.model';
@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {

	public listreadonly: BulkDataRecord[] = [];

	private dialogRef: DialogRef;
	public searchText: string;

	private copyDailogInfo: CopyDialogComponent;

	public gridData: BulkDataRecord[] = [];

	public entityId = XrmEntities.ListBulkDataManagement;

	public columnOptions: GridColumnCaption[] = [];

	private selectedRecord: BulkDataRecord;

	private transactionEntityId : number;

	public isuploadBtn:boolean = false;

	private destroyAllSubscribtion$ = new Subject<void>();

	public tabOptions: ITabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: dropdown.Active,
				favourableValue: false,
				selected: true
			}
		]
	};

	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];

	onclickUpload = (e:BulkDataRecord) => {
		this.uploadDialogData[0].value = e.TemplateName;
		this.selectedRecord = e;
		this.transactionEntityId = e.XrmEntityId;
		this.openDialog(
			{ text: 'Upload', value: magicNumber.three, themeColor: 'primary' },
			{ text: 'Cancel', value: magicNumber.zero, themeColor: 'primary', fillMode: 'outline' },
			this.uploadDialogData,
			'Upload'
		);
		this.bulkDataService.isuploadBtn.next(true);
	};

	onclickDownload = (e:BulkDataRecord) => {

		this.downloadDialogData[0].value = e.TemplateName;
		this.selectedRecord = e;
		this.transactionEntityId = e.XrmEntityId;
		this.openDialog(
			{ text: 'DownloadExistingDataTemplate', value: magicNumber.one, themeColor: 'primary', fillMode: 'outline' },
			{ text: 'DownloadBlankTemplate', value: magicNumber.two, themeColor: 'primary', fillMode: 'outline' },
			this.downloadDialogData,
			'Download'
		);
	};

	onclickHistory = (e:BulkDataRecord) => {

		this.bulkDataService.backFromUploadHistory.next({
			isBackFromUploadHistory: true,
			uploadHistoryId: e
		});
		this.backToList();
	};

	public actionSet= [
		{
			Status: false,
			Items: this.gridConfiguration.showDownloadUploadHistoryIcon(
				this.onclickDownload,
				this.onclickUpload,
				this.onclickHistory
			)
		}
	]; ;

	public pageSize: number;

	private downloadDialogData: DialogContentType[] = [
	 {
		 type: 'label',
		 labels: 'TemplateName',
		 value: ''
	 },
	 {
		 type: 'dropdown',
		 labels: { dropdownLabel: 'Sector' },
		 labelLocalizeParam: this.sectorLabelTextParams,
		 tooltipVisible: false,
		 tooltipTitleParam: [],
		 dropdownData: [],
		 controlName: 'sector',
		 IsTreePresent: false,
		 tooltipTitleLocalizeParam: this.sectorLabelTextParams,
		 notRequired: false,
		 validationMessage: "PleaseSelectSector"
	 }
	];

	private uploadDialogData: DialogContentType[] = [
		{
			type: 'label',
			labels: 'TemplateName',
			value: ''
		},
	 {
		 type: 'dropdown',
		 labels: { dropdownLabel: 'Sector' },
		 labelLocalizeParam: this.sectorLabelTextParams,
		 tooltipVisible: false,
		 tooltipTitleParam: [],
		 dropdownData: [],
		 controlName: 'sector',
		 IsTreePresent: false,
		 tooltipTitleLocalizeParam: this.sectorLabelTextParams,
		 notRequired: false,
		 validationMessage: "PleaseSelectSector"
	 },
	 {
		 type: 'upload',
		 controlName: 'upload',
		 notRequired: false,
		 validationMessage: "PleaseSelectFile"
	 }
	];

	constructor(
    private localizationService: LocalizationService,
		private kendoDialogService: DialogService,
		private sectorService: SectorService,
		private gridConfiguration: GridConfiguration,
		private route: Router,
		private gridService: GridViewService,
		private bulkDataService: BulkDataManagementService,
		private toasterService: ToasterService
		) {
	}


	ngOnInit(): void {

		forkJoin([
			this.gridService.getColumnOption(this.entityId, 'BulkDataMaster'),
			this.gridService.getPageSizeforGrid(this.entityId),
			this.sectorService.getExistingSectorsDropdownList()
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columnData, pageSize, sectorData]) => {
			this.getColumnData(columnData);
			this.getPageSizeData(pageSize);
			this.populateDropdown(sectorData);
		});
	}

	private getColumnData(res: ApiResponse) {
		if (res.Succeeded === true) {
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private getTemplateData(res: ApiResponse){
		this.gridData = res.Data;
		this.listreadonly = res.Data;
	}

	private getPageSizeData(res: ApiResponse) {
		if (res.StatusCode === HttpStatusCode.Ok) {
			const Data = res.Data;
			this.pageSize = Data.PageSize;
		}
	}

	private populateDropdown(res: ApiResponse){
		this.uploadDialogData[1].dropdownData = res.Data;
		this.downloadDialogData[1].dropdownData = res.Data;
	}

	backToList(){
		this.route.navigate([NavigationPaths.list]);
	}

	private openDialog(btnMessage1: ButtonType, btnMessage2: ButtonType, dialogData: DialogContentType[], state: string){

		this.dialogRef = this.kendoDialogService.open({
			content: CopyDialogComponent,
			actions: [
				{
					text: this.localizationService.GetLocalizeMessage(btnMessage1.text),
					value: btnMessage1.value,
					themeColor: btnMessage1.themeColor,
					fillMode: btnMessage1.fillMode
				},
				{
					text: this.localizationService.GetLocalizeMessage(btnMessage2.text),
					value: btnMessage2.value
				}
			],
			width: 420,
			preventAction: (ev: any, dialog: DialogRef | undefined) => {

				const formGroup: FormGroup = (dialog?.content.instance as CopyDialogComponent)
					.formGroup;
				if (ev.value === magicNumber.zero) {
					this.toasterService.resetToaster();
					dialog?.close();
				}

				if(formGroup.valid)
					this.Action(formGroup, ev, dialog);
				else
					formGroup.markAllAsTouched();

				return true;
			}
		});

		this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
		this.copyDailogInfo.copydialogdata = dialogData;
		this.copyDailogInfo.isCopy = false;
		this.copyDailogInfo.title = state;
	}

	private Action(form:FormGroup, ev: ButtonType, dialog: DialogRef | undefined){

		if (ev.value === Number(magicNumber.one)) {
			this.downloadExistingData(form, dialog);
		}
		if (ev.value === Number(magicNumber.two)) {
			this.downloadSampletemplate(form, dialog);
		}
		if (ev.value === Number(magicNumber.three)) {
			this.uploadFile(form, dialog);
		}
	}

	private uploadFile(form:FormGroup, dialog: DialogRef | undefined){

		const fileData = form.get('upload')?.value[0],
			formData = new FormData();

		formData.append(`TemplateFile`, fileData);
		formData.append('BulkDataMasterId', this.selectedRecord.Id.toString());
		formData.append('SectorId', form.get('sector')?.value.Value);
		formData.append('EntityId', this.selectedRecord.XrmEntityId.toString());
		this.bulkDataService.uploadTemplate(formData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: any) => {

			if (res.Succeeded) {
				dialog?.close();
				this.bulkDataService.uploaded.next({showToaster: true, templateName: this.selectedRecord.TemplateName});

				this.backToList();
			}
			else {
				this.toasterService.notPopup.next(false);
				this.toasterService.showToaster(ToastOptions.Error, res.ValidationMessages
					? res.ValidationMessages[0].ErrorMessage
					: res.Message);
			}
		});
	}

	private downloadSampletemplate(form:FormGroup, dialog: DialogRef | undefined){

		const payload = {
			Ukey: this.selectedRecord.UKey,
			EntityId: this.transactionEntityId,
			SectorId: form.value.sector.Value,
			IsWithData: false
		};

		this.bulkDataService.downloadTemplate(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: any) => {
			this.downloadFile(res, dialog, form);
		});
	}

	private downloadExistingData(form:FormGroup, dialog: DialogRef | undefined){

		const payload = {
			Ukey: this.selectedRecord.UKey,
			EntityId: this.transactionEntityId,
			SectorId: form.value.sector.Value,
			IsWithData: true
		};

		this.bulkDataService.downloadTemplate(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: any) => {
			this.downloadFile(res, dialog, form);
		});
	}

	private downloadFile(res:any, dialog: DialogRef | undefined, form: FormGroup){
		const url = window.URL.createObjectURL(res.body),
			a = document.createElement('a'),
			fileNameWithExtension = this.generateFileName(form);
		a.href = url;
		a.download = fileNameWithExtension;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
	}

	generateFileName(form:FormGroup){

		const date = new Date(),
			uniqueDateCode = `${date.getFullYear().toString() + this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `${this.selectedRecord.TemplateName} (${form.value.sector.Text}) ${uniqueDateCode}`;

		return fileName;
	}

	calculateDate(n:number) {
		return n < Number(magicNumber.ten)
			? `0${ n}`
			: n.toString();
	}

	OnSearch(list: string){
		this.searchText = list;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
