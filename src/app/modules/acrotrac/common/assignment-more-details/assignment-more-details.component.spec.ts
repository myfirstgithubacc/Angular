import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentMoreDetailsComponent } from './assignment-more-details.component';

describe('AssignmentMoreDetailsComponent', () => {
	let component: AssignmentMoreDetailsComponent,
		fixture: ComponentFixture<AssignmentMoreDetailsComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AssignmentMoreDetailsComponent]
		});
		fixture = TestBed.createComponent(AssignmentMoreDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
