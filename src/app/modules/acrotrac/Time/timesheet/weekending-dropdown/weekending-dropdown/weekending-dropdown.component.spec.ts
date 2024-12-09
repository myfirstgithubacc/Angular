import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekendingDropdownComponent } from './weekending-dropdown.component';

describe('WeekendingDropdownComponent', () => {
	let component: WeekendingDropdownComponent,
		fixture: ComponentFixture<WeekendingDropdownComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [WeekendingDropdownComponent]
		});
		fixture = TestBed.createComponent(WeekendingDropdownComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
