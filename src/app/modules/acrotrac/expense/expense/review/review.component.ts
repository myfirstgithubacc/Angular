import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({selector: 'app-review',
	template: '<app-view-review [isReview]="true"></app-view-review>',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent {

}
