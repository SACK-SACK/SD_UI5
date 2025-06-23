sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
  ],
  function (Controller, MessageToast, UIComponent, History) {
    "use strict";

    return Controller.extend(
      "sync.ca.sd.create.newcontract.controller.BaseController",
      {
        /**
         * Router 접근용 헬퍼
         */
        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },

        /**
         * View 모델 가져오기
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * View 모델 세팅
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * i18n 번들 접근
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * FCL 레이아웃 조정용 함수
         * @param {string} sColumns One | Two | Three
         */
        _setLayout: function (sColumns) {
          this.getModel("appView").setProperty(
            "/layout",
            sColumns + "Column" + (sColumns === "One" ? "" : "sMidExpanded")
          );
        },

        /**
         * 이전 화면으로 이동 (기본 동작)
         */
        onBack: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("home");
          }
        },

        /**
         * 공통 알림 메시지
         */
        showToast: function (sText) {
          MessageToast.show(sText);
        },
      }
    );
  }
);
