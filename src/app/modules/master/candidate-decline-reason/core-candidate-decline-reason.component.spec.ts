import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCandidateDeclineReasonComponent } from './core-candidate-decline-reason.component';

describe('CoreCandidateDeclineReasonComponent', () => {
	let component: CoreCandidateDeclineReasonComponent,
		fixture: ComponentFixture<CoreCandidateDeclineReasonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreCandidateDeclineReasonComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreCandidateDeclineReasonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
