import { TestBed } from '@angular/core/testing';

import { ConstantValueService } from './constant-value.service';

describe('ConstantValueService', () => {
	let service: ConstantValueService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ConstantValueService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
