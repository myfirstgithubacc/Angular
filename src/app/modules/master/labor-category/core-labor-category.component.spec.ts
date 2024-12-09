import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreLaborCategoryComponent } from './core-labor-category.component';

describe('CoreLaborCategoryComponent', () => {
	let component: CoreLaborCategoryComponent,
		fixture: ComponentFixture<CoreLaborCategoryComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreLaborCategoryComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreLaborCategoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
