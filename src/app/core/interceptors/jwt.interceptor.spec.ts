import { TestBed } from '@angular/core/testing';

import { JWTInterceptor} from './jwt.interceptor';

describe('JwtInterceptor', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [JWTInterceptor]
		}));

	it('should be created', () => {
		const interceptor: JWTInterceptor = TestBed.inject(JWTInterceptor);
		expect(interceptor).toBeTruthy();
	});
});
