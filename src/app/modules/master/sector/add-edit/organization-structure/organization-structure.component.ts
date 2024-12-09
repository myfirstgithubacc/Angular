
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { Subject, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SectorState } from '@xrm-core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IOrgStructureFM, ISectorOrgLevelConfigDtos, patchOrgStructure } from './utils/helper';
import { Sector } from '@xrm-core/models/Sector/sector.model';
import { SectorOrgLevelConfigDtos } from '@xrm-core/models/Sector/sector-org-level-configs.model';
import { OutputParams } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-organization-structure',
	templateUrl: './organization-structure.component.html',
	styleUrls: ['./organization-structure.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationStructureComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() isSubmitted: boolean;
	@Input() ShowAll: boolean = false;
	@ViewChild(ListViewComponent) listViewComponent: ListViewComponent|undefined;
	public isEditMode: boolean;
	public formOrganizationStructure: FormGroup;
	public visibleChecked: boolean = true;
	public disabled = true;
	public tempStorage: SectorOrgLevelConfigDtos[];
	public orgStructureForm: FormGroup<IOrgStructureFM>;
	public arrayform: FormArray<FormGroup<ISectorOrgLevelConfigDtos>>;
	public itemLabel: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public getFormErrorStatus: number = magicNumber.zero;
	public column = [
		{
			colSpan: 5,
			columnName: 'ScreenLabelName',
			controls: [
				{
					controlType: 'text',
					controlId: 'OrgName',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					maxlength: Number(magicNumber.hundred),
					placeholder: ''
				},
				{
					controlType: '',
					controlId: 'IsShowHide',
					defaultValue: true,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		},
		{
			colSpan: Number(magicNumber.two),
			columnName: 'Utilize',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsVisible',
					defaultValue: false,
					isEditMode: true,
					isDisable: false,
					onLabel: 'Yes',
					dependableVisibility: false,
					offLabel: 'No',
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		},
		{
			colSpan: Number(magicNumber.two),
			columnName: 'Mandatory',
			controls: [
				{
					controlType: 'switch',
					controlId: 'IsMandatory',
					defaultValue: false,
					isEditMode: true,
					isDisable: false,
					onLabel: 'Yes',
					offLabel: 'No',
					dependableVisibility: true,
					requiredMsg: 'ReqFieldValidationMessage'
				}
			]
		}
	];

	public populatedData: SectorOrgLevelConfigDtos[];

	public columnConfiguration = {
		isShowfirstColumn: true,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		isAddMoreValidation: false,
		Id: true,
		firstColumnName: 'OrganizationStructure',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: Number(magicNumber.zero),
		itemSr: true,
		itemLabelName: 'OrganizationLevel',
		itemlabelLocalizeParam: this.itemLabel,
		firstColumnColSpan: Number(magicNumber.three),
		isVisibleAsterick: true,
		lastColumnColSpan: Number(magicNumber.zero)
	};

	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private sectorService: SectorService,
		private store: Store,
		private widget: WidgetServiceService,
		private el: ElementRef,
		private cdr: ChangeDetectorRef
	) {
		this.populatedData = [
			{ "OrgName": '', "IsVisible": true, "OrgType": 1, "IsMandatory": true, "Id": Number(magicNumber.zero), "IsShowHide": true },
			{ "OrgName": '', "IsVisible": false, "OrgType": 2, "IsMandatory": false, "Id": Number(magicNumber.zero), "IsShowHide": false },
			{ "OrgName": '', "IsVisible": false, "OrgType": 3, "IsMandatory": false, "Id": Number(magicNumber.zero), "IsShowHide": false },
			{ "OrgName": '', "IsVisible": false, "OrgType": 4, "IsMandatory": false, "Id": Number(magicNumber.zero), "IsShowHide": false }
		];
	}


	ngOnChanges() {
		this.isEditMode = this.formStatus;
		if (this.isSubmitted) {
			this.listViewComponent?.checkTouched();
		}
		if (this.reload) {
			this.sectorService.getDataPersistOrg.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((y) => {
				if (y) {
					this.populatedData = y.length > Number(magicNumber.zero) ?
						y
						: [...this.populatedData, ...y];
					this.populatedData.forEach((row: SectorOrgLevelConfigDtos) => {
						row.IsShowHide = row.IsVisible;
					});
					this.sectorService.OrgStructureFormArray(this.populatedData, this.arrayform);
					this.cdr.markForCheck();
				}
			});
		}
	}

	ngOnInit(): void {
		this.sectorService.setFormInitStatus(magicNumber.one);
		this.getFormErrorStatus = this.sectorService.getFormErrorStatus(magicNumber.one);
		// this.widget.updateForm.next(false);
		if (!this.ShowAll) {
			this.sectorService.makeScreenScrollOnUpdate(this.el);
		}

		this.orgStructureForm = this.childFormGroup.get('OrgLevelConfigs') as FormGroup<IOrgStructureFM>;
		this.arrayform = this.orgStructureForm.controls.SectorOrgLevelConfigDtos as FormArray<FormGroup<ISectorOrgLevelConfigDtos>>;

		this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (res) {
				this.orgStructureForm.markAsDirty();
			}
		});
		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}
	}

	private AddMode(): void {
		this.sectorService.getDataPersistOrg.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((formArray) => {
			if (formArray !== null) {
				this.populatedData = formArray.length > Number(magicNumber.zero) ?
					formArray
					: [...this.populatedData, ...formArray];

				this.populatedData.forEach((row: SectorOrgLevelConfigDtos) => {
					row.IsShowHide = row.IsVisible;
				});
				this.sectorService.OrgStructureFormArray(this.populatedData, this.arrayform);
				this.cdr.markForCheck();
			}
		});
	}

	private EditMode(): void {
		this.store.select(SectorState.sectorByUKey).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(({ OrgLevelConfigs }: Sector) => {
			if (OrgLevelConfigs.SectorOrgLevelConfigDtos.length > Number(magicNumber.zero)) {
				OrgLevelConfigs.SectorOrgLevelConfigDtos.forEach((ele: SectorOrgLevelConfigDtos, index: number) => {
					this.populatedData[index] = ele;
					this.populatedData[0].IsVisible = true;
					this.populatedData[0].IsMandatory = true;
					this.populatedData[index].IsShowHide = ele.IsVisible;
				});
				patchOrgStructure(OrgLevelConfigs, this.orgStructureForm);
				this.sectorService.OrgStructureFormArray(this.populatedData, this.arrayform);
				this.cdr.markForCheck();
			}
		});
	}

	public getData(list: SectorOrgLevelConfigDtos[]): void {
		this.sectorService.OrgStructureFormArray(list, this.arrayform);
	}

	public getFormStatus(formArray: FormArray): void {
		setTimeout(() => {
			if (this.getFormErrorStatus > Number(magicNumber.one)) {
				// formArray.markAllAsTouched();
			}
			this.tempStorage = formArray.getRawValue();
			this.sectorService.OrgStructureFormArray(this.tempStorage, this.arrayform);
			this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
				if (!data) {
					this.cdr.markForCheck();
					this.tempStorage.forEach((item: SectorOrgLevelConfigDtos, i: number) => {
						formArray.at(magicNumber.zero).get('IsMandatory')?.disable({ onlySelf: true, emitEvent: false });
						formArray.at(magicNumber.zero).get('IsVisible')?.disable({ onlySelf: true, emitEvent: false });

						if (item.IsVisible) {
							formArray.at(i).get('IsMandatory')?.enable({ onlySelf: true, emitEvent: false });
							formArray.at(i).get('OrgName')?.setValidators([this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ScreenLabelName')]);
							formArray.at(i).get('IsShowHide')?.setValue(true, { onlySelf: true, emitEvent: false });
						}
						else {
							formArray.at(i).get('IsMandatory')?.disable({ onlySelf: true, emitEvent: false });
							formArray.at(i).get('IsMandatory')?.setValue(false, { onlySelf: true, emitEvent: false });
							formArray.at(i).get('OrgName')?.clearValidators();
							formArray.at(i).get('IsShowHide')?.setValue(false, { onlySelf: true, emitEvent: false });
						}
						formArray.at(i).get('OrgName')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
						formArray.at(i).get('IsShowHide')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
					});
					this.cdr.markForCheck();
				}
			});

			if(!formArray.pristine) {
				this.orgStructureForm.markAsDirty();
				this.cdr.markForCheck();
			}

		}, magicNumber.hundred);
		this.cdr.markForCheck();
	}


	public switchEvent(e: OutputParams): void {
		if (e.control === 'IsVisible') {
			if (e.formData.at(e.index).get('IsVisible').value) {
				e.formData.at(e.index).get('IsMandatory')?.enable({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('OrgName')?.setValidators([this.sectorService.fieldSpecficRequiredMessageValidation('PleaseEnterData', 'ScreenLabelName')]);
				e.formData.at(e.index).get('OrgName')?.setErrors({ 'incorrect': true });
				e.formData.at(e.index).get('OrgName')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('OrgName')?.markAsTouched();
				e.formData.at(e.index).get('IsMandatory')?.setValue(false);
			} else {
				e.formData.at(e.index).get('OrgName')?.clearValidators({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('OrgName')?.setErrors(null);
				e.formData.at(e.index).get('OrgName')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('IsMandatory')?.disable({ onlySelf: true, emitEvent: false });
				e.formData.at(e.index).get('IsMandatory')?.setValue(false);
			}
			e.formData.at(e.index).get('IsShowHide')?.setValue(e.data.value.IsVisible);
			this.cdr.markForCheck();
		}
	}

	ngAfterViewInit(): void {
		if (this.reload) {
			this.sectorService.OrgStructureFormArray(this.populatedData, this.arrayform);
		}

		if(this.arrayform.invalid && this.isSubmitted && this.isEditMode) {
			this.listViewComponent?.checkTouched();
		}
	}

	ngOnDestroy(): void {
		if (!this.isDraft && !this.isEditMode) {
			this.sectorService.holdDataPersistOrg.next(this.tempStorage);
		} else {
			this.sectorService.holdDataPersistOrg.next(null);
		}

		this.sectorService.clearTimeout();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
