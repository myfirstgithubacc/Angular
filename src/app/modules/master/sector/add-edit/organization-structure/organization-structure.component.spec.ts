import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationStructureComponent } from './organization-structure.component';

describe('OrganizationStructureComponent', () => {
	let component: OrganizationStructureComponent,
		fixture: ComponentFixture<OrganizationStructureComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [OrganizationStructureComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(OrganizationStructureComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
