import { Component, Input, OnInit } from '@angular/core';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';

@Component({
	selector: 'app-multi-level-comments',
	templateUrl: './multi-level-comments.component.html',
	styleUrl: './multi-level-comments.component.scss'
})

export class MultiLevelCommentsComponent<T extends { [K in keyof T]: string | number | Date }> implements OnInit {

	@Input() allComments: T[] = [];
	@Input() label: string = '';
	public dateFormat: string;
	@Input() dateKey: keyof T;
	@Input() labelKey: keyof T | null;
	@Input() commentsKey: keyof T;

	constructor(private sessionStore: SessionStorageService) { }

	ngOnInit(): void {
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}
}

