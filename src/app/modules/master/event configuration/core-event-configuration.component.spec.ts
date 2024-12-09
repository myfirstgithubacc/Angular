import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreEventConfirgurationComponent } from './core-event-configuration.component';

describe('CoreEventConfirgurationComponent', () => {
	let component: CoreEventConfirgurationComponent,
		fixture: ComponentFixture<CoreEventConfirgurationComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreEventConfirgurationComponent]
		});
		fixture = TestBed.createComponent(CoreEventConfirgurationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
