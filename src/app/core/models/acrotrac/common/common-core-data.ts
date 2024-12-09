import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface ExpenseEntryCoreData {
    ExpenseEntryCode?: string;
    StatusName?: string;
    StatusId?: number;
    Id?: number;
    Screen?: string;
    AssignmentCode?: string;
    TotalAmount?: DynamicParam[];
    ContractorName?: string;
  }

