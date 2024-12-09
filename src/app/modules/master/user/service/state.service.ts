import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StateService {

	getDropDownListnew() {
		return [
			{ Text: 'Illinois', Value: '1' },
			{ Text: 'Kentucky', Value: '2' },
			{ Text: 'Indiana', Value: '3' },
			{ Text: 'New Jersey', Value: '4' },
			{ Text: 'Texas', Value: '5' }
		];
	}

	getDropDownList() {
		return [
			{ Text: 'AL', Value: '1' },
			{ Text: 'NY', Value: '2' },
			{ Text: 'IL', Value: '3' },
			{ Text: 'AK', Value: '4' },
			{ Text: 'AZ', Value: '5' },
			{ Text: 'NV', Value: '6' }
		];
	}
}
