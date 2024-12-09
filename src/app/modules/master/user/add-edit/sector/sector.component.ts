import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Keys } from '@progress/kendo-angular-common';
import { CellClickEvent, CellCloseEvent } from '@progress/kendo-angular-grid';
import { SectorService } from 'src/app/services/masters/sector.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { UserDataAccessRight } from '@xrm-master/user/enum/enums';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { UserDetails } from '@xrm-master/user/model/model';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { ApprovalConfigChangeData, ApprovalConfigChangeEvent, ClientUserSectorAccess, DataItem, EventDetails, EventObject, TreeChecked, TreeCheckedRootObject, UdfData } from '@xrm-master/user/interface/user';


@Component({selector: 'app-sector',
	templateUrl: './sector.component.html',
	styleUrls: ['./sector.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SectorComponent implements OnInit {
	public tooltipDir!: TooltipDirective;
	public userDataAccessRight = UserDataAccessRight;
	isClient: boolean = true;
	@Input() inputProperties:{
		AddEditUserForm: FormGroup;
		SectorLabel: string;
		allSectorList: DataItem[];
		staffingAgencyUserList: DataItem[];
		isEditMode: boolean;
		userDetails:UserDetails;
	};
	public filteredSectors: DataItem[] = [];
	@Output() onChangeSectorDropdown: EventEmitter<EventObject>;
	@Output() onChangeLocationDropdown: EventEmitter<null>;
	@Output() onChangeOrg1Dropdown: EventEmitter<null>;
	@Output() onAddNewSector: EventEmitter<null>;
	@Output() onChangeApprovalConfiguration: EventEmitter<ApprovalConfigChangeEvent>;
	@Output() onselectedConfiguredTreeItems: EventEmitter<TreeCheckedRootObject>;
	@Output() onChangeDefaultSectorSwitch: EventEmitter<boolean>;
	@Output() udfData: EventEmitter<{data: UdfData, index: number }>;

	onSplitButtonItemClick(data: unknown) { }
	onSplitButtonClick() { }

	public showTooltip(e: MouseEvent): void {
  	const element = e.target as HTMLElement;
  	if (
  		(element.nodeName === 'TD' || element.nodeName === 'TH') &&
      element.offsetWidth < element.scrollWidth
  	) {
  		this.tooltipDir.toggle(element);
  	} else {
  		this.tooltipDir.hide();
  	}
	}

	public addnewApprovalConfig: boolean = true;

	/* userRecordSection: boolean = true;
     userPreferencesSection: boolean = false;
     userRecordsTabActive: boolean = true;
     userPreferencesTabActive: boolean = false; */

	public sectorTabRadioGroupList = [
  	{
  	Text: "All", Value: true
  	},
  	{
  	Text: "Selected", Value: false
  	}
	];

	public actionType = ActionType;
	// eslint-disable-next-line max-params
	constructor(
    private cd: ChangeDetectorRef,
    public route: Router,
    public sector: SectorService,
    public udfCommonMethods: UdfCommonMethods,
    private localizationService: LocalizationService
	) {
		this.onChangeSectorDropdown = new EventEmitter<EventObject>();
		this.onChangeLocationDropdown= new EventEmitter<null>();
		this.onChangeOrg1Dropdown= new EventEmitter<null>();
		this.onAddNewSector= new EventEmitter<null>();
		this.onChangeApprovalConfiguration= new EventEmitter<ApprovalConfigChangeEvent>();
		this.onselectedConfiguredTreeItems= new EventEmitter<TreeCheckedRootObject>();
		this.onChangeDefaultSectorSwitch= new EventEmitter<boolean>();
		this.udfData= new EventEmitter<{data: UdfData, index: number }>();
	}

	ngDoCheck(): void {
		this.cd.detectChanges();
	}
	ngOnInit() {
		// Call the filtering function once during initialization or whenever necessary
		this.filteredSectors = this.filterSectorList(this.inputProperties.allSectorList);
		const sectorDetails = this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray;
		sectorDetails.valueChanges.subscribe(() => {
			this.filteredSectors = this.filterSectorList(this.inputProperties.allSectorList);
		});
	}
	public onChangeRadio(event:boolean, item:AbstractControl){
  	if(!event){
  		item?.get('AppliesToAllOrgLevel1')?.setValue(false);
  		item?.get('AppliesToAllLocation')?.setValue(false);
  	}
  	else{
  		item?.get('isValidTreeDataSelected')?.setValue(true);
  		item?.get('selectedTree')?.setValue([]);
  	}
  	this.cd.detectChanges();
	}

	get clientUserSectorAccessAddDtos() : FormArray {
  	return this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray;
	}

	get SectorDetails(){
  	return this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray;
	}

	public CheckSavedSector(sectorid:string | number){
  	return this.inputProperties.userDetails?.ClientUserSectorAccesses?.some((x:ClientUserSectorAccess) => {
  		return x.SectorId == sectorid;
  	});
	}

	public getRecordUkeyForUdf(index: number) {
		if(this.inputProperties.userDetails?.ClientUserSectorAccesses)
    	return this.inputProperties.userDetails?.ClientUserSectorAccesses[index]?.RecordUKey ?? "";
		return "";
	}

	public ShowSectorTabName(name:string, index:number){
  	if(name){
  		return name;
  	}
  	else{
  		return `${this.inputProperties.SectorLabel} ${index+ magicNumber.one}`;
  	}
	}
	public showDeleteIcon(data: string | null) {
		if((this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).length == Number(magicNumber.one))
			return false;
		if(data)
			return !this.inputProperties.userDetails.ClientUserSectorAccesses?.some((x: ClientUserSectorAccess) =>
			 x.SectorId == Number.parseInt(data));
		return true;
	}

	public deleteSector(index: number) {
    	(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).removeAt(index);
		if(index > Number(magicNumber.zero))
			this.tabClick(--index);
		else
		  this.tabClick(magicNumber.zero);
	}


	public filterSectorList(allsec: DataItem[]) {
		let filteredSectors: DataItem[] = allsec;
		if (allsec.length > 0) {
			const sectorDetails = this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray,
			 sectorSelectedValues = sectorDetails.controls.map((control) =>
					control.get('sectorId')?.value?.Value);
			filteredSectors = allsec.filter((sec) =>
				!sectorSelectedValues.includes(sec.Value));
		}
		return filteredSectors;
	}
	public switchChange(event: boolean, secId: number, data: ApprovalConfigChangeData) {
  	this.onChangeApprovalConfiguration.emit({ event: event, sectorindex: secId, data: data });
	}

	public tabClick(i: number) {
  	(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls?.forEach((control: AbstractControl) => {
  		control?.get('isshow')?.setValue(false);
  	});
  	(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls[i].get('isshow')?.setValue(true);
	}
	public addnewSector() {
  	this.onAddNewSector.emit();
	 }
	public getFormGroup(item: AbstractControl): FormGroup {
  	return item as FormGroup;
	}

	public onChangeSector(e: EventDetails, i: number) {
  	(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls[i].get('defaultLocationId')?.setValue(null);
  	(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls[i].get('defaultOrgLevel1Id')?.setValue(null);
  	this.onChangeSectorDropdown.emit({ event: e, index: i, isEvent: true });
  	((this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls[i]?.get('userApprovalConfigurationDetail') as FormArray).clear();
  	this.cd.detectChanges();
	}

	public selectedConfiguredTreeItems(event: TreeChecked, index:number) {
  	this.onselectedConfiguredTreeItems.emit({data: event, index: index});
	}

	public onChangeOrglevel() {
  	this.onChangeOrg1Dropdown.emit();
	}
	public onChangeLocation() {
  	this.onChangeLocationDropdown.emit();
	}
	public getUdfData(data: UdfData, index:number) {
  	if(data?.formGroup?.dirty){
  		(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls[index].get('udfFieldRecords')?.markAsDirty();
  	}
  	this.udfData.emit({data, index});
	}

	public onChangeDefaultSector(event: boolean, index: number) {
  	if (event) {
  		(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls?.forEach((a: AbstractControl) => {
  			a?.get('isDefault')?.setValue(false);
  		});
  		(this.inputProperties.AddEditUserForm.get('SectorDetails') as FormArray).controls[index].get('isDefault')?.setValue(true);
  		this.onChangeDefaultSectorSwitch.emit(true);
  	}
	}
	public isList = true;
	public expandedDetailKeys: number[] = [magicNumber.one];


	public splitButtonItems = [
  	{
  		text: this.localizationService.GetLocalizeMessage('ExportToExcel'),
  		icon: "excel"
  	},
  	{
  		text: this.localizationService.GetLocalizeMessage('ExportToPdf'),
  		icon: "pdf"
  	}
	];

	public cellClickHandler(args: CellClickEvent): void {
  	if (!args.isEdited) {
  		args.sender.editCell(
  			args.rowIndex,
  			args.columnIndex
  		);
  	}
	}

	public cellClickHandler2(args: CellClickEvent): void {
  	if (!args.isEdited) {
  		args.sender.editCell(
  			args.rowIndex,
  			args.columnIndex

  		);
  	}
	}


	public cellCloseHandler(args: CellCloseEvent): void {

  	const { formGroup } = args.formGroup;

  	if (!formGroup.valid) {
  		args.preventDefault();
  	} else if (formGroup.dirty) {
  		if (args.originalEvent && args.originalEvent.keyCode === Keys.Escape) {
  			return;
  		}
  	}
	}

	public cellCloseHandler2(args: CellCloseEvent): void {
  	const { formGroup } = args.formGroup;

  	if (!formGroup.valid) {
  		args.preventDefault();
  	} else if (formGroup.dirty) {
  		if (args.originalEvent && args.originalEvent.keyCode === Keys.Escape) {
  			return;
  		}
  	}
	}

	public getLocalizedMessage(key:string){
  	return this.localizationService.GetLocalizeMessage('ConfigurePlaceholder', [{Value: key, IsLocalizeKey: false}]);
	}
}
