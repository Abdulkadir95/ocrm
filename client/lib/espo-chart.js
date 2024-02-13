/*! espocrm 2023-11-08 */
define("crm:views/dashlets/abstract/chart",["views/dashlets/abstract/base","lib!flotr2"],function(t,e){return t.extend({templateContent:'<div class="chart-container"></div><div class="legend-container"></div>',decimalMark:".",thousandSeparator:",",defaultColorList:["#6FA8D6","#4E6CAD","#EDC555","#ED8F42","#DE6666","#7CC4A4","#8A7CC2","#D4729B"],successColor:"#85b75f",gridColor:"#ddd",tickColor:"#e8eced",textColor:"#333",hoverColor:"#FF3F19",legendColumnWidth:110,legendColumnNumber:6,labelFormatter:function(t){return'<span style="color:'+this.textColor+'">'+t+"</span>"},init:function(){t.prototype.init.call(this),this.flotr=e,this.successColor=this.getThemeManager().getParam("chartSuccessColor")||this.successColor,this.colorList=this.getThemeManager().getParam("chartColorList")||this.defaultColorList,this.tickColor=this.getThemeManager().getParam("chartTickColor")||this.tickColor,this.gridColor=this.getThemeManager().getParam("chartGridColor")||this.gridColor,this.textColor=this.getThemeManager().getParam("textColor")||this.textColor,this.hoverColor=this.getThemeManager().getParam("hoverColor")||this.hoverColor,this.getPreferences().has("decimalMark")?this.decimalMark=this.getPreferences().get("decimalMark"):this.getConfig().has("decimalMark")&&(this.decimalMark=this.getConfig().get("decimalMark")),this.getPreferences().has("thousandSeparator")?this.thousandSeparator=this.getPreferences().get("thousandSeparator"):this.getConfig().has("thousandSeparator")&&(this.thousandSeparator=this.getConfig().get("thousandSeparator")),this.on("resize",()=>{this.isRendered()&&setTimeout(()=>{this.adjustContainer(),this.isNoData()?this.showNoData():this.draw()},50)}),$(window).on("resize.chart"+this.id,()=>{this.adjustContainer(),this.isNoData()?this.showNoData():this.draw()}),this.once("remove",()=>{$(window).off("resize.chart"+this.id)})},formatNumber:function(e,t,i){if(null===e)return"";var a=this.getConfig().get("currencyDecimalPlaces"),r="";if(i&&(1e6<=e?(r="M",e/=1e6):1e3<=e&&(r="k",e/=1e3)),t)e=0===a?Math.round(e):a?Math.round(e*Math.pow(10,a))/Math.pow(10,a):Math.round(e*Math.pow(10,2))/Math.pow(10,2);else{let t=i?2:4;e=Math.round(e*Math.pow(10,t))/Math.pow(10,t)}var o=e.toString().split(".");if(o[0]=o[0].replace(/\B(?=(\d{3})+(?!\d))/g,this.thousandSeparator),t)if(0===a)delete o[1];else if(a){i=0;if(1<o.length?i=o[1].length:o[1]="",a&&i<a){var s=a-i;for(let t=0;t<s;t++)o[1]+="0"}}return o.join(this.decimalMark)+r},getLegendColumnNumber:function(){var t=this.$el.closest(".panel-body").width();return Math.floor(t/this.legendColumnWidth)||this.legendColumnNumber},getLegendHeight:function(){var t=Math.ceil(this.chartData.length/this.getLegendColumnNumber()),e=0,i=this.getThemeManager().getParam("dashletChartLegendRowHeight")||19,a=this.getThemeManager().getParam("dashletChartLegendPaddingTopHeight")||7;return e=0<t?i*t+a:e},adjustContainer:function(){var t="calc(100% - "+this.getLegendHeight().toString()+"px)";this.$container.css("height",t)},adjustLegend:function(){var t,e,i=this.getLegendColumnNumber();i&&(t=this.getThemeManager().getParam("dashletChartLegendBoxWidth")||21,e=this.$legendContainer.width(),i=((e=Math.floor((e-t*i)/i))+t)*(this.$legendContainer.find("> table tr:first-child > td").length/2),this.$legendContainer.find("> table").css("table-layout","fixed").attr("width",i),this.$legendContainer.find("td.flotr-legend-label").attr("width",e),this.$legendContainer.find("td.flotr-legend-color-box").attr("width",t),this.$legendContainer.find("td.flotr-legend-label > span").each((t,e)=>{e.setAttribute("title",e.textContent)}))},afterRender:function(){this.$el.closest(".panel-body").css({"overflow-y":"visible","overflow-x":"visible"}),this.$legendContainer=this.$el.find(".legend-container"),this.$container=this.$el.find(".chart-container"),this.fetch(function(t){this.chartData=this.prepareData(t),this.adjustContainer(),this.isNoData()?this.showNoData():setTimeout(()=>{this.$container.length&&this.$container.is(":visible")&&this.draw()},1)})},isNoData:function(){return!1},url:function(){},prepareData:function(t){return t},fetch:function(e){Espo.Ajax.getRequest(this.url()).then(t=>{e.call(this,t)})},getDateFilter:function(){return this.getOption("dateFilter")||"currentYear"},showNoData:function(){var t=this.getThemeManager().getParam("fontSize")||14,e=(this.$container.empty(),1.2*t),i=$("<span>").html(this.translate("No Data")).addClass("text-muted"),e=$("<div>").css("text-align","center").css("font-size",e+"px").css("display","table").css("width","100%").css("height","100%");i.css("display","table-cell").css("vertical-align","middle").css("padding-bottom",1.5*t+"px"),e.append(i),this.$container.append(e)}})}),define("crm:views/dashlets/sales-pipeline",["crm:views/dashlets/abstract/chart","lib!espo-funnel-chart"],function(t){return t.extend({name:"SalesPipeline",setupDefaultOptions:function(){this.defaultOptions.dateFrom=this.defaultOptions.dateFrom||moment().format("YYYY")+"-01-01",this.defaultOptions.dateTo=this.defaultOptions.dateTo||moment().format("YYYY")+"-12-31"},url:function(){var t="Opportunity/action/reportSalesPipeline?dateFilter="+this.getDateFilter();return"between"===this.getDateFilter()&&(t+="&dateFrom="+this.getOption("dateFrom")+"&dateTo="+this.getOption("dateTo")),this.getOption("useLastStage")&&(t+="&useLastStage=true"),this.getOption("teamId")&&(t+="&teamId="+this.getOption("teamId")),t},isNoData:function(){return this.isEmpty},prepareData:function(t){let e=[];return this.isEmpty=!0,t.dataList.forEach(t=>{t.value&&(this.isEmpty=!1),e.push({stageTranslated:this.getLanguage().translateOption(t.stage,"stage","Opportunity"),value:t.value,stage:t.stage})}),e},setup:function(){this.currency=this.getConfig().get("defaultCurrency"),this.currencySymbol=this.getMetadata().get(["app","currency","symbolMap",this.currency])||"",this.chartData=[]},draw:function(){let i=Espo.Utils.clone(this.colorList);this.chartData.forEach((t,e)=>{e+1>i.length&&i.push("#164"),this.chartData.length===e+1&&"Closed Won"===t.stage&&(i[e]=this.successColor),this.chartData[e].color=i[e]}),this.$container.empty();new EspoFunnel.Funnel(this.$container.get(0),{colors:i,outlineColor:this.hoverColor,callbacks:{tooltipHtml:t=>{var e=this.chartData[t].value;return this.chartData[t].stageTranslated+"<br>"+this.currencySymbol+this.formatNumber(e,!0)}},tooltipClassName:"flotr-mouse-value",tooltipStyleString:"opacity:0.7;background-color:#000;color:#fff;position:absolute;padding:2px 8px;-moz-border-radius:4px;border-radius:4px;white-space:nowrap;"},this.chartData),this.drawLegend(),this.adjustLegend()},drawLegend:function(){let i=this.getLegendColumnNumber(),t=this.$el.find(".legend-container"),a='<table style="font-size: smaller; color:'+this.textColor+'">';this.chartData.forEach((t,e)=>{e%i==0&&(0<e&&(a+="</tr>"),a+="<tr>");e=this.getHelper().escapeString(t.stageTranslated),t='<div style="border:1px solid transparent;padding:1px"><div style="width:13px;height:9px;border:1px solid '+t.color+'"><div style="width:14px;height:10px;background-color:'+t.color+';"></div></div></div>';a=a+'<td class="flotr-legend-color-box">'+t+'</td><td class="flotr-legend-label"><span title="'+e+'">'+e+"</span></td>"}),a+="</tr></table>",t.html(a)}})}),define("crm:views/dashlets/sales-by-month",["crm:views/dashlets/abstract/chart"],function(t){return t.extend({name:"SalesByMonth",columnWidth:50,setupDefaultOptions:function(){this.defaultOptions.dateFrom=this.defaultOptions.dateFrom||moment().format("YYYY")+"-01-01",this.defaultOptions.dateTo=this.defaultOptions.dateTo||moment().format("YYYY")+"-12-31"},url:function(){var t="Opportunity/action/reportSalesByMonth?dateFilter="+this.getDateFilter();return"between"===this.getDateFilter()&&(t+="&dateFrom="+this.getOption("dateFrom")+"&dateTo="+this.getOption("dateTo")),t},getLegendHeight:function(){return 0},isNoData:function(){return this.isEmpty},prepareData:function(t){var e=this.monthList=t.keyList,i=t.dataMap||{},a=[],r=(e.forEach(t=>{a.push(i[t])}),this.chartData=[],this.isEmpty=!0,0),o=(a.length&&(r=a.reduce((t,e)=>t+e)/a.length),[]),s=0;return a.forEach((t,e)=>{t&&(this.isEmpty=!1),t&&s<t&&(s=t),o.push({data:[[e,t]],color:r<=t?this.successColor:this.colorBad})}),this.max=s,o},setup:function(){this.currency=this.getConfig().get("defaultCurrency"),this.currencySymbol=this.getMetadata().get(["app","currency","symbolMap",this.currency])||"",this.colorBad=this.successColor},getTickNumber:function(){var t=this.$container.width();return Math.floor(t/this.columnWidth)},draw:function(){var e=this.getTickNumber();this.flotr.draw(this.$container.get(0),this.chartData,{shadowSize:!1,bars:{show:!0,horizontal:!1,shadowSize:0,lineWidth:1,fillOpacity:1,barWidth:.5},grid:{horizontalLines:!0,verticalLines:!1,outline:"sw",color:this.gridColor,tickColor:this.tickColor},yaxis:{min:0,showLabels:!0,color:this.textColor,max:this.max+.08*this.max,tickFormatter:t=>(t=parseFloat(t))&&t%1==0?this.currencySymbol+this.formatNumber(Math.floor(t),!1,!0).toString():""},xaxis:{min:0,color:this.textColor,noTicks:e,tickFormatter:t=>{if(t%1==0){t=parseInt(t);if(t in this.monthList)return 5<this.monthList.length-e&&t===this.monthList.length-1?"":moment(this.monthList[t]+"-01").format("MMM YYYY")}return""}},mouse:{track:!0,relative:!0,lineColor:this.hoverColor,position:"s",autoPositionVertical:!0,trackFormatter:t=>{var e=parseInt(t.x);let i="";return e in this.monthList&&(i+=moment(this.monthList[e]+"-01").format("MMM YYYY")+"<br>"),i+this.currencySymbol+this.formatNumber(t.y,!0)}}})}})}),define("crm:views/dashlets/opportunities-by-stage",["crm:views/dashlets/abstract/chart"],function(t){return t.extend({name:"OpportunitiesByStage",setupDefaultOptions:function(){this.defaultOptions.dateFrom=this.defaultOptions.dateFrom||moment().format("YYYY")+"-01-01",this.defaultOptions.dateTo=this.defaultOptions.dateTo||moment().format("YYYY")+"-12-31"},url:function(){var t="Opportunity/action/reportByStage?dateFilter="+this.getDateFilter();return"between"===this.getDateFilter()&&(t+="&dateFrom="+this.getOption("dateFrom")+"&dateTo="+this.getOption("dateTo")),t},prepareData:function(t){let i=[];for(var e in t){var a=t[e];i.push({stage:e,value:a})}this.stageList=[],this.isEmpty=!0;var r=[],o=0;i.forEach(t=>{t.value&&(this.isEmpty=!1);var e={data:[[t.value,i.length-o]],label:this.getLanguage().translateOption(t.stage,"stage","Opportunity")};r.push(e),this.stageList.push(this.getLanguage().translateOption(t.stage,"stage","Opportunity")),o++});let s=0;return i.length&&i.forEach(t=>{t.value&&t.value>s&&(s=t.value)}),this.max=s,r},setup:function(){this.currency=this.getConfig().get("defaultCurrency"),this.currencySymbol=this.getMetadata().get(["app","currency","symbolMap",this.currency])||""},isNoData:function(){return this.isEmpty},draw:function(){this.flotr.draw(this.$container.get(0),this.chartData,{colors:this.colorList,shadowSize:!1,bars:{show:!0,horizontal:!0,shadowSize:0,lineWidth:1,fillOpacity:1,barWidth:.5},grid:{horizontalLines:!1,outline:"sw",color:this.gridColor,tickColor:this.tickColor},yaxis:{min:0,showLabels:!1,color:this.textColor},xaxis:{min:0,color:this.textColor,max:this.max+.08*this.max,tickFormatter:t=>!(t=parseFloat(t))||(t%1!=0||t>this.max+.05*this.max)?"":this.currencySymbol+this.formatNumber(Math.floor(t),!1,!0).toString()},mouse:{track:!0,relative:!0,position:"w",autoPositionHorizontal:!0,lineColor:this.hoverColor,trackFormatter:t=>{return this.getHelper().escapeString(t.series.label||this.translate("None"))+"<br>"+this.currencySymbol+this.formatNumber(t.x,!0)}},legend:{show:!0,noColumns:this.getLegendColumnNumber(),container:this.$el.find(".legend-container"),labelBoxMargin:0,labelFormatter:this.labelFormatter.bind(this),labelBoxBorderColor:"transparent",backgroundOpacity:0}}),this.adjustLegend()}})}),define("crm:views/dashlets/opportunities-by-lead-source",["crm:views/dashlets/abstract/chart"],function(t){return t.extend({name:"OpportunitiesByLeadSource",url:function(){var t="Opportunity/action/reportByLeadSource?dateFilter="+this.getDateFilter();return"between"===this.getDateFilter()&&(t+="&dateFrom="+this.getOption("dateFrom")+"&dateTo="+this.getOption("dateTo")),t},prepareData:function(t){var e,i=[];for(e in t){var a=t[e];i.push({label:this.getLanguage().translateOption(e,"source","Lead"),data:[[0,a]]})}return i},isNoData:function(){return!this.chartData.length},setupDefaultOptions:function(){this.defaultOptions.dateFrom=this.defaultOptions.dateFrom||moment().format("YYYY")+"-01-01",this.defaultOptions.dateTo=this.defaultOptions.dateTo||moment().format("YYYY")+"-12-31"},setup:function(){this.currency=this.getConfig().get("defaultCurrency"),this.currencySymbol=this.getMetadata().get(["app","currency","symbolMap",this.currency])||""},draw:function(){this.flotr.draw(this.$container.get(0),this.chartData,{colors:this.colorList,shadowSize:!1,pie:{show:!0,explode:0,lineWidth:1,fillOpacity:1,sizeRatio:.8,labelFormatter:(t,e)=>{e=(100*e/t).toFixed(2);return e<7?"":'<span class="small" style="font-size: 0.8em;color:'+this.textColor+'">'+e.toString()+"%</span>"}},grid:{horizontalLines:!1,verticalLines:!1,outline:"",tickColor:this.tickColor},yaxis:{showLabels:!1,color:this.textColor},xaxis:{showLabels:!1,color:this.textColor},mouse:{track:!0,relative:!0,lineColor:this.hoverColor,trackFormatter:t=>{var e=this.currencySymbol+this.formatNumber(t.y,!0),i=(100*(t.fraction||0)).toFixed(2).toString();return this.getHelper().escapeString(t.series.label||this.translate("None"))+"<br>"+e+" / "+i+"%"}},legend:{show:!0,noColumns:this.getLegendColumnNumber(),container:this.$el.find(".legend-container"),labelBoxMargin:0,labelFormatter:this.labelFormatter.bind(this),labelBoxBorderColor:"transparent",backgroundOpacity:0}}),this.adjustLegend()}})});
//# sourceMappingURL=espo-chart.js.map