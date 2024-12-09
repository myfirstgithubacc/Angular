import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfxConfigurationsComponent } from './rfx-configurations.component';

describe('RfxConfigurationsComponent', () => {
	let component: RfxConfigurationsComponent,
		fixture: ComponentFixture<RfxConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RfxConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(RfxConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
