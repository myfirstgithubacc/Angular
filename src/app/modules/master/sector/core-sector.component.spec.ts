import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreSectorComponent } from './core-sector.component';

describe('CoreSectorComponent', () => {
	let component: CoreSectorComponent,
		fixture: ComponentFixture<CoreSectorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreSectorComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreSectorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
