
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "com/ingenx/qrmappingdashboard/utils/HelperFunction",
], function (Controller, MessageToast, Fragment, JSONModel, MessageBox, HelperFunction) {
    "use strict";
    let ocidValue = "";
    let selectedDealerName = "";
    let materialQty = "";
    let itemMaterial = ""
    return Controller.extend("com.ingenx.qrmappingdashboard.controller.SalesOrderCreation", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter()
            oRouter.getRoute("onRouteCreateSalesOrder").attachPatternMatched(this._loadSalesOrderType, this);
        },

         // load sales order type data
        _loadSalesOrderType :async function(){
            this._busyDialog =new sap.m.BusyDialog({
                title : "Processing..."
            })
            let oData =await HelperFunction._getSingleEntityData(this,"getDistinctOrderType")
            let salesOrderModel = new JSONModel(oData)
            this.getView().setModel(salesOrderModel,"salesOrderTypeModel")
        },
        
       // open dealer value help dialog 
        onCustomerValueHelp: function () {
            HelperFunction._openValueHelpDialog(this, "customerValueHelpValueHelp", "com.ingenx.qrmappingdashboard.fragments.soCustomer")
        },

        //dealer value help Search method 
        onCustomerValueHelpSearch: function (oEvent) {
            HelperFunction._valueHelpLiveSearch(oEvent, "Kunnr")
        },

        //dealer value help selection method
        onCustomerVendorValueConfirmItem: async function (oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let dealerDesc = this.byId("dealerDessc");
            if (oSelectedItem) {
                let sSelectedDealerNo = oSelectedItem.getTitle();
                this.getView().byId("salesOrder_dealer").setValue(sSelectedDealerNo);
                let selectedDealerName = oSelectedItem.getDescription();
                if (dealerDesc) {
                    dealerDesc.setVisible(true);
                    dealerDesc.setValue(selectedDealerName);
                } else {
                    console.warn("Dealer name field not found");
                }        
                let sOrderType = this.getView().byId("salesOrder_salesOrderType").getValue();        
                if (sOrderType && sSelectedDealerNo) {
                    try {
                        let oData = await this._getSingleEntityDataWithMulitpleParam(sOrderType, sSelectedDealerNo);
                        
                        if (oData.length > 0) {
                            let { DistChannel, DistchaText } = oData[0].DistChannels[0];
                            let { Division, DivText } = oData[0].Divisions[0];
                            let { SalesOrg, salesorgText } = oData[0].SalesOrgs[0];
        
                            this.setValueInInputFields([
                                { "salesOrder_distChannel": DistChannel },
                                { "salesOrder_distChannelDesc": DistchaText },
                                { "salesOrder_division": Division },
                                { "salesOrder_divisionDesc": DivText },
                                { "salesOrder_salesOrg": SalesOrg },
                                { "salesOrder_salesOrgDesc": salesorgText }
                            ]);
        
                            let orderTypeModel3 = new JSONModel(oData[0].Plants);
                            this.getView().setModel(orderTypeModel3, "plantDataModel");
        
                            this.byId("salesOrder_distChannelDesc").setVisible(true);
                            this.byId("salesOrder_salesOrgDesc").setVisible(true);
                            this.byId("salesOrder_divisionDesc").setVisible(true);
                        }
                    } catch (error) {
                        console.error("Error occurred while fetching data:", error);
                    }
                } else {
                    console.warn("Both Sales Order Type and Dealer must be selected before fetching data.");
                }
            }
        
            oEvent.getSource().getBinding("items").filter([]);
        },        

        setValueInInputFields: function (inputData) {
            if (Array.isArray(inputData)) {
                inputData.forEach(item => {
                    let inputId = Object.keys(item)[0]; 
                    let inputValue = item[inputId]; 
                    
                    let oInputField = this.getView().byId(inputId);
                    if (oInputField) {
                        oInputField.setValue(inputValue); 
                    } else {
                        console.warn("Input field with ID", inputId, "not found");
                    }
                });
            } else {
                console.warn("Invalid input data passed to setValueInInputFields");
            }
        },        
        //open plant value help dialog 
        onPlantTypeValueHelp: function () {
            HelperFunction._openValueHelpDialog(this, "plantValueHelpValueHelp", "com.ingenx.qrmappingdashboard.fragments.soPlant")
        },

        // plant value help search method
        onplantValueHelpSearch: function (oEvent) {
            HelperFunction._valueHelpLiveSearch(oEvent, "Plant")
        },

        // plant value help selection method
        onplantValueConfirmItem: function (oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let dealerDesc = this.byId("plantDesc")
            if (oSelectedItem) {
                let sSelectedDealerNo = oSelectedItem.getTitle();
                let selectedPlantName = oSelectedItem.getDescription();
                this.getView().byId("salesOrder_plant").setValue(sSelectedDealerNo);
                dealerDesc ? dealerDesc.setVisible(true) && dealerDesc.setValue(selectedPlantName) : console.warn("Plant Desc field not Found")
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

       // open sales order type value help   
        onSalesOrderTypeValueHelp: function () {
            HelperFunction._openValueHelpDialog(this, "salesOrgValueHelpValueHelp", "com.ingenx.qrmappingdashboard.fragments.soType")
        },

       // oder type value help searching method
        onsalesOrgValueHelpSearch: function (oEvent) {
            HelperFunction._valueHelpLiveSearch(oEvent, "SalesOrderType")
        },

        // open sales org value help
        onSalesOrgValueHelp : function(){
            HelperFunction._openValueHelpDialog(this, "onSalesFragment", "com.ingenx.qrmappingdashboard.fragments.soSalesOrg")
        },

        // open disribution value help 
        onDistributionTypeValueHelp : function(){
            HelperFunction._openValueHelpDialog(this, "onDistributionFragment", "com.ingenx.qrmappingdashboard.fragments.sodistchannel")
        },
        
        //select item of dist value help
        ondistchannelValueConfirmItem: function(oEvent){
            // HelperFunction._valueHelpSelectedValue(oEvent,this,"salesOrder_distChannel")
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let distDesc = this.byId("salesOrder_distChannelDesc")
            if (oSelectedItem) {
                let selectDist = oSelectedItem.getTitle();
                let selectDistDesc = oSelectedItem.getDescription();
                this.getView().byId("salesOrder_distChannel").setValue(selectDist);
                distDesc ? distDesc.setVisible(true) && distDesc.setValue(selectDistDesc) : console.warn("Plant Desc field not Found")
            }
            oEvent.getSource().getBinding("items").filter([]);
        },
        // open division value help 
        onDivisionValueHelp : function(){
            HelperFunction._openValueHelpDialog(this, "onDivisionFragment", "com.ingenx.qrmappingdashboard.fragments.soDivision")
        },
        // select item of division value help 
        ondivisionValueConfirmItem: function(oEvent){
            // HelperFunction._valueHelpSelectedValue(oEvent,this,"salesOrder_division")
            let oSelect = oEvent.getParameter("selectedItem")
            let divInput = this.byId("salesOrder_divisionDesc")
            if(oSelect){
                let divValue = oSelect.getTitle()
                let divDesc = oSelect.getDescription()
                this.getView().byId("salesOrder_division").setValue(divValue);
                divDesc?divInput.setVisible(true) && divInput.setValue(divDesc):console.log("dist desc not found")
            }
        },

        // select item of sales org value 
        onsalesOrgValueConfirmItem: function(oEvent){
            // HelperFunction._valueHelpSelectedValue(oEvent,this,"salesOrder_salesOrg")
            let oSelect = oEvent.getParameter("selectedItem")
            let salesOrdDescInput = this.byId("salesOrder_salesOrgDesc")
            if(oSelect){
                let salesOrgValue = oSelect.getTitle()
                let salesOrgValueDesc = oSelect.getDescription()
                this.byId("salesOrder_salesOrg").setValue(salesOrgValue)
                salesOrgValueDesc ? salesOrdDescInput.setVisible(true) && salesOrdDescInput.setValue(salesOrgValueDesc) : console.log("desc not found")
            }
        },
      

        // order type value help selection method
        onsalesTypeValueConfirmItem: function (oEvent) {
            let sOrderType = HelperFunction._valueHelpSelectedValue(oEvent,this,"salesOrder_salesOrderType");
            let sDealer = this.getView().byId("salesOrder_dealer").getValue();
        
            if (sOrderType && sDealer) {
                this._getSingleEntityDataWithMulitpleParam(sOrderType, sDealer).then(oData => {
                    if (oData.length > 0) {
                        let { DistChannel, DistchaText } = oData[0].DistChannels[0];
                        let { Division, DivText } = oData[0].Divisions[0];
                        let { SalesOrg, salesorgText } = oData[0].SalesOrgs[0];
        
                        this.setValueInInputFields([
                            { "salesOrder_distChannel": DistChannel },
                            { "salesOrder_distChannelDesc": DistchaText },
                            { "salesOrder_division": Division },
                            { "salesOrder_divisionDesc": DivText },
                            { "salesOrder_salesOrg": SalesOrg },
                            { "salesOrder_salesOrgDesc": salesorgText }
                        ]);
        
                        let orderTypeModel3 = new JSONModel(oData[0].Plants);
                        this.getView().setModel(orderTypeModel3, "plantDataModel");
        
                        this.byId("salesOrder_distChannelDesc").setVisible(true);
                        this.byId("salesOrder_salesOrgDesc").setVisible(true);
                        this.byId("salesOrder_divisionDesc").setVisible(true);
                    }
                }).catch(error => console.error("Error while fetching data:", error));
            } else {
                console.warn("Both Sales Order Type and Dealer must be selected.");
            }
        },        

        _getSingleEntityDataWithMulitpleParam: async function (orderType, dealer) {
            if (orderType && dealer) {
                let url = "getSalesOrderTypevalues";
                let oModel = this.getOwnerComponent().getModel();
                let oBindList = oModel.bindList(`/${url}(SalesOrderType='${orderType}',Dealer='${dealer}')`);
        
                try {
                    let oContext = await oBindList.requestContexts(0, Infinity);
                    let oData = oContext.map(context => context.getObject());
        
                    if (oData.length === 0) {
                        sap.m.MessageToast.show("Data Not Found");
                        return [];
                    }
                    return oData;
                } catch (error) {
                    console.error(`Error occurred while reading data from the '${url}' entity:`, error);
                    return [];
                }
            } else {
                console.warn("Sales Order Type and Dealer must be selected.");
                return [];
            }
        },        

        // Submit sales order data 
        onClickSumbitButton:async function () {
        
            try { 
                let inputFields = ["salesOrder_salesOrg", "salesOrder_salesOrderType", "salesOrder_salesOrderDesc",
                    "salesOrder_distChannel", "salesOrder_division","salesOrder_dealer", "salesOrder_plant"
                ]
                this._busyDialog.open();              
                let fieldValues =await HelperFunction._getInputValues(this,inputFields)
                let [salesOrg,sOrderType,orderDesc,sDistChannel,sDivision,sDealer,sPlant] = fieldValues
                let oPayload = {
                        "SalesOrderType": sOrderType || "",
                        "PurchaseOrderByCustomer":orderDesc ||"",
                        "SalesOrganization": salesOrg || "",
                        "DistributionChannel": sDistChannel || "",
                        "OrganizationDivision": sDivision || "",
                        "SoldToParty": sDealer || "",
                         "to_Item": [
                         {
                        "Material": itemMaterial,
                        "PurchaseOrderByCustomer":orderDesc ||"",
                        "RequestedQuantity": materialQty || "",
                        "ProductionPlant": sPlant || "",
                        "StorageLocation": "",
                        }]
                    }
                    
                this._sendToBackend(oPayload,inputFields);
            }
            catch (error) {
                console.error("Error in onClickSumbitButton:", error);
                sap.m.MessageToast.show("Failed to submit production order.");
            }
        },

        inputFieldHide : function(inputIDs){
             if(Array.isArray(inputIDs)){
               inputIDs.forEach(id=>{
                let input = this.byId(id)
                input ? input.setVisible(false) : console.log(`ID - ${id} not Found`)
               })
             }
             return []
        },
               


        //  used to send the payload on entity and calling from onClickSumbitButton method
        _sendToBackend:async function (oPayload,inputFields) {
            try {
                let descInput = ["dealerDessc","salesOrder_distChannelDesc","plantDesc","salesOrder_salesOrgDesc","salesOrder_divisionDesc"]
                let oModel = this.getOwnerComponent().getModel();
                let oBindList = oModel.bindList("/A_SalesOrder");

                oBindList.create(oPayload, true);
                oBindList.attachCreateCompleted((oEvent) => {
                    let params = oEvent.getParameters();

                    if (params.success) {
                        let response = params.context.getObject();
                        let SalesOrder = response.SalesOrder;

                        sap.m.MessageBox.success("Sales Order: " + SalesOrder, {
                            title: "Sales Order Created",
                            onClose:async () => {
                                await this._onUpdateOcData(SalesOrder,oPayload.SoldToParty);
                                HelperFunction._clearInputValues(this,inputFields);
                                this.inputFieldHide(descInput)
                                setTimeout(() => {
                                    this._busyDialog.close()
                                }, 1000);
                            }
                        });
                    }
                });
            } catch (error) {
                console.error("Error in _sendToBackend:", error);
                sap.m.MessageToast.show("Failed to send data to the backend.");
            }
        },

        // method is used for updating the sales order in OC and calling from onClickSumbitButton method
        _onUpdateOcData :async function(salesId,dealerID){
            let status ="Sales Order Mapped"
              let oModel = this.getOwnerComponent().getModel()
              let oBindList = oModel.bindList("/OuterContainer")
              let aFilter = new sap.ui.model.Filter({
                path: "OCID",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: ocidValue
            });
              try {
                  let aContext = await oBindList.filter(aFilter).requestContexts()
                  if(aContext.length === 0){
                    return sap.m.MessageBox.error("No matching entity found");
                  }
                  const oContext = aContext[0];
                  oContext.setProperty("SalesOrder",salesId)
                  oContext.setProperty("DealerId",dealerID)
                  oContext.setProperty("status",status)
                  oContext.setProperty("DealerName",selectedDealerName)
                  await oModel.submitBatch("updateGroup")
              } catch (error) {
                console.log("Error",error)
              }
        },

        // Box QR scanner method
        onPressBoxQrScanner: async function (oEvent) {
            if (oEvent.getParameter("cancelled")) {
                sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
                return;
            }
            const scanResult = oEvent.getParameter("text");

            if (!scanResult) {
                sap.m.MessageToast.show("No data found in scan", { duration: 1000 });
                return;
            }
            try {
                const scannedData = JSON.parse(scanResult);
                const { SerialNo, BatchID } = scannedData;

                if (!SerialNo) {
                    sap.m.MessageToast.show("Not a valid QR for scan", { duration: 1000 });
                    return;
                }
                const oModel = this.getOwnerComponent().getModel();
                const oBindList = oModel.bindList("/MaterialBox");
                const aFilter = new sap.ui.model.Filter({
                    path: "SerialNo",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: SerialNo
                });
                const aContexts = await oBindList.filter(aFilter).requestContexts();
                if (aContexts.length === 0) {
                    sap.m.MessageBox.error("No matching entity found");
                    return;
                }
                const oContext = aContexts[0];
                const ICIdData = await this._getICIdData(ocidValue);
                const idData = ICIdData.map(item => item.ICID)
                console.log("Resolved ICIdData:", idData);
                let selectedIcCode = ""
                if (idData.length > 1) {
                    let dModel = new JSONModel(idData)
                    this.getView().setModel(dModel, "dialogIcListModel")
                    await HelperFunction._openValueHelpDialog(this, "icListDialog", "com.ingenx.qrmappingdashboard.fragments.ICsListValueHelp")
                    selectedIcCode = await this.onICCodeSelection()
                }
                else{
                    selectedIcCode = idData[0]
                }
                if (selectedIcCode) {
                    oContext.setProperty("IC_ICID", selectedIcCode);
                    oContext.setProperty("BatchID", BatchID);
                    await oModel.submitBatch("updateGroup");
                    await this._loadContainerTableData();
                    setTimeout(() => {
                        sap.m.MessageToast.show("Data updated successfully!");
                    }, 0);
                }
                else {
                    console.log("Ic code is not selected")
                }
            } catch (error) {
                console.error("Error processing scan:", error);
                sap.m.MessageBox.error("An error occurred: " + (error.message || "Unknown error"));
            }
        },
        
        // method is used for opening the ic's value help
        onICCodeSelection: function () {
            return new Promise((resolve, reject) => {
                const oDialog = this.byId("icListDialog");

                if (!oDialog) {
                    reject(new Error("Dialog not found"));
                    return;
                }
                oDialog.attachConfirm((oEvent) => {
                    const sSelect = oEvent.getParameter("selectedItem");
                    if (sSelect) {
                        const sValue = sSelect.getTitle();
                        resolve(sValue);
                    } else {
                        reject(new Error("No item selected"));
                    }
                }); 
            });
        },

         // method is used to get the total IC and calling from onPressBoxQrScanner 
        _getICIdData: async function (OCid) {
            let oData = await HelperFunction._getSingleEntityData(this,"InnerContainer")
            if(OCid){
                try {
                    let filterdIC = oData.filter(item=>item.OC_OCID === OCid);
                    return filterdIC
                } catch (error) {
                    console.log("Error", error)  
                }
            }
        },

        // IC QR scanner method
        onPressIcQrScanner: async function (oEvent) {
            try {
                if (oEvent.getParameter("cancelled")) {
                    sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
                    return;
                }
                let scanResult = oEvent.getParameter("text");
                if (!scanResult) {
                    sap.m.MessageToast.show("No data found in scan", { duration: 1000 });
                    return;
                }
                let scannedData = JSON.parse(scanResult);
                let scannedICID = scannedData.ICID;
                if (!scannedICID) {
                    sap.m.MessageToast.show("Invalid scan data. ICID not found.", { duration: 1000 });
                    return;
                }
                let oModel = this.getOwnerComponent().getModel();
                let oBindList = oModel.bindList("/OuterContainer");
                let oFilter = new sap.ui.model.Filter({
                    path: "OCID",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: ocidValue
                });
                oBindList.filter([oFilter]);
                oBindList.requestContexts().then(async (aContexts) => {
                    if (!aContexts.length) {
                        sap.m.MessageBox.error("No matching OuterContainer found for the given Sales Order.");
                        return;
                    }
                    let oContext = aContexts[0];
                    let oData = oContext.getObject();
                    let sOCQRCode = oData.OCQRCode;
                    let sOCQRCodeURL = oData.OCQRCodeURL;
                    let oBindList2 = oModel.bindList("/InnerContainer");
                    let aFilter = new sap.ui.model.Filter({
                        path: "ICID",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: scannedICID
                    });
                    oBindList2.filter(aFilter).requestContexts().then((aContexts) => {
                        if (aContexts.length === 0) {
                            sap.m.MessageBox.error("No matching entity found for the given filter.");
                            return;
                        }
                        let oContext = aContexts[0];
                        oContext.setProperty("OC_OCID", ocidValue);
                        oContext.setProperty("OC_OCQRCode", sOCQRCode);
                        oContext.setProperty("OC_OCQRCodeURL", sOCQRCodeURL);
                        oContext.setProperty("SalesOrder", "");
                        oModel.submitBatch("updateGroup").then(
                            async() => {
                                await this._loadContainerTableData()
                                setTimeout(() => {
                                    sap.m.MessageToast.show("Data updated successfully!");
                                }, 0);
                            },
                            (oError) => {
                                console.error("Error updating data:", oError);
                                sap.m.MessageBox.error("Error occurred: " + (oError.message || "Unknown error."));
                            }
                        );
                    }).catch((error) => {
                        console.error("Error requesting contexts:", error);
                        sap.m.MessageBox.error("Failed to retrieve data: " + error.message);
                    });
                }).catch((oError) => {
                    console.error("Error requesting contexts:", oError);
                    sap.m.MessageBox.error("Failed to retrieve data: " + oError.message);
                });
            } catch (e) {
                console.error("Error in onScanSuccess:", e);
                sap.m.MessageBox.error(e.message);
            }
        },

        // OC QR Scanner method
        onPressOcQrScanner:async function (oEvent) {
            this._displayTable = this.byId("salesOrderCreate_Table")
            if (oEvent.getParameter("cancelled")) {
                sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
            } else {
                let scanResult = oEvent.getParameter("text");
                if (scanResult) {
                    let scannedData = JSON.parse(scanResult);
                    let { OCID } = scannedData
                    ocidValue = OCID
                    this._displayTable.setBusy(true)
                    await this._loadContainerTableData()
                } else {
                    sap.m.MessageToast.show("No data found in scan", { duration: 1000 });

                }
            }
        },

        // Display the OC's data inside table
        _loadContainerTableData: async function () {
            if (ocidValue) {
                let oModel = this.getOwnerComponent().getModel();
                let oBindList = oModel.bindList(`/getScannedOCData(OCID='${ocidValue}')`)
                try {
                    let oContext = await oBindList.requestContexts(0, Infinity)
                    let oData = oContext.map(context => context.getObject())
                    let allOCIDData = oData[0];
                    let ocId = allOCIDData.OCID;
                    let pOrder = allOCIDData.ProductionOrder || "";
                    let mfgDate = allOCIDData.ManufactureDt || "";
                    let expDate = allOCIDData.ExpiryDt || "";
                    let BatchID = allOCIDData.BatchID || "";
                    let lMaterial = allOCIDData.Material || "";
                    itemMaterial = lMaterial
                    let result = [];
                    if (allOCIDData.ICs && allOCIDData.ICs.length > 0) {
                        result = allOCIDData.ICs.flatMap(ic => {
                            if (ic.Boxes && ic.Boxes.length > 0) {
                                return ic.Boxes.map(box => ({
                                    ICID: ic.ICID,
                                    ICQRCode: ic.ICQRCode,
                                    BoxSerialNo: box.SerialNo,
                                    BoxQRCode: box.BoxQRCode,
                                    pOrder,
                                    mfgDate,
                                    expDate,
                                    BatchID,
                                    lMaterial,
                                    ocId,
                                }));
                            } else {
                                return {
                                    ICID: ic.ICID,
                                    ICQRCode: ic.ICQRCode,
                                    ocId
                                };
                            }
                        });
                    } else {
                        result.push({
                            ocId
                        });
                    }
                    let filterQty = result.map(item=>item.BoxSerialNo)
                    materialQty = filterQty.length
                    let tableModel = new JSONModel(result)
                    this.getView().setModel(tableModel, "salesOrderModelData")
                    this._displayTable.setBusy(false)
                } catch (error) {
                    console.log(error)
                }
            }
        },
    });
});