import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDefinedFieldsComponent } from './user-defined-fields.component';

describe('UserDefinedFieldsComponent', () => {
	let component: UserDefinedFieldsComponent,
		fixture: ComponentFixture<UserDefinedFieldsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UserDefinedFieldsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(UserDefinedFieldsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
