import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DataStaffingAgencyList } from '@xrm-core/models/Configure-client/staffing-agency-tier.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ConfigureClientDeclarations } from '@xrm-master/configure-client/Common/declarations';
import { TierType } from '@xrm-master/configure-client/Common/enums';
import { Column, ColumnConfigure } from '@xrm-shared/models/list-view.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-staffing-agency',
	templateUrl: './staffing-agency.component.html',
	styleUrls: ['./staffing-agency.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffingAgencyComponent implements OnInit, OnDestroy{

  @Input() form: FormGroup;

  private destroyAllSubscribtion$ = new Subject<void>();

  public label : string[] = [];

  public columnStaffingAency: Column[] = ConfigureClientDeclarations.ColumnStaffingAgency;

  public staffingAgencyArrayform: FormArray;

  public columnConfigurationStaffingAgency: ColumnConfigure = ConfigureClientDeclarations.ColumnConfigurationStaffingAgency;

  public prefilledStaffingAgencyDetails: DataStaffingAgencyList[] = [
  	{
  		TierType: '',
  		TierTypeName: this.localizationService.GetLocalizeMessage(TierType.Preferred),
  		Id: 0
  	}, {
  		TierType: '',
  		TierTypeName: this.localizationService.GetLocalizeMessage(TierType.Tier3),
  		Id: 0
  	},
  	{
  		TierType: '',
  		TierTypeName: this.localizationService.GetLocalizeMessage(TierType.Other),
  		Id: 0
  	}
  ];

  constructor(
    private configureClient: ConfigureClientService,
    private localizationService: LocalizationService,
    private formBuilder: FormBuilder,
		private cdr: ChangeDetectorRef,
		private widget: WidgetServiceService,
		private scrollService: WindowScrollTopService
  ){
  	this.scrollService.scrollTop();
  }

  ngOnInit(): void {

  	this.staffingAgencyArrayform = this.form.controls['staffingAgencyArrayform'] as FormArray;
  	this.getStaffingAgency();

  	this.configureClient.updateObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {reasonForChange: string, update: boolean}) => {
  		if(res.update){
  			this.updateStaffingAgency(res.reasonForChange);
  		}
  		});

  	this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
  		if (res) {
  			this.staffingAgencyArrayform.markAsDirty();
  		}
  	});
  }

  private getStaffingAgency(): void {
  	this.configureClient.getStaffingAgency().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
  		next: (data: ApiResponse) => {
  			const getdataStaffingAgency: DataStaffingAgencyList[] = [];
  			for (const dt in data.Data) {
  				this.label.push(data.Data[dt].TierType);
  				getdataStaffingAgency.push({
  					TierTypeName: data.Data[dt].TierTypeName,
  					TierType: data.Data[dt].TierType,
  					controlName: data.Data[dt].controlName,
  					Id: data.Data[dt].Id
  				});
  			}
  			if (getdataStaffingAgency.length > Number(magicNumber.zero)) {
  				this.prefilledStaffingAgencyDetails = [...getdataStaffingAgency];
  				this.fillData(this.prefilledStaffingAgencyDetails);
  			}
  		}
  	});
  }

  public getStaffingAgencyFormStatus(e: FormGroup): void {
  	this.form = e;
  }

  private fillData(list: DataStaffingAgencyList[]) : void {
  	this.staffingAgencyArrayform.clear();
  	list.forEach((row: DataStaffingAgencyList) => {
  		this.staffingAgencyArrayform.push(this.formBuilder.group({
  			Id: [
  				row.Id ?
  					row.Id
  					: magicNumber.zero
  			],
  			TierType: [row.TierType],
  			StaffingAgencyLabel: [row.StaffingAgencyLabel ?? this.prefilledStaffingAgencyDetails[row.Id].TierTypeName],
  			TierTypeName: [row.TierTypeName]
  		}));
  		this.cdr.detectChanges();
  	});
  }

  getStaffingAgencyData(e: DataStaffingAgencyList[]) {
  	this.fillData(e);
  }

  private updateStaffingAgency(reasonForChange: string): void {

  	const payload = {staffingAgencyTypeList: this.form.value, reasonForChange: reasonForChange};
  	this.configureClient
  		.updateStaffingAgency(payload)
  		.pipe(
  			switchMap((data: GenericResponseBase<null>) => {
  			this.configureClient.toMove.next({ApiResponse: data, move: true});
  				this.localizationService.Refresh();
  					this.localizationService.RefreshFile();
  					this.widget.reloadJson.next(true);
  			return of(null);
  		}),
		  takeUntil(this.destroyAllSubscribtion$)
  		)
  		.subscribe(() => {
  			this.getStaffingAgency();
  		});
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	this.widget.updateForm.next(false);
  }
}
