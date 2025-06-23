sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sync/ca/sd/create/newcontract/model/models",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
    "sap/ui/model/BindingMode",
  ],
  (UIComponent, models, FCLSemanticHelper, BindingMode) => {
    "use strict";

    return UIComponent.extend("sync.ca.sd.create.newcontract.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // const oView = sap.ui.view({
        // id: "appView", // ← 여기만 바꿈!
        // viewName: "sync.ca.sd.create.newcontract.view.App",
        // type: "XML"
        // });
        // oView.placeAt("content");

        //css/style.css 파일을 포함
        // sap.ui.getCore().includeStyleSheet("css/style.css");

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        //contractModel: 고객 계약 정보 초기값 정의
        const oContractModel = new sap.ui.model.json.JSONModel({
          Cuscode: "", //고객 코드
          Vbeln: "", //계약 번호
          Cusname: "",
          Vbegdat: null, //계약 시작일
          Venddat: null, //계약 종료일
          Vlaufz: "", //계약 유효기간 수치값000
          Vlauez: "M", //계약 유효기간 단위  (d:일, m:월, y:년)
          Valdel: "", //계약 주기 수치값
          Valunit: "D", //계약 주기 단위 (d:일, m:월, y:년)
          Vuntdat: null, //계약 체결일
          Totdelvnum: "",
          NetvalSum: 0, //순계약 금액
          Waers: "KRW", //통화
          Bphaed: "", // 대표자명
          Bpcsnr: "", // 사업자등록번호
        });
        oContractModel.setDefaultBindingMode(BindingMode.TwoWay);
        this.setModel(oContractModel, "contractModel");

        //cartModel: 장바구니 품목 목록
        const oCartModel = new sap.ui.model.json.JSONModel({
          CartItems: [],
        });
        this.setModel(oCartModel, "cartModel");

        const oQuantityModel = new sap.ui.model.json.JSONModel({
          quantities: {}, // 이렇게 명시!
        });
        this.setModel(oQuantityModel, "quantityModel");

        // enable routing
        this.getRouter().initialize();

        // ① FlexibleColumnLayout layout을 위한 모델 세팅
        const oModel = new sap.ui.model.json.JSONModel({
          layout: "OneColumn", // 또는 "TwoColumnsMidExpanded"으로 시작 가능
          // smallScreenMode: false,
        });
        this.setModel(oModel, "appView");

        const oCfgModel = new sap.ui.model.json.JSONModel({
          inDelete: false,
          listMode: "None",
          notInDelete: true,
        });
        this.setModel(oCfgModel, "cfg");
      },

      /**
       * 플렉서블 컬럼 레이아웃의 Semantic Helper의 객체를 가져온다.
       * Semantic Helper 객체는 특정 상황에 따라 플렉서블의 layout을 어떻게 할 건지 정보를 갖고 있다.
       * 예를 들어 중간 컬럼이 닫힐 경우 => 원 컬럼을 해야 한다 라는 정보를 주거나
       * OneColumn 에서 그 다음 layout은 어떤 layout이 되어야 하는가? 에서 TwoColumn~~에 대한 내용을 알려준다.
       */
      getFlexibleLayoutInfo: function () {
        var oFlexible = this.getRootControl().byId("idFlexibleColumnLayout");
        var oSettings = {
          defaultTwoColumnLayoutType: sap.f.LayoutType.OneColumn, // "TwoColumnsMidExpanded",
          initialColumnsCount: 1,
          maxColumnsCount: 3,
        };

        var oHelper = FCLSemanticHelper.getInstanceFor(oFlexible, oSettings);
        return oHelper;
      },
    });
  }
);
