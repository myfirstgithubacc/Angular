import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRestMealBreakComponent } from './core-rest-meal-break.component';

describe('CoreRestMealBreakComponent', () => {
	let component: CoreRestMealBreakComponent,
		fixture: ComponentFixture<CoreRestMealBreakComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreRestMealBreakComponent]
		});
		fixture = TestBed.createComponent(CoreRestMealBreakComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
