import { PanelBarItemModel } from "@progress/kendo-angular-layout/panelbar/panelbar-item-model";

export interface ReportFolderAddEdit {
	FolderId:number;
	UKey: string;
	FolderName: string;
	Description : null | string;
	SharedRoleIds : number[] | null;
	ShareWithName? :string[] | null;
	Id:number;
}

export interface ReportLibList {
	ApplicableActions: string;
	BaseDataEntity: string;
	CreatedBy: string;
	CreatedOn: string;
	Description: string | null;
	Frequency: string | null;
	Id: number;
	ModifiedBy: string | null;
	ModifiedOn: string | null;
	OutputType: string;
	Owner: string;
	ReportId: string;
	ReportName: string;
	ReportType: string;
	ReportTypeId:number;
	UKey: string;
	OutputTypeId:number;
}

export type ReportFolderList = PanelBarItemModel & ReportFolderAddEdit;
