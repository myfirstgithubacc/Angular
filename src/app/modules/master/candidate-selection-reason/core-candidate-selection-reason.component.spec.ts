import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCandidateSelectionReasonComponent } from './core-candidate-selection-reason.component';

describe('CoreCandidateSelectionReasonComponent', () => {
	let component: CoreCandidateSelectionReasonComponent,
		fixture: ComponentFixture<CoreCandidateSelectionReasonComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreCandidateSelectionReasonComponent]
		});
		fixture = TestBed.createComponent(CoreCandidateSelectionReasonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
