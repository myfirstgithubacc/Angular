import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpendedTimesheetDetailsComponent } from './expended-timesheet-details.component';

describe('ExpendedTimesheetDetailsComponent', () => {
	let component: ExpendedTimesheetDetailsComponent,
		fixture: ComponentFixture<ExpendedTimesheetDetailsComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ExpendedTimesheetDetailsComponent]
		});
		fixture = TestBed.createComponent(ExpendedTimesheetDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
