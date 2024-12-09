import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SecurityClearanceData, SecurityClearanceGet } from '@xrm-core/models/Configure-client/security-clearance.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ConfigureClientDeclarations } from '@xrm-master/configure-client/Common/declarations';
import { Column, ColumnConfigure } from '@xrm-shared/models/list-view.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';

@Component({
	selector: 'app-security-clearance',
	templateUrl: './security-clearance.component.html',
	styleUrls: ['./security-clearance.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityClearanceComponent implements OnInit, OnDestroy{

  @Input() form: FormGroup;

  private destroyAllSubscribtion$ = new Subject<void>();

  public prefilledDataSecurityClearance: SecurityClearanceData[] = [];

  private securityClearanceDataForUpload: SecurityClearanceData[] = [];

  public columnConfigurationSecurityClearance: ColumnConfigure = ConfigureClientDeclarations.ColumnConfigurationSecurityClearance;

  private securityClearanceForm: FormArray;

  public columnSeurityClearance: Column[] = ConfigureClientDeclarations.ColumnSecurityClearance;

  constructor(
    private configureClient: ConfigureClientService,
    private formBuilder: FormBuilder,
    private widget: WidgetServiceService,
		private cdr: ChangeDetectorRef,
		private localizationService: LocalizationService,
		private scrollService: WindowScrollTopService
  ){
  	this.scrollService.scrollTop();
  }

  ngOnInit(): void {
  	this.getSecurityClearance();

  	this.securityClearanceForm = this.form.controls['securityClearanceList'] as FormArray;

  	this.configureClient.updateObs.pipe(takeUntil(this.destroyAllSubscribtion$)).
  		subscribe((res: {reasonForChange: string, update: boolean}) => {
  			if(res.update){
  				this.updateSecurityClearance(res.reasonForChange);
  			}
  		});

  	this.widget.updateFormObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
  		if (res) {
  			this.securityClearanceForm.markAsDirty();
  		}
  	});
  }

  getSecurityClearance(){
  	this.configureClient.getSecurityClearance().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
  		next: (data: ApiResponse) => {
  			const getdataSecurityClearance: SecurityClearanceData[] = [];
  			for (const dt in data.Data) {
  				getdataSecurityClearance.push({
  					text1: data.Data[dt].SecurityName,
  					switch1: data.Data[dt].IsVisible,
  					order: data.Data[dt].DisplayOrder,
  					uKey: data.Data[dt].Ukey,
  					isDisabled: data.Data[dt].Disabled,
  					Id: 0
  				});
  			}
  			getdataSecurityClearance.sort((a: SecurityClearanceData, b: SecurityClearanceData) =>
  			   	a.order - b.order);
  			if (getdataSecurityClearance.length > Number( magicNumber.zero)) {
  				this.prefilledDataSecurityClearance = [...getdataSecurityClearance];
  				this.fillData(this.prefilledDataSecurityClearance);
  			}
  		},
  		complete: () => {
  			this.form.markAsPristine();
  		}
  	});
  }

  public getSecurityClearanceData(e: SecurityClearanceData[]): void {
  	this.securityClearanceDataForUpload = e;
  	this.fillData(e);
  }

  private fillData(list: SecurityClearanceData[]) : void {
  	this.securityClearanceForm.clear();
  	list.forEach((row: SecurityClearanceData) => {
  		this.securityClearanceForm.push(this.formBuilder.group({
  			Ukey: [row.uKey],
  			SecurityName: [row.text1],
  			IsVisible: [row.switch1],
  			Disabled: [row.isDisabled],
  			DisplayOrder: [row.order]
  		}));
  	});
  	this.cdr.markForCheck();
  }

  public getSecurityClearanceFormStatus(e: FormGroup): void {
  	this.form = e;
  }

  private updateSecurityClearance(reasonForChange: string): void {
  	const securityClearanceDataToUpdate: SecurityClearanceGet[] = [],
  		securityClearanceListData = {
  		SecurityClearanceDtos: securityClearanceDataToUpdate,
  		reasonForChange: reasonForChange
  	};
  	for (let i = 0; i < this.securityClearanceDataForUpload.length; i++) {
  		if (
  			!this.form.controls[i].pristine
  		) {
  			const formGroupObjectToinsert = {
  				securityName: this.securityClearanceDataForUpload[i].text1,
  				isVisible: this.securityClearanceDataForUpload[i].switch1,
  				uKey: this.securityClearanceDataForUpload[i].uKey,
  				disabled: this.securityClearanceDataForUpload[i].isDisabled
  			};
  			securityClearanceDataToUpdate.splice(i, magicNumber.zero, formGroupObjectToinsert);
  		}
  	}
  	this.configureClient
  		.updateSecurityClearance(securityClearanceListData)
		  .pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((data: GenericResponseBase<null>) => {
  			this.configureClient.toMove.next({ApiResponse: data, move: true});
  			this.localizationService.Refresh();
  			this.localizationService.RefreshFile();
  			this.widget.reloadJson.next(true);
  		});
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	this.widget.updateForm.next(false);
  }
}
