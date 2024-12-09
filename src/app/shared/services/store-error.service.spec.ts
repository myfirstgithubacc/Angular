import { TestBed } from '@angular/core/testing';

import { StoreErrorService } from './store-error.service';

describe('StoreErrorService', () => {
	let service: StoreErrorService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StoreErrorService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
