import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";


export interface KendoTemplateDropdown {
	 	list: any;
		listControlName:any;
	  isRequired: boolean ;
	  label: string ;
	  placeholder: any;
	  isEditMode: boolean ;
	 	isDisabled: boolean;
	 	isValuePrimitiveAllowed: boolean;
		tooltipTitle: any;
	 	tooltipVisible: any;
   	tooltipTitleLocalizeParam: DynamicParam[];
  	isHtmlContent: boolean;
  	xrmEntityId: number ;
  	fieldName: string | null ;
  	entityType: string ;
  	isRendered: boolean ;
  	isItemTemplate:false;
		isValueTemplate:false;
		itemTemplate:any;
		valueTemplate:any;
	 	dropDownList : any;
  	labelLocalizeParam: DynamicParam[];
	 	KendoTemplateDropdown: any;
		filterable:boolean;
		tagName:string,
		tagAlign:string;
		TagVisibility:any;
		addOnLabelText ?: string ;
		addOnLabelTextLocalizeParam ?: DynamicParam[] ;
}
