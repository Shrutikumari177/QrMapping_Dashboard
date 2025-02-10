sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "com/ingenx/qrmappingdashboard/utils/HelperFunction"
], (BaseController, Filter, FilterOperator, Fragment, JSONModel, HelperFunction) => {
    "use strict";

    return BaseController.extend("com.ingenx.qrmappingdashboard.controller.ProductionTrackingDashboard", {
        onInit() {

        },

        // open Batch value help dialog box
        _onDashboardBatchValueHelp: function () {


            let ocInput = this.byId("productionDashboard_ocID");
            if (ocInput) {
                ocInput.setValue("");
            }



            let shapeLayout = this.byId("dashboard_shapeLayout");
            let detailsLayout = this.byId("dashboard_ContainerDetailsLayout");


            if (shapeLayout) shapeLayout.setVisible(false);
            if (detailsLayout) detailsLayout.setVisible(false);



            HelperFunction._openValueHelpDialog(
                this,
                "_dashboardBatchIdDataFragment",
                "com.ingenx.qrmappingdashboard.fragments.batchCodeValueHelp"
            );
        },


        // open oc value help dialog box
        _onDashboardOCValueHelp: function () {
            HelperFunction._openValueHelpDialog(this, "_dashboardOCCodeFragment", "com.ingenx.qrmappingdashboard.fragments.ocCodeValueHelp")
        },

        // triggered during select an OC item from value help
        onOCValueConfirmItem: function (oEvent) {
            HelperFunction._valueHelpSelectedValue(oEvent, this, "productionDashboard_ocID")
        },

        // batch value help search code in a dialog
        onBatchValueHelpSearch: function (oEvent) {
            HelperFunction._valueHelpLiveSearch(oEvent, "BatchNo","batchValueHelpValueHelp1",this)
        },

        // oc value help search code in a dialog
        onOCValueHelpSearch: function (oEvent) {
            HelperFunction._valueHelpLiveSearch(oEvent, "OCID","ocCodeValueHelp",this)
        },


        onBatchValueConfirmItem: async function (oEvent) {

            this.selectedBatchValue = HelperFunction._valueHelpSelectedValue(oEvent, this, "productionDashboard_batchId");
            let oData = await HelperFunction._getSingleEntityDataWithParam(this, "getBatchOCValueHelp", "BatchID", this.selectedBatchValue)
            let oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel, "batchDataModel");
            console.log("model data", this.getView().getModel("batchDataModel").getData());
            const oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);
        },

        handleChange: async function (oEvent) {
            this.selectedDate = oEvent.getParameter("value");

        },

      
        _onGoButtonPress: async function () {
            let batchData = [];
            let ocIDs = [];

            if (!this._busyDialog) {
                this._busyDialog = new sap.m.BusyDialog({
                    title: "Fetching OCID"
                });
            }

            this._busyDialog.open();

            try {
                let ocValue = this.byId("productionDashboard_ocID").getValue().trim(); // Get OCID input value

                if (this.selectedBatchValue) {
                    batchData = await HelperFunction._getSingleEntityDataWithParam(
                        this, "getBatchOCValueHelp", "BatchID", this.selectedBatchValue
                    );
                } else if (this.selectedDate) {
                    batchData = await HelperFunction._getSingleEntityDataWithParam(
                        this, "getBatchOCValueHelp", "ManufactureDt", this.selectedDate
                    );
                } else {
                    sap.m.MessageToast.show("Please select either a Batch or a Date before proceeding.");
                    return;
                }

                if (!batchData || batchData.length === 0) {
                    sap.m.MessageToast.show("No OCID found");
                    return;
                }

                if (ocValue) {
                    // Filter batchData to include only the selected OCID
                    batchData = batchData.filter(item => item.OCID === ocValue);
                }

                ocIDs = batchData.map(item => item.OCID).filter(ocid => ocid);

                if (ocIDs.length === 0) {
                    sap.m.MessageToast.show("No OCID found for the selected Batch or Manufacture Date.");
                    return;
                }

                let ocDataArray = [];

                for (let ocID of ocIDs) {
                    let encodedOcId = encodeURIComponent(ocID);
                    let ocData = await HelperFunction._getSingleEntityDataWithParam(
                        this, "getProductionTrackingDashboardData", "OCID", encodedOcId
                    );
                    ocDataArray.push(...ocData);
                }

                if (ocDataArray.length === 0) {
                    sap.m.MessageToast.show("No production tracking data found for the selected OCIDs.");
                    return;
                }

                let orderModel = new JSONModel(ocDataArray);
                this.getView().setModel(orderModel, "orderModel");
                console.log("Final Order Model:", ocDataArray);

                let shapeLayout = this.byId("dashboard_shapeLayout");
                let detailsLayout = this.byId("dashboard_ContainerDetailsLayout");

                if (detailsLayout) {
                    detailsLayout.setVisible(false);
                }

                if (shapeLayout) {
                    shapeLayout.setVisible(true);
                } else {
                    console.warn("Shape Layout not found");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                sap.m.MessageToast.show("An error occurred while fetching data.");
            } finally {
                this._busyDialog.close();
            }
        },













        // Searching method based on icCode or batch no in IC table
        onSearchOCItem: function (oEvent) {
            HelperFunction.performTableSearchMethod(this, oEvent, "dashboardOCproduct_ProductTable", ["ICID", "BatchID"]);
        },

        // Searching method based on serial no or batch no in Box table  
        onSearchBoxItem: function (oEvent) {
            HelperFunction.performTableSearchMethod(this, oEvent, "detailsFragemnt_boxTable", ["SerialNo", "BatchID"]);
        },

        // using for display count in icontabbar
        countFormatter: function (value) {
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
            const oIconTabBar = oView.byId("idIconTabBar");
            if (oIconTabBar) {
                const oBoxDetailsTab = oView.byId("tankDialogDetailsTab");
                if (oBoxDetailsTab) {
                    oBoxDetailsTab.setEnabled(true);
                }
                oIconTabBar.setSelectedKey("initial");
            } else {
                console.error("IconTabBar not found.");
            }
            const oData = oContext.getObject();
            if (oData) {
                oData.ICs?.forEach((ic) => {
                    Object.assign(ic, {
                        ManufactureDt: oData.ManufactureDt || "",
                        ExpiryDt: oData.ExpiryDt || "",
                        ProductionOrder: oData.ProductionOrder || "",
                        BatchID: oData.BatchID || "",
                        Material: oData.Material
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
        _onOCQrCodeLink: function (oEvent) {
            var oModel = this.getView().getModel("fragmentModel");
            var oData = oModel.getData();
            let BoxQRCodeURL = oData.OCQRCodeURL;
            let oDialog = this.byId("dashboarDeatislDetailQrDialog");
            let oImage = this.byId("dashboardDetailsqrImage");
            oImage.setSrc(BoxQRCodeURL);
            oDialog.open();
        },



        // display box qr code dialog
        onDashboardBoxQrCode: function (oEvent) {
            this.openQrDialogBox(oEvent, "boxModelData", "BoxQRCodeURL")
        },

        // display IC qr dialog box
        onDashboardICQrCode: function (oEvent) {
            this.openQrDialogBox(oEvent, "fragmentModel", "ICQRCodeURL")
        },



        // open qr dialog box
        openQrDialogBox: function (oEvent, modelName, propertyName) {
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