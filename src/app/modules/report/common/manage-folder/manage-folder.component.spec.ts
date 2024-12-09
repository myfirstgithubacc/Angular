import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFolderComponent } from './manage-folder.component';

describe('ManageFolderComponent', () => {
	let component: ManageFolderComponent,
	 fixture: ComponentFixture<ManageFolderComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ManageFolderComponent]
		})
			.compileComponents();
		fixture = TestBed.createComponent(ManageFolderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
