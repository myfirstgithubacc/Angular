import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ReasonForRequestService } from '../services/reason-for-request.service';
import { map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { ICommonComponentData, IReasonForRequestData } from '@xrm-core/models/reason-for-request/reason-for-request.interface';
import { NavigationPaths } from '../constant/routes-constant';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { INavigationPathMap, ISectorDetailById } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public reasonForRequestDetails: IReasonForRequestData;
	public rfxSwitchconfig: boolean = false;
	private unsubscribeAll$: Subject<void> = new Subject<void>();
	public navigationPaths: INavigationPathMap = NavigationPaths;

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		public router: Router,
		public reasonForRequestService: ReasonForRequestService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.fetchAndProcessReasonForReq();
	}

	private fetchAndProcessReasonForReq(): void {
		this.activatedRoute.params.pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((param) =>
				this.getReasonForRequestByUkey(param["ukey"])),
			switchMap((reasonForRequestData) => {
				this.handleReasonForRequestData(reasonForRequestData);
				return this.getSectorBasicDetailByIdForRfx(reasonForRequestData.SectorId);
			})
		).subscribe((isRfxSowRequired) => {
			this.rfxSwitchconfig = isRfxSowRequired;
			this.cdr.markForCheck();
		});
	}

	private getReasonForRequestByUkey(ukey: string): Observable<IReasonForRequestData> {
		return this.reasonForRequestService.getReasonForRequestByUkey(ukey).pipe(
			takeUntil(this.unsubscribeAll$),
			map((data: GenericResponseBase<IReasonForRequestData>) => {
				if (!data.Succeeded || !data.Data) return {} as IReasonForRequestData;
				return data.Data;
			})
		);
	}

	private getSectorBasicDetailByIdForRfx(sectorId: number): Observable<boolean> {
		return this.reasonForRequestService.getRfxDataFromSector(sectorId).pipe(
			takeUntil(this.unsubscribeAll$),
			map((data: GenericResponseBase<ISectorDetailById>) => {
				if (!data.Succeeded || !data.Data) return false;
				return data.Data.IsRfxSowRequired;
			})
		);
	}


	private handleReasonForRequestData(reasonForRequestData: IReasonForRequestData): void {
		this.reasonForRequestDetails = reasonForRequestData;
		this.reasonForRequestService.sharedDataSubject.next(this.prepareSharedData());
	}

	private prepareSharedData(): ICommonComponentData {
		return {
			'Disabled': this.reasonForRequestDetails.Disabled,
			'ReasonForRequestId': this.reasonForRequestDetails.Id,
			'ReasonForRequestCode': this.reasonForRequestDetails.Code
		};
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		this.toasterService.resetToaster();
	}
}
