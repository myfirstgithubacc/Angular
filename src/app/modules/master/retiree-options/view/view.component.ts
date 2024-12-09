import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { RetireeoptionsService } from 'src/app/services/masters/retiree-options.service';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { NavigationPaths } from '../constant/routes-constant';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { NavPathsType, RetireeOptData, StatusData } from '../constant/retiree.enum';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {

	public navigationPaths: NavPathsType = NavigationPaths;
	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public retireeOptData: RetireeOptData;
	private ngUnsubscribe$ = new Subject<void>();
	public statusData: StatusData = {

		items: []
	};
	public ukey: string;
	constructor(
		private activatedRoute: ActivatedRoute,
		private retireeOptServc: RetireeoptionsService,
		private toasterServc: ToasterService
	) {
	}

	ngOnInit(): void {
		this.getById();
	}

	private getById() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
				if (param['id']) {
					this.ukey = param['id'];
					return this.retireeOptServc.getRetireeOptionId(param['id']).pipe(takeUntil(this.ngUnsubscribe$));
				}
				return EMPTY;
			})
		).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.retireeOptData = res.Data;
					this.retireeOptServc.retireeDataSubject.next({
						"retireeID": this.retireeOptData.Id,
						"Disabled": this.retireeOptData.Disabled,
						"retireeCode": this.retireeOptData.Code
					});

				}
			}
		});
	}
	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.toasterServc.resetToaster();
	}


}


