import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreEventReasonComponent } from './core-event-reason.component';

describe('CoreEventReasonComponent', () => {
	let component: CoreEventReasonComponent,
		fixture: ComponentFixture<CoreEventReasonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreEventReasonComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreEventReasonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
