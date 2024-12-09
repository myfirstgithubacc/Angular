import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherApproversLineItemsComponent } from './other-approvers-line-items.component';

describe('OtherApproversLineItemsComponent', () => {
	let component: OtherApproversLineItemsComponent,
	 fixture: ComponentFixture<OtherApproversLineItemsComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [OtherApproversLineItemsComponent]
		});
		fixture = TestBed.createComponent(OtherApproversLineItemsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
