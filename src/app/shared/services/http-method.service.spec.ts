import { TestBed } from '@angular/core/testing';

import { HttpMethodService } from './http-method.service';

describe('HttpMethodService', () => {
	let service: HttpMethodService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(HttpMethodService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
