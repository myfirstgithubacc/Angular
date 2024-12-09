import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreReviewCandidatesComponent } from './core-review-candidates.component';

describe('CoreReviewCandidatesComponent', () => {
	let component: CoreReviewCandidatesComponent,
		fixture: ComponentFixture<CoreReviewCandidatesComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreReviewCandidatesComponent]
		});
		fixture = TestBed.createComponent(CoreReviewCandidatesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
