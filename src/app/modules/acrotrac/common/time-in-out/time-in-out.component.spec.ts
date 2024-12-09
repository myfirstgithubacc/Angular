import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeInOutComponent } from './time-in-out.component';

describe('TimeInOutComponent', () => {
	let component: TimeInOutComponent,
	 fixture: ComponentFixture<TimeInOutComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TimeInOutComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(TimeInOutComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
