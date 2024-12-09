import { FormGroup } from "@angular/forms";
import { ExpenseEntryAddEdit } from "@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-add-edit";
import { DropdownModel } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function normalizeExpenseEntryDetails(data: ExpenseEntryAddEdit) {
	data.ExpenseEntryDetails = data.ExpenseEntryDetails.map((element) => {
		return {
			...element, 'Amount': parseFloat(element.Amount.toFixed(magicNumber.two)),
			'CostAccountingCodeId': (element.CostAccountingCodeId as string).toString(),
			'ExpenseTypeId': (element.ExpenseTypeId as string).toString()
		};
	});
}

// Will Remove AssignmentId, WeekendingDate...
export function	patchDataFromGetByUkey({ StatusId, ContractorComment, AssignmentId,
	 WeekendingDate, ReviewerComment }: ExpenseEntryAddEdit, form: FormGroup ) {
	form.patchValue({
		'AssignmentId': AssignmentId,
		'WeekendingDate': WeekendingDate,
		'StatusId': StatusId,
		'ContractorComment': ContractorComment,
		'ReviewerComment': ReviewerComment
	});
}

export function displayData(list: DropdownModel[], controlName: string, formGroup: FormGroup) {
	if (list.length == Number(magicNumber.one))
		formGroup.controls[controlName].setValue(list[0]);
}

/**
	 * @param sizeInBytes
	 * @returns
	 * check size
	 * megabytes = bytes/1024*1000
	 */
export function checkFileSizeExceedMaxDocumentSize(sizeInBytes: number, maxDocumentSize: number) {
	const fileSizeInMB = (sizeInBytes / (magicNumber.oneThousandTwentyFour * magicNumber.oneThousandTwentyFour)).toFixed(magicNumber.two);
	return (Number(fileSizeInMB) > maxDocumentSize);
}


export function checkSelectedFileExtension(extension: string, allowedExtensions: string[]) {
	/**
	 * extension is coming as i.e., ".png"of selected file
	 * allowed extension is coming as "[png, jpg, xlsx]"
	 * Step 1: Check if the uploaded file's extension exists in the allowedExtensions by removing prefix dot
	 */
	const isExtensionAllowed = allowedExtensions.includes(extension.replace('.', ''));
	return isExtensionAllowed;
}

/**
	 * @param arrayString
	 * @param conjunction
	 * @returns
	 * You can now call the formatArrayAsString function with the optional conjunction parameter to specify
	 * whether you want "and" or "or" between the array elements.
	 * If you don't provide a value for conjunction, it will default to "or":
	 */
export function formatArrayAsString(arrayString: string[], conjunction: 'and' | 'or' = 'or') {
	// Create a copy of the array and sort array
	const arrayStringData = [...arrayString].sort((a: string, b: string) =>
		a.localeCompare(b));
	let formattedString = "";
	if (arrayStringData.length === Number(magicNumber.one)) {
		formattedString = arrayStringData[0];
	} else if (arrayStringData.length === Number(magicNumber.two)) {
		formattedString = arrayStringData.join(` ${conjunction} `);
	} else if (arrayStringData.length > Number(magicNumber.two)) {
		const lastTitle = arrayStringData.pop();
		formattedString = `${arrayStringData.join(", ")} ${conjunction} ${lastTitle}`;
	}
	return formattedString;
}
