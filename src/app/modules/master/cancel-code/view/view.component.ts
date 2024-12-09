import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
