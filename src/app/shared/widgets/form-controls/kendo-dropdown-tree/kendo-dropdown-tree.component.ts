import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { MultiSelectTreeCheckableSettings } from '@progress/kendo-angular-dropdowns';
import { FilterExpandSettings } from '@progress/kendo-angular-treeview';
import { dropdownModel } from '@xrm-core/models/dropdown.model';
import { IList } from '@xrm-shared/Utilities/list.interface';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-kendo-dropdown-tree',
	templateUrl: './kendo-dropdown-tree.component.html',
	styleUrls: ['./kendo-dropdown-tree.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoDropdownTreeComponent implements OnInit {

	public checkableSettings: MultiSelectTreeCheckableSettings = {
		checkChildren: true,
		checkOnClick: false
	};

	public get filterExpandSettings(): FilterExpandSettings {
		return { expandedOnClear: 'none' };
	}

  @Input() label: string = '';
  @Input() labelLocalizeParam: DynamicParam[] = [];

  @Input() placeholderKey:string = 'SearchFor';
  @Input() isSingleSelected: boolean = false;
  @Input() isToolTipVisible: boolean = false;
  @Input() tooltipTitle: string = '';
  @Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

  @Input() isEditMode: boolean = true;
  @Input() isValuePremitive: boolean = true;
  @Input() isRequired: boolean = false;
  @Input() isCheckAll: boolean = false;
  @Input() isFilterable: boolean = false;
  @Input() isHtmlContent: boolean = false;

  @Input() data: dropdownModel[] = [];
  @Input() selectedData: dropdownModel[] = [];
  @Input() singleSelectedData: dropdownModel;

  @Input() addOnLabelText: string = '';

	@Input() addOnLabelTextLocalizeParam: DynamicParam[] = [];

  @Output() result = new EventEmitter<any>();

  isVisibleCheckAllBtn: boolean = false;

  public value: number | string | null = null;
  public parsedData: IList[] = [];
  public isExists: boolean = false;


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  	this.isVisibleCheckAllBtn = this.isCheckAll;
  	this.parsedData = this.data;
  	this.value = this.singleSelectedData.Value;
  	if (this.isSingleSelected) {
  		this.result.emit(this.value);
  	} else {
  		this.result.emit(this.selectedData);
  	}
  }

  public valueChange(value: any): any {
  	this.result.emit(value);
  }

  public handleFilter(value: string): void {
  	this.parsedData = this.search(this.data, value);
  	if (this.isCheckAll)
  		this.isVisibleCheckAllBtn = this.parsedData.length > 0;
  }

  public search(items: any[], term: string): any[] {
  	return items.reduce((acc: any[], item) => {
  		this.isExists = false;
  		this.isExists = this.contains(item.Text, term);
  		if (!this.isExists && item.items && item.items.length > Number(magicNumber.zero)) {
  			const newItems = this.search(item.items, term);
  			this.isExists = newItems.length > Number(magicNumber.zero);
  		}
  		if (this.isExists)
  			acc.push(item);

  		return acc;
  	}, []);
  }

  public contains(text: string, term: string): boolean {
  	return text.toLowerCase().includes((term || "").toLowerCase());
  }


}
