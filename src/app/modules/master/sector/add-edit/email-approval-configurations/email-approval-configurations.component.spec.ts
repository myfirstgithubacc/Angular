import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailApprovalConfigurationsComponent } from './email-approval-configurations.component';

describe('EmailApprovalConfigurationsComponent', () => {
	let component: EmailApprovalConfigurationsComponent,
		fixture: ComponentFixture<EmailApprovalConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EmailApprovalConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(EmailApprovalConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
