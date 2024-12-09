import { IDropdownOption } from "@xrm-shared/models/common.model";
import { GenericResponseBase } from "../responseTypes/generic-response.interface";
import { ValidatorFn } from "@angular/forms";
import { dropdownWithExtras } from "../dropdown.model";

export interface ICommonComponentData {
    DmsConfigId: number;
    Disabled: boolean;
    DmsConfigCode: string;
}

export interface IDocumentRowData {
    AllowedExtensions: string;
    Code: string;
    CreatedBy: string;
    CreatedOn: string;
    Disabled: boolean;
    DocumentTitle: string;
    Id: number;
    LastModifiedBy: string;
    LastModifiedOn: string;
    MultipleDocumentAllowed: string;
    Resume: string;
    UKey: string;
    UploadedStage: string;
    UploadedStageId: number;
    WorkFlows: string;
  }

export interface IDocumentConfiguration {
    documentTitle: string;
    UploadedStageId: string;
    documentConfigurationVisibleTo: { visibleTo: string }[];
    documentConfigurationWorkflowDtos: { workflowId: string }[];
    allowedExtensions: string;
    mandatory: boolean;
    multipleDocumentAllowed: boolean;
    resume: boolean;
    configurationBySector: boolean;
    documentConfigurationSectorDtos: IDocumentConfigurationSectorDtos[];
    UKey?: null | string
}

export interface IPrefieldData {
    Id: number;
    SectorName: string;
    AppliesTo: string;
    VisibleTo: string;
    Mandatory: string;
  }

export interface IDocumentConfigurationSectorDtos{
	sectorId: string;
	appliesTo: boolean;
	documentConfigurationVisibleToSector: { visibleTo: string }[];
	mandatory: boolean;
}

export interface IDocumentConfigurationSector {
  Id: string;
  sectorName: string;
  appliesTo: boolean;
  visibleTo: IDropdownOption | null;
  mandatory: boolean;
}

export interface IWorkflowDto {
    WorkflowName: string;
    Text: string;
    WorkflowId: number;
  }

export interface IDmsSectorDitails {
    Id: number;
    SectorName: string;
    DocumentConfigurationVisibleToSector: IVisibleToDto[];
    SectorId: number;
    AppliesTo: boolean;
    Mandatory: boolean;
  }

  interface IVisibleToDto {
    Id: number;
    Name: string;
    Text: string;
  }

export interface IDocumentConfigurationResponse {
    UKey: string;
    Id: number;
    Code: string;
    UploadedStage: string;
    ConfigurationBySector: boolean;
    Mandatory: boolean;
    MultipleDocumentAllowed: boolean;
    Resume: boolean;
    Disabled: boolean;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string;
    LastModifiedOn: string;
    DocumentConfigurationWorkflowGetAllDtos: IWorkflowDto[];
    DocumentConfigurationSectorGetAllDtos: IDmsSectorDitails[];
    DocumentConfigurationVisibleTo: IVisibleToDto[];
    DocumentTitle: string;
    UploadedStageId: number;
    AllowedExtensions: string;
    WorkflowId?: string;
  }

export interface IDocumentWorkflow {
    ddlgetdocumentworkflow: GenericResponseBase<IDropdownOption[]>;
    ddlgetdocumentvisibleto: GenericResponseBase<IDropdownOption[]>;
}

export interface IDmsType {
    selecttypefordmsStage: GenericResponseBase<IDropdownOption[]>;
    selecttypenamefordmsExt: GenericResponseBase<IDropdownOption[]>;
}

export interface IDropDownDataResponse {
    documentWorkflow: IDocumentWorkflow;
    dmsType: IDmsType;
    sectorData: GenericResponseBase<dropdownWithExtras[]>;
}

interface IControl {
  controlType: string;
  controlId: string;
  defaultValue: string | boolean | IDropdownOption[];
  isEditMode: boolean;
  isDisable?: boolean;
  placeholder: string;
  offLabel?: string;
  onLabel?: string;
  dataType?: string;
  isSpecialCharacterAllowed?: boolean;
  specialCharactersAllowed?: string[];
  specialCharactersNotAllowed?: string[];
  requiredMsg?: string;
  validators?: ValidatorFn[];
}

export interface IColumnConfig {
  colSpan: number;
  columnName: string;
  controls: IControl[];
}
