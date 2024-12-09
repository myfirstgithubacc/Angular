/* eslint-disable one-var */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbModel } from '@xrm-shared/models/breadcrumbs.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { FavoritesService } from '@xrm-shared/services/favorites.service';
import { GlobalService } from '@xrm-shared/services/global.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { map, Subject, switchMap, takeUntil } from 'rxjs';
import { FavoritesList } from 'src/app/modules/extras/landing-page/constants/constants';
@Component({selector: 'app-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnInit {
  @ViewChild('breadcrumblist', { read: ElementRef })
  	breadcrumblist: ElementRef;
  public isScreenBarVisible = true;
  private unsubscribe$ = new Subject<void>();
  public title: string;
  public isFavoriteAllowed: boolean = true;
  public isVisible: boolean;
  public isBreadcrumbVisible = false;
  public isDashboard: boolean;
  isShowDivIf = true;
  addtofav: boolean = true;
  public favoritesList: FavoritesList[];
  public entityId:number;
  public isFavoriteModule: boolean;
  public blackList: number[]=[magicNumber.zero, XrmEntities.RecentAlerts];
  public homepage: string;
  public url: string;
  // eslint-disable-next-line max-params
  constructor(
    private screenTitle: PageTitleService,
    private global: GlobalService,
    private actRoute: Router,
	private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private favoriteService: FavoritesService
  ) {

  }

  ngOnInit(): void {
  	const EID = 0;

	   this.actRoute.events.pipe(map(() => {
  			let child = this.route.firstChild;
  			while (child?.firstChild) {
  				child = child.firstChild;
  			}

  			if (child?.snapshot.data['entityId']) {
  				return child.snapshot.data['entityId'];
  			}
  			return EID;
  		})).pipe(takeUntil(this.unsubscribe$)).subscribe((id: number) => {
  			this.entityId = id;
  			this.isFavoriteAllowed = this.blackList.some((element:number) =>
  			{ return element == this.entityId; });
  		});
  	this.homepage = this.actRoute.routerState.snapshot.url;
  	// eslint-disable-next-line one-var
  	this.global.getRouteObs.pipe(takeUntil(this.unsubscribe$)).subscribe((data: boolean) => {
  		this.isVisible = data;
  	});

  	this.screenTitle.castTitle.pipe(takeUntil(this.unsubscribe$)).subscribe((title: string) => {
  		this.title = title;
  	});
  	this.screenTitle.getRouteObs.pipe(takeUntil(this.unsubscribe$)).subscribe((route: string) => {
  		this.url = route;
  	});
	 	// check whether EntityLocalizedKey exists or not
  	this.screenTitle.favorite
  		.pipe(
  			switchMap(() =>
  				this.favoriteService.getFavorites()),
  			takeUntil(this.unsubscribe$)
  		)
  		.subscribe((res) => {
  			this.favoritesList = res.Data ?? [];
  			const exists = this.favoritesList.some((item: BreadcrumbModel) =>
  				item.EntityId === this.entityId);
  			this.isFavoriteModule = exists;
  			this.addtofav = !exists;
  			this.cdr.markForCheck();
  		});

  }

  public submitFavorites(favoriteEntityId: number) {
  	const entityId = { entityId: favoriteEntityId};
  	this.favoriteService.submitFavorites(entityId).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
  			// No response needed
  		});

  }

  public favToggleCollapse() {
  	this.addtofav = !this.addtofav;
  	this.isFavoriteModule= !this.isFavoriteModule;
  	const favoriteEntityId = this.entityId;
  	this.submitFavorites(favoriteEntityId);
  }

  ngOnDestroy() {
  	this.unsubscribe$.next();
  	this.unsubscribe$.complete();
  }
}
