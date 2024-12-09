import { IDropdown } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class ExpenseEntryDetailGrid {
	Id: nullableNumber;
	ExpenseEntryId: number | undefined | null;
	StatusId: nullableNumber;
	CostAccountingCodeId: IDropdown | string;
	CostAccountingName: string;
	DateIncurred: nullableString;
	Quantity: nullableNumber;
	Amount: number;
	ExpenseTypeId: IDropdown | string;
	ExpenseTypeName: string;
	DocumentFileName: nullableString;
	Description: nullableString;
	InlineViewDisabled:boolean;
	NatureOfExpenseId: number;
	MspFee: number;
	DmsFieldRecord: {
        Id: number;
        StatusId: number;
        DocumentAddDto: {
            DocumentConfigurationId: number;
            FileName: string;
            FileExtension: string;
            FileNameWithExtension: string;
            EncryptedFileName: string;
            FileSize: number;
            ContentType: string;
            ChunkNumber: number;
            TotalChunks: number;
            DocumentProcessingType: number;
        };
    };
	Property?:number;
	constructor(init?: Partial<ExpenseEntryDetailGrid>) {
		if (typeof init?.ExpenseTypeId !== 'string' && init?.ExpenseTypeId?.Value) {
			init.ExpenseTypeName = init.ExpenseTypeId.Text;
			init.ExpenseTypeId = init.ExpenseTypeId.Value;
		}
		if (typeof init?.CostAccountingCodeId !== 'string' && init?.CostAccountingCodeId?.Value) {
			init.CostAccountingName = init.CostAccountingCodeId.Text;
			init.CostAccountingCodeId = init.CostAccountingCodeId.Value;
		}

		if (init && (init.Id === null || init.Id)) {
			// This is for Update and Add...
			init.Id = (init.Id !== magicNumber.zero)
				? init.Id
				: magicNumber.zero;
		}

		Object.assign(this, init);
	}
}
