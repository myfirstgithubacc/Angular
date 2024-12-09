import { DatePipe } from "@angular/common";
import { ExpenseEntryDetailGrid } from "@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function alterExpenseEntryDetailsGrid(list: ExpenseEntryDetailGrid[], expEntryId: number, datePipe: DatePipe): ExpenseEntryDetailGrid[] {
	return list.map((entry) => {
		if (!entry.ExpenseEntryId) {
			entry.ExpenseEntryId = expEntryId;
			entry.Id = entry.Id ?? magicNumber.zero;
		}
		entry.DateIncurred = datePipe.transform(entry.DateIncurred, 'MM/dd/YYYY');
		return entry;
	});
}
