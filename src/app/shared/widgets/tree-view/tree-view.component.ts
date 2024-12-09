/* eslint-disable no-loop-func */
/* eslint-disable line-comment-position */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';


@Component({selector: 'app-tree-view',
	templateUrl: './tree-view.component.html',
	styleUrls: ['./tree-view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewComponent implements OnChanges {

	@Input() data: any;
	@Input() isFiltered: boolean;
	@Input() isRequired: boolean;
	@Input() selection: boolean;
	@Input() tooltipTitle: string;
	@Input() tooltipPosition: string;
	@Input() tooltipVisible: boolean;
	@Input() dataWIthIndex: number;
	@Input() height: string;
	@Input() tooltipTitleLocalizeParam: DynamicParam[] = [];
	public key = 'Text';
	@Input() label: string = '';
	@Input() textField: string;
	@Input() isViewOnlyCase:boolean = false;
	@Input() isViewApprovalCase:boolean = false;
	@Output() onCheckedTree = new EventEmitter<any>();
	@Input() checkedKeys: string[] = [];
	@Input() disabledKeys:string[]= [];
	@Input() selectedKeys: string[] = [];
	@Input() childrenField: string;
	@Input() selectedItems: any[] = [];
	@Input() selectedItemsIndex: any[] = [];
	@Input() treeViewType: string;
	@Input() expandedKeys: unknown[] = [];
	@Input() isReset: boolean = false;
	TreeValue: FormControl;
	incomingControlName: string;
	isDisabled: boolean = false;
	compareIndex:any;
	lastchildD: any[] = [];
	X1: any;
	showTreeView = true;

	constructor(
		private parentF: FormGroupDirective,
		private cdRef: ChangeDetectorRef
	) {
		this.TreeValue = new FormControl(null);
	}
	@Input()
	set controlName(value: string) {
		this.TreeValue = this.parentF.form.get(value) as FormControl;
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (this.treeViewType == "copyTree") {
			this.checkedKeys = [];
		}

		this.data = changes['data'].currentValue;
		if (this.isViewApprovalCase) {
			this.data?.map((value: any) => {
				const checkPrefix: any = this.checkedKeys.filter((val: any) =>
					(val[0] ?? '') == value.Index);
				if (value.items.length == checkPrefix.length && (!this.checkedKeys.includes(value.Index))) {
					this.checkedKeys.push(value.Index);
				}
			});
		}
	}

	public startsWith = (key: any) =>
		this.selectedItemsIndex.filter((country) =>
			country.startsWith(key));

	multiLevelTreeView(itemLookup: any) {
		if (this.checkedKeys.length === magicNumber.zero && this.selectedItems.length === magicNumber.zero) {
			this.selectedItemsIndex = [];
			this.selectedItems = [];
			this.onCheckedTree.emit({ selected: this.selectedItems, checkedKey: this.checkedKeys });
		} else if (!this.isViewApprovalCase) {

			this.getTreeViewDataRecursion2(itemLookup);

			const checkedKeysSet = new Set(this.checkedKeys);
			// Filter selectedItems based on checkedKeys and uniqueness of Index
			this.selectedItems = this.selectedItems.filter((item, index, self) => {
				// Check if the item's Index is in the checkedKeys and is unique
				return (checkedKeysSet.has(item.Index) && self.findIndex((t) =>
					(
						t.Index === item.Index
					)) === index) && Object.prototype.hasOwnProperty.call(item, "ActionGroupId");
			});
			this.onCheckedTree.emit({ selected: this.selectedItems, checkedKey: this.checkedKeys });
			if(itemLookup.children.length > magicNumber.zero) {
				this.showTreeView = false;
				this.cdRef.detectChanges();
				this.showTreeView = true;
				this.cdRef.detectChanges();
			}
		} else {
			this.onCheckedTree.emit({ selected: this.selectedItems, checkedKey: this.checkedKeys });
		}
	}

	public onSelectionChange(itemLookup: any): void {
		if (this.treeViewType === "multileveltreeview") {
			this.multiLevelTreeView(itemLookup);
		}
		else if (this.treeViewType === "singleleveltreeview") {
			if (this.checkedKeys.length == magicNumber.zero) {
				this.selectedItemsIndex = [];
				this.selectedItems = [];
				this.onCheckedTree.emit({ selected: this.selectedItems, checkedKey: this.checkedKeys });
			} else {
				const arr = this.selectedItemsIndex;
				this.selectedItemsIndex = arr.filter(function (item: any, pos: any) {
					return arr.indexOf(item) == pos;
				});
				this.selectedItems = this.uniqForObject(this.selectedItems);
				this.getSingleLevelTreeView(itemLookup);
				this.onCheckedTree.emit({ selected: this.selectedItems, checkedKey: this.checkedKeys });
			}
		}
		else if (this.treeViewType === 'approvalLevel') {
			this.toSelectionItemsOfApproval(itemLookup);
			this.onCheckedTree.emit(this.selectedItems);
		} else {
			this.toSelectionItems(itemLookup?.item?.dataItem);
			this.onCheckedTree.emit(this.selectedItems);
		}
	}

	uniqForObject(array: any[]): any[] {
		const result: any[] = [];
		for (const item of array) {
			const found = result.some((value) =>
				value.Value === item.Value);
			if (!found) {
				result.push(item);
			}
		}
		return result;
	}
	public isItemSelected = (_: any, index: string) =>
		this.selectedKeys.includes(index);
	// eslint-disable-next-line max-lines-per-function
	getTreeViewDataRecursion(element: any, isChildren: number = magicNumber.zero, isRemove: number = magicNumber.one) {

		if (element?.children?.length > magicNumber.zero) {
			element.children.forEach((child: any) => {
				this.getTreeViewDataRecursion(child, magicNumber.one);
			});
		}
		else if (element?.item?.dataItem?.items?.length > magicNumber.zero) {
			this.dataItemElement(element);
		} else if (element?.item?.dataItem != null && element?.item?.dataItem != undefined) {
			this.nullDataItem(element, isChildren, isRemove);
		}
		else if (element?.items != null && element.items != undefined) {
			element.items.forEach((child: any) => {
				this.getTreeViewDataRecursion(child, magicNumber.one);
			});
		}
		else if (element != null && element != undefined) {
			this.selectedtedItemIndex(element);
		}
	}
	// eslint-disable-next-line max-len
	getTreeViewDataRecursion2(element: any) {

		let selectParentIndex: string = '',
		 previousSelection = this.selectedItemsIndex.slice(),
			shouldExcludeParent = false;

		 const selectItem = element.item.dataItem.text,
		 selectIndex = element.item.dataItem.Index,
			a = this.data.find((res: any) =>
				res.Index == selectIndex),
				 b = a
				? a.items?.map((res: any) =>
					res.Index)
				: [],
				 c: any[] = [],
				 d: any[] = [];


				 // Flag to check if the parent should be excluded
				 if (element?.parent) selectParentIndex = element?.parent.item.index;

		if (a) {
			const a1 = a.Index;
			a.items?.forEach((x: any) => {
				let shouldExcludeChild = false;
				// Flag to check if the child with groupId 25 is found
				b.forEach((y: any) => {

					if (x.Index == y) {
						x.items.forEach((child: any) => {
							if (child.ActionGroupId === magicNumber.twentyFive && x.items.length > 1) {
								shouldExcludeChild = true;
								// eslint-disable-next-line max-nested-callbacks
								previousSelection = previousSelection.filter((el: any) =>
									el != child.Index);
							} else {
								c.push({ parent: y, children: child.Index });
								this.selectedItems.push(child);
							}
						});
						if (!shouldExcludeChild) {
							d.push(y);
						} else {
							shouldExcludeParent = true;
						}
						x.items.forEach((child: any) => {
							if (child.ActionGroupId !== magicNumber.twentyFive || x.items.length <= magicNumber.one) {

								d.push(child.Index);
								this.selectedItems.push(child);
							}
						});
					}
				});
			});
			if (!shouldExcludeParent) {
				d.push(selectIndex);
			}

			if (previousSelection) {

				const commonElements = d.filter((item) =>
					previousSelection.includes(item));
				if (commonElements.length === d.length) {
					d.forEach((item) => {
						previousSelection = previousSelection.filter((i) =>
							i !== item);
						this.selectedItemsIndex = [...previousSelection];
						const uniqueSet = new Set(this.selectedItemsIndex);

						this.selectedItemsIndex = Array.from(uniqueSet);

					});
				} else {
					this.selectedItemsIndex = [...previousSelection, ...d];
					// Convert the array to a set to remove duplicates
					const uniqueSet = new Set(this.selectedItemsIndex);
					// Convert the set back to an array
					this.selectedItemsIndex = Array.from(uniqueSet);

				}
			}
			this.checkedKeys = this.selectedItemsIndex;
		} else {
			this.processDataFromItems(selectIndex, selectItem, selectParentIndex);
		}
		/* this.selectedItemsIndex = [...previousSelection, ...d];
		   Convert the array to a set to remove duplicates */
		// eslint-disable-next-line one-var
		const uniqueSet = new Set(this.selectedItemsIndex);
		// Convert the set back to an array
		this.selectedItemsIndex = Array.from(uniqueSet);

		this.checkedKeys = this.selectedItemsIndex;
	}

	findTopParent(item: any): any {
		if (item.parent) {
			const parentItem = this.data.find((res: any) =>
				res.Index === item.parent);
			return this.findTopParent(parentItem); // Recursively call the function with the parent item
		} else {
			return item;
		}
	}

	processDataFromItems(selectIndex: string, selectItem: any, selectParentIndex: string) {
		let previousSelection = this.selectedItemsIndex.slice(),
				 topParent: any,
				 check = false,
				 a;
		for (const item of this.data) {
			if (item.items) {
				let found = item.items.find((res: any) =>
					res.Index == selectIndex);

				if (!found) {
					item.items.forEach((res: any) => {
						found = res.items.find((e: any) =>
							e.Index == selectIndex && res.Index == selectParentIndex);
						if (found != undefined) {
							check = true;
							topParent = this.findTopParent(item); // Find the top parent
						}
					});
				}
				if (found && !check) {
					topParent = this.findTopParent(item); // Find the top parent
					break;
				}
			}
		}

		if (topParent) {
			a = topParent;
			if (a) {
				const a1 = a.Index,
				 b = a
						? a.items.map((res: any) =>
							res.Index)
						: [],
						 c: any[] = [],
						 d: any[] = [];
						 let shouldExcludeParent = false,
						  doNotCheckChild = false;
				a.items.forEach((x: any) => {
					if (x.Index == selectParentIndex )
						this.X1 = x.items.map((item: any) =>
							item.Index);
					let shouldExcludeChild = false; // Flag to check if the child with groupId 25 is found
					b.forEach((y: any) => {
						if (x.Index == selectIndex) {
							this.X1 = x.items.map((item: any) =>
								item.Index);
							doNotCheckChild = true;


							x.items.forEach((child: any) => {
								if (child.ActionGroupId === magicNumber.twentyFive && x.items.length > magicNumber.one) {
									shouldExcludeChild = true;
									// eslint-disable-next-line max-nested-callbacks
									previousSelection = previousSelection.filter((el: any) =>
										el != child.Index);
								} else {
									c.push({ parent: y, children: child.Index });
									this.selectedItems.push(child);

								}
							});
							if (!shouldExcludeChild) {
								// d.push(y);
							} else {
								shouldExcludeParent = true;
							}
							x.items.forEach((child: any) => {
								if (child.ActionGroupId !== magicNumber.twentyFive || x.items.length <= magicNumber.one) {

									d.push(child.Index);
									this.selectedItems.push(child);

								}
							});
						}
					});
				});
				if (!shouldExcludeParent) {
					d.push(selectIndex);
					let selectedItem: any;
					for (const item of this.data) {
						selectedItem = this.findItemByIndex(item, selectIndex);
						if (selectedItem) {
							this.selectedItems.push(selectedItem);
						}
					}
				}
				if (!doNotCheckChild) {
					if (c.length == 0 && selectItem == "View Only") {
						let arr: any = [];
						topParent.items.forEach((e: any) => {
							if (e.Index == selectParentIndex) {
								arr = e.items.filter((el: any) =>
									el.ActionGroupId != magicNumber.twentyFive || topParent.items.length <= magicNumber.one);
								arr = arr.map((el: any) =>
									el.Index);
							}
						});
						arr.forEach((e: any) => {
							previousSelection = previousSelection.filter((el: any) =>
								el != e);
						});
					} else {
						let arr: any = [];
						topParent.items.forEach((e: any) => {
							if (e.Index == selectParentIndex) {
								arr = e.items.filter((el: any) =>
									el.ActionGroupId == magicNumber.twentyFive && topParent.items.length > magicNumber.one).map((el: any) =>
									el.Index);
							}
						});

						arr.forEach((e: any) => {
							previousSelection = previousSelection.filter((el: any) =>
								el != e);
						});

						this.lastchildD = [];
						topParent.items.forEach((last: any) => {
							last.items.forEach((child: any) => {
								if(child.Index == selectIndex){
									this.lastchildD.push(child.Index);
									this.selectedItems.push(child);
 										}
							});
						});

					}
				}

				if (previousSelection) {

					const commonElements = d.filter((item) =>
						previousSelection.includes(item));
					if (commonElements.length === d.length) {
						d.forEach((item) => {
							previousSelection = previousSelection.filter((i) =>
								i !== item);
							this.selectedItemsIndex = [...previousSelection];
							const uniqueSet = new Set(this.selectedItemsIndex);

							this.selectedItemsIndex = Array.from(uniqueSet);
							this.unSelectParent(selectParentIndex, a1, b);

						});
					} else {
						this.selectedItemsIndex = [...previousSelection, ...d];
						const uniqueSet = new Set(this.selectedItemsIndex);

						this.selectedItemsIndex = Array.from(uniqueSet);
						this.unSelectParent(selectParentIndex, a1, b);
						this.checkedKeys = this.selectedItemsIndex;
					}
				}
			}
		}

	}
	// Function to find item by index in the data array
	findItemByIndex(item: any, index: string): any {
		if (item.Index === index) {
			return item;
		}
		if (item.items) {
			for (const subItem of item.items) {
				const foundItem = this.findItemByIndex(subItem, index);
				if (foundItem) {
					return foundItem;
				}
			}
		}
		return null;
	}
	unSelectParent(selectParentIndex: any, a1: any, b: any) {
		const allX1InSelected = this.X1.every((item: any) =>
			this.selectedItemsIndex.includes(item));
		if (allX1InSelected) {

			// If all items of X1 are present in selectedItemsIndex, push a1 and b into selectedItemsIndex
			this.selectedItemsIndex.push(selectParentIndex);

		} else {
			// If all elements of X1 are not in selectedItemsIndex, remove a1 and selectParentIndex from selectedItemsIndex
			const indicesToRemove = [a1, selectParentIndex];

			this.selectedItemsIndex = this.selectedItemsIndex.filter((item) =>
				!indicesToRemove.includes(item));
		}
		// eslint-disable-next-line one-var
		const allX2InSelected = b.every((item: any) =>
			this.selectedItemsIndex.includes(item));
		if (allX2InSelected) {
			/* If all items of b are present in selectedItemsIndex, push a1 into selectedItemsIndex
			   if (!this.selectedItemsIndex.includes(a1)) { */
			this.selectedItemsIndex.push(a1);
			// }
		} else {
			// If all elements of X1 are not in selectedItemsIndex, remove a1 and selectParentIndex from selectedItemsIndex
			const indicesToRemove = [a1];
			this.selectedItemsIndex = this.selectedItemsIndex.filter((item) =>
				!indicesToRemove.includes(item));
		}

	}
	nullDataItem(element:any, isChildren:any, isRemove:any){
		const checkData = this.selectedItemsIndex.findIndex((value) =>
			value == element.item.dataItem.Index);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if ((isChildren == magicNumber.one && this.isViewOnlyCase) && (checkData > -magicNumber.one)) {
			if (isRemove) {
				this.selectedItemsIndex.splice(checkData, magicNumber.one);
				this.checkedKeys = this.selectedItemsIndex;
				this.selectedItems = this.selectedItems.filter((elementFilter) =>
					elementFilter.Index != element.item.dataItem.Index);
			}
		} else if (!this.selectedItemsIndex.some((obj) =>
			obj === element.item.dataItem.Index)) {
			if (this.isViewOnlyCase) {
				// eslint-disable-next-line no-var
				this.viewCaseOnly(element, isChildren);
			}
			this.actionGroupId(element, isChildren);
		} else {
			this.selectedItemsIndex.forEach((ele, index) => {
				if (ele == element.item.dataItem.Index && !this.checkedKeys.includes(element.item.dataItem.Index)) {
					this.selectedItemsIndex.splice(index, magicNumber.one);
					const index1 = this.selectedItems.findIndex((elemen: any) =>
						elemen.Index === ele);
					this.selectedItems.splice(index1, magicNumber.one);
				}
			});
		}
	}

	dataItemElement(element:any){
		element.item.dataItem?.items?.forEach((ele: any) => {
			if (element.item.dataItem?.items?.length > magicNumber.zero) {
				element.item.dataItem?.items?.forEach((element1: any) => {
					this.getTreeViewDataRecursion(element1, magicNumber.one);
				});
			}
			else if (!this.selectedItemsIndex.some((obj) =>
				obj === ele.Index)) {
				if (this.isViewOnlyCase) {
					this.compareIndex = ele.Index.substring(magicNumber.zero, ele.Index.lastIndexOf('_') + magicNumber.one);
					if (ele.ActionGroupId == magicNumber.twentyFive) {
						this.selectedItems = this.selectedItems.filter((elementFilter) =>
							elementFilter.Index.substring(magicNumber.zero, elementFilter.IndexlastIndexOf('_') + magicNumber.one) != this.compareIndex);
						this.selectedItemsIndex = this.selectedItemsIndex.filter((elementFilter) =>
							elementFilter.substring(magicNumber.zero, elementFilter.lastIndexOf('_') + magicNumber.one) != this.compareIndex);
					}
					else {
						this.selectedItems = this.selectedItems.filter((elementFilter) => {
							if (elementFilter.Index.substring(magicNumber.zero, elementFilter.Index.lastIndexOf('_') + magicNumber.one) == this.compareIndex && elementFilter.ActionGroupId == magicNumber.twentyFive) {
								this.selectedItemsIndex = this.selectedItemsIndex.filter((filter) =>
									filter != elementFilter.Index);
								return false;
							}
							return true;
						});

					}
				}
				this.selectedItems.push(ele);
				this.selectedItemsIndex.push(ele.Index);
				this.checkedKeys = [];
				this.selectedItemsIndex.forEach((element1) => {
					this.checkedKeys.push(element1);
				});
			} else {
				this.selectedItemsIndex.forEach((elem, index) => {
					if (elem == ele.Index && !this.checkedKeys.includes(element.item.dataItem?.Index)) {
						this.selectedItemsIndex.splice(index, magicNumber.one);
						const index1 = this.selectedItems.findIndex((elemen: any) =>
							elemen.Index === elem);
						this.selectedItems.splice(index1, magicNumber.one);
					}
				});

			}
		});
	}

	viewCaseOnly(element:any, isChildren:any){
		this.compareIndex = element?.item?.dataItem?.Index?.substring(magicNumber.zero, element.item?.dataItem?.Index?.lastIndexOf('_') + magicNumber.one);
		if (element.item.dataItem.ActionGroupId == magicNumber.twentyFive) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (isChildren == magicNumber.zero) {
				this.selectedItems = this.selectedItems.filter((elementFilter) =>
					elementFilter.Index.substring(magicNumber.zero, elementFilter.Index.lastIndexOf('_') + magicNumber.one) != this.compareIndex);
				this.selectedItemsIndex = this.selectedItemsIndex.filter((elementFilter) =>
					elementFilter.substring(magicNumber.zero, elementFilter.lastIndexOf('_') + magicNumber.one) != this.compareIndex);
			}
		}
		else {
			this.selectedItems = this.selectedItems.filter((elementFilter) => {
				if (elementFilter.Index.substring(magicNumber.zero, elementFilter.Index.lastIndexOf('_') + magicNumber.one) == this.compareIndex && elementFilter.ActionGroupId == magicNumber.twentyFive) {
					this.selectedItemsIndex = this.selectedItemsIndex.filter((filter) =>
						filter != elementFilter.Index);
					return false;
				}
				return true;
			});

		}
	}

	actionGroupId(element:any, isChildren:any){
		if ((element.item.dataItem.ActionGroupId == magicNumber.twentyFive && isChildren == magicNumber.one) && this.isViewOnlyCase) {
			this.selectedItemsIndex.forEach((ele, index) => {
				if (ele == element.item.dataItem.Index && !this.checkedKeys.includes(element.item.dataItem.Index)) {
					this.selectedItemsIndex.splice(index, magicNumber.one);
					const index1 = this.selectedItems.findIndex((elemen: any) =>
						elemen.Index === ele);
					this.selectedItems.splice(index1, magicNumber.one);
				}
			});
			this.checkedKeys = [];
			this.selectedItemsIndex.forEach((element1) => {
				this.checkedKeys.push(element1);
			});
		} else {
			this.selectedItems.push(element.item.dataItem);
			this.selectedItemsIndex.push(element.item.dataItem.Index);
			this.checkedKeys = [];
			this.selectedItemsIndex.forEach((element1) => {
				this.checkedKeys.push(element1);
			});
		}
	}
	selectedtedItemIndex(element:any){
		if (!this.selectedItemsIndex.some((obj) =>
			obj === element.Index)) {
			if (this.isViewOnlyCase) {
				// eslint-disable-next-line one-var, no-shadow
				this.compareIndex = element?.Index?.substring(magicNumber.zero, element.Index?.lastIndexOf('_') + magicNumber.one);
				if (element.ActionGroupId == magicNumber.twentyFive) {
					this.selectedItems = this.selectedItems.filter((elementFilter) =>
						elementFilter.Index.substring(magicNumber.zero, elementFilter.Index.lastIndexOf('_') + magicNumber.one) != this.compareIndex);
					this.selectedItemsIndex = this.selectedItemsIndex.filter((elementFilter) =>
						elementFilter.substring(magicNumber.zero, elementFilter.lastIndexOf('_') + magicNumber.one) != this.compareIndex);
				}
				else {
					this.selectedItems = this.selectedItems.filter((elementFilter) => {
						if (elementFilter.Index.substring(magicNumber.zero, elementFilter.Index.lastIndexOf('_') + magicNumber.one) == this.compareIndex && elementFilter.ActionGroupId == magicNumber.twentyFive) {
							this.selectedItemsIndex = this.selectedItemsIndex.filter((filter) =>
								filter != elementFilter.Index);
							return false;
						}
						return true;
					});

				}
			}

			this.selectedItems.push(element);
			this.selectedItemsIndex.push(element.Index);
			this.checkedKeys = [];
			this.selectedItemsIndex.forEach((element1) => {
				this.checkedKeys.push(element1);
			});

		} else {
			this.selectedItemsIndex.forEach((ele, index) => {
				if (ele == element.Index && !this.checkedKeys.includes(element.Index)) {
					this.selectedItemsIndex.splice(index, magicNumber.one);
					const index1 = this.selectedItems.findIndex((elemen: any) =>
						elemen.Index === ele);
					this.selectedItems.splice(index1, magicNumber.one);
				}
			});
		}
	}


	getSingleLevelTreeView(element: any) {
		if (element.item.dataItem != null && element.item.dataItem != undefined) {
			if ((this.selectedItemsIndex.length == Number(magicNumber.zero))||(!this.selectedItemsIndex.some((obj) =>
				obj === element.item.index))) {
				this.selectedItems.push(element.item.dataItem);
				this.selectedItemsIndex.push(element.item.index);
			}
		} else {
			this.selectedItemsIndex.forEach((ele, index) => {
				if (ele == element.item.index && !this.checkedKeys.includes(element.item.index)) {
					this.selectedItemsIndex.splice(index, magicNumber.one);
					const index1 = this.selectedItems.findIndex((elemen: any) =>
						elemen.index === ele);
					this.selectedItems.splice(index1, magicNumber.one);
				}
			});
		}
	}


	toSelectionItemsForMultiLevel(dataItems: any) {
		if (!this.checkDuplicateOfMultiLevelTreeView(dataItems)) {
			dataItems.checked = true;
			this.selectedItems.push(dataItems);
			this.onCheckedTree.emit(this.selectedItems);
		} else {
			this.deleteDataOfMUltiLevelTreeView(dataItems);
		}
	}

	toSelectionItemsOfApproval(dataItem: any) {
		if (this.isReset) {
			this.selectedItems = [];
		}

		try {
			if (dataItem.items) {
				if (this.selectedItems.length != dataItem.items.length) {
					this.selectedItems = [];
					dataItem.items.forEach((element: any) => {
						this.selectedItems.push(element);
					});
				} else {
					this.selectedItems = [];
				}
			}

			else if (this.checkDuplicate(this.selectedItems, dataItem.item.dataItem.Value)) {
				this.deleteApproval(dataItem);
			} else {

				this.addApproval(dataItem);
			}
		} catch (e) {
			// Code to handle the exception
		}
	}

	toSelectionItems(dataItem: any) {
		try {
			if (dataItem.items) {
				if (this.selectedItems.length != dataItem.items.length) {
					this.selectedItems = [];
					dataItem.items.forEach((element: any) => {
						this.selectedItems.push(element);
					});
				} else {
					this.selectedItems = [];
				}
			} else if (this.selectedItems.includes(dataItem)) {
				this.delete(dataItem);
			} else {
				this.add(dataItem);
			}
		} catch (e) {
			// Code to handle the exception
		}
	}

	checkDuplicate(data: any, dataItem: any) {
		const value = data.some((d: any) => {
			return d.item.dataItem.Value === dataItem;
		});
		return value;
	}

	convertValueChangedbasedOnData(dataItems: any) {
		const filteredValue = this.selectedItems.filter((e: any) => {
			return e?.parent?.item?.index == dataItems?.item?.index;
		});
		if (filteredValue.length > Number(magicNumber.zero)) {
			if (
				filteredValue.length == dataItems.children.length &&
				this.selectedItems.length > Number(magicNumber.zero)
			) {
				this.selectedItems = this.selectedItems.filter((e: any) => {
					return e?.parent?.item?.index != dataItems?.item?.index;
				});
			}
		} else {
			this.toSelectionItemsForMultiLevel(dataItems);
		}

	}

	add(value: any) {
		this.selectedItems.push(value);
	}

	delete(value: any) {
		this.selectedItems.splice(
			this.selectedItems.findIndex((i) =>
				i.value == value.value),
			magicNumber.one
		);
	}
	// toSelectionItems(dataItem: any) {


	addApproval(value: any) {
		if (!value.item.dataItem.IsSelected) {
			value.checked = true;
			value.item.dataItem.IsSelected = true;
		}
		else {
			value.checked = false;
			value.item.dataItem.IsSelected = false;
		}
		this.selectedItems.push(value);
	}

	deleteApproval(value: any) {
		const index = this.selectedItems.findIndex((i) =>
			i.item.dataItem.Text === value.item.dataItem.Text);

		if (this.selectedItems[index].item.dataItem.IsSelected) {

			this.selectedItems[index].checked = false;
			this.selectedItems[index].item.dataItem.IsSelected = false;

		}
		else {
			this.selectedItems[index].checked = true;
			this.selectedItems[index].item.dataItem.IsSelected = true;

		}


	}

	checkDuplicateOfMultiLevelTreeView(dataItems: any) {
		const value = this.selectedItems.some((d: any) => {
			return d.item.index === dataItems.item.index;
		});
		return value;
	}

	deleteDataOfMUltiLevelTreeView(dataItems: any) {
		if (dataItems.parent == null) {
			this.selectedItems = [];
		} else {
			const index = this.selectedItems.findIndex((i) =>
				i.item.index === dataItems.item.index);
			if (this.selectedItems[index].checked) {
				this.selectedItems[index].checked = false;
			} else {
				this.selectedItems[index].checked = true;
			}

			this.selectedItems.splice(index, magicNumber.one);
		}
	}

}
