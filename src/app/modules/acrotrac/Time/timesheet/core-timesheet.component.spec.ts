import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreTimesheetComponent } from './core-timesheet.component';

describe('CoreTimesheetComponent', () => {
	let component: CoreTimesheetComponent,
		fixture: ComponentFixture<CoreTimesheetComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreTimesheetComponent]
		});
		fixture = TestBed.createComponent(CoreTimesheetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
