import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentReviewComponent } from './adjustment-review.component';

describe('AdjustmentReviewComponent', () => {
	let component: AdjustmentReviewComponent,
		fixture: ComponentFixture<AdjustmentReviewComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AdjustmentReviewComponent]
		});
		fixture = TestBed.createComponent(AdjustmentReviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
