import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiLevelCommentsComponent } from './multi-level-comments.component';

describe('MultiLevelCommentsComponent', () => {
	let component: MultiLevelCommentsComponent,
	 fixture: ComponentFixture<MultiLevelCommentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MultiLevelCommentsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MultiLevelCommentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
