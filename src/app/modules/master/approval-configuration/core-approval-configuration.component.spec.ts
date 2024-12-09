import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreApprovalConfigurationComponent } from './core-approval-configuration.component';

describe('CoreApprovalConfigurationComponent', () => {
	let component: CoreApprovalConfigurationComponent,
		fixture: ComponentFixture<CoreApprovalConfigurationComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreApprovalConfigurationComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreApprovalConfigurationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
