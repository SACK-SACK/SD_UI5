sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "./Formatter",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Formatter, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("sync.ca.sd.deliveryscheduledisplay.controller.Main", {
    formatter: Formatter,

    onInit: function () {
      this.oRouter = this.getOwnerComponent().getRouter();  
       // 라우터 객체 가져오기
      this.oModel = this.getOwnerComponent().getModel();
      // 디폴트 모델 참조 저장
    },

//필터링 함수
onFilterList: function (oEvent) {
  var sQuery = oEvent.getParameter("query");
  var aFilter = [];

  var oList = this.byId("contractList"); // 리스트 컨트롤
  var oBinding = oList.getBinding("items"); // 리스트 바인딩

  if (sQuery) {
    // Cuscode 또는 Cusname에 검색어가 포함된 항목 필터링 (OR 조건)
    aFilter.push(
      new Filter({
        filters: [
          new Filter("Cuscode", FilterOperator.Contains, sQuery),
          new Filter("Cusname", FilterOperator.Contains, sQuery)
        ],
        and: false // OR 조건
      })
    );
    oBinding.filter(aFilter); // 필터 적용
  } else {
    // 검색어가 비어 있으면 필터를 풀고 전체 리스트 조회 
    oBinding.filter([]);
  }
},

    onListItemPress: function (oEvent) {

      // 다음 컬럼 상태(중간 컬럼 확장 상태)를 가져옴
      const oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),

            // 클릭한 리스트 아이템의 바인딩 경로 
            sPath = oEvent.getSource().getBindingContext().getPath(),  

            // 경로를 통해 계약 문서 번호(Vbeln)를 추출
            sVbeln = this.oModel.getProperty(sPath + "/Vbeln");  

       // 중간 컬럼(middle column)에 Detail 페이지를 표시하며 RouteDetail로 라우팅
      this.oRouter.navTo("RouteDetail", {
        layout: oNextUIState.layout,
        vbeln: sVbeln   
      });
    }

  });
});
