sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "com/ingenx/qrmappingdashboard/utils/HelperFunction"
  ], (BaseController,Filter,FilterOperator,Fragment,JSONModel,HelperFunction) => {
    "use strict";
  
    return BaseController.extend("com.ingenx.qrmappingdashboard.controller.ProductionTrackingDashboard", {
        onInit() {
        
        },

        // open Batch value help dialog box
        _onDashboardBatchValueHelp: function(){
            HelperFunction._openValueHelpDialog(this,"_dashboardBatchIdDataFragment","com.ingenx.qrmappingdashboard.fragments.batchCodeValueHelp")
        },

        // open oc value help dialog box
        _onDashboardOCValueHelp: function(){
            HelperFunction._openValueHelpDialog(this,"_dashboardOCCodeFragment","com.ingenx.qrmappingdashboard.fragments.ocCodeValueHelp")
        },

        // triggered during select an OC item from value help
        onOCValueConfirmItem : function(oEvent){
            HelperFunction._valueHelpSelectedValue(oEvent,this,"productionDashboard_ocID")
        },

        // batch value help search code in a dialog
        onBatchValueHelpSearch : function(oEvent){
            HelperFunction._valueHelpLiveSearch(oEvent,"BatchNo")
        },

        // oc value help search code in a dialog
        onOCValueHelpSearch : function(oEvent){
            HelperFunction._valueHelpLiveSearch(oEvent,"orderConfirmationId")
        },
        
        // triggered during select a batch value item from value help
         onBatchValueConfirmItem :async function(oEvent){
            let detailsLayout = this.byId("productionDashboard_ocID")
            let batchValue =  HelperFunction._valueHelpSelectedValue(oEvent,this,"productionDashboard_batchId")
            let oData =await  HelperFunction._getSingleEntityDataWithParam(this,"getBatchOCValueHelp","BatchID",batchValue)
            if(detailsLayout){
                detailsLayout.setValue("")
            }
            let oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel, "batchDataModel");        
            console.log("model data", this.getView().getModel("batchDataModel").getData());
            const oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);
         },

        //  Filter oc data based on date
         handleChange:async function (oEvent) {
            const oDateValue = oEvent.getParameter("value");  
            let oData =await  HelperFunction._getSingleEntityDataWithParam(this,"getBatchOCValueHelp","ManufactureDt",oDateValue)  
            let oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel, "batchDataModel");
            console.log("model data", this.getView().getModel("batchDataModel").getData());        
        },
        
        // method is used to extract the data based on batch or oc code
        _onGoButtonPress : async function() {            
            let ocValue = this.byId("productionDashboard_ocID").getValue();
            let oDatePicker = this.byId("DP1");
            let manufacturingvalue = oDatePicker.getDateValue(); 
            let batchValue = this.byId("productionDashboard_batchId").getValue();
            let shape_layout = this.byId("dashboard_shapeLayout");
            let details_layout = this.byId("dashboard_ContainerDetailsLayout");
            details_layout?details_layout.setVisible(false):details_layout.setVisible(true)
            if (ocValue && (batchValue || manufacturingvalue)) {
                let encodedOcId = encodeURIComponent(ocValue);
                let oData =await HelperFunction._getSingleEntityDataWithParam(this,"getProductionTrackingDashboardData","OCID",encodedOcId)
                console.log("coming data",oData)
                let filterModel = new JSONModel(oData);
                this.getView().setModel(filterModel, "orderModel");
                shape_layout ? shape_layout.setVisible(true) : console.warn("Layout not Found");
            } else {
                sap.m.MessageToast.show("Please Enter OC and either Batch or Manufacturing Date");
            }
        },

        // Searching method based on icCode or batch no in IC table
        onSearchOCItem: function (oEvent) {
            HelperFunction.performTableSearchMethod(this,oEvent, "dashboardOCproduct_ProductTable", ["ICID","BatchID"]);
        },
        
       // Searching method based on serial no or batch no in Box table  
        onSearchBoxItem: function (oEvent) {
            HelperFunction.performTableSearchMethod(this,oEvent, "detailsFragemnt_boxTable", ["SerialNo","BatchID"]);
        },        

        // using for display count in icontabbar
        countFormatter : function(value){
           return value ? value.length : " "
        },

        // This method is using to load the selected OC data into tabbar's table
        onImageClick: function (oEvent) {
            const oView = this.getView();
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("orderModel");        
            if (!oContext) {
                return sap.m.MessageToast.show("No data found for this image.");
            }
            const oData = oContext.getObject();
            if (oData) {
                oData.ICs?.forEach((ic) => {
                    Object.assign(ic, {
                        ManufactureDt: oData.ManufactureDt || "",
                        ExpiryDt: oData.ExpiryDt || "",
                        ProductionOrder: oData.ProductionOrder || "",
                        BatchID: oData.BatchID || "",
                        Material:oData.Material
                    });
                });
        
                const detailModel = new sap.ui.model.json.JSONModel(oData);
                oView.setModel(detailModel, "fragmentModel");        
                const detailsLayout = oView.byId("dashboard_ContainerDetailsLayout");
                if (detailsLayout) {
                    detailsLayout.setVisible(true);
                }
            }
            console.log("Clicked Image Data:", oData);
        },

        // print qr code method
        onDashboardPrintQR: function () {
            var oImage = this.byId("dashboardDetailsqrImage");
            var sImageSrc = oImage.getSrc();
            if (sImageSrc) {
                var oImageElement = new Image();
                oImageElement.onload = function () {
                    console.log("Image loaded successfully. Proceeding to print...");
                    var oWindow = window.open("", "_blank");
                    oWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
                    oWindow.document.write('<img src="' + sImageSrc + '" style="width:200px;height:200px;"/>');
                    oWindow.document.write('</body></html>');
                    oWindow.document.close();
                    setTimeout(() => {
                        oWindow.print();
                        oWindow.close(); 
                    }, 500); 
                };
                oImageElement.onerror = function () {
                    console.error("Failed to load the QR code image from URL:", sImageSrc);
                    sap.m.MessageToast.show("Failed to load the QR code image.");
                };
                oImageElement.src = sImageSrc;
            } else {
                console.warn("QR Code source is empty or undefined.");
                sap.m.MessageToast.show("QR Code is not available for printing.");
            }
        },
        // dislpay OC qr code dialog after clicked on qr Link
        _onOCQrCodeLink: function(oEvent){
            var oModel = this.getView().getModel("fragmentModel");
            var oData = oModel.getData();
            let BoxQRCodeURL = oData.OCQRCodeURL;
            let oDialog = this.byId("dashboarDeatislDetailQrDialog");
            let oImage = this.byId("dashboardDetailsqrImage");
            oImage.setSrc(BoxQRCodeURL);
            oDialog.open();
        },

       

        // display box qr code dialog
        onDashboardBoxQrCode: function(oEvent){
            this.openQrDialogBox(oEvent,"boxModelData","BoxQRCodeURL")
        },

        // display IC qr dialog box
        onDashboardICQrCode: function(oEvent){
            this.openQrDialogBox(oEvent,"fragmentModel","ICQRCodeURL")
        },  


        
        // open qr dialog box
        openQrDialogBox : function(oEvent,modelName,propertyName){
           let oSource = oEvent.getSource()
           let oBinding = oSource.getBindingContext(modelName)
           let oData = oBinding.getObject()
           let qrCodeUrl = oData[propertyName];
           let oDialog = this.byId("dashboarDeatislDetailQrDialog");
            let oImage = this.byId("dashboardDetailsqrImage");
            oImage.setSrc(qrCodeUrl);
            oDialog.open();
        },

         // close qr dialog box
         onCloseQRDialog: function () {
            this.byId("dashboarDeatislDetailQrDialog").close();
        },

        // manipulate table data after clicked on a row of IC's table
        onIcRowSelect: function (oEvent) {
            const oView = this.getView(); 
            const oContext = oEvent.getSource().getBindingContext("fragmentModel");            
            if (!oContext) {
                return sap.m.MessageToast.show("No Data Found");
            }
            const icData = oContext.getObject();
            const rowData = icData?.Boxes || [];
            if (!Array.isArray(rowData) || rowData.length === 0) {
                return sap.m.MessageToast.show("No Data Found");
            }
            rowData.forEach((box) => {
                Object.assign(box, {
                    ManufactureDt: icData.ManufactureDt || "",
                    ExpiryDt: icData.ExpiryDt || "",
                    ProductionOrder: icData.ProductionOrder || "",
                    BatchID: icData.BatchID || "",
                    Material: icData.Material
                });
            });
            const boxModel = new sap.ui.model.json.JSONModel({ boxes: rowData });
            oView.setModel(boxModel, "boxModelData");
            console.log("my order Data:", boxModel.getData());
        
            const oIconTabBar = oView.byId("idIconTabBar");
            if (oIconTabBar) {
                const oBoxDetailsTab = oView.byId("DialogBoxDetails");
                if (oBoxDetailsTab) {
                    oBoxDetailsTab.setEnabled(true); 
                }
                oIconTabBar.setSelectedKey("boxKey");
            } else {
                console.error("IconTabBar not found.");
            }
        },
    });
  });