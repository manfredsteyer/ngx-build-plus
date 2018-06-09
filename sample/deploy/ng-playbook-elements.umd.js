(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/elements'), require('@angular/platform-browser-dynamic'), require('@angular/platform-browser')) :
  typeof define === 'function' && define.amd ? define('@ng-playbook/elements', ['exports', '@angular/core', '@angular/common', '@angular/elements', '@angular/platform-browser-dynamic', '@angular/platform-browser'], factory) :
  (factory((global['ng-playbook'] = global['ng-playbook'] || {}, global['ng-playbook'].elements = {}),global.ng.core,global.ng.common,global.ng.elements,global.ng.platformBrowserDynamic,global.ng.platformBrowser));
}(this, (function (exports,core,common,elements,platformBrowserDynamic,platformBrowser) { 'use strict';

  /**
   * @fileoverview added by tsickle
   * @suppress {checkTypes} checked by tsc
   */
  var ElementsComponent = (function () {
      function ElementsComponent() {
      }
      ElementsComponent.decorators = [
          { type: core.Component, args: [{
                      selector: "ng-playbook-elements",
                      template: "elements works!"
                  },] },
      ];
      return ElementsComponent;
  }());
  var ElementalsModule = (function () {
      function ElementalsModule(injector) {
          this.injector = injector;
      }
      /**
       * @return {?}
       */
      ElementalsModule.prototype.ngDoBootstrap = /**
       * @return {?}
       */
          function () {
              var /** @type {?} */ element = elements.createCustomElement(ElementsComponent, {
                  injector: this.injector
              });
              customElements.define('ng-playbook-elements', element);
          };
      ElementalsModule.decorators = [
          { type: core.NgModule, args: [{
                      imports: [
                          common.CommonModule,
                          platformBrowser.BrowserModule
                      ],
                      declarations: [ElementsComponent],
                      entryComponents: [ElementsComponent]
                  },] },
      ];
      /** @nocollapse */
      ElementalsModule.ctorParameters = function () {
          return [
              { type: core.Injector }
          ];
      };
      return ElementalsModule;
  }());
  platformBrowserDynamic.platformBrowserDynamic().bootstrapModule(ElementalsModule)
      .catch(function (err) { return console.log(err); });

  /**
   * @fileoverview added by tsickle
   * @suppress {checkTypes} checked by tsc
   */

  /**
   * @fileoverview added by tsickle
   * @suppress {checkTypes} checked by tsc
   */

  exports.ElementsComponent = ElementsComponent;
  exports.ElementalsModule = ElementalsModule;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctcGxheWJvb2stZWxlbWVudHMudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9AbmctcGxheWJvb2svZWxlbWVudHMvbGliL2VsZW1lbnRhbHMubW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgTmdNb2R1bGUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgY3JlYXRlQ3VzdG9tRWxlbWVudCB9IGZyb20gJ0Bhbmd1bGFyL2VsZW1lbnRzJztcbmltcG9ydCB7IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IGBuZy1wbGF5Ym9vay1lbGVtZW50c2AsXG4gIHRlbXBsYXRlOiBgZWxlbWVudHMgd29ya3MhYFxufSlcbmV4cG9ydCBjbGFzcyBFbGVtZW50c0NvbXBvbmVudCB7XG59XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgQnJvd3Nlck1vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtFbGVtZW50c0NvbXBvbmVudF0sXG4gIGVudHJ5Q29tcG9uZW50czogW0VsZW1lbnRzQ29tcG9uZW50XVxufSlcbmV4cG9ydCBjbGFzcyBFbGVtZW50YWxzTW9kdWxlIHtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvclxuICApIHt9XG5cbiAgbmdEb0Jvb3RzdHJhcCgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gY3JlYXRlQ3VzdG9tRWxlbWVudChFbGVtZW50c0NvbXBvbmVudCwge1xuICAgICAgaW5qZWN0b3I6IHRoaXMuaW5qZWN0b3JcbiAgICB9KTtcbiAgICBjdXN0b21FbGVtZW50cy5kZWZpbmUoJ25nLXBsYXlib29rLWVsZW1lbnRzJywgZWxlbWVudCk7XG4gIH1cblxufVxuXG5wbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEVsZW1lbnRhbHNNb2R1bGUpXG4gIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4iXSwibmFtZXMiOlsiQ29tcG9uZW50IiwiY3JlYXRlQ3VzdG9tRWxlbWVudCIsIk5nTW9kdWxlIiwiQ29tbW9uTW9kdWxlIiwiQnJvd3Nlck1vZHVsZSIsIkluamVjdG9yIiwicGxhdGZvcm1Ccm93c2VyRHluYW1pYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O29CQU1DQSxjQUFTLFNBQUM7d0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjt3QkFDaEMsUUFBUSxFQUFFLGlCQUFpQjtxQkFDNUI7O2dDQVREOzs7UUF1QkUsMEJBQ1U7WUFBQSxhQUFRLEdBQVIsUUFBUTtTQUNkOzs7O1FBRUosd0NBQWE7OztZQUFiO2dCQUNFLHFCQUFNLE9BQU8sR0FBR0MsNEJBQW1CLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3JELFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtpQkFDeEIsQ0FBQyxDQUFDO2dCQUNILGNBQWMsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDeEQ7O29CQW5CRkMsYUFBUSxTQUFDO3dCQUNSLE9BQU8sRUFBRTs0QkFDUEMsbUJBQVk7NEJBQ1pDLDZCQUFhO3lCQUNkO3dCQUNELFlBQVksRUFBRSxDQUFDLGlCQUFpQixDQUFDO3dCQUNqQyxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztxQkFDckM7Ozs7O3dCQXBCNkJDLGFBQVE7OzsrQkFBdEM7O0FBb0NBQyxpREFBc0IsRUFBRSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUN2RCxLQUFLLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFBLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
