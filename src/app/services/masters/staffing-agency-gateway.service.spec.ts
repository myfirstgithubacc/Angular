import { TestBed } from '@angular/core/testing';

import { StaffingAgencyGatewayService } from './staffing-agency-gateway.service';

describe('StaffingAgencyGatewayService', () => {
	let service: StaffingAgencyGatewayService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StaffingAgencyGatewayService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
