sap.ui.define(["sap/ui/core/Fragment","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,n){"use strict";return{_openValueHelpDialog:function(t,n,r){let a=t.getView();if(!t[n]){return e.load({id:a.getId(),name:r,controller:t}).then(e=>{t[n]=e;a.addDependent(t[n]);t[n].open()}).catch(e=>{console.warn("Fragment not Loading",e)})}else{t[n].open()}},_valueHelpSelectedValue:function(e,t,n){let r=t.byId(n);let a=e.getParameter("selectedItem");let o=a.getTitle();if(o){r.setValue(o);e.getSource().getBinding("items").filter([]);return o}else{console.warn("Selected Value Not Found!!")}},_clearInputValues:function(e,t){t.forEach(t=>{let n=e.byId(t);if(n){n.setValue("")}else{console.warn(`${t} not Found`)}})},_valueHelpLiveSearch:function(e,t,r,a){let o=e.getParameter("value")||e.getParameter("query")||e.getParameter("newValue");let l=e.getSource().getBinding("items");if(o){let e=new sap.ui.model.Filter(t,n.Contains,o);l.filter([e])}else{l.filter([])}if(r&&a){let e=a.getView().byId(r);if(e){l.attachEventOnce("dataReceived",function(t){let n=l.getCurrentContexts();if(!n||n.length===0){e.setNoDataText("No Data")}else{e.setNoDataText("")}})}}},_getSingleEntityDataWithParam:async function(e,t,n,r){let a=e.getOwnerComponent().getModel();let o=a.bindList(`/${t}(${n}='${r}')`);try{let e=await o.requestContexts(0,Infinity);let t=e.map(e=>e.getObject());if(t.length===0){return sap.m.MessageToast.show("Data Not Found")}return t}catch(e){console.log(`Error occurred while reading data from the '${t}' entity : `,e)}},_getSingleEntityData:async function(e,t){let n=e.getOwnerComponent().getModel();let r=n.bindList(`/${t}`);try{let e=await r.requestContexts(0,Infinity);let t=e.map(e=>e.getObject());if(t.length===0){return console.log("Data Not Found")}return t}catch(e){console.log(`Error occurred while reading data from the '${t}' entity : `,e)}},performTableSearchMethod:function(e,t,n,r){const a=t.getParameter("query")||t.getParameter("newValue");const o=e.getView().byId(n);if(!o){console.error("Table not found");return}const l=r.map(e=>new sap.ui.model.Filter(e,sap.ui.model.FilterOperator.Contains,a));const i=new sap.ui.model.Filter({filters:l,and:false});const u=o.getBinding("items");if(!u){console.error("Table binding not found");return}u.filter(i)},_getInputValues:function(e,t){if(Array.isArray(t)){return t.map(t=>{let n=e.byId(t);if(n){return n.getValue()}else{console.warn("Input field not found for ID:",t);return null}})}else{console.error("Input IDs must be an array. Received:",t);return[]}}}});
//# sourceMappingURL=HelperFunction.js.map