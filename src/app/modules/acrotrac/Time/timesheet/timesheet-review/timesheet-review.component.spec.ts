import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetReviewComponent } from './timesheet-review.component';

describe('TimesheetReviewComponent', () => {
	let component: TimesheetReviewComponent,
		fixture: ComponentFixture<TimesheetReviewComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TimesheetReviewComponent]
		});
		fixture = TestBed.createComponent(TimesheetReviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
