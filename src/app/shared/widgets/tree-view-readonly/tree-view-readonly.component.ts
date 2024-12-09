import { Component, Input, SimpleChanges, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { TreeItem } from '@xrm-shared/models/tree-view-readonly.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-tree-view-readonly',
	templateUrl: './tree-view-readonly.component.html',
	styleUrls: ['./tree-view-readonly.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewReadonlyComponent{

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 @Input() data:any;

  @Input() isFiltered = false;
  @Input() isRequired = false;
  @Input() selection: TreeItem | null = null;
   @Input() tooltipTitle: string | null = null;
   @Input() tooltipPosition: string | null = null;
  @Input() tooltipVisible: boolean;
  @Input() childrenField: string = '';

  @Input() tooltipTitleLocalizeParam: DynamicParam[] = [];

  @Input() label: string = '';
  @Input() textField: string | string[] = '';

  ngOnChanges(changes: SimpleChanges): void {

  	this.data = changes['data'].currentValue;
  }

}
