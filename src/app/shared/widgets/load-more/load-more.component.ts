/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ILoadMoreColumnOptions } from '@xrm-shared/models/load-more.interface';

@Component({
	selector: 'app-load-more',
	templateUrl: './load-more.component.html',
	styleUrls: ['./load-more.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadMoreComponent<T> {
  @Input() dataSource: T[] = [];
  @Output() loadMoreData = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() copyData = new EventEmitter<T>();
  @Output() onClosePopup = new EventEmitter<void>();
  @Output() onOpenPopup = new EventEmitter<void>();

  public text: string = '';
  @Input() placeholder: string = 'SearchFor';
  @Input() buttonNameSearch: string = '';
  @Input() isSpecialCharacterAllowed: boolean = true;
  @Input() specialCharactersAllowed: string[] = [];
  @Input() specialCharactersNotAllowed: string[] = [];
  @Input() columnOptions: ILoadMoreColumnOptions[] = [];
  @Input() isSearch: boolean = false;
  @Input() uniqueId: string;
  @Input() headerTitle: string;
  @Input() buttonLabel: string;
  public isLoadMorePopupShow: boolean = false;

  public openPopup(): void {
  	this.onOpenPopup.emit();
  	this.text = '';
  	this.isSearch = false;
  	this.isLoadMorePopupShow = true;
  }

  private closePopup(): void {
  	this.onClosePopup.emit();
  	this.isLoadMorePopupShow = false;
  }

  public loadMore(): void {
  	if (!this.isSearch) {
  		this.loadMoreData.emit();
  	}
  }

  public getCopyData(event: T) {
  	this.copyData.emit(event);
  	this.closePopup();
  }

  public onSearch(): void {
  	this.smartSearch(this.text.trim());
  }

  public onChange(value: string): void {
  	if (value === '') {
  		this.smartSearch(this.text.trim());
  	}
  }

  public onEntrePress(event: KeyboardEvent) {
  	if (event.key == 'Enter') {
  		this.smartSearch(this.text.trim());
  	}
  }

  private smartSearch(text: string) {
  	this.isSearch = true;
  	this.search.emit(text);
  }

  public getNestedValue(obj: Record<string, unknown>, key: string): T | string | undefined {
  	const keys = key.split('.'),
  	 value = keys.reduce<unknown>((acc, currentKey) => {
  		if (acc && typeof acc === 'object' && currentKey in acc) {
  			return (acc as Record<string, unknown>)[currentKey];
  		}
  		return undefined;
  	}, obj);
  	if (typeof value === 'boolean') {
  		return value
  			? 'Yes'
  			: 'No';
  	}
  	return value as T;
  }

}
