import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMspProcessActivityComponent } from './configure-msp-process-activity.component';

describe('ConfigureMspProcessActivityComponent', () => {
	let component: ConfigureMspProcessActivityComponent,
		fixture: ComponentFixture<ConfigureMspProcessActivityComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigureMspProcessActivityComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(ConfigureMspProcessActivityComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
