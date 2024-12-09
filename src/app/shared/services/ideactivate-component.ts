
export interface IDeactivateComponent {
  // canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
  canDeactivate(): boolean;
}
