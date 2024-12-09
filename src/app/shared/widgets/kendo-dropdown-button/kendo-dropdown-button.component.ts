import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { ActionItem, DataItem } from '@xrm-shared/models/dropdown-button.model';


@Component({
	selector: 'app-kendo-dropdown-button',
	templateUrl: './kendo-dropdown-button.component.html',
	styleUrls: ['./kendo-dropdown-button.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoDropdownButtonComponent {

  @Input() actionSet: ActionItem[] = [];
  @Input() dataItem: DataActionItem[] | null = null;
  @Input() entityId: number | string | null = null;
  @Input() isDisabled: boolean = false;
  @Output() ItemClick: EventEmitter<DataItem> = new EventEmitter<DataItem>();

  public onItemClick(e: ActionItem): void {
  	e.fn(this.dataItem);
  }
  constructor(private cdr: ChangeDetectorRef) { }
  ngOnChanges() {
  	if (this.entityId == null)
  		return;
  }

}
export interface DataActionItem {
  icon: string;
  color: string;
  title: string;
}
