import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalListComponent } from './list.component';

describe(' GlobalListComponent', () => {
	let component: GlobalListComponent,
		fixture: ComponentFixture< GlobalListComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [GlobalListComponent]
		});
		fixture = TestBed.createComponent( GlobalListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
