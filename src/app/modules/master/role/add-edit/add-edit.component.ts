/* eslint-disable max-params */
import { AfterContentInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { RoleServices } from '../services/role.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { FormData1, Option, Role, RoleFormData, RootObject, SelectedActions, UpdateFormdata, XrmEntityAction, XrmEntityActionPer, XrmEntityActionResponse } from '../Generictype.model';
import { RoleIdentifier } from '../constatnt/enum';
import { NavigationPaths } from '../constatnt/route';
import { CommonService } from '@xrm-shared/services/common.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, AfterContentInit, OnDestroy {
	public isEditMode: boolean = false;
	public onlyOnce: boolean = false;
	public AddEditRoleForm: FormGroup;
	public AddEditEventReasonForm: FormGroup;
	public roleServicesList: Option[]=[];
	public roleNameList: Option[]=[];
	private roleId?: number;
	private roleUkey?: number;
	public recordId:string='';
	private roleObject: Role;
	private isDisabled:boolean = true;
	public checkedKey: any = [];
	public selectedKey: any = [];
	private actionDetails:XrmEntityAction[]|SelectedActions[] | XrmEntityActionPer[] |any[] = [];
	private selectedDropDown: Option[];
	selectedActionList: XrmEntityActionPer[] = [];
	preSelectedActionList: XrmEntityAction[] = [];
	public expandedKeys: any[] = [];
	private RoleID: string = RoleIdentifier.RoleID;
	public permissionList: RootObject[] = [];
	public isCopyBlockVisible:boolean = false;
	private isPersistToast:boolean = false;
	private unsubscribe$: Subject<void> = new Subject<void>();
	private EntityId:number=XrmEntities.Role;
	private isFirstEdit: boolean = true;
	private copyTruthness: boolean = true;

	constructor(
    private fb: FormBuilder,
    public sector: SectorService,
    private roleService: RoleServices,
    public role: RoleServices,
    private activatedRoute: ActivatedRoute,
    private customValidator: CustomValidators,
    private localization : LocalizationService,
    private router: Router,
    private toasterService: ToasterService,
    private eventLog: EventLogService,
    private cd: ChangeDetectorRef,
	private commonGridViewService:CommonService
	) {
		this.AddEditEventReasonForm = this.fb.group({
			status: [null]
		});
		this.AddEditRoleForm = this.fb.group({
			roleId: [],
			roleGroupId: [null, this.customValidator.RequiredValidator(this.localization.GetLocalizeMessage('PleaseSelectUserGroup'))],
			roleName: ['', [this.customValidator.RequiredValidator(this.localization.GetLocalizeMessage('PleaseEnterRole'))]],
			rollDropDown: [{}],
			disabled: [false],
			ReasonForChange: [''],
			selectedNode: [null]
		});


	}

	public setCopyButtonDisabled(): boolean {
		return !(this.permissionList.length !== Number(magicNumber.zero) && this.AddEditRoleForm.get('rollDropDown')?.value?.Value);
	}

	ngOnInit(): void {
		this.loadInitialData();
	}

	private loadInitialData() {
		forkJoin({
			userGroup: this.role.getUserGroupList(),
			roleGroup: this.isEditMode
				? of(null)
				: this.role.getRoleGroupList()
		}).pipe(takeUntil(this.unsubscribe$)).subscribe(({ userGroup, roleGroup }) => {
			if (userGroup.Succeeded) {
				this.roleServicesList = userGroup.Data;
			}
			this.roleNameList = roleGroup?.Data;
		});
		this.cd.markForCheck();
	}

	ngAfterContentInit():void{
		this.valueChangesListener();
		this.getRoleDetails();
	}

	private valueChangesListener() {
		if (!this.isEditMode) {
			this.AddEditRoleForm.get('roleGroupId')?.valueChanges.pipe(
				takeUntil(this.unsubscribe$),
				switchMap((value) => {
					if (value?.Value != undefined) {
						this.roleNameList = [];
						return forkJoin({
							roleGroup: this.role.getRoleGroupList({ roleGroupId: value.Value }),
							actionList: this.role.getXRMEntityActionList(value.Value)
						});
					}
					return of(null);
				})
			).subscribe((result) => {
				if (result) {
					this.AddEditRoleForm.get('rollDropDown')?.setValue(null);
					this.roleNameList = result.roleGroup.Data;
					this.permissionList = result.actionList.Data;
					// if(!this.isEditMode){
					// 	this.setSelectedRole(result.default);
					// }
					if (this.onlyOnce) {
						this.updateActionList();
						this.onlyOnce = false;
					}
				}
				this.cd.markForCheck();
			});
		}
	}

	private getRoleDetails() {
		this.roleUkey = this.activatedRoute.snapshot.params['id'];
  			if(this.roleUkey){
			this.isEditMode = true;
			this.onlyOnce = true;
			this.role.getRoleByUkey(this.roleUkey).pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
				if(data.Succeeded && data.Data)
				{ this.roleObject = data.Data;
					this.recordId = this.roleObject.RoleCode;
					this.roleService.dataContainer.next(this.roleObject);
					this.roleId = this.roleObject.RoleNo;
					   this.selectedDropDown = this.roleServicesList.filter((element: Option) => {
						return element.Text === this.roleObject.RoleGroupName;
					});
					const roleName = this.roleObject.RoleName ?? '';
					this.patchFormValues({
						roleGroup: {
							Text: this.roleObject.RoleGroupName,
							Value: `${this.roleObject.RoleGroupId}`,
							TextLocalizedKey: null,
							IsSelected: false
						},
						roleName: roleName,
						disabled: this.roleObject.Disabled
					});
					this.AddEditRoleForm.markAsPristine();
					this.cd.detectChanges();
				}
			});
		}
	}

	private patchFormValues(data: RoleFormData) {
		this.AddEditRoleForm.patchValue({
			roleGroupId: {
				Text: data.roleGroup.Text,
				Value: data.roleGroup.Value,
				TextLocalizedKey: data.roleGroup.TextLocalizedKey,
				IsSelected: data.roleGroup.IsSelected
			},
			roleName: data.roleName,
			disabled: data.disabled
		});
	}

	public roleGroupChanges(event: Option[]|undefined) {
		if (event != undefined) {
			this.isCopyBlockVisible = true;
		} else {
			this.isCopyBlockVisible = false;
		}
		this.checkedKey = [];
		this.expandedKeys = [];
		this.selectedKey = [];
		this.selectedActionList = [];
	}

	private updateActionList() {
		this.role
			.getRoleActionMappingByRoleNo(this.roleObject.RoleNo)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((value: XrmEntityActionResponse) => {
				this.preSelectedActionList = value?.Data;
				if (value != null)
					this.setSelectedRole(value);
			});
	}

	private prepareFormData(reasonforupdate: string) {
		const formData = this.AddEditRoleForm.value;
		delete formData.selectedNode;
		formData.actionDetails = this.actionDetails;

		if (this.AddEditRoleForm.controls['roleGroupId'].value) {
			formData.roleGroupId = Number(this.AddEditRoleForm.controls['roleGroupId'].value.Value);
		} else {
			formData.roleGroupId = null;
		}

		delete formData.rollDropDown;
		formData.roleName = formData.roleName.trim();

		if (this.isEditMode) {
			formData.roleId = this.roleObject.Id;
			formData.ReasonForChange = reasonforupdate;

		}
		return formData;
	}
	private updateRole(formData: UpdateFormdata) {
		this.roleService.updateRole(formData, formData.roleId).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
			this.handleResponse(res, 'RoleHasBeenSavedSuccessfully', 'RoleAlreadyExists', magicNumber.fourHundredNine, magicNumber.fourHundredThree, 'Somethingwentwrong', formData);
		});
		this.eventLog.isUpdated.next(true);

	}
	private createRole(formData: FormData1) {
		delete formData.roleId;
		this.roleService.createRole(formData).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
			if (res.Succeeded) {
				this.router.navigate([NavigationPaths.list]);
				this.toasterService.displayToaster(ToastOptions.Success, 'RoleHasBeenSavedSuccessfully');
				this.isPersistToast = true;
			} else {
				this.toasterService.displayToaster(ToastOptions.Error, res.StatusCode == Number(magicNumber.fourHundredNine)
					? 'RoleAlreadyExists'
					: res.Message ?? 'Somethingwentwrong');
			}
		});
	}

	private handleResponse(
		res: GenericResponseBase<null>,
		successMessage: string,
		roleExistsMessage: string,
		roleExistsErrorCode: number,
		unauthorizedErrorCode: number,
		genericErrorMessage: string,
		formData: FormData1
	) {
		if (res.Succeeded) {
			this.toasterService.displayToaster(ToastOptions.Success, successMessage);
			this.roleObject.RoleName = formData.roleName;
			this.commonGridViewService.resetAdvDropdown(this.EntityId);
			this.AddEditRoleForm.markAsPristine();
			this.cd.markForCheck();
		} else if (res.StatusCode === roleExistsErrorCode) {
			this.toasterService.displayToaster(ToastOptions.Error, roleExistsMessage);
		} else if (res.StatusCode === unauthorizedErrorCode) {
			this.toasterService.displayToaster(ToastOptions.Error, genericErrorMessage);
		}
	}
	private addUpdate(reasonforupdate: string = '') {
		const formData = this.prepareFormData(reasonforupdate);
		if (this.isEditMode) {
			this.updateRole(formData);
		} else {
			this.createRole(formData);
		}

	}

	public submitForm() {
		this.AddEditRoleForm.markAllAsTouched();
		if (this.AddEditRoleForm.invalid)
			return;
		if (this.actionDetails.length == Number(magicNumber.zero)) {
			this.toasterService.displayToaster(ToastOptions.Error, 'PleaseSelectAnyPermissionToAddThisRole');
			return;
		}

		if (this.AddEditRoleForm.valid) {
			this.addUpdate();
		}
	}
	selectedItems(data: XrmEntityAction|SelectedActions|any): void {
		if (this.isFirstEdit || this.copyTruthness) {
			if(!data.checkedKey&&!data.selected){
				this.checkSelected(this.permissionList, data);
			}
			this.isFirstEdit = false;
		}
		if (data.checkedKey == undefined) {
			if(Array.isArray(data)){
				this.actionDetails = data;
			}

		}
		else if (data.checkedKey.length == Number(magicNumber.zero))
			this.actionDetails = [];
		else
			this.actionDetails = (data.selected as XrmEntityActionPer[]);

		this.actionDetails.forEach((item:any, index) => {
			if (index !== this.actionDetails.findIndex((i:any) =>
				(i.XrmEntityActionId === item.XrmEntityActionId) && (i.ActionGroupId === item.ActionGroupId))) {
				this.actionDetails.splice(index, magicNumber.one);
			}
		});
		this.cd.markForCheck();
		if(this.isEditMode)
			this.isSavedDisabled();
	}

	public checkSelected(data: RootObject[], selectedData: any) {
		const checkedKeyArray: string[] = [];

		data.forEach((parent: any) => {
			const parentIndex = parent.Index,
			 parentCheckedItems: any[] = [];
			let allSubparentsSelected = true;
			parent.items.forEach((subparent: any) => {
				const subparentIndex = subparent.Index;
				let allChildrenSelected = true;
				subparent.items.forEach((child: any) => {
					// eslint-disable-next-line max-nested-callbacks
					const isSelected = selectedData.some((selectedItem: any) =>
						selectedItem.XrmEntityActionId === child.XrmEntityActionId &&
						selectedItem.ActionGroupId === child.ActionGroupId);
					if (!isSelected) {
						allChildrenSelected = false;
					}
				});

				if (allChildrenSelected) {
					parentCheckedItems.push(subparentIndex);
					checkedKeyArray.push(subparentIndex);
				} else {
					allSubparentsSelected = false;
				}
			});

			if (allSubparentsSelected) {
				checkedKeyArray.push(parentIndex);
			} else if (parentCheckedItems.length > Number(magicNumber.zero)) {
				checkedKeyArray.push(...parentCheckedItems);
			}
		});
		this.checkedKey.push(...checkedKeyArray);
		this.selectedKey.push(...checkedKeyArray);
	}

	private isSavedDisabled() {
		if(this.AddEditRoleForm.get('selectedNode')?.value ==null)
		{
			this.AddEditRoleForm.get('selectedNode')?.setValue(this.actionDetails);
		}
		else if (this.actionDetails.length != Number(magicNumber.zero) ) {
			this.AddEditRoleForm.markAsDirty();
			const data =this.AddEditRoleForm.get('selectedNode')?.value,
				 areListsEqual = data.every((aItem: any) =>
					this.actionDetails.some((bItem: any) =>
						aItem.XrmEntityActionId === bItem.XrmEntityActionId && aItem.ActionGroupId === bItem.ActionGroupId))
            && this.actionDetails.every((aItem: any) =>
            	data.some((bItem: any) =>
            		aItem.XrmEntityActionId === bItem.XrmEntityActionId && aItem.ActionGroupId === bItem.ActionGroupId));
			if (!areListsEqual && this.isDisabled)
			{
				this.AddEditRoleForm.get('selectedNode')?.setValue(this.actionDetails);
				this.isDisabled=false;
			}
		}
		this.cd.detectChanges();
	}

	public copySelectedRole() {
		if (this.AddEditRoleForm.get('rollDropDown')?.value.Value) {
			this.role
				.getRoleActionMappingByRoleNo(this.AddEditRoleForm.get('rollDropDown')?.value.Value)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((result) => {
					this.setSelectedRole(result);
					this.showSuccessfullyCopied();
					this.copyTruthness=false;
					this.cd.markForCheck();
				});

		}

	}

	private showSuccessfullyCopied() {
		if (this.actionDetails.length != Number(magicNumber.zero))
		{
			const dynamicParam1 : DynamicParam[] = [{ Value: this.AddEditRoleForm.get('rollDropDown')?.value.Text, IsLocalizeKey: true }];
			this.toasterService.displayToaster(ToastOptions.Success, this.localization.GetLocalizeMessage('PermissionSuccessfullyCopied', dynamicParam1));
		}
		else
		{
			this.toasterService.displayToaster(ToastOptions.Error, this.localization.GetLocalizeMessage('NoPermissionToCopy'));
		}
	}


	private setSelectedRole(result: XrmEntityActionResponse) {
		this.checkedKey = [];
		this.selectedKey = [];
		this.selectedActionList = [];
		this.actionDetails = [];
		if (result?.Data?.length > Number(magicNumber.zero) && this.permissionList.length > Number(magicNumber.zero)) {
			this.selectedKey = [];
			this.checkedKey = [];
			this.permissionList.forEach((element: RootObject) => {
				this.getChildItems(element, result);
			});
			this.permissionList.forEach((element: RootObject) => {
				this.setParentChecekedItems(element);
				let flag: boolean = false;

				for (let i = 0; i < element?.items.length; i++) {
					if (this.selectedKey.includes(element?.items[i].Index)) {
						flag = true;
					} else {
						flag = false;
						return;
					}
				}
				if (flag) {
					if (!this.selectedKey.includes(element.Index)) {
						this.selectedKey.push(element.Index);
					}
					if (!this.checkedKey.includes(element.Index))
						this.checkedKey.push(element.Index);
				}
			});
			this.selectedItems(result.Data);
		}

	}
	private setParentChecekedItems(element: RootObject) {
		if(element?.items){
			if (element?.items?.length > Number(magicNumber.zero)) {
				if(element.items[0].items){
					if (element.items[0].items?.length > Number(magicNumber.zero)) {
						element.items.forEach((ele) =>
							this.setParentChecekedItems((ele)as RootObject));
					}
				}
			}
			else {
				let flag: boolean = false;
				for (const item of element.items) {
					if (this.selectedKey.includes(item.Index)) {
						flag = true;
					} else {
						flag = false;
						return;
					}
				}
				if (flag) {
					if (!this.selectedKey.includes(element.Index))
						this.selectedKey.push(element.Index);
					if (!this.checkedKey.includes(element.Index))
						this.checkedKey.push(element.Index);
				}

			}
		}

	}
	private getChildItems(element: RootObject | XrmEntityActionPer, result: XrmEntityActionResponse): void {
		if ('items' in element && element.items) {
			if (element?.items?.length > Number(magicNumber.zero)) {
				element.items.forEach((ele) =>
					this.getChildItems(ele as RootObject | XrmEntityActionPer, result));
			}
		}
		else if (
			result.Data.some((obj: XrmEntityAction) =>
				obj.XrmEntityActionId === (element as XrmEntityActionPer).XrmEntityActionId &&
				obj.ActionGroupId === (element as XrmEntityActionPer).ActionGroupId)
		) {
			this.selectedKey.push(element.Index);
			this.checkedKey.push(element.Index);
			this.selectedActionList.push(element as XrmEntityActionPer);
			this.actionDetails.push(element);
		}


	}

	ngOnDestroy(): void {
		this.actionDetails = [];
		this.checkedKey = [];
		this.selectedKey = [];
		this.selectedActionList = [];
		if(!this.isPersistToast)
			this.toasterService.resetToaster();
		this.isEditMode = false;
		this.unsubscribe$.next();
    	this.unsubscribe$.complete();

	}
}
