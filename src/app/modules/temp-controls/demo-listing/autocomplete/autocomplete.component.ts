import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';

import { CustomValidators } from '@xrm-shared/services/custom-validators.service';


@Component({

	selector: 'app-autocomplete',

	templateUrl: './autocomplete.component.html',

	styleUrls: ['./autocomplete.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush

})

export class AutocompleteComponent {
	public myForm: FormGroup;

	public disabledDate2: any = new Date();
	securityLevel = [
		{ Text: 'X-Small', Value: '1' },
		{ Text: 'Small', Value: '3' },
		{ Text: 'X-large', Value: '4' },
		{ Text: 'XL-large', Value: '5' }
	];

	public disabledDates1 = (date: Date): boolean => {

		const yesterday = ((d: any) =>

			new Date(d.setDate(d.getDate() - 1)))(new Date());

		return (date.getTime() < yesterday.getTime());

	};

	constructor(private formBuilder: FormBuilder, private customValidators: CustomValidators) {

		this.myForm = this.formBuilder.group({

			gender: [null, this.customValidators.RequiredValidator()],

			datePicker1: [null],

			datePicker2: [null],
			sectorName: [null],
			sectorName1: [null]


		});


		this.myForm.get('datePicker1')?.valueChanges.subscribe(() => {

			// When selectedDate1 changes, update disabledDates for selectedDate2

			this.myForm.get('datePicker2')?.updateValueAndValidity();

		});

	}

	cdLog() {
		console.log('Grand parent component called');
	  }

	// eslint-disable-next-line no-sparse-arrays

	public approvalRequiredDropDownData: string[] = [
		"Amsterdam",
		"Athens",
		"Barcelona",
		"Berlin",
		"Brussels",
		"Chicago",
		"Copenhagen",
		"Dublin",
		"Helsinki",
		"Houston",
		"Lisbon",
		"London",
		"Los Angeles",
		"Madrid",
		"Miami",
		"Montreal",
		"New York",
		"Paris",
		"Philadelphia",
		"Prague",
		"Rome",
		"Sao Paulo",
		"Seattle",
		"Stockholm",
		"Toronto",
		"Vancouver",
		"Vienna",
		"Vienna",
		"Warsaw"
	];


	onChange(date: any) {

		this.disabledDate2 = this.comapreDate(date);


	}

	patchValue() {

		this.myForm.get('sectorName')?.patchValue({ Value: '3' });

	}

	removeValue() {

		this.myForm.get('sectorName')?.reset();

	}

	comapreDate(date: any) {

		return new Date() < new Date(date);

	}


	disableDates = (date: Date): boolean => {

		const selectedDate1 = this.myForm.get('datePicker1')?.value;

		return date < selectedDate1;

	};

}
