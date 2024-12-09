import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { RetireeoptionsService } from 'src/app/services/masters/retiree-options.service';
import { NavigationPaths } from '../constant/routes-constant';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { RetireeOption } from '@xrm-core/models/retiree-option.model';
import { HttpStatusCode } from '@angular/common/http';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { IRetireeOption, NavPathsType, RetireeOptData, SaveEditModeApiResponse } from '../constant/retiree.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';


@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {

	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public addEditRetireeOptForm: FormGroup;
	public navigationPaths: NavPathsType = NavigationPaths;
	public ukey: string;
	private ngUnsubscribe$ = new Subject<void>();
	public retireeOptData: RetireeOptData;
	public recordName: boolean = false;
	public statusCardREcord: string;
	public sectorData: string[] = [];

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		public retireeOptServc: RetireeoptionsService,
		private route: Router,
		private customValidators: CustomValidators,
		private toasterServc: ToasterService,
		private eventLog: EventLogService,
		private activatedRoute: ActivatedRoute
	) {
		this.initializeForm();
	}

	public initializeForm() {
		this.addEditRetireeOptForm = this.fb.group({
			RetireeOptionName: [null, this.customValidators.RequiredValidator('PleaseEnterRetireeOption')],
			SectorId: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]]
		});
	}

	ngOnInit(): void {
		if (this.route.url == this.navigationPaths.addEdit) {
			this.isEditMode = false;
		} else {
			this.isEditMode = true;
			this.loadData();
		}
		this.getSectorList();
	}

	private getSectorList() {
		this.retireeOptServc.getSectorDropDownList().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.sectorData = res.Data;
				}
			}
		});
	}

	private loadData() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
				if (param['id']) {
					this.isEditMode = true;
					this.ukey = param['id'];
					return this.retireeOptServc.getRetireeOptionId(param['id']);
				} else {
					return of(null);
				}
			})
		).subscribe({
			next: (res: ApiResponse | null) => {
				if (res?.Succeeded) {
					this.retireeOptData = res.Data;
					this.getById();

				}
				this.eventLog.isUpdated.next(true);
			}
		});
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
		this.toasterServc.resetToaster();
	}
	public getById() {
		this.isEditMode = true;
		this.patchvalue();
		this.retireeOptServc.retireeDataSubject.next({
			"retireeID": this.retireeOptData.Id,
			"Disabled": this.retireeOptData.Disabled,
			"retireeCode": this.retireeOptData.Code
		});
	}
	patchvalue() {
		this.addEditRetireeOptForm.patchValue({
			RetireeOptionName: this.retireeOptData.RetireeOptionName,
			SectorId: this.retireeOptData.SectorId
		});
	}

	public submitForm() {
		this.addEditRetireeOptForm.markAllAsTouched();
		if (this.addEditRetireeOptForm.valid) {
			if (this.isEditMode) {
				this.save();
				this.addEditRetireeOptForm.markAsPristine();
			} else {
				this.save();
			}
		}
	}

	save() {
		this.addEditRetireeOptForm.markAllAsTouched();
		if (this.isEditMode) {
			const retireeOptionData: RetireeOption = new RetireeOption(this.addEditRetireeOptForm.value);
			retireeOptionData.UKey = this.retireeOptData.UKey;
			this.saveEditMode(retireeOptionData);
		} else {
			const retireeOptionData: RetireeOption = new RetireeOption(this.addEditRetireeOptForm.value);
			retireeOptionData.SectorId = this.addEditRetireeOptForm.controls['SectorId'].value.Value;
			this.saveAddMode(retireeOptionData);
		}
	}

	saveEditMode(retireeOptionData: IRetireeOption) {
		this.retireeOptServc.updateRetireeOption(retireeOptionData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<SaveEditModeApiResponse>) => {
				this.toasterServc.resetToaster();
				if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'RetireeOptAlreadyExists');
					this.recordName = false;
				}
				else if (data.StatusCode === Number(HttpStatusCode.Ok)) {
					setTimeout(() => {
						this.toasterServc.showToaster(ToastOptions.Success, "RetireeOptAddedSuccessfully");
					});
					this.recordName = true;
					this.statusCardREcord = data.Data?.RetireeOptionName ?? '';
				} else {
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.Message
					);
					this.recordName = false;
				}
				this.eventLog.isUpdated.next(true);
			}
		});
	}


	saveAddMode(retireeOptionData: IRetireeOption) {
		this.retireeOptServc.addRetireeOption(retireeOptionData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<SaveEditModeApiResponse>) => {
				if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'RetireeOptAlreadyExists');
				}
				else if (data.StatusCode === Number(HttpStatusCode.Ok)) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, "RetireeOptAddedSuccessfully");
					this.route.navigate([NavigationPaths.list]);
				}
				else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.Message
					);
				}
			}
		});
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		if (this.isEditMode) {
			this.toasterServc.resetToaster();
		}

	}
}
