import { Directive, Input, HostListener, OnDestroy, Output, EventEmitter } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
	selector: '[afterValueChanged]'
})
export class AfterValueChangedDirective implements OnDestroy {
  @Output()
	public afterValueChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  public valueChangeDelay = 800;
  private unsubscribe$ = new Subject<void>();
  private stream: Subject<number> = new Subject<number>();


  constructor() {
  	this.stream.pipe(
  		debounceTime(this.valueChangeDelay),
  		takeUntil(this.unsubscribe$)
  	)
  		.subscribe((value: number) =>
  			this.afterValueChanged.next(value));
  }

  ngOnDestroy(): void {
  	this.unsubscribe$.next();
  	this.unsubscribe$.complete();
  }

  @HostListener('valueChange', ['$event'])
  public onValueChange(value: number): void {
  	this.stream.next(value);
  }
}

