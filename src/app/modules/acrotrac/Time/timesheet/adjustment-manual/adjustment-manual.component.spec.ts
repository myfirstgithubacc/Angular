import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentManualComponent } from './adjustment-manual.component';

describe('AdjustmentManualComponent', () => {
	let component: AdjustmentManualComponent,
		fixture: ComponentFixture<AdjustmentManualComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AdjustmentManualComponent]
		});
		fixture = TestBed.createComponent(AdjustmentManualComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
