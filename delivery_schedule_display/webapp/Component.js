sap.ui.define([
    "sap/ui/core/UIComponent",
    "sync/ca/sd/deliveryscheduledisplay/model/models",
    "sap/f/library",
    "sap/f/FlexibleColumnLayoutSemanticHelper"
], (UIComponent, models, library, FlexibleColumnLayoutSemanticHelper) => {
    "use strict";

    var LayoutType = library.LayoutType;

    return UIComponent.extend("sync.ca.sd.deliveryscheduledisplay.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
          // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        // this.setModel(models.createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();

        // App View 에서 사용하는 모델 추가
        var oData = {
          layout: null,
        };
        // layout 은 사용자의 행동에 따라서
        // OneColumn <--> TwoColumnsMidExpanded
        var oJsonModel = new sap.ui.model.json.JSONModel(oData);

        this.setModel(oJsonModel, "app");
        // 앱 첫 로드시 항상 초기 layout으로 이동
        var oRouter = this.getRouter();

        var bIsReload = false;
        var perfEntries = performance.getEntriesByType("navigation");

        if (perfEntries.length > 0 && perfEntries[0].type === "reload") {
          bIsReload = true;
        }

        if (bIsReload) {
          oRouter.navTo(
            "RouteMain",
            {
              layout: "OneColumn",
            },
            {
              replace: true,
            }
          );
        }
        },
          getHelper: function () {
            // App.view.xml에서 사용한 FCL id
            var oFCL = this.getRootControl().byId("fclId"); 

            // URL 파라미터에서 max 컬럼 수를 동적으로 가져오기 (ex: ?max=3)
            // 유연한 화면 구성 제어를 위해 사용
            var oParams = new URLSearchParams(window.location.search);

            // FlexibleColumnLayoutSemanticHelper의 설정값 정의
            var oSettings = { 

                // 기본 2단 화면 전환 시 사용할 layout 타입 설정
                defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
                
                // 기본 3단 화면 전환 시 사용할 layout 타입 설정
                defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,

                // 최대 열 수 
                maxColumnsCount: oParams.get("max")
            };

            // 설정값을 바탕으로 FCL Semantic Helper 인스턴스를 반환
            // 이후 Controller 등에서 getHelper().getNextUIState() 등으로 레이아웃 전환 계산 가능
            return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
        }
    });
});