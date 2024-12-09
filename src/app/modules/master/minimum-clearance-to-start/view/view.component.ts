import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavigationPaths } from '../constant/routes-constant';
import { MinimumClearanceToStartService } from '../services/minimum-clearance-to-start.service';
import { Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { ICommonComponentData, IMinimumClearanceDetails } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { INavigationPathMap, ISectorDetailById } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public activatedRoute$: Subscription;
	public minimumClearanceToStart: IMinimumClearanceDetails;
	public navigationPaths: INavigationPathMap = NavigationPaths;
	public isRfxSowRequired: boolean = false;
	private unsubscribeAll$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		public router: Router,
		private minimumClearanceService: MinimumClearanceToStartService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.fetchAndProcessClearanceDetails();
	}

	private fetchAndProcessClearanceDetails(): void {
		this.activatedRoute.params.pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((param) =>
				this.minimumClearanceService.getMinimumClearanceToStartByUKey(param['uKey'])),
			switchMap((data: GenericResponseBase<IMinimumClearanceDetails>) => {
				if (!data.Succeeded || !data.Data) return [];
				this.handleMinimumClearanceData(data.Data);
				return this.minimumClearanceService.getSectorBasicDetailById(data.Data.SectorId);
			})
		).subscribe((res: GenericResponseBase<ISectorDetailById>) => {
			if (!res.Succeeded || !res.Data) return;
			this.isRfxSowRequired = res.Data.IsRfxSowRequired;
			this.cdr.markForCheck();
		});
	}

	private handleMinimumClearanceData(minimumClearanceData: IMinimumClearanceDetails): void {
		this.minimumClearanceToStart = minimumClearanceData;
		this.minimumClearanceService.sharedDataSubject.next(this.prepareSharedData());
	}

	private prepareSharedData(): ICommonComponentData {
		return {
			'Disabled': this.minimumClearanceToStart.Disabled,
			'MinClearanceId': this.minimumClearanceToStart.Id,
			'MinClearanceCode': this.minimumClearanceToStart.Code
		};
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		this.toasterService.resetToaster();
	}
}
