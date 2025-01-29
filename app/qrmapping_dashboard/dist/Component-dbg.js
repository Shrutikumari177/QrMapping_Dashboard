// sap.ui.define([
//     "sap/ui/core/UIComponent",
//     "com/ingenx/qrmappingdashboard/model/models"
// ], (UIComponent, models) => {
//     "use strict";

//     return UIComponent.extend("com.ingenx.qrmappingdashboard.Component", {
//         metadata: {
//             manifest: "json",
//             interfaces: [
//                 "sap.ui.core.IAsyncContentCreation"
//             ]
//         },

//         init() {
//             UIComponent.prototype.init.apply(this, arguments);

//             this.setModel(models.createDeviceModel(), "device");

//             this.getRouter().initialize();
//         }
//     });
// });
sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/ingenx/qrmappingdashboard/model/models",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], (UIComponent, models, Log, JSONModel, Device) => {
    "use strict";

    return UIComponent.extend("com.ingenx.qrmappingdashboard.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");

            const imagePath = sap.ui.require.toUrl("com/ingenx/qrmappingdashboard/images/");
            const imageModel = new JSONModel({ path: imagePath });
            this.setModel(imageModel, "imageModel");

            this.getRouter().initialize();
        }
    });
});
