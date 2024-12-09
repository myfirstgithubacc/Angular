import { TestBed } from '@angular/core/testing';
import { ApiHeaderInterceptor } from './api-header.interceptor';

describe('ApiHeaderInterceptor', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [ApiHeaderInterceptor]
		}));

	it('should be created', () => {
		const interceptor: ApiHeaderInterceptor = TestBed.inject(ApiHeaderInterceptor);
		expect(interceptor).toBeTruthy();
	});
});
