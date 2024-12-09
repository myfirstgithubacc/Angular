import { Injectable } from '@angular/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { CopyItemService } from './copy-item.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { magicNumber } from './common-constants/magic-number.enum';

// eslint-disable-next-line no-shadow
enum dropdownType {
  copyToSource = 'copyToSource',
  copyToDestination = 'copyToDestination'
}

@Injectable({
	providedIn: 'root'
})
export class CopyItemConfirmationService {
	private unsubscribe$ = new Subject<void>();
	public copySectorConfirmation: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	// copy sector property declaration
	private dialogRef: DialogRef;
	// copy sector api request data
	private copyInfoRequest: any;
	private treeData: any = {};
	private copyDailogInfo: CopyDialogComponent;

	private copyDialogData: any[] = [];

	// eslint-disable-next-line max-params
	constructor(
    private sectorService: SectorService,
    private copyItemService: CopyItemService,
    private kendoDialogService: DialogService,
    private localizationService: LocalizationService
	) { }

	/**
  * trigger from component when user click on copy icon
  * we get copy dialog data such as input fields array source and destination
  * along with popup title
  */
	public copyItemBtnEvent(copyDialogData: any, entityTitle: any) {
		this.copyDialogData = copyDialogData;
		// prepare sector copy list data
		this.sectorService.getSectorDropDownList()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
			// for destination dropdown data set
				this.copyItemService.setItemListForCopyItems(data.Data);
				this.setCopySourceDestinationDropdownData(data.Data, dropdownType.copyToSource);
			});

		// open dialog container
		this.dialogRef = this.kendoDialogService.open({
			content: CopyDialogComponent,
			actions: [
				{ text: this.localizationService.GetLocalizeMessage('Yescopy'), themeColor: "primary" },
				{ text: this.localizationService.GetLocalizeMessage('Nocopy') }
			],
			width: 420,
			preventAction: (ev: any, dialog) => {
				if (ev.text.includes('No')) {
					dialog?.close();
				}
				const formGroup: any = (dialog?.content.instance as CopyDialogComponent)
					.formGroup;
				if (!formGroup.valid) {
					formGroup?.markAllAsTouched();
				}
				return !formGroup.valid;
			}
		});
		// bind required data inside dialog container
		this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
		this.copyDailogInfo.title = `Do you want to copy the selected ${entityTitle} to another Sector?`;
		this.copyDailogInfo.copydialogdata = this.copyDialogData;
		this.copyDailogInfo.treeData = this.treeData;
		// see which button is clicked...
		this.dialogRef.result
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
				this.copyInfoRequest = {
					copyToSource: this.copyDailogInfo.formGroup.value.copyToSource?.Value,
					copyToDestination: this.copyDailogInfo.formGroup.value.copyToDestination?.Value,
					requestIds: this.copyDailogInfo.formGroup.value.TreeValues.map((x: any) =>
						x.value)
				};
				if (data.text.toLowerCase().includes('yes')) {
				// copy sector confirmation when user clicked on yes copy button
					this.copySectorConfirmation.next(this.copyInfoRequest);
				}
			});
	}

	// set dropdown data coming from sector api
	private setCopySourceDestinationDropdownData(dropdownData: any, controlName: any) {
		const index = this.copyDialogData.findIndex((i: any) =>
			i.controlName === controlName);
		if (index != magicNumber.minusOne) {
			this.copyDialogData[index].dropdownData = dropdownData;
		}
	}

	// set tree data just below of source dropdown to select sector item to be copyied
	public setCopySourceTreeData(treeArray: any) {
		const requiredTreeArray = treeArray.map((obj: string) =>
				Object.keys(obj).reduce((accumulator: any, key: any) => {
					// accumulator is the new object we are creating
					accumulator[key.toLowerCase()] = obj[key];
					return accumulator;
				}, {})),
			// tree object
		 treeData = {
				treeData: [
					{
						text: "All",
						items: requiredTreeArray
					}
				],
				label: "SelectTheRecords",
				tooltipVisible: true,
				tooltipTitleParams: [],
				tooltipTitle: "SelectTheRecordsToCopy"
			};
		this.copyDailogInfo.treeData = treeData;
	}

	// set destination dropdown list just after the source object selected
	public setDestinationDropdownOnSelectSource(data: any) {
		if (data.controlName === dropdownType.copyToSource) {
			// set destination dropdown list array after removing source selected item/obj/index
			const copyItemDestinationDrpData = [...this.copyItemService.getItemListForCopyItems().value];
			// remove index(obj) which is selected in source dropdown
			copyItemDestinationDrpData.splice(copyItemDestinationDrpData.findIndex((element: any) =>
				element.Value === data.change.Value), magicNumber.one);
			this.setCopySourceDestinationDropdownData(copyItemDestinationDrpData, dropdownType.copyToDestination);
		}
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
