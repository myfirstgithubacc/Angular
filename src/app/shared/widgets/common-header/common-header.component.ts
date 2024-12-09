/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AuthCommonService } from '@xrm-shared/services/common.service';
import { Subject, forkJoin, EMPTY } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { CommonButtonSet, StatusData, StatusItemList } from '@xrm-shared/models/common-header.model';

@Component({
	selector: 'app-common-header',
	templateUrl: './common-header.component.html',
	styleUrls: ['./common-header.component.scss'],
	providers: [AuthCommonService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonHeaderComponent implements OnInit, OnChanges, OnDestroy, DoCheck {
	public formControl!: FormControl;
	@Input() set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
	@Input() entityId: number| any;
	@Input() recordId: string | null | undefined | any;
	@Input() recordStatus: string | null | undefined;
	@Input() recordName: string;
	@Input() isEditMode: boolean = false;
	@Input() isStatusEditable: boolean = false;
	@Input() subEntityType: string | undefined;
	@Input() buttonSet: CommonButtonSet[] | any = [];
	@Input() listOfStatus: StatusItemList[] = [];
	@Input() recordIdTitle: string;
	@Input() recordStatusTitle: string;
	@Input() recordIdTitleParams: DynamicParam[];
	@Input() statusData: StatusData | any;
	@Output() onLink = new EventEmitter<string>();
	private unsubscribe$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private parentF: FormGroupDirective,
		public route: Router,
		private localizationService: LocalizationService,
		private commonService: AuthCommonService,
		private cdref: ChangeDetectorRef
	) { }
	ngDoCheck(): void {
		this.cdref.markForCheck();
	}

	ngOnInit(): void {
		this.fetchCommonHeaderAuthPermission();
	}

	ngOnChanges(changes: SimpleChanges): void {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (changes['subEntityType']) {
			this.fetchCommonHeaderAuthPermission();
		}
		if(changes['buttonSet'])
  		this.fetchCommonHeaderAuthPermission();
	}

	private fetchCommonHeaderAuthPermission(): void {
		forkJoin([this.commonService.getCommonHeaderAuthPermission(this.entityId, this.buttonSet, this.subEntityType)]).pipe(
			takeUntil(this.unsubscribe$),
			switchMap(([permissionRes]) => {
				if (permissionRes.length > magicNumber.zero)
					this.buttonSet = permissionRes;
				return EMPTY;
			})
		).subscribe();
	}

	public getStringClasses(cssClass: any[]): any {
		return cssClass.reduce((classes, currentClass) => {
			return { ...classes, [currentClass]: true };
		}, {});
	}

	public dynamicParamLocalizaion(localizeKey: string, dynamicParam: DynamicParam[]): string {
		return this.localizationService.GetLocalizeMessage(localizeKey, dynamicParam);
	}

	public popupAction(param: string): void {
		this.onLink.emit(param);
	}

	public actionClicked(fn: any, action: any): void {
		fn(action);
	}

	public valueChange(value: string): void {
		// Implement logic here if needed
	}

	public getObject(object: DynamicParam[]): string | null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (object.length === magicNumber.zero) return null;
		return this.localizationService.GetParamObject(object);
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
