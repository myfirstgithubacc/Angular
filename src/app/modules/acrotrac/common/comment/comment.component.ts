import { Component, Input, OnInit } from '@angular/core';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { ReviewerComment } from '../../Time/timesheet/adjustment-manual/enum';

@Component({
	selector: 'app-comment',
	templateUrl: './comment.component.html',
	styleUrl: './comment.component.scss'
})
export class CommentComponent implements OnInit {
  @Input() CommentArray:ReviewerComment[];
  public dateFormat: string;

  constructor(private sessionStore: SessionStorageService) { }


  ngOnInit() {
  	this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
  }

}
