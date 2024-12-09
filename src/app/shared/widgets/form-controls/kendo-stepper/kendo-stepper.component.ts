import { Component, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

const MAX_STEPS = 10;
@Component({
	selector: 'app-kendo-stepper',
	templateUrl: './kendo-stepper.component.html',
	styleUrls: ['./kendo-stepper.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoStepperComponent {
  @Input() steps: { label?: string, isValid?: boolean, disabled?: boolean, validate?: boolean }[];

  @Input() stepsLocalizeParam: DynamicParam[] = [];

  @Input() currentStep: number;

  @Input() linear: boolean = false;

  @Input() isOptional: boolean = false;

  @Output() stepChanged = new EventEmitter<number>();

  @Output() completed = new EventEmitter<void>();

  @Output() canceled = new EventEmitter<void>();

  @Output() activate = new EventEmitter<StepperActivateEvent>();


  constructor(private localizationSrv: LocalizationService, private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
  	if (this.steps.length > MAX_STEPS) {
  		this.steps.length = MAX_STEPS;
  	}
  	this.localizeStepLabels();
  }

  ngDoCheck(): void {
  	this.cd.markForCheck();
  }

  public localizeStepLabels(): Step[] {
  	this.steps.forEach((step: Step) => {
  		if (step.label) {
  			const dynamicParams = step.LocalizeParam;
  			step.label = this.localizationSrv.GetLocalizeMessage(step.label, dynamicParams);
  		}
  	});
  	return this.steps;
  }

  onStepChanged(stepIndex: number) {
  	this.stepChanged.emit(stepIndex);
  }

  onComplete(evt: any) {
  	this.completed.emit(evt);
  }

  onCancel(evt: any) {
  	this.canceled.emit(evt);
  }

  onActivate(event: StepperActivateEvent) {
  	if (this.isOptional) {
  		this.activate.emit(event);
  		return;
  	}
  	event.preventDefault();
  }
}
interface Step {
  label?: string;
  isValid?: boolean;
  disabled?: boolean;
  validate?: boolean;
  LocalizeParam?: DynamicParam[];
}
