import { TestBed } from '@angular/core/testing';

import { AuthDeactiveGuard } from './auth-deactive.guard';

describe('AuthDeactiveGuard', () => {
	let guard: AuthDeactiveGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(AuthDeactiveGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
