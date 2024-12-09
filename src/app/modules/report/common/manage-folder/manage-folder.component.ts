import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { ReportFolderAddEdit } from '@xrm-core/models/report/report-folder-list';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { RoleServices } from '@xrm-master/role/services/role.service';
import { IDropdownItem } from '@xrm-shared/models/common.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ReportDataService } from 'src/app/services/report/report.service';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';

@Component({
	selector: 'app-manage-folder',
	templateUrl: './manage-folder.component.html',
	styleUrl: './manage-folder.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageFolderComponent implements OnInit, OnChanges, OnDestroy {
	private dialogStatus: boolean = false;
	public addEditFolderForm: FormGroup;
	public getActiveRolesList: IDropdownItem[];
	public magicNumber = magicNumber;
	private destroyAllSubscribtion$ = new Subject<void>();
	private folderLabelTextParams: DynamicParam[] = [{ Value: 'FolderName', IsLocalizeKey: true }];
	@Input() isEditMode: boolean;
	@Input() payload: ReportFolderAddEdit;
	@Input({ required: true })
	get handleDialogBox(): boolean {
		return this.dialogStatus;
	}
	set handleDialogBox(value: boolean) {
		this.dialogStatus = value;
		this.handleDialogBoxChange.emit(this.dialogStatus);
	}
	@Output() handleDialogBoxChange = new EventEmitter<boolean>();
	@Output() getFolderList = new EventEmitter<string>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private customvalidators: CustomValidators,
		private reportDataService: ReportDataService,
		private roleService: RoleServices,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef,
		private localizationService: LocalizationService
	) {
		this.addEditFolderForm = this.formBuilder.group({
			"FolderName": [null, [this.customvalidators.RequiredValidator('PleaseEnterData', [{ Value: 'FolderName', IsLocalizeKey: true }])]],
			"Description": [null],
			"SharedRoleIds": [null, [this.customvalidators.RequiredValidator('PleaseSelectData', [{ Value: 'ShareWith', IsLocalizeKey: true }])]]
		});
	}

	ngOnInit(): void {
		this.roleService.getRoleGroupList().pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: ApiResponse) => {
				if (res.Succeeded) {
					const data = res.Data as IDropdownItem[];
					this.getActiveRolesList = data.sort((a: IDropdownItem, b: IDropdownItem) => {
						return a.Text.localeCompare(b.Text);
					});
				}
				this.cdr.markForCheck();
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['payload']?.currentValue) {
			const { FolderName, Description, SharedRoleIds, ShareWithName } = changes['payload'].currentValue,
				transformedSharedRoleIds = (SharedRoleIds || []).map((id: number | string, index: number) =>
					({
						'Text': ShareWithName[index],
						'Value': id.toString()
					}));
			this.addEditFolderForm.patchValue({ FolderName, Description, SharedRoleIds: transformedSharedRoleIds || [] });
		}
	}

	public closeDialog(): void {
		this.handleDialogBox = false;
		this.addEditFolderForm.reset();
		this.toasterService.notPopup.next(true);
		this.toasterService.resetToaster();
	}

	private resetDialog(): void {
		this.handleDialogBox = false;
		this.addEditFolderForm.reset();
	}

	public saveFolder(): void {
		this.addEditFolderForm.markAllAsTouched();
		const formValues = this.addEditFolderForm.getRawValue(),
			updatedSharedRoleIds = (formValues.SharedRoleIds || []).map((item: number | { Value: string }) => {
				if (typeof item === 'object' && item.Value) {
					return parseInt(item.Value);
				}
				return item;
			}).filter((id: number) =>
				typeof id === 'number'),
			payload = {
				...formValues,
				SharedRoleIds: updatedSharedRoleIds
			};

		if (this.addEditFolderForm.valid) {
			this.toasterService.notPopup.next(true);
			if (this.isEditMode) {
				payload.UKey = this.payload.UKey;
				this.updateFolder(payload);
			} else {
				this.addNewFolder(payload);
			}
		}
	}


	private addNewFolder(payload: ReportFolderAddEdit) {
		this.reportDataService.addNewFolder(payload).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ReportFolderAddEdit>) => {
				this.toasterService.resetToaster();
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.folderLabelTextParams);
				if (isSuccessfulResponse(res)) {
					this.toasterService.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					this.getFolderList.emit('edit');
					this.resetDialog();
				}
				else if (!isSuccessfulResponse(res)) {
					if (res.StatusCode === Number(HttpStatusCode.Conflict)) {
						this.toasterService.notPopup.next(false);
						this.toasterService.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
					} else {
						this.toasterService.showToaster(ToastOptions.Error, res.Message);
						this.resetDialog();
					}
				}
				this.cdr.markForCheck();
			});
	}

	private updateFolder(payload: ReportFolderAddEdit) {
		this.reportDataService.updateFolder(payload).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ReportFolderAddEdit>) => {
				this.toasterService.resetToaster();
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.folderLabelTextParams);
				if (isSuccessfulResponse(res)) {
					this.toasterService.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					this.getFolderList.emit('edit');
					this.resetDialog();
				}
				else if (!isSuccessfulResponse(res)) {
					if (res.StatusCode === Number(HttpStatusCode.Conflict)) {
						this.toasterService.notPopup.next(false);
						this.toasterService.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
					} else {
						this.toasterService.showToaster(ToastOptions.Error, res.Message);
						this.resetDialog();
					}
				}
				this.cdr.markForCheck();
			});
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.toasterService.notPopup.next(true);
	}

}
