import { Injectable } from '@angular/core';
import { StorageKeys } from '@xrm-shared/enums/storage-keys.enum';

@Injectable({
  providedIn: 'root'
})
export class ManageTabsService {

  private readonly tabsKey = 'openTabs';
  private readonly cTab = 'cTab';
  private readonly duplicateTab = 'isDuplicate';

  constructor() { }

  public trackTab() {
    let openTabs = this.getStoredTabs();
    let tabId = this.getCurrentTab() ?? this.generateUniqueId();

    let isLogin = this.isUserLogin();
    const isLoginInCTab = this.isUserLoginInCTab();
    const index = openTabs.findIndex(x => x.tabId == tabId);

    if (this.isDuplicateTab() || !isLoginInCTab)
      isLogin = false;

    if (index === -1) {
      openTabs.push({ tabId: tabId, islogin: isLogin });
    }
    else {
      tabId = this.generateUniqueId();
      openTabs.push({ tabId: tabId, islogin: false });
      if (isLogin) {
        sessionStorage.setItem(this.duplicateTab, '1');
      }
    }

    this.setCurrentTab(tabId);
    this.storeTabs(openTabs);
  }

  public handleTabClose() {
    const tabId = this.getCurrentTab();
    if (!tabId) return;

    let openTabs = this.getStoredTabs();
    openTabs = openTabs.filter(x => x.tabId !== tabId);
    this.storeTabs(openTabs);
  }

  public isDuplicateTab(): boolean {
    const isDuplicate = sessionStorage.getItem(this.duplicateTab) ?? '0';
    return isDuplicate === '1'
  }

  public manageLoginStatus(isLogin: boolean) {
    const tabId = this.getCurrentTab();
    if (!tabId) {
      this.trackTab();
    }

    const openTabs = this.getStoredTabs();
    const index = openTabs.findIndex(x => x.tabId == tabId);

    if (index == -1)
      return;

    if (isLogin && this.isDuplicateTab())
      return;

    openTabs[index].islogin = isLogin;
    this.storeTabs(openTabs);
  }

  public isUserLoginInCTab() {
    const val = sessionStorage.getItem(StorageKeys[StorageKeys.loggedIn]) ?? null;
    if (!val)
      return false;

    return val === 'true';
  }

  public isCTabExists() {
    const tabId = this.getCurrentTab();
    if (!tabId)
      return false;

    const openTabs = this.getStoredTabs();
    return openTabs.some(x => x.tabId == tabId);
  }

  public setDuplicateTab() {
    const tabId = this.getCurrentTab();
    if (!tabId)
      return;

    sessionStorage.setItem(this.duplicateTab, '1');
  }

  public isAnyTabLogin() {
    const openTabs = this.getStoredTabs();
    return openTabs.some(x => x.islogin == true);
  }

  public isAnyOtherTabLogin() {
    const tabId = this.getCurrentTab();
    const openTabs = this.getStoredTabs();
    return openTabs.some(x => x.tabId != tabId && x.islogin == true);
  }

  public isUserLogin(): boolean {
    const islogin = localStorage.getItem(StorageKeys[StorageKeys.loggedIn]);
    return islogin === 'true';
  }

  private generateUniqueId(): string {
    return 'tab-' + Math.random().toString(36).substr(2, 9);
  }

  private storeTabs(tabs: { tabId: string, islogin: boolean }[]): void {
    localStorage.setItem(this.tabsKey, JSON.stringify(tabs));
  }

  private getStoredTabs(): { tabId: string, islogin: boolean }[] {
    return JSON.parse(localStorage.getItem(this.tabsKey) || '[]');
  }

  private setCurrentTab(tabId: string) {
    sessionStorage.setItem(this.cTab, tabId);
  }

  private getCurrentTab(): string | null {
    return sessionStorage.getItem(this.cTab);
  }


}
