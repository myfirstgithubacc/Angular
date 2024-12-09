import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { TabItem } from '@xrm-shared/models/menu-interface';

@Component({selector: 'app-side-menu',
	templateUrl: './side-menu.component.html',
	styleUrls: ['./side-menu.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {

	@Output() selectedTapEvent = new EventEmitter<TabItem>();

	@Input() TabList: TabItem[] = [];

	onTapChange(data: TabItem) {
		if (!data.isDisabled) {
			this.TabList.forEach((tab) => {
				tab.isSelected = false;
			});
			const ind = this.TabList.findIndex((a) =>
				a.label == data.label);
			this.TabList[ind].isSelected = true;
			this.selectedTapEvent.emit(data);
		}
	}
}
