import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HeaderService } from '@xrm-shared/services/header.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { CustomThemeService } from '@xrm-shared/services/theme.sevice';
import { Subject, takeUntil } from 'rxjs';
import { WidgetServiceService } from '@xrm-shared/widgets/services/widget-service.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';


@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, OnDestroy {
	menu: any;
	menuToggle:any=false;
	class:any='parent';
	status:any;
	ulcheack:boolean;
	addClass: boolean = false;
	addClass2: boolean = false;
	id:any;
	id2:any;

	private unsubscribe$ = new Subject<void>();
	public exportClearTimeOut: any = null;
	constructor(
		private menuService: MenuService,
		private headerServc: HeaderService,
		private ThemeService: CustomThemeService,
		private widget:WidgetServiceService,
		private sessionStorage: SessionStorageService
	) {
	}
	ngOnDestroy(): void {
		clearTimeout(this.exportClearTimeOut);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	loadmenu(): void {
		this.menuService.getMenuList().pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
			this.menu = res;
			this.sortAdministrationChildren(this.menu);
			this.removeListFromRoutes(this.menu);
		});
	}

	ngOnInit(): void {
		this.widget.reloadJson1.pipe(takeUntil(this.unsubscribe$)).subscribe((data:boolean) => {
			if (data) {
				this.exportClearTimeOut=setTimeout(() => {
			    this.menu=[];
					this.loadmenu();
				}, magicNumber.OneThousandTwoHundredEighty);

			}
		});
		this.loadmenu();
		this.headerServc.isMenuVisible.pipe(takeUntil(this.unsubscribe$)).subscribe((data:any) => {
			this.menuToggle =data;
			if(this.menuToggle){
				this.ThemeService.setSideToggle('body--expended moreExpended');
			}else{
				this.ThemeService.setSideToggle('body--expended');
			}
		});
	}

	   public sortAdministrationChildren(menu: any): void {
		const administrationItem = menu.find((item: any) =>
			item.ItemName === "Administrations");
		if (administrationItem) {
			const administrationChildren = administrationItem.Children.filter((child: any) =>
				child.ItemName === "Users" || child.ItemName === "LookupTable" || child.ItemName === "SystemConfiguration");
			administrationChildren.forEach((adminChild: any) => {
				adminChild.Children.sort((a: any, b: any) =>
					a.ItemName.localeCompare(b.ItemName));
			});
		}
	}


	private removeListFromRoutes(menu: any): void {
		if (menu && menu.length > magicNumber.zero) {
			menu.forEach((item: any) => {
				this.removeListFromRoute(item);
			});
		}
	}

	private removeListFromRoute(route: any): void {
		// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
		if (route?.Route?.endsWith('/list')) {
			route.Route = route.Route.slice(magicNumber.zero, magicNumber.minusfive);
		}
		if (route?.Children?.length > magicNumber.zero) {
			this.removeListFromRoutes(route.Children);
		}
	}

	link:any;
	link2:any;
	RemoveSidebar(child?:any, route?:any){
		this.sessionStorage.set('clickedRoute', JSON.stringify(route));
		this.headerServc.setDropdownState('recentAlert', false);
		this.headerServc.setDropdownState('userGuide', false);
		this.headerServc.setDropdownState('profile', false);
		if (child > magicNumber.zero) {
			const isMobile = window.innerWidth < 768;
			if (isMobile) {
				this.headerServc.isMenuVisible.next(true);
			} else {
				this.headerServc.isMenuVisible.next(false);
			}
		} else {
			this.headerServc.isMenuVisible.next(false);
		}
	}

	hideMenu1(route?: any): void {
		this.id=route.ItemId;
		if(this.link!=this.id){
			this.addClass=false;
		}
		this.addClass=!this.addClass;
		this.link=this.id;
	}

	hideMenu2(route1?: any): void {
		this.id2 = route1.ItemId;
		if (this.link2 != this.id2) {
			this.addClass2 = false;
		}
		const isMobile = window.innerWidth < 768;
		if (isMobile) {
			this.addClass2 = !this.addClass2;
		}

		this.link2 = this.id2;
		return;
	}
}

