import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ListViewComponent } from '@xrm-shared/widgets/list-view/list-view.component';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { DocumentConfigurationService } from '../services/document-configuration.service';
import { Subject, takeUntil } from 'rxjs';
import { IDocumentConfigurationResponse, IDmsSectorDitails, IWorkflowDto, IPrefieldData } from '@xrm-core/models/document-configuration/document-configuration.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ColumnConfigure } from 'src/app/modules/contractor/contractor-details/constant/contractor-interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	@ViewChild('configureBySectorListView', { static: false }) configureBySectorListView: ListViewComponent;
	public countryId: number;
	public documentConfigurationDetails: IDocumentConfigurationResponse;
	public documentConfigurationPrefieldData: IPrefieldData[] = [];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		public loaderService: LoaderService,
		public router: Router,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		public documentConfigurationService: DocumentConfigurationService
	) { }

	ngOnInit(): void {
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			this.getDocumentConfigurationById(param["id"]);
		});
		this.toasterService.resetToaster();
	}

	private getDocumentConfigurationById(id: string) {
		this.documentConfigurationService.getDocumentConfigurationById(id)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IDocumentConfigurationResponse>) => {
				if (!res.Succeeded || !res.Data) {
					return;
				}
				res.Data.WorkflowId = res.Data.DocumentConfigurationWorkflowGetAllDtos.map((workflow: IWorkflowDto) =>
						 workflow.WorkflowName).join(", ");
				res.Data.AllowedExtensions = res.Data.AllowedExtensions.replaceAll(",", ", ");
				this.documentConfigurationDetails = res.Data;
				this.patchConfigureBySector(res.Data.ConfigurationBySector);
				this.updateSharedDataSubject(this.documentConfigurationDetails);
			});
	}

	private updateSharedDataSubject(details: IDocumentConfigurationResponse): void {
		this.documentConfigurationService.sharedDataSubject.next({
			Disabled: details.Disabled,
			DmsConfigId: details.Id,
			DmsConfigCode: details.Code
		});
	}

	private patchConfigureBySector(getBooleanValue: boolean) {
		if (!getBooleanValue) {
			return;
		}
		this.documentConfigurationPrefieldData = this.documentConfigurationDetails.DocumentConfigurationSectorGetAllDtos.map((x: IDmsSectorDitails) =>
			 ({
				Id: x.SectorId,
				SectorName: x.SectorName,
				AppliesTo: x.AppliesTo
					? 'Yes'
					: 'No',
				VisibleTo: x.DocumentConfigurationVisibleToSector[magicNumber.zero]?.Name,
				Mandatory: x.Mandatory
					? 'Yes'
					: 'No'
			}));
	}

	public documentConfigurationColumnConfiguration: ColumnConfigure = {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: 'Item',
		secondColumnName: 'Add More',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemLabelName: '',
		firstColumnColSpan: magicNumber.zero,
		lastColumnColSpan: magicNumber.zero
	};

	public documentConfigurationColumns = [
		{
			colSpan: magicNumber.three,
			columnName: 'Sector Name',
			controls: [
				{
					controlType: 'text',
					controlId: 'SectorName',
					defaultValue: '',
					isEditMode: false,
					isDisable: false,
					placeholder: ''
				}
			]
		},
		{
			colSpan: magicNumber.three,
			columnName: 'AppliesTo',
			controls: [
				{
					controlType: 'text',
					controlId: 'AppliesTo',
					defaultValue: '',
					isEditMode: false,
					isDisable: false,
					placeholder: ''
				}
			]
		},
		{
			colSpan: magicNumber.three,
			columnName: 'VisibleTo',
			controls: [
				{
					controlType: 'text',
					controlId: 'VisibleTo',
					defaultValue: '',
					isEditMode: false,
					isDisable: false,
					placeholder: ''
				}
			]
		},
		{
			colSpan: magicNumber.three,
			columnName: 'Mandatory',
			controls: [
				{
					controlType: 'text',
					controlId: 'Mandatory',
					defaultValue: '',
					isEditMode: false,
					isDisable: false,
					placeholder: ''
				}
			]
		}
	];

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.toasterService.resetToaster();
	}

}
