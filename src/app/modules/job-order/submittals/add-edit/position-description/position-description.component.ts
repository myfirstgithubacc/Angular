import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CardVisibilityKeys, PRDetails } from '../../services/Interfaces';

@Component({
	selector: 'app-position-description',
	templateUrl: './position-description.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PositionDescriptionComponent {

	@Input() positionDetailsForm: FormGroup;
	@Input() profReqData: PRDetails;
	@Input() isCardVisible: boolean;
	@Output() onExpandedChange = new EventEmitter<{ card: CardVisibilityKeys; isCardVisible: boolean }>();

	public onExpandedCollapse(event:boolean){
		this.onExpandedChange.emit({card: 'ispositionDescriptionVisible', isCardVisible: event});
	}
}
