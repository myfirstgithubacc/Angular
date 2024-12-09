export function dateUTC(date: Date) {
	const selectedDate = date;
	// selectedDate?.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
	return selectedDate;
}
