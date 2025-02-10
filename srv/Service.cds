using ZTRACKTRACE_VALUEHELP_SRV from './external/ZTRACKTRACE_VALUEHELP_SRV.cds';
using IRMSZAPI_SALES_ORDER_SRV from './external/IRMSZAPI_SALES_ORDER_SRV.cds';
using ZTRACK_TRACE_SRV from './external/ZTRACK_TRACE_SRV.cds';
using {QrGeneratorApp_edmx} from './external/QrGeneratorApp.edmx';


service qrmappingservice {


    function getDistinctOrderType(SalesOrderType : String)               returns array of {
        SalesOrderType : String;
    };

    function getSalesOrderTypevalues(SalesOrderType : String, Dealer:String)            returns array of {
        SalesOrg : String;
        DistChannel : String;
        Division : String;
        Plant :String;
    };

    function getScannedOCData(OCID : String)                             returns array of {
        OCID : String;
        OCQRCode : String;
        OCQRCodeURL : String;
        BatchID : String;
        status : String;
        ManufactureDt : DateTime;
        ExpiryDt : DateTime;
        ProductionOrder : Int64;
        Material : String;
        ICs : array of {
            ICID : String;
            ICQRCode : String;
            ICQRCodeURL : String;
            Boxes : array of {
                SerialNo : String;
                BoxQRCode : String;
                BoxQRCodeURL : String;
            };
        };
    };

    function getProductionTrackingDashboardData(OCID : String)           returns array of {
        OCID : String;
        OCQRCode : String;
        OCQRCodeURL : String;
        BatchID : String;
        status : String;
        VendorId : String;
        VendorName : String;
        ManufactureDt : DateTime;
        ExpiryDt : DateTime;
        ProductionOrder : Int64;
        SalesOrder:String;
        Material : String;
        RetailerId:String;
        RetailerTaxNo:String;
        ICs : array of {
            ICID : String;
            ICQRCode : String;
            ICQRCodeURL : String;
            RetailerId:String;
            RetailerTaxNo:String;
            Boxes : array of {
                SerialNo : String;
                BoxQRCode : String;
                BoxQRCodeURL : String;
                 RetailerId:String;
                RetailerTaxNo:String;
            };
        };
    };

    function getBatchOCValueHelp(BatchID : String, ManufactureDt : Date) returns array of {
        OCID : String;
    };

    
    entity A_SalesOrderItem            as
        projection on IRMSZAPI_SALES_ORDER_SRV.A_SalesOrderItem {
            key SalesOrder,
            key SalesOrderItem,
                HigherLevelItem,
                SalesOrderItemCategory,
                SalesOrderItemText,
                PurchaseOrderByCustomer,
                Material,
                MaterialByCustomer,
                PricingDate,
                RequestedQuantity,
                RequestedQuantityUnit,
                ItemGrossWeight,
                ItemNetWeight,
                ItemWeightUnit,
                ItemVolume,
                ItemVolumeUnit,
                TransactionCurrency,
                NetAmount,
                MaterialGroup,
                MaterialPricingGroup,
                Batch,
                ProductionPlant,
                StorageLocation,
                DeliveryGroup,
                ShippingPoint,
                ShippingType,
                DeliveryPriority,
                IncotermsClassification,
                IncotermsTransferLocation,
                IncotermsLocation1,
                IncotermsLocation2,
                CustomerPaymentTerms,
                SalesDocumentRjcnReason,
                ItemBillingBlockReason,
                WBSElement,
                ProfitCenter,
                ReferenceSDDocument,
                ReferenceSDDocumentItem,
                SDProcessStatus,
                DeliveryStatus,
                OrderRelatedBillingStatus,
                RequirementSegment
        };

    entity A_SalesOrderHeaderPartner   as
        projection on IRMSZAPI_SALES_ORDER_SRV.A_SalesOrderHeaderPartner {
            key SalesOrder,
            key PartnerFunction,
                Customer,
                Supplier,
                Personnel,
                ContactPerson
        };

    entity A_SalesOrderHeaderPrElement as
        projection on IRMSZAPI_SALES_ORDER_SRV.A_SalesOrderHeaderPrElement {
            key SalesOrder,
            key PricingProcedureStep,
            key PricingProcedureCounter,
                ConditionType,
                PricingDateTime,
                ConditionCalculationType,
                ConditionBaseValue,
                ConditionRateValue,
                ConditionCurrency,
                ConditionQuantity,
                ConditionQuantityUnit,
                ConditionCategory,
                ConditionIsForStatistics,
                PricingScaleType,
                ConditionOrigin,
                IsGroupCondition,
                ConditionRecord,
                ConditionSequentialNumber,
                TaxCode,
                WithholdingTaxCode,
                CndnRoundingOffDiffAmount,
                ConditionAmount,
                TransactionCurrency,
                ConditionControl,
                ConditionInactiveReason,
                ConditionClass,
                PrcgProcedureCounterForHeader,
                FactorForConditionBasisValue,
                StructureCondition,
                PeriodFactorForCndnBasisValue,
                PricingScaleBasis,
                ConditionScaleBasisValue,
                ConditionScaleBasisUnit,
                ConditionScaleBasisCurrency,
                CndnIsRelevantForIntcoBilling,
                ConditionIsManuallyChanged,
                ConditionIsForConfiguration,
                VariantCondition
        };

    entity A_SalesOrderItemPartner     as
        projection on IRMSZAPI_SALES_ORDER_SRV.A_SalesOrderItemPartner {
            key SalesOrder,
            key SalesOrderItem,
            key PartnerFunction,
                Customer,
                Supplier,
                Personnel,
                ContactPerson
        };

    entity A_SalesOrderItemText        as
        projection on IRMSZAPI_SALES_ORDER_SRV.A_SalesOrderItemText {
            key SalesOrder,
            key SalesOrderItem,
            key Language,
            key LongTextID,
                LongText
        };


    entity ZMaterial_ValueHelp         as
        projection on ZTRACKTRACE_VALUEHELP_SRV.ZMaterial_ValueHelp {
            key Material
        };

    entity Zdivision_sotrack           as
        projection on ZTRACKTRACE_VALUEHELP_SRV.Zdivision_sotrack {
            key Division
        };

    entity zcustomer_sotrack           as
        projection on ZTRACKTRACE_VALUEHELP_SRV.zcustomer_sotrack {
            key Kunnr,
                Description
        };

    entity zdistchannel_sotrack        as
        projection on ZTRACKTRACE_VALUEHELP_SRV.zdistchannel_sotrack {
            key DistChannel
        };

   

    entity zplant_soTrack              as
        projection on ZTRACKTRACE_VALUEHELP_SRV.zplant_soTrack {
            key StorageLocation,
            key Plant,
                Description
        };

    entity zsalesorder_trackso         as
        projection on ZTRACKTRACE_VALUEHELP_SRV.zsalesorder_trackso {
            key SalesOrder,
                Description
        };

      entity zsalesorderdetails_so as projection on ZTRACKTRACE_VALUEHELP_SRV.zsalesorderdetails_so
    {        key SalesOrderType, key SalesOrg, key DistChannel, key Division, key Auart, Kopgr, salesorgText, DistchaText, DivText     }   

    entity A_SalesOrder                as
        projection on IRMSZAPI_SALES_ORDER_SRV.A_SalesOrder {
            key SalesOrder,
                SalesOrderType,
                SalesOrganization,
                DistributionChannel,
                OrganizationDivision,
                SalesGroup,
                SalesOffice,
                SalesDistrict,
                SoldToParty,
                CreationDate,
                CreatedByUser,
                LastChangeDate,
                LastChangeDateTime,
                PurchaseOrderByCustomer,
                CustomerPurchaseOrderType,
                CustomerPurchaseOrderDate,
                SalesOrderDate,
                TotalNetAmount,
                TransactionCurrency,
                SDDocumentReason,
                PricingDate,
                RequestedDeliveryDate,
                ShippingCondition,
                CompleteDeliveryIsDefined,
                ShippingType,
                HeaderBillingBlockReason,
                DeliveryBlockReason,
                IncotermsClassification,
                IncotermsTransferLocation,
                IncotermsLocation1,
                IncotermsLocation2,
                IncotermsVersion,
                CustomerPaymentTerms,
                PaymentMethod,
                AssignmentReference,
                ReferenceSDDocument,
                ReferenceSDDocumentCategory,
                CustomerTaxClassification1,
                TaxDepartureCountry,
                VATRegistrationCountry,
                SalesOrderApprovalReason,
                SalesDocApprovalStatus,
                OverallSDProcessStatus,
                TotalCreditCheckStatus,
                OverallTotalDeliveryStatus,
                OverallSDDocumentRejectionSts,
                to_Item,
                to_Partner
        }

    entity zbatchno_track              as
        projection on ZTRACK_TRACE_SRV.zbatchno_track {
            key BatchNo
        }

    entity zbatchdetails_Track         as
        projection on ZTRACK_TRACE_SRV.zbatchdetails_Track {
            key BatchNo,
            key SerialNo,
                Material,
                aufnr,
                ManufactureDt,
                ExpiryDt,
                ProductionOrder,
                OrderList
        };
         entity zsalesheaddata_tracktrace as projection on ZTRACKTRACE_VALUEHELP_SRV.zsalesheaddata_tracktrace
    {        key SalesOrderType, key Plant, key Sold_Party, key Sales_org, key Chnl_Dis, key Division, Sold_Party_Text, Patnr_Fn, Partnr_Fn_Text, Ship_Party, Ship_Party_Text, Sales_org_Text, Chnl_Dis_Text, PlantDesc, Division_Text     }    
;

    entity MaterialBox                 as projection on QrGeneratorApp_edmx.MaterialBox;
    entity InnerContainer              as projection on QrGeneratorApp_edmx.InnerContainer;
    entity OuterContainer              as projection on QrGeneratorApp_edmx.OuterContainer;


}
