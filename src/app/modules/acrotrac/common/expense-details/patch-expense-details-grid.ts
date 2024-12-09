import { FormGroup } from "@angular/forms";
import { ExpenseEntryDetailGrid } from "@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid";
import { NatureOfExpenses } from "../../expense/expense/enum-constants/enum-constants";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function formBindOnEditClick(selectedRow: ExpenseEntryDetailGrid, ExpenseEntryForm: FormGroup, NatureOfExpenseId: number) {
	/* Patching string type date to Date() type format only for showing on UI... */
	ExpenseEntryForm.patchValue({
		'CostAccountingCodeId': (selectedRow.CostAccountingCodeId === '0')
			? null
			: { 'Text': selectedRow.CostAccountingName, 'Value': selectedRow.CostAccountingCodeId },
		'DateIncurred': selectedRow.DateIncurred
			? new Date(selectedRow.DateIncurred)
			: null,
		'DocumentFileName': selectedRow.DmsFieldRecord?.DocumentAddDto?.FileNameWithExtension,
		'DmsFieldRecord': selectedRow.DmsFieldRecord,
		'ExpenseTypeId': (selectedRow.ExpenseTypeId === '0')
			? null
			: { 'Text': selectedRow.ExpenseTypeName, 'Value': selectedRow.ExpenseTypeId },
		// If Expense is Amount then we show null other than that we show the Quantity...
		'Quantity': NatureOfExpenseId == Number(NatureOfExpenses.AmountOnly)
			? null
			: selectedRow.Quantity,
		'Description': selectedRow.Description,
		'Id': selectedRow.Id,
		/* if Mileage is selected then we show the Amount in 2 decimals using toFixed(2) but it will convert it into String...
		 parseInt() Amount in expense-details component...*/
		'Amount': NatureOfExpenseId === Number(NatureOfExpenses.Mileage)
			? selectedRow.Amount.toFixed(magicNumber.two)
			: selectedRow.Amount
	});
}
