import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeConversionGuideComponent } from './time-conversion-guide.component';

describe('TimeConversionGuideComponent', () => {
	let component: TimeConversionGuideComponent,
		fixture: ComponentFixture<TimeConversionGuideComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TimeConversionGuideComponent]
		});
		fixture = TestBed.createComponent(TimeConversionGuideComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
