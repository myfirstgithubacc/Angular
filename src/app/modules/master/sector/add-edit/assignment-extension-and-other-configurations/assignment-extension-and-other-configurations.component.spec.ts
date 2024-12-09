import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentExtensionAndOtherConfigurationsComponent } from './assignment-extension-and-other-configurations.component';

describe('AssignmentExtensionAndOtherConfigurationsComponent', () => {
	let component: AssignmentExtensionAndOtherConfigurationsComponent,
		fixture: ComponentFixture<AssignmentExtensionAndOtherConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AssignmentExtensionAndOtherConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(AssignmentExtensionAndOtherConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
