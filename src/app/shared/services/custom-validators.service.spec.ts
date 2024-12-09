import { TestBed } from '@angular/core/testing';

import { CustomValidators } from './custom-validators.service';

describe('CustomValidatorsService', () => {
	let service: CustomValidators;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CustomValidators);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
