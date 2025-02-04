const cds = require('@sap/cds');

module.exports = async (srv) => {

    const externalService = await cds.connect.to('QrGeneratorApp_edmx'); 
    srv.on('READ', 'MaterialBox', async (req) => {
        try {
            const query = req.query;
    
            const result = await externalService.run(query);
    
            return result; 
        } catch (err) {
            console.error('Error fetching data from external service:', err);
            req.error(500, 'Failed to fetch data from external service.');
        }
    });
    srv.on('READ', 'InnerContainer', async (req) => {
        try {
            const query = req.query;
    
            const result = await externalService.run(query);
    
            return result; 
        } catch (err) {
            console.error('Error fetching data from external service:', err);
            req.error(500, 'Failed to fetch data from external service.');
        }
    });
    srv.on('READ', 'OuterContainer', async (req) => {
        try {
            const query = req.query;
    
            const result = await externalService.run(query);
    
            return result; 
        } catch (err) {
            console.error('Error fetching data from external service:', err);
            req.error(500, 'Failed to fetch data from external service.');
        }
    });
   
    srv.on('UPDATE', 'MaterialBox', async (req) => {
        try {
            const { SerialNo, BatchID, IC_ICID } = req.data;
            console.log("data",req.data);
            
    
            if (!BatchID || !SerialNo || !IC_ICID) {
                return req.reject(400, 'BatchID, SerialNo, and IC_ICID are required.');
            }
    
            const existingBox = await externalService.run(
                SELECT.from('MaterialBox').where({ SerialNo })
            );
    
            if (!existingBox || existingBox.length === 0) {
                return req.reject(404, `MaterialBox with SerialNo: ${SerialNo} not found.`);
            }
    
            const { BoxQRCode, IC_ICID: existingICID } = existingBox[0];
    
            if (existingICID) {
                return req.reject(400, `MaterialBox with SerialNo: ${SerialNo} already has IC assigned.`);
            }
    
            const existingIC = await externalService.run(
                SELECT.from('InnerContainer').where({ ICID: IC_ICID })
            );
    
            if (!existingIC || existingIC.length === 0) {
                return req.reject(404, `InnerContainer with ICID: ${IC_ICID} not found.`);
            }
    
            const { ICQRCode, ICQRCodeURL, OC_OCID } = existingIC[0];

            const existingOC = await externalService.run(
                SELECT.from('OuterContainer').where({ OCID: OC_OCID })
            );
            const { OCQRCodeURL, OCQRCode } = existingOC[0];
            

            
    
            await externalService.run([
                UPDATE('InnerContainer')
                    .set({ BatchID })
                    .where({ ICID: IC_ICID,ICQRCode:existingIC[0].ICQRCode,ICQRCodeURL:existingIC[0].ICQRCodeURL }),
    
                UPDATE('OuterContainer')
                    .set({ BatchID })
                    .where({ OCID: OC_OCID,OCQRCodeURL:existingOC[0].OCQRCodeURL,OCQRCode:existingOC[0].OCQRCode }),
    
                UPDATE('MaterialBox')
                    .set({
                        IC_ICID,
                        IC_ICQRCode: ICQRCode,
                        IC_ICQRCodeURL: ICQRCodeURL
                    })
                    .where({ SerialNo, BoxQRCode })
            ]);
    
            return {
                message: `Updates completed successfully for ICID: ${IC_ICID} and SerialNo: ${SerialNo}`
            };
        } catch (error) {
            console.error('Error updating MaterialBox:', error.message);
            req.reject(500, error.message);
        }
    });
    
    srv.on('UPDATE', 'InnerContainer', async (req) => {
        try {
            const { ICID, OC_OCID, OC_OCQRCode, OC_OCQRCodeURL } = req.data;
            console.log("data",req.data);
            
    
            if (!ICID) {
                return req.reject(400, 'ICID is required.');
            }
    
            const existingIC = await externalService.run(
                SELECT.one.from('InnerContainer').where({ ICID })
            );
    
            if (!existingIC) {
                return req.reject(404, `InnerContainer with ICID: ${ICID} not found.`);
            }
    
            if (existingIC.OC_OCID && existingIC.OC_OCID.trim() !== '') {
                return req.reject(400, `InnerContainer with ICID: ${ICID} already has OC assigned.`);
            }
            console.log(existingIC.ICQRCode ,existingIC.ICQRCodeURL);
            
            const updateResult = await externalService.run(
                UPDATE('InnerContainer')
                    .set({
                        OC_OCID: OC_OCID,
                        OC_OCQRCode: OC_OCQRCode,
                        OC_OCQRCodeURL: OC_OCQRCodeURL
                    })
                    .where({ ICID:ICID,ICQRCode:existingIC.ICQRCode,ICQRCodeURL:existingIC.ICQRCodeURL })
            );
    
            if (updateResult === 0) {
                return req.reject(500, `Failed to update InnerContainer for ICID: ${ICID}`);
            }
    
            return {
                message: `InnerContainer updated successfully for ICID: ${ICID}`
            };
    
        } catch (error) {
            console.error('Error updating InnerContainer:', error.message);
            req.reject(500, error.message);
        }
    });
    srv.on('UPDATE', 'OuterContainer', async (req) => {
        try {
            const { OCID, SalesOrder, DealerId, DealerName,status	 } = req.data;
    
            if (!OCID) {
                return req.reject(400, 'OCID is required.');
            }
    
            if (!SalesOrder) {
                return req.reject(400, 'SalesOrder is required.');
            }
    
            const existingOC = await externalService.run(
                SELECT.one.from('OuterContainer').where({ OCID })
            );
    
            if (!existingOC) {
                return req.reject(404, `OuterContainer with OCID: ${OCID} not found.`);
            }
    
            if (existingOC.SalesOrder && existingOC.SalesOrder.trim() !== '') {
                return req.reject(400, `OuterContainer already mapped to SalesOrder: ${existingOC.SalesOrder}`);
            }
    
            const sOCQRCode = existingOC.OCQRCode;
            const sOCQRCodeURL = existingOC.OCQRCodeURL;
    
            const updateOCResult = await externalService.run(
                UPDATE('OuterContainer')
                    .set({
                        SalesOrder: SalesOrder,
                        DealerId: DealerId,
                        DealerName: DealerName,
                        status:status
                    })
                    .where({ OCID, OCQRCodeURL: sOCQRCodeURL, OCQRCode: sOCQRCode })
            );
    
            if (updateOCResult === 0) {
                return req.reject(500, `Failed to update OuterContainer`);
            }
    
            const existingICs = await externalService.run(
                SELECT.from('InnerContainer').where({ OC_OCID: OCID })
            );
    
            if (!existingICs.length) {
                return req.reject(404, `No InnerContainers found for OCID: ${OCID}`);
            }
    
            for (const innerContainer of existingICs) {
                const updateICResult = await externalService.run(
                    UPDATE('InnerContainer')
                        .set({
                            SalesOrder: SalesOrder,
                            DealerId: DealerId,
                            DealerName: DealerName
                        })
                        .where({ 
                            ICID: innerContainer.ICID, 
                            ICQRCode: innerContainer.ICQRCode, 
                            ICQRCodeURL: innerContainer.ICQRCodeURL 
                        })
                );
    
                if (updateICResult === 0) {
                    return req.reject(500, `Failed to update InnerContainer with ICID: ${innerContainer.ICID}`);
                }
    
                const existingMaterialBoxes = await externalService.run(
                    SELECT.from('MaterialBox').where({ IC_ICID: innerContainer.ICID })
                );
    
                if (!existingMaterialBoxes.length) {
                    return req.reject(404, `No MaterialBoxes found for InnerContainer with ICID: ${innerContainer.ICID}`);
                }
    
                for (const materialBox of existingMaterialBoxes) {
                    const updateMBResult = await externalService.run(
                        UPDATE('MaterialBox')
                            .set({
                                DealerId: DealerId,
                                DealerName: DealerName
                            })
                            .where({ 
                                SerialNo: materialBox.SerialNo, 
                                BoxQRCode: materialBox.BoxQRCode 
                            })
                    );
    
                    if (updateMBResult === 0) {
                        return req.reject(500, `Failed to update MaterialBox with SerialNo: ${materialBox.SerialNo}`);
                    }
                }
            }
    
            return {
                message: `OuterContainer, all linked InnerContainers, and MaterialBoxes updated successfully`
            };
    
        } catch (error) {
            console.error('Error updating OuterContainer, InnerContainers, and MaterialBoxes:', error.message);
            req.reject(500, error.message);
        }
    });
    
    
    



    
   

    // Sales order Creation javascript logics and methods
    const ZTRACKTRACE_VALUEHELP_SRV = await cds.connect.to("ZTRACKTRACE_VALUEHELP_SRV"); 
      srv.on('READ', 'ZMaterial_ValueHelp', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'Zdivision_sotrack', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'zcustomer_sotrack', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'zdistchannel_sotrack', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'zneworg', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'zplant_soTrack', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'zsalesorder_trackso', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 
      srv.on('READ', 'zsalesorderdetails_so', req => ZTRACKTRACE_VALUEHELP_SRV.run(req.query)); 


      const IRMSZAPI_SALES_ORDER_SRV = await cds.connect.to("IRMSZAPI_SALES_ORDER_SRV");
      srv.on('READ', 'A_SalesOrder', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('READ', 'A_SalesOrderItem', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('READ', 'A_SalesOrderItemPartner', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('READ', 'A_SalesOrderItemText', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('CREATE', 'A_SalesOrder', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('CREATE', 'A_SalesOrderHeaderPartner', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('CREATE', 'A_SalesOrderHeaderPrElement', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('CREATE', 'A_SalesOrderItem', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('CREATE', 'A_SalesOrderItemPartner', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));
      srv.on('CREATE', 'A_SalesOrderItemText', req => IRMSZAPI_SALES_ORDER_SRV.run(req.query));

    //   Custom Handlers code start

    srv.on('getDistinctOrderType', async (req) => {
        try {
            let query = SELECT.from('zsalesorderdetails_so')
                .columns(['SalesOrderType']);

            const result = await ZTRACKTRACE_VALUEHELP_SRV.run(query);

            if (!result || result.length === 0) {
                return req.reject(404, "No records found.");
            }

            const filteredResult = result
                .filter(item => item.SalesOrderType && item.SalesOrderType.trim() !== "")
                .map(item => item.SalesOrderType.trim());


            const uniqueSalesOrderType = Array.from(new Set(filteredResult));


            const response = uniqueSalesOrderType.map(SalesOrderType => ({ SalesOrderType }));


            return response;

        } catch (error) {
            console.error("Error in getDistinctOrderType:", error);
            return req.reject(500, "An error occurred while processing your request.");
        }
    });

    srv.on('getSalesOrderTypevalues', async (req) => {
        const { SalesOrderType } = req.data;
    
        try {
            const SalesOrderDetails = await ZTRACKTRACE_VALUEHELP_SRV.run(
                SELECT
                    .from('zsalesorderdetails_so')
                    .columns(['SalesOrg', 'DistChannel', 'Division'])
                    .where({ SalesOrderType: SalesOrderType })
            );
    
            if (!SalesOrderDetails || SalesOrderDetails.length === 0) {
                return req.reject(404, "No sales order details found for the given Sales Order Type.");
            }
    
            const salesOrgSet = new Set();
            const distChannelSet = new Set();
            const divisionSet = new Set();
    
            SalesOrderDetails.forEach(detail => {
                salesOrgSet.add(detail.SalesOrg);
                distChannelSet.add(detail.DistChannel);
                divisionSet.add(detail.Division);
            });
    
            const uniqueSalesOrgs = Array.from(salesOrgSet);
            const uniqueDistChannels = Array.from(distChannelSet);
            const uniqueDivisions = Array.from(divisionSet);
    
            return {
                SalesOrgs: uniqueSalesOrgs,
                DistChannels: uniqueDistChannels,
                Divisions: uniqueDivisions
            };
    
        } catch (error) {
            console.error("Error in getSalesOrderTypevalues:", error);
            return req.reject(500, `An unexpected error occurred: ${error.message}`);
        }
    });

    srv.on('getScannedOCData', async (req) => {
        try {
            const { OCID } = req.data;

            if (!OCID) {
                return req.reject(400, "OCID is a required parameter.");
            }

            async function getOuterContainerData(OCID) {
                return externalService.run( SELECT.one
                    .from('OuterContainer')
                    .columns(['OCID', 'OCQRCode', 'OCQRCodeURL', 'BatchID', 'status'])
                    .where({ OCID }) || null);
            }

            async function getInnerContainers(OCID) {
                if (!OCID) return [];
                return externalService.run(SELECT.from('InnerContainer')
                    .columns(['ICID', 'ICQRCode', 'ICQRCodeURL', 'BatchID', 'OC_OCID'])
                    .where({ OC_OCID: OCID }) || []);
            }

            async function getMaterialBoxData(OCID, BatchID) {
                if (!OCID || !BatchID) return [];
                return externalService.run( SELECT.from('MaterialBox')
                    .columns(['IC_ICID as ICID', 'SerialNo', 'BoxQRCode', 'BoxQRCodeURL'])
                    .where({ 'IC.OC_OCID': OCID, BatchID }) || []);
            }

            async function getBatchDetails(BatchID) {
                if (!BatchID) return {};
                return ZTRACK_TRACE_SRV.run(
                    SELECT.one
                        .from('zbatchdetails_Track')
                        .columns(['ManufactureDt', 'ExpiryDt', 'ProductionOrder', 'Material'])
                        .where({ BatchNo: BatchID })
                ) || {};
            }

            const outerContainerData = await getOuterContainerData(OCID);
            if (!outerContainerData) {
                return req.reject(404, `No data found for OCID: ${OCID}`);
            }

            const BatchID = outerContainerData.BatchID;
            const innerContainers = await getInnerContainers(OCID);
            const materialBoxData = await getMaterialBoxData(OCID, BatchID);
            const batchDetails = await getBatchDetails(BatchID);

            let groupedICs = Object.values(
                materialBoxData.reduce((acc, item) => {
                    if (!acc[item.ICID]) {
                        acc[item.ICID] = {
                            ICID: item.ICID,
                            ICQRCode: null,
                            ICQRCodeURL: null,
                            Boxes: []
                        };
                    }
                    acc[item.ICID].Boxes.push({
                        SerialNo: item.SerialNo,
                        BoxQRCode: item.BoxQRCode,
                        BoxQRCodeURL: item.BoxQRCodeURL
                    });
                    return acc;
                }, {})
            );

            innerContainers.forEach((ic) => {
                const existingIC = groupedICs.find(groupedIC => groupedIC.ICID === ic.ICID);
                if (!existingIC) {
                    groupedICs.push({
                        ICID: ic.ICID,
                        ICQRCode: ic.ICQRCode,
                        ICQRCodeURL: ic.ICQRCodeURL,
                        Boxes: [] 
                    });
                } else {
                    existingIC.ICQRCode = ic.ICQRCode;
                    existingIC.ICQRCodeURL = ic.ICQRCodeURL;
                }
            });

            const response = {
                OCID: outerContainerData.OCID,
                OCQRCode: outerContainerData.OCQRCode,
                OCQRCodeURL: outerContainerData.OCQRCodeURL,
                BatchID: outerContainerData.BatchID,
                status: outerContainerData.status,
                ManufactureDt: batchDetails.ManufactureDt,
                ExpiryDt: batchDetails.ExpiryDt,
                ProductionOrder: batchDetails.ProductionOrder,
                Material: batchDetails.Material,
                ICs: groupedICs
            };

            return response;
        } catch (error) {
            console.error("Error in getScannedOCData:", error);
            return req.reject(500, error.message || "Internal Server Error");
        }
    });


        //Tracking dashboard javascript logics and methods

        srv.on('getProductionTrackingDashboardData', async (req) => {
            try {
                const { OCID } = req.data;
    
                if (!OCID) {
                    return req.reject(400, "'OCID' is a required parameter.");
                }
    
                const outerContainerData = await externalService.run(SELECT.one.from('OuterContainer')
                    .columns([
                        'OCID',
                        'OCQRCode',
                        'OCQRCodeURL',
                        'BatchID',
                        'status',
                        'DealerId',
                        'DealerName'
                    ])
                    .where({ OCID }));
    
                if (!outerContainerData) {
                    return req.reject(404, "No data found for the provided OCID.");
                }
    
                const { BatchID } = outerContainerData;
    
    
                const response = {
                    OCID: outerContainerData.OCID,
                    OCQRCode: outerContainerData.OCQRCode,
                    OCQRCodeURL: outerContainerData.OCQRCodeURL,
                    BatchID: outerContainerData.BatchID,
                    status: outerContainerData.status,
                    DealerId: outerContainerData.DealerId || "",
                    DealerName: outerContainerData.DealerName || "",
                    ManufactureDt: null,
                    ExpiryDt: null,
                    ProductionOrder: null,
                    Material: null,
                    ICs: []
                };
    
                const icData = await externalService.run( SELECT.from('MaterialBox')
                    .columns([
                        'IC_ICID as ICID',
                        'IC_ICQRCode as ICQRCode',
                        'IC_ICQRCodeURL as ICQRCodeURL',
                        'SerialNo',
                        'BoxQRCode',
                        'BoxQRCodeURL',
                        'IC.OC_OCID'
                    ])
                    .where({ 'IC.OC_OCID': OCID, BatchID }));
    
                if (icData.length > 0) {
                    const groupedICs = icData.reduce((acc, item) => {
                        if (!acc[item.ICID]) {
                            acc[item.ICID] = {
                                ICID: item.ICID,
                                ICQRCode: item.ICQRCode,
                                ICQRCodeURL: item.ICQRCodeURL,
                                Boxes: []
                            };
                        }
                        acc[item.ICID].Boxes.push({
                            SerialNo: item.SerialNo,
                            BoxQRCode: item.BoxQRCode,
                            BoxQRCodeURL: item.BoxQRCodeURL
                        });
                        return acc;
                    }, {});
                    response.ICs = Object.values(groupedICs);
                }
    
                const batchDetails = await ZTRACK_TRACE_SRV.run(
                    SELECT.one
                        .from('zbatchdetails_Track')
                        .columns(['ManufactureDt', 'ExpiryDt', 'ProductionOrder', 'Material'])
                        .where({ BatchNo: BatchID })
                );
    
                if (batchDetails) {
                    Object.assign(response, {
                        ManufactureDt: batchDetails.ManufactureDt,
                        ExpiryDt: batchDetails.ExpiryDt,
                        ProductionOrder: batchDetails.ProductionOrder,
                        Material: batchDetails.Material
                    });
                }
    
                return response;
    
            } catch (error) {
                console.error("Error in getProductionTrackingDashboardData:", error);
                return req.reject(500, error.message || "Internal Server Error");
            }
        });

        srv.on('getBatchOCValueHelp', async (req) => {
            const { BatchID, ManufactureDt } = req.data;
    
            const fetchOuterContainerDetails = async (batchNo) => {
                const results = await externalService.run( SELECT.from('OuterContainer')
                    .where({ BatchID: batchNo }));
    
                if (!results.length) {
                    return req.reject(404, `No details found for BatchID: ${batchNo}`);
                }
    
                return results.map(item => ({ OCID: item.OCID }));
            };
    
            if (BatchID) {
                return await fetchOuterContainerDetails(BatchID);
            }
    
            if (ManufactureDt) {
                const batchDetails = await ZTRACK_TRACE_SRV.run(
                    SELECT.one
                        .from('zbatchdetails_Track')
                        .columns(['BatchNo'])
                        .where({ ManufactureDt })
                );
    
                if (!batchDetails) {
                    return req.reject(404, `No BatchNo found for ManufactureDt: ${ManufactureDt}`);
                }
    
                return await fetchOuterContainerDetails(batchDetails.BatchNo);
            }
    
            return req.reject(400, `Either BatchID or ManufactureDt must be provided.`);
        });
    

      const ZTRACK_TRACE_SRV = await cds.connect.to("ZTRACK_TRACE_SRV"); 
      srv.on('READ', 'zbatchno_track', req => ZTRACK_TRACE_SRV.run(req.query)); 
      srv.on('READ', 'zbatchdetails_Track', req => ZTRACK_TRACE_SRV.run(req.query)); 




}