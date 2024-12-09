import { TestBed } from '@angular/core/testing';

import { CopyItemService } from './copy-item.service';

describe('CopyItemService', () => {
	let service: CopyItemService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CopyItemService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
