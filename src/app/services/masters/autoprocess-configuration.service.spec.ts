import { TestBed } from '@angular/core/testing';

import { AutoprocessConfigurationService } from './autoprocess-configuration.service';

describe('AutoprocessConfigurationService', () => {
	let service: AutoprocessConfigurationService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(AutoprocessConfigurationService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
