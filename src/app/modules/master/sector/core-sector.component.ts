import { HttpStatusCode } from '@angular/common/http';

import { Component, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';

import { Router } from '@angular/router';

import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';

import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';

import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';

import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';

import { EventLogService } from '@xrm-shared/services/event-log.service';

import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';

import { PageTitleService } from '@xrm-shared/services/page-title.service';

import { ToasterService } from '@xrm-shared/services/toaster.service';

import { Subject, takeUntil } from 'rxjs';

import { SectorService } from 'src/app/services/masters/sector.service';

@Component({selector: 'app-core-sector',

	templateUrl: './core-sector.component.html',

	styleUrls: ['./core-sector.component.scss'],

	encapsulation: ViewEncapsulation.None,

	changeDetection: ChangeDetectionStrategy.OnPush

})

export class CoreSectorComponent implements OnInit, OnDestroy {

	public statusForm: FormGroup;

	private show: boolean = false;

	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];

	public statusCardData = {

		items: [

			{

				item: '',

				title: this.localizationService.GetLocalizeMessage('SectorId', this.sectorLabelTextParams),

				itemDynamicParam: [{Value: 'Sector', IsLocalizeKey: false}],

				cssClass: ['basic-title']

			},

			{

				item: '',

				title: 'Disabled',

				cssClass: ['basic-code']

			}

		]

	};

	public recordId: string;

	public recordStatus: string;

	private ukey: string;

	public entityId: number = XrmEntities.Sector;

	public showHeader: boolean = true;

	public showAudit: boolean = true;

	private destroyAllSubscribtion$ = new Subject<void>();

	isDataLoading:boolean = false;

	showSwitch:boolean = false;
	isDataLoadingDefault:boolean = false;
	showAllSectionsSwitch:boolean = false;

	// eslint-disable-next-line max-params
	constructor(

		private formBuilder: FormBuilder,

		private global: PageTitleService,

		private commonHeaderIcons: CommonHeaderActionService,

		private router: Router,

		private toasterService: ToasterService,

		private sectorService: SectorService,

		private cdr: ChangeDetectorRef,

		public localizationService: LocalizationService,

		private eventLog: EventLogService

	) {

		this.statusForm = this.formBuilder.group({

			'status': [null]

		});

	}

	// eslint-disable-next-line max-lines-per-function
	ngOnInit() {
		this.sectorService.ShowAllSectionsSwitch.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			this.showAllSectionsSwitch = data;
		});
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			if (url == '/xrm/master/sector/list') {

				this.showHeader = false;
				this.showSwitch = false;

			}
			else if(url == '/xrm/master/sector/add-edit'){
				this.showSwitch = true;
			   this.showHeader = false;
			}
			else {
				this.showAudit = true;
				this.showHeader = true;
				this.showSwitch = true;

				const ukey = url.split('/');

				this.ukey = ukey[ukey.length - magicNumber.one];

				this.show = url.includes('view');

			}

			this.buttonSet[0].items = this.show

				? this.commonHeaderIcons.commonActionSetOnActive(

					this.onEdit,

					this.onActivate

				)

				: this.commonHeaderIcons.commonActionSetOnActiveEdit(this.onActivate);

			this.buttonSet[1].items = this.show

				? this.commonHeaderIcons.commonActionSetOnDeactiveView(

					this.onEdit,

					this.onActivate

				)

				: this.commonHeaderIcons.commonActionSetOnDeactive(this.onActivate);

			this.buttonSet[2].items = this.show

				?this.commonHeaderIcons.commonActionSetOnEditDraft(this.onEdit)

				:[];

			this.cdr.markForCheck();

		});

		this.sectorService.getData.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			this.recordId = res?.SectorCode ?? '';

			this.recordStatus = res?.RecordStatus ?? '';

			this.statusCardData.items[0].item = this.recordId;

			this.statusCardData.items[1].item = this.recordStatus;

			if( this.recordStatus=='Active'){

				this.statusCardData.items[1].cssClass=['green-color'];

			}else if( this.recordStatus=='Inactive'){

				this.statusCardData.items[1].cssClass=['red-color'];

			}else{

				this.statusCardData.items[1].cssClass=[];

				this.showAudit = false;

			}

			this.eventLog.entityId.next(XrmEntities.Sector);

			this.eventLog.recordId.next(res?.Id);

			this.cdr.markForCheck();

		});

	}
	showAll(data:boolean){
		this.sectorService.showAllSectorSection.next(data);
		if(data){
			this.isDataLoading = true;
		}
		else{
			this.isDataLoading = false;
		}
	}
	private onActivate = (actions: string) => {

		if (actions == 'Activate') {

			this.processDialogResponse(false);

		} else {

			this.processDialogResponse(true);

		}

	};

	private onEdit = () => {

		this.eventLog.isUpdated.next(true);

		this.router.navigate([`${'/xrm/master/sector/add-edit/'}/${this.ukey}`]);

	};

	public buttonSet = [

		{

			status: 'Active',

			items: this.commonHeaderIcons.commonActionSetOnActive(

				this.onEdit,

				this.onActivate

			)

		},

		{

			status: 'Inactive',

			items: this.commonHeaderIcons.commonActionSetOnDeactiveView(this.onEdit, this.onActivate)

		},

		{

			status: 'Draft',

			items: this.commonHeaderIcons.commonActionSetOnEditDraft(this.onEdit)

		}

	];

	private processDialogResponse(disable: boolean) {

		this.toasterService.resetToaster();

		this.ActivateDeactivateExpenseType([{ UKey: this.ukey, ReasonForChange: '', Disabled: disable }]);

	}

	private ActivateDeactivateExpenseType(dataItem: ActivateDeactivate[]) {

		this.sectorService.updateStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$))

			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {

				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);

				if(isSuccessfulResponse(response)){

					if (dataItem[0].Disabled) {

						this.recordStatus = 'Inactive';

						this.statusCardData.items[1] = { item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled' };

						this.statusForm.controls['status'].setValue({

							Text: this.recordStatus,

							Value: this.recordStatus

						});

						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully', localizeTextParams);

					} else {

						this.recordStatus = 'Active';

						this.statusCardData.items[1] = { item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled' };

						this.statusForm.controls['status'].setValue({

							Text: this.recordStatus,

							Value: this.recordStatus

						});

						this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully', localizeTextParams);

					}

					this.cdr.markForCheck();

					this.eventLog.isUpdated.next(true);

				}

				else if (hasValidationMessages(response)) {

					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);

				}

				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {

					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);

				}

				else {

					this.toasterService.displayToaster(ToastOptions.Error, response.Message);

				}

				this.cdr.markForCheck();

			});

	}

	ngOnDestroy(): void {

		if(this.toasterService.isRemovableToaster)

			this.toasterService.resetToaster();

		this.destroyAllSubscribtion$.next();

		this.destroyAllSubscribtion$.complete();

	}

}


