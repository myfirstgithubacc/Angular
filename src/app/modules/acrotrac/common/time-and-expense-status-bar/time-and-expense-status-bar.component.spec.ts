import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAndExpenseStatusBarComponent } from './time-and-expense-status-bar.component';

describe('TimeAndExpenseStatusBarComponent', () => {
	let component: TimeAndExpenseStatusBarComponent,
		fixture: ComponentFixture<TimeAndExpenseStatusBarComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TimeAndExpenseStatusBarComponent]
		});
		fixture = TestBed.createComponent(TimeAndExpenseStatusBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
