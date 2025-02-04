sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageToast","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/m/MessageBox","com/ingenx/qrmappingdashboard/utils/HelperFunction"],function(e,t,a,s,r,o){"use strict";let n="";let l="";let i="";let d="";return e.extend("com.ingenx.qrmappingdashboard.controller.SalesOrderCreation",{onInit:function(){const e=this.getOwnerComponent().getRouter();e.getRoute("onRouteCreateSalesOrder").attachPatternMatched(this._loadSalesOrderType,this)},_loadSalesOrderType:async function(){this._busyDialog=new sap.m.BusyDialog({title:"Processing..."});let e=await o._getSingleEntityData(this,"getDistinctOrderType");let t=new s(e);this.getView().setModel(t,"salesOrderTypeModel")},onCustomerValueHelp:function(){o._openValueHelpDialog(this,"customerValueHelpValueHelp","com.ingenx.qrmappingdashboard.fragments.soCustomer")},onCustomerValueHelpSearch:function(e){o._valueHelpLiveSearch(e,"Kunnr")},onCustomerVendorValueConfirmItem:function(e){var t=e.getParameter("selectedItem");let a=this.byId("dealerDessc");if(t){var s=t.getTitle();l=t.getDescription();this.getView().byId("salesOrder_dealer").setValue(s);a?a.setVisible(true)&&a.setValue(l):console.warn("Dealer name field not Found")}e.getSource().getBinding("items").filter([])},onPlantTypeValueHelp:function(){o._openValueHelpDialog(this,"plantValueHelpValueHelp","com.ingenx.qrmappingdashboard.fragments.soPlant")},onplantValueHelpSearch:function(e){o._valueHelpLiveSearch(e,"Plant")},onplantValueConfirmItem:function(e){var t=e.getParameter("selectedItem");let a=this.byId("plantDesc");if(t){var s=t.getTitle();l=t.getDescription();this.getView().byId("salesOrder_plant").setValue(s);a?a.setVisible(true)&&a.setValue(l):console.warn("Plant Desc field not Found")}e.getSource().getBinding("items").filter([])},onSalesOrderTypeValueHelp:function(){o._openValueHelpDialog(this,"salesOrgValueHelpValueHelp","com.ingenx.qrmappingdashboard.fragments.soType")},onsalesOrgValueHelpSearch:function(e){o._valueHelpLiveSearch(e,"SalesOrderType")},onSalesOrgValueHelp:function(){o._openValueHelpDialog(this,"onSalesFragment","com.ingenx.qrmappingdashboard.fragments.soSalesOrg")},onDistributionTypeValueHelp:function(){o._openValueHelpDialog(this,"onDistributionFragment","com.ingenx.qrmappingdashboard.fragments.sodistchannel")},ondistchannelValueConfirmItem:function(e){o._valueHelpSelectedValue(e,this,"salesOrder_distChannel")},onDivisionValueHelp:function(){o._openValueHelpDialog(this,"onDivisionFragment","com.ingenx.qrmappingdashboard.fragments.soDivision")},ondivisionValueConfirmItem:function(e){o._valueHelpSelectedValue(e,this,"salesOrder_division")},onsalesOrgValueConfirmItem:function(e){o._valueHelpSelectedValue(e,this,"salesOrder_salesOrg")},onsalesTypeValueConfirmItem:async function(e){let t=o._valueHelpSelectedValue(e,this,"salesOrder_salesOrderType");let a=await o._getSingleEntityDataWithParam(this,"getSalesOrderTypevalues","SalesOrderType",t);let r=new s(a[0].DistChannels);this.getView().setModel(r,"distDataModel");let n=new s(a[0].Divisions);this.getView().setModel(n,"DivisionDataModel");let l=new s(a[0].SalesOrgs);this.getView().setModel(l,"salesOrgDataModel")},onClickSumbitButton:async function(){try{let e=["salesOrder_salesOrg","salesOrder_salesOrderType","salesOrder_salesOrderDesc","salesOrder_distChannel","salesOrder_division","salesOrder_dealer","salesOrder_plant"];this._busyDialog.open();let t=await o._getInputValues(this,e);let[a,s,r,n,l,c,u]=t;let p={SalesOrderType:s||"",PurchaseOrderByCustomer:r||"",SalesOrganization:a||"",DistributionChannel:n||"",OrganizationDivision:l||"",SoldToParty:c||"",to_Item:[{Material:d,PurchaseOrderByCustomer:r||"",RequestedQuantity:i||"",ProductionPlant:u||"",StorageLocation:""}]};this._sendToBackend(p,e)}catch(e){console.error("Error in onClickSumbitButton:",e);sap.m.MessageToast.show("Failed to submit production order.")}},_sendToBackend:async function(e,t){try{let s=this.byId("dealerDessc");let r=this.byId("plantDesc");var a=this.getOwnerComponent().getModel();let n=a.bindList("/A_SalesOrder");n.create(e,true);n.attachCreateCompleted(a=>{let n=a.getParameters();if(n.success){let a=n.context.getObject();let l=a.SalesOrder;sap.m.MessageBox.success("Sales Order: "+l,{title:"Sales Order Created",onClose:async()=>{await this._onUpdateOcData(l,e.SoldToParty);o._clearInputValues(this,t);s?s.setVisible(false):"";r?r.setVisible(false):"";setTimeout(()=>{this._busyDialog.close()},0)}})}})}catch(e){console.error("Error in _sendToBackend:",e);sap.m.MessageToast.show("Failed to send data to the backend.")}},_onUpdateOcData:async function(e,t){let a="Sales Order Mapped";let s=this.getOwnerComponent().getModel();let r=s.bindList("/OuterContainer");let o=new sap.ui.model.Filter({path:"OCID",operator:sap.ui.model.FilterOperator.EQ,value1:n});try{let n=await r.filter(o).requestContexts();if(n.length===0){return sap.m.MessageBox.error("No matching entity found")}const i=n[0];i.setProperty("SalesOrder",e);i.setProperty("DealerId",t);i.setProperty("status",a);i.setProperty("DealerName",l);await s.submitBatch("updateGroup")}catch(e){console.log("Error",e)}},onPressBoxQrScanner:async function(e){if(e.getParameter("cancelled")){sap.m.MessageToast.show("Scan cancelled",{duration:1e3});return}const t=e.getParameter("text");if(!t){sap.m.MessageToast.show("No data found in scan",{duration:1e3});return}try{const e=JSON.parse(t);const{SerialNo:a,BatchID:r}=e;if(!a){sap.m.MessageToast.show("Not a valid QR for scan",{duration:1e3});return}const l=this.getOwnerComponent().getModel();const i=l.bindList("/MaterialBox");const d=new sap.ui.model.Filter({path:"SerialNo",operator:sap.ui.model.FilterOperator.EQ,value1:a});const c=await i.filter(d).requestContexts();if(c.length===0){sap.m.MessageBox.error("No matching entity found");return}const u=c[0];const p=await this._getICIdData(n);const g=p.map(e=>e.ICID);console.log("Resolved ICIdData:",g);let m="";if(g.length>1){let e=new s(g);this.getView().setModel(e,"dialogIcListModel");await o._openValueHelpDialog(this,"icListDialog","com.ingenx.qrmappingdashboard.fragments.ICsListValueHelp");m=await this.onICCodeSelection()}else{m=g[0]}if(m){u.setProperty("IC_ICID",m);u.setProperty("BatchID",r);await l.submitBatch("updateGroup");await this._loadContainerTableData();setTimeout(()=>{sap.m.MessageToast.show("Data updated successfully!")},0)}else{console.log("Ic code is not selected")}}catch(e){console.error("Error processing scan:",e);sap.m.MessageBox.error("An error occurred: "+(e.message||"Unknown error"))}},onICCodeSelection:function(){return new Promise((e,t)=>{const a=this.byId("icListDialog");if(!a){t(new Error("Dialog not found"));return}a.attachConfirm(a=>{const s=a.getParameter("selectedItem");if(s){const t=s.getTitle();e(t)}else{t(new Error("No item selected"))}})})},_getICIdData:async function(e){let t=await o._getSingleEntityData(this,"InnerContainer");if(e){try{let a=t.filter(t=>t.OC_OCID===e);return a}catch(e){console.log("Error",e)}}},onPressIcQrScanner:async function(e){try{if(e.getParameter("cancelled")){sap.m.MessageToast.show("Scan cancelled",{duration:1e3});return}var t=e.getParameter("text");if(!t){sap.m.MessageToast.show("No data found in scan",{duration:1e3});return}var a=JSON.parse(t);var s=a.ICID;if(!s){sap.m.MessageToast.show("Invalid scan data. ICID not found.",{duration:1e3});return}let r=this.getOwnerComponent().getModel();let o=r.bindList("/OuterContainer");let l=new sap.ui.model.Filter({path:"OCID",operator:sap.ui.model.FilterOperator.EQ,value1:n});o.filter([l]);o.requestContexts().then(async e=>{if(!e.length){sap.m.MessageBox.error("No matching OuterContainer found for the given Sales Order.");return}let t=e[0];let a=t.getObject();let o=a.OCQRCode;let l=a.OCQRCodeURL;let i=r.bindList("/InnerContainer");let d=new sap.ui.model.Filter({path:"ICID",operator:sap.ui.model.FilterOperator.EQ,value1:s});i.filter(d).requestContexts().then(e=>{if(e.length===0){sap.m.MessageBox.error("No matching entity found for the given filter.");return}let t=e[0];t.setProperty("OC_OCID",n);t.setProperty("OC_OCQRCode",o);t.setProperty("OC_OCQRCodeURL",l);t.setProperty("SalesOrder","");r.submitBatch("updateGroup").then(async()=>{await this._loadContainerTableData();setTimeout(()=>{sap.m.MessageToast.show("Data updated successfully!")},0)},e=>{console.error("Error updating data:",e);sap.m.MessageBox.error("Error occurred: "+(e.message||"Unknown error."))})}).catch(e=>{console.error("Error requesting contexts:",e);sap.m.MessageBox.error("Failed to retrieve data: "+e.message)})}).catch(e=>{console.error("Error requesting contexts:",e);sap.m.MessageBox.error("Failed to retrieve data: "+e.message)})}catch(e){console.error("Error in onScanSuccess:",e);sap.m.MessageBox.error(e.message)}},onPressOcQrScanner:async function(e){this._displayTable=this.byId("salesOrderCreate_Table");if(e.getParameter("cancelled")){sap.m.MessageToast.show("Scan cancelled",{duration:1e3})}else{var t=e.getParameter("text");if(t){var a=JSON.parse(t);let{OCID:e}=a;n=e;this._displayTable.setBusy(true);await this._loadContainerTableData()}else{sap.m.MessageToast.show("No data found in scan",{duration:1e3})}}},_loadContainerTableData:async function(){if(n){let e=this.getOwnerComponent().getModel();let t=e.bindList(`/getScannedOCData(OCID='${n}')`);try{let e=await t.requestContexts(0,Infinity);let a=e.map(e=>e.getObject());let r=a[0];let o=r.OCID;let n=r.ProductionOrder||"";let l=r.ManufactureDt||"";let c=r.ExpiryDt||"";let u=r.BatchID||"";let p=r.Material||"";d=p;let g=[];if(r.ICs&&r.ICs.length>0){g=r.ICs.flatMap(e=>{if(e.Boxes&&e.Boxes.length>0){return e.Boxes.map(t=>({ICID:e.ICID,ICQRCode:e.ICQRCode,BoxSerialNo:t.SerialNo,BoxQRCode:t.BoxQRCode,pOrder:n,mfgDate:l,expDate:c,BatchID:u,lMaterial:p,ocId:o}))}else{return{ICID:e.ICID,ICQRCode:e.ICQRCode,ocId:o}}})}else{g.push({ocId:o})}let m=g.map(e=>e.BoxSerialNo);i=m.length;let h=new s(g);this.getView().setModel(h,"salesOrderModelData");this._displayTable.setBusy(false)}catch(e){console.log(e)}}}})});
//# sourceMappingURL=SalesOrderCreation.controller.js.map