sap.ui.define(["sap/ui/core/UIComponent","com/ingenx/qrmappingdashboard/model/models"],(e,i)=>{"use strict";return e.extend("com.ingenx.qrmappingdashboard.Component",{metadata:{manifest:"json",interfaces:["sap.ui.core.IAsyncContentCreation"]},init(){e.prototype.init.apply(this,arguments);this.setModel(i.createDeviceModel(),"device");this.getRouter().initialize()}})});
//# sourceMappingURL=Component.js.map