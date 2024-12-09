import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { NavigationPaths } from '../constant/routes-constant';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { NavPathsType, ShiftData } from '../constant/shift-data.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy {
	public navigationPaths: NavPathsType = NavigationPaths;
	public shift: ShiftData;
	public enableXrmTimeClock: boolean = false;
	public shiftDifferentialMethod: number | null;
	public multiplierOrAdder: string | null;
	public formattedValue: number;
	public starTime: string | null;
	public endTime: string | null;
	public ukey: string;
	public countryVal: number;
	private ngUnsubscribe$ = new Subject<void>();
	public dataShift: ShiftData;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		private shiftServc: ShiftGatewayService,
		public route: Router,
		public dialogService: DialogPopupService,
		private toasterServc: ToasterService,
		private localization: LocalizationService,
		private cdr:ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getById(param['id']);
				this.ukey = param["id"];
			}
		});
	}

	private getById(id: string) {
		this.shiftServc.getShiftById(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.shift = res.Data;
					this.shiftServc.shiftDataSubject.next({
						"shiftID": this.shift.ShiftId,
						"Disabled": this.shift.Disabled,
						"shiftCode": this.shift.ShiftCode
					});

					this.formattedValue = this.shift.AdderOrMultiplierValue;
					this.starTime = this.localization.TransformTime(this.shift.StartTime);
					this.endTime = this.localization.TransformTime(this.shift.EndTime);
					switch (res.Data.ReportingDayType) {
						case "Out":
							this.shift.ReportingDayType = "Punch Out";
							break;
						case "In":
							this.shift.ReportingDayType = "Punch In";
							break;
						default:
					}
					this.multiplierOrAdder = this.shift.ShiftDifferential.toLowerCase() === 'multiplier'
						? 'Multiplier'
						: 'Adder';
					this.getSectorDataById(this.shift.SectorId, this.shift.LocationId);
				}
			}
		});
	}

	public getSectorDataById(sectorId: number, locationId: number) {
		forkJoin([
			this.shiftServc.getLocationBasedTimeClock(locationId),
			this.shiftServc.getSectorById(sectorId)
		])
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(([res, resp]) => {
				if (resp.Succeeded) {
					this.countryVal = resp.Data.CountryId;
					this.enableXrmTimeClock = resp.Data.IsXrmTimeClockRequired;

					if (res.Data){
						if(res.Data.AlternateTimeClockConfigurations){
							this.enableXrmTimeClock = res.Data.EnableXRMTimeClock;
						}
					}
				}
				this.cdr.markForCheck();
			});
	}
	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.toasterServc.resetToaster();
	}

}
