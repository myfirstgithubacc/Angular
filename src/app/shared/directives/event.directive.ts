import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
	selector: '[myEvent]'
})
export class EventDirective {
  @Output() public singleClick = new EventEmitter<void>();
  @Output() public focusEvent = new EventEmitter<void>();
  @Output() public changeEvent = new EventEmitter<void>();
  @Output() public blurEvent = new EventEmitter<void>();
  @Output() public dragEvent = new EventEmitter<void>();
  @Output() public dropEvent = new EventEmitter<void>();
  @Output() public dragEnterEvent = new EventEmitter<void>();
  @Output() public dragLeaveEvent = new EventEmitter<void>();
  @Output() public selectEvent = new EventEmitter<void>();
  @Output() public submitEvent = new EventEmitter<void>();
  @Output() public toggleEvent = new EventEmitter<void>();

  @HostListener('click', ['$event'])
  public onClick(event: any): void {
  	this.singleClick.emit(event);
  }

  @HostListener('focus', ['$event'])
  public onFocus(event: any): void {
  	this.focusEvent.emit(event);
  }

  @HostListener('change', ['$event'])
  public onChange(event: any): void {
  	this.changeEvent.emit(event);
  }

  @HostListener('blur', ['$event'])
  public onBlur(event: any): void {
  	this.blurEvent.emit(event);
  }

  @HostListener('dragover', ['$event'])
  public allowDrop(event: any) {
  	event.preventDefault();
  }

  @HostListener('drag', ['$event'])
  public onDrag(event: any): void {
  	this.dragEvent.emit(event);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any): void {
  	this.dropEvent.emit(event);
  }

  @HostListener('dragenter', ['$event'])
  public onDragEnter(event: any): void {
  	this.dragEnterEvent.emit(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: any): void {
  	this.dragLeaveEvent.emit(event);
  }

  @HostListener('select', ['$event'])
  public onSelect(event: any): void {
  	this.selectEvent.emit(event);
  }

  @HostListener('submit', ['$event'])
  public onSubmit(event: any): void {
  	this.submitEvent.emit(event);
  }

  @HostListener('toggle', ['$event'])
  public onToggle(event: any): void {
  	this.toggleEvent.emit(event);
  }

}
