import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({selector: 'app-view',
	template: '<app-view-review></app-view-review>',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
}
