var config = {
  
    save: function(){
        var doc = $$("configForm").getValues();
        doc.doctype = "INVOICE_CFG";
        
        if (typeof doc._id !== 'undefined'){
        
            webix.ajax().header({
                    "Content-type":"application/json"
            }).post(SERVER_URL + DBNAME + "/_design/config/_update/sn/" + doc._id, JSON.stringify(doc), 
                function(text, data, xhr){
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    var msg = data.json();
                    if('action' in msg){
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('configForm').setValues(msg.doc);
                    }
                }
            );
        }else{
            webix.ajax().header({
			    "Content-type":"application/json"
			}).post(SERVER_URL + DBNAME + "/_design/config/_update/sn/", JSON.stringify(doc), 
				function(text, data, xhr){
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    var msg = data.json();
                    if('action' in msg){
                        msg.doc._id = xhr.getResponseHeader('X-Couch-Id');
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('configForm').setValues(msg.doc);
                    }
				}
			);
        }
        
    },

    export: function(){
        

        var promise_xls = webix.ajax(SERVER_URL + DBNAME + "/_design/globallists/_list/toxls/config/export2Excel");

        promise_xls.then(function(realdata) {
            //success
            /* original data */
            var data = realdata.json();
            var ws_name = "Invoices";
            
            function Workbook() {
                if(!(this instanceof Workbook)) return new Workbook();
                this.SheetNames = [];
                this.Sheets = {};
            }
            
            var wb = new Workbook(),  ws = XLSX.utils.aoa_to_sheet(data);
            
            /* add worksheet to workbook */
            wb.SheetNames.push(ws_name);
            wb.Sheets[ws_name] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
            
            function s2ab(s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "invoices.xlsx");
            
        }).fail(function(err) {
            //error
            webix.message({ type: "error", text: err });
            console.log(err);
        });
    },
    
    ui: function(){
        return  {
            id: "page-6",
            fitBiggest: true,
            rows:[
                {
                    cols:[
                        {
                            rows:[
                                { 
                                    view:"property", id:"financialStatementY2D", autoheight: true, editable: false,
                                    elements:[
                                        { label:"RON Year to Date", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedRONY2D"},
                                        { label:"Overdue", type:"text", id:"dueRONY2D"},
                                        { label:"Payed", type:"text", id:"payedRONY2D"},
                                        { label:"EUR Year to Date", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedEURY2D"},
                                        { label:"Overdue", type:"text", id:"dueEURY2D"},
                                        { label:"Payed", type:"text", id:"payedEURY2D"}
                                    ]
                                }
                            ]
                        },
                        {
                            rows:[
                                { 
                                    view:"property", id:"financialStatement", autoheight: true, editable: false,
                                    elements:[
                                        { label:"RON TOTAL", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedRON"},
                                        { label:"Overdue", type:"text", id:"dueRON"},
                                        { label:"Payed", type:"text", id:"payedRON"},
                                        { label:"EUR TOTAL", type:"label"},
                                        { label:"Invoiced", type:"text", id:"invoicedEUR"},
                                        { label:"Overdue", type:"text", id:"dueEUR"},
                                        { label:"Payed", type:"text", id:"payedEUR"}
                                    ]
                                }
                            ]
                        },
                        {
                            rows:[
                                {
                                    view: "form",
                                    id: "configForm",
                                    
                                    elementsConfig: { labelWidth: 180 },
                                    elements:[
                                        { view:"fieldset", label:"Serii Facturi", body:{
                                            rows:[
                                                { view:"text", label:"SERIA:", placeholder:"Seria", name:"SERIA"},
                                                { view:"counter", label:"NUMARUL:", step:1, min:0, name:"NUMARUL"},
                                                {view:"button", label:"SAVE", type:"danger", click:'config.save'}   
                                            ]
                                            }
                                        },
                                        //{ template:"Export all data", type:"section"},
                                        { view:"button", type:"iconButton", icon:"file-excel-o", label:"Export to Excel", click:'config.export'}
                                    ]
                                }
                            ]
                        }                        
                    ]                    
                },
                {
                    cols: [
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Year to Date invoiced vs. payed RON",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#year_month#", title:"Month"},
                                    yAxis:{ title:"Amount (RON)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend:{
                                        values:[{text:"Invoiced",color:"#1293f8"},{text:"Payed",color:"#66cc00"}],
                                        align:"right",
                                        valign:"middle",
                                        layout:"y",
                                        width: 100,
                                        margin: 8
                                    },
                                    series:[
                                        {
                                            value:"#invoiced_ron#",
                                            item:{
                                                borderColor: "#1293f8",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#1293f8",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#invoiced_ron#"
                                            }
                                        },
                                        {
                                            value:"#payed_ron#",
                                            item:{
                                                borderColor: "#66cc00",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#66cc00",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#payed_ron#"
                                            }
                                        }
                                    ],
                                    url: "../../_design/globallists/_list/y2d/charts/y2d?startkey=[\""+ new Date().getFullYear() +"\",\"01\"]&endkey=[\""+ new Date().getFullYear() +"\",\"12\"]"
                                }
                            ]                    
                        },
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Year to Date invoiced vs. payed EUR",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#year_month#", title:"Month"},
                                    yAxis:{ title:"Amount (EUR)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend:{
                                        values:[{text:"Invoiced",color:"#1293f8"},{text:"Payed",color:"#66cc00"}],
                                        align:"right",
                                        valign:"middle",
                                        layout:"y",
                                        width: 100,
                                        margin: 8
                                    },
                                    series:[
                                        {
                                            value:"#invoiced_eur#",
                                            item:{
                                                borderColor: "#1293f8",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#1293f8",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#invoiced_eur#"
                                            }
                                        },
                                        {
                                            value:"#payed_eur#",
                                            item:{
                                                borderColor: "#66cc00",
                                                color: "#ffffff"
                                            },
                                            line:{
                                                color:"#66cc00",
                                                width:3
                                            },
                                            tooltip:{
                                                template:"#payed_eur#"
                                            }
                                        }
                                    ],
                                    url: "../../_design/globallists/_list/y2d/charts/y2d?startkey=[\""+ new Date().getFullYear() +"\",\"01\"]&endkey=[\""+ new Date().getFullYear() +"\",\"12\"]"                                
                                }
                            ]
                        }
                    ]
                },
                {
                    cols: [
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Monthly invoiced per Year RON",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    id: "y2m_ron",
                                    title: "SDS",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#month#", title:"Month"},
                                    yAxis:{ title:"Amount (RON)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend: function(){ return (config)?config.legend_y2m_ron:{};}(),
                                    series: function(){ return (config)?config.series_y2m_ron:[];}()
                                }
                                
                            ]
                        },
                        {
                            rows:[
                                {
                                    view: "template",
                                    template: "Monthly invoiced per Year EUR",
                                    type:"header"
                                },
                                {
                                    view:"chart",
                                    id: "y2m_eur",
                                    type:"line",
                                    preset:"simple",
                                    xAxis:{ template:"#month#", title:"Month"},
                                    yAxis:{ title:"Amount (EUR)", template: function(obj){return (obj%1000?"":obj/1000+"k");}},
                                    legend: function(){ return (config)?config.legend_y2m_eur:{};}(),
                                    series: function(){ return (config)?config.series_y2m_eur:[];}()
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
    
};
