import { TestBed } from '@angular/core/testing';

import { EventReasonService } from './event-reason.service';

describe('EventReasonService', () => {
	let service: EventReasonService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EventReasonService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
