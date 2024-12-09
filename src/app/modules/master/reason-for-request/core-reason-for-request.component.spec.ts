import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreReasonForRequestComponent } from './core-reason-for-request.component';

describe('CoreReasonForRequestComponent', () => {
	let component: CoreReasonForRequestComponent,
		fixture: ComponentFixture<CoreReasonForRequestComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreReasonForRequestComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreReasonForRequestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
