sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.ingenx.qrmappingdashboard.controller.Home", {
        onInit() {
        },
        onPressCreateSalesOrder: function () {
            const tile = this.getOwnerComponent().getRouter();
            tile.navTo("onRouteCreateSalesOrder");
        },

        onPressProductionTrackDashboard: function () {
            const tile = this.getOwnerComponent().getRouter();
            tile.navTo("onRouteProductionTrackingDashboard");
        },
    });
});