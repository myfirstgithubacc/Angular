import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreEmailTemplateComponent } from './core-email-template.component';

describe('CoreEmailTemplateComponent', () => {
	let component: CoreEmailTemplateComponent,
		fixture: ComponentFixture<CoreEmailTemplateComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreEmailTemplateComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreEmailTemplateComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
