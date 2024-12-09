import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { TabItem } from '@xrm-master/user/interface/user';
import { UsersService } from '@xrm-master/user/service/users.service';

@Component({
  selector: 'app-side-menu-user',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  @Input() public isApiCallOnTabBasis = false;
  constructor(private cd: ChangeDetectorRef, private usersService: UsersService) { }

  @Output() selectedTapEvent = new EventEmitter<TabItem>();

  @Input() TabList: TabItem[] = [];

  onTapChange(data: TabItem) {
    if (!data.isDisabled) {
      this.selectedTapEvent.emit(data);
    }
  }
}
