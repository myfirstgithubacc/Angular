import { TestBed } from '@angular/core/testing';

import { PreloadingModuleService } from './preloading-module.service';

describe('PreloadingModuleService', () => {
	let service: PreloadingModuleService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PreloadingModuleService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
