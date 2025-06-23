sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageBox',
	'sap/ui/comp/navpopover/LinkData',
	'sap/ui/core/util/MockServer',
	'sap/ui/core/Title',
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Image',
	'sap/m/Text',
	'sap/m/FlexItemData',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/m/MessageToast'
], function (Controller, MessageBox, LinkData,MockServer, Title, SimpleForm, Image, Text, FlexItemData, ODataModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.comp.sample.smartchart.general.SmartChart", {

		onInit: function () {

			var oMockServer = new MockServer({
				rootUri: "sapuicompsmartchart/"
			});
			this._oMockServer = oMockServer;
			oMockServer.simulate("test-resources/sap/ui/comp/demokit/sample/smartchart/general/mockserver/metadata.xml", "test-resources/sap/ui/comp/demokit/sample/smartchart/general/mockserver/");
			oMockServer.start();

			// create and set ODATA Model
			this._oModel = new ODataModel("sapuicompsmartchart", true);
			this.getView().setModel(this._oModel);

			//set maxHeight for categoryAxis in order to allow longer labels being fully displayed
			var oSmartChart = this.getView().byId("smartChartGeneral");
			oSmartChart.attachInitialized(function(){
				oSmartChart.getChartAsync().then(function(oChart){
					oChart.setVizProperties({categoryAxis:{layout:{maxHeight:0.8}}});
				});
			});
		},

		navigationTargetsObtained: function(oNavigationTargets) {
			const { semanticAttributes } = oNavigationTargets;

			return Promise.resolve({
				mainNavigationId: "Supplier",
				mainNavigation: new LinkData({
					text: "Homepage",
					href: "https://www.sap.com",
					target: "_blank"
				}),
				actions: [
					new LinkData({
						text: "Go to shopping cart",
						href: "#"
					})
				],
				extraContent: new SimpleForm({
					maxContainerCols: 1,
					content: [
						new Title({
							text: "Product description"
						}), new Image({
							src: "test-resources/sap/ui/documentation/sdk/images/HT-1052.jpg", // oSemanticAttributes.ProductPicUrl,
							densityAware: false,
							width: "50px",
							height: "50px",
							layoutData: new FlexItemData({
								growFactor: 1
							})
						}), new Text({
							text: semanticAttributes.Description
						})
					]
				})
			});
		},

		onNavigate: function (oEvent) {
			var oParameters = oEvent.getParameters();
			if (oParameters.text === "Homepage") {
				return;
			}
			MessageBox.show(oParameters.text + " has been pressed", {
				icon: MessageBox.Icon.INFORMATION,
				title: "SmartChart demo",
				actions: [
					MessageBox.Action.OK
				]
			});
		},

		onUiStateChange: function(oEvent) {
			MessageToast.show("UI state changed for SmartChart with id - " + oEvent.getSource().getId());
		},

		applyUIState: function() {
			var oSmartChart = this.getView().byId("smartChartGeneral"),
				oUiState = oSmartChart.getUiState(),
				oPresentationVariant = oUiState.getPresentationVariant();

			oPresentationVariant.SortOrder = [{
				Property: "Name",
				Descending: false
			}];

			oUiState.setPresentationVariant(oPresentationVariant);
			oSmartChart.setUiState(oUiState);
		},

		onExit: function () {
			this._oMockServer.stop();
			this._oModel.destroy();
		}
	});
});