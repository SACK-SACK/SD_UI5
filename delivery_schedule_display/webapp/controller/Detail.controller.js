sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "./Formatter",
    "sap/ui/core/format/DateFormat",
    "sap/ui/unified/DateRange",
    "sap/ui/core/date/UI5Date",
    "sap/base/i18n/date/CalendarType",
    "./Formatter"
  ],
  function (
    Controller,
    formatter,
    DateFormat,
    DateRange,
    UI5Date,
    CalendarType,
  ) {
    "use strict";

    return Controller.extend(
      "sync.ca.sd.deliveryscheduledisplay.controller.Detail",
      {
         formatter: formatter,
        onInit: function () {
          this.oFormatYyyymmdd = DateFormat.getInstance({
            pattern: "yyyy-MM-dd",
            calendarType: CalendarType.Gregorian,
          });

          var oExitButton = this.getView().byId("exitFullScreenBtn"),
            oEnterButton = this.getView().byId("enterFullScreenBtn");

          this.oRouter = this.getOwnerComponent().getRouter();
          this.oModel = this.getOwnerComponent().getModel("app"); // ⬅ 반드시 "app" 모델 사용

          this.oRouter
            .getRoute("RouteMain")
            .attachPatternMatched(this._onVbelnMatched, this);
          this.oRouter
            .getRoute("RouteDetail")
            .attachPatternMatched(this._onVbelnMatched, this);

          [oExitButton, oEnterButton].forEach(function (oButton) {
            oButton.addEventDelegate({
              onAfterRendering: function () {
                if (this.bFocusFullScreenButton) {
                  this.bFocusFullScreenButton = false;
                  oButton.focus();
                }
              }.bind(this),
            });
          }, this);
        },

        handleFullScreen: function () {
          // 전체 화면 버튼이 눌렸을 때: midColumn을 fullScreen 모드로 전환
          this.bFocusFullScreenButton = true;
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/fullScreen"
          );
          this.oRouter.navTo("RouteDetail", {
            layout: sNextLayout,
            vbeln: this._vbeln,
          });
        },
        handleExitFullScreen: function () {
           // 축소 버튼이 눌렸을 때: fullScreen 모드를 midColumn 기본 뷰로 복귀
          this.bFocusFullScreenButton = true;
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/exitFullScreen"
          );
          this.oRouter.navTo("RouteDetail", {
            layout: sNextLayout,
            vbeln: this._vbeln,
          });
        },
        handleClose: function () {
          // 닫기 버튼이 눌렸을 때: midColumn을 닫고 main 화면으로 전환
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );
          this.oRouter.navTo("RouteMain", { layout: sNextLayout });
        },
        _onVbelnMatched: function (oEvent) {
          this._vbeln =
            oEvent.getParameter("arguments").vbeln || this._vbeln || "0";
          this._currentPath = "/ContractSet('" + this._vbeln + "')";
          this.getView().bindElement({
            path: this._currentPath,
            events: {
              change: function () {
                this.loadDelivDates(this._vbeln);
              }.bind(this),
            },
          });
        },

        // 납기일 정보를 불러와 캘린더에 표시할 데이터 구성
        loadDelivDates: function (sVbeln) {
          const oModel = this.getView().getModel();
          const oCalendarModel = new sap.ui.model.json.JSONModel();

          oModel.read("/Deliv_palnSet", {
            filters: [
              // 계약 번호 필터링
              new sap.ui.model.Filter(
                "Vbeln",
                sap.ui.model.FilterOperator.EQ,
                sVbeln
              ),
            ],
            success: function (oData) {
              const oDateMap = {};

              // 납기일이 있는 날짜만 수집하여 중복 제거
              oData.results.forEach((o) => {
                if (o.DelivDate) {
                  const sDateKey = this.oFormatYyyymmdd.format(
                    new Date(o.DelivDate)
                  );
                  oDateMap[sDateKey] = true;
                }
              });

              // 캘린더에 표시할 날짜 배열 생성
              const aDates = Object.keys(oDateMap).map((sDate) => ({
                type: "Type09",
                date: new Date(sDate),
              }));

              oCalendarModel.setData({ dates: aDates });
              this.getView().setModel(oCalendarModel, "calendarModel");
            }.bind(this),
            error: function () {
              sap.m.MessageToast.show("납기일 정보를 불러오지 못했습니다.");
            },
          });
        },
// "Today" 버튼 클릭 시 오늘 날짜로 캘린더 이동 + 선택
handleSelectToday: function (oEvent) {
  var oCalendar = this.byId("calendar");
  var oToday = UI5Date.getInstance();

  oCalendar.removeAllSelectedDates();
  oCalendar.addSelectedDate(new DateRange({ startDate: oToday }));
  oCalendar.focusDate(oToday);

  // 버튼 눌림 효과 제거
  if (oEvent && oEvent.getSource) {
    setTimeout(() => {
      oEvent.getSource().setPressed(false);
      oEvent.getSource().getDomRef().blur(); // 포커스 제거 (선택적)
    }, 100);
  }
},

        // 선택된 날짜가 납기일 목록에 포함되어 있는지 확인하는 함수
        _isDateInDelivList: function (oDate) {

          // 캘린더 모델(calendarModel)에서 납기일 리스트 가져오기
          const oCalendarModel = this.getView().getModel("calendarModel");
          const aDelivDates = oCalendarModel.getProperty("/dates") || [];

          // yyyy-mm-dd 형식으로 비교
          const sTarget = this.oFormatYyyymmdd.format(oDate);

          // 납기일 목록 중에 선택한 날짜가 포함되어 있는지 확인
          return aDelivDates.some(
            function (oItem) {
              return this.oFormatYyyymmdd.format(oItem.date) === sTarget;
            }.bind(this)
          );
        },

        // 사용자가 캘린더에서 날짜를 선택했을 때 실행되는 함수
        onCalendarSelect: function (oEvent) {
          const oCalendar = oEvent.getSource(); // 캘린더 컨트롤 객체
          const aSelectedDates = oCalendar.getSelectedDates(); // 선택된 날짜 목록 가져오기

          if (!aSelectedDates || aSelectedDates.length === 0) {
            return; // 선택된 날짜가 없으면 종료
          }

          const oDate = aSelectedDates[0].getStartDate(); // 첫 번째 선택된 날짜 추출

           // 선택한 날짜가 실제 납기일인지 확인
          if (this._isDateInDelivList(oDate)) {

             // 납기일이면 해당 날짜에 대한 상세 데이터 조회
            this._loadDelivDetailByDate(this._vbeln, oDate);
          } else {
             // 납기일이 아니면 안내 메시지 표시
            sap.m.MessageToast.show("납기 일정이 없는 날짜입니다.");
          }
        },

        // 특정 계약 번호와 날짜에 대한 납기 상세 데이터를 조회하고 팝업(Fragment)으로 표시하는 함수
        _loadDelivDetailByDate: function (sVbeln, oDate) {

           // 현재 뷰의 OData 모델 가져오기 (기본 모델로 가정)
          const oModel = this.getView().getModel();

           // 날짜를 UTC 기준으로 보정 (타임존 이슈 방지용)
          const oDateUTC = new Date(
            Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate())
          );
          console.log(oDate.toISOString().split("T")[0]);

          // OData 필터 조건으로 사용할 ISO 형식의 UTC 날짜 문자열 생성
          const sODataDate = oDateUTC.toISOString(); 

          // OData에서 Deliv_palnSet 엔터티 호출
          oModel.read("/Deliv_palnSet", {
            filters: [
               // 계약번호 필터
              new sap.ui.model.Filter(
                "Vbeln",
                sap.ui.model.FilterOperator.EQ,
                sVbeln
              ),
               // 납기일 필터 (UTC 기준 ISO 문자열)
              new sap.ui.model.Filter(
                "DelivDate",
                sap.ui.model.FilterOperator.EQ,
                sODataDate
              ),
            ],
            success: function (oData) {
               // 데이터가 있을 경우
              if (oData.results.length > 0) {
                // 프래그먼트에서 사용할 모델 생성
                const oFragModel = new sap.ui.model.json.JSONModel({
                  items: oData.results, // 납기 상세 데이터 바인딩
                  
                });
                // "fragModel"이라는 이름으로 뷰에 등록
                this.getView().setModel(oFragModel, "fragModel");
                // 프래그먼트(팝업) 열기
                this._openDelivDialog();
              } else {
                // 결과가 없을 경우 사용자에게 안내 메시지 표시
                sap.m.MessageToast.show("해당 날짜의 납기 데이터가 없습니다.");
              }
            }.bind(this),
            // 내부에서 this 사용을 위해 바인딩
            error: function () {
              // 서버 오류 또는 조회 실패 시 메시지 표시
              sap.m.MessageToast.show("납기 상세 정보를 불러오지 못했습니다.");
            },
          });
        },

        _openDelivDialog: function () {
          if (!this._oDialog) {
            // Fragment 최초 로딩
            sap.ui.core.Fragment.load({
              name: "sync.ca.sd.deliveryscheduledisplay.view.Frag1", // Fragment XML 경로
              type: "XML",
              controller: this, // 현재 컨트롤러를 Fragment에도 지정
            }).then(
              function (oDialog) {
                this._oDialog = oDialog; // 다이얼로그 인스턴스 저장
                this.getView().addDependent(this._oDialog); 
                this._oDialog.open(); // 다이얼로그 열기
              }.bind(this)
            );
          } else {
            this._oDialog.open();
          }
        },

        onCloseDialog: function () {
          if (this._oDialog) {
            this._oDialog.close();
          }
        },

        onSectionPress: function (oEvent) {
          const oItem = oEvent.getParameter("listItem"); // 클릭한 ListItem

          // 1. CustomData에서 target 가져오기
          const oTargetData = oItem.getCustomData().find(function (oData) {
            return oData.getKey && oData.getKey() === "target";
          });

          if (!oTargetData) {
            return;
          }

          const sTarget = oTargetData.getValue();
          const oRouter = this.getOwnerComponent().getRouter();

          // 2. 바인딩된 계약 문서번호와 고객코드 가져오기
          const oModel = this.getView().getModel();

          const sVbeln = oModel.getProperty(this._currentPath + "/Vbeln");
          const sCuscode = oModel.getProperty(this._currentPath + "/Cuscode");

          // 3. FlexibleColumnLayout 상태 정보 가져오기
          const oNextUIState = this.getOwnerComponent()
            .getHelper()
            .getNextUIState(2);

          // 4. 라우팅 분기
          switch (sTarget) {
            case "customers":
              oRouter.navTo("RouteCustomerInfo", {
                layout: oNextUIState.layout,
                vbeln: sVbeln,
                cuscode: sCuscode,
              });
              break;

            case "contracts":
              oRouter.navTo("RouteContractInfo", {
                layout: oNextUIState.layout,
                vbeln: sVbeln,
                cuscode: sCuscode,
              });
              break;

            default:
              console.warn("정의되지 않은 target:", sTarget);
              break;
          }
        },
 // "Latest" 버튼 클릭 시 최근에 청구된 납기 순번 날짜로 캘린더 이동 
handleSelectLatest: function (oEvent) {
  const oModel = this.getView().getModel();
  const sVbeln = this._vbeln;
  const oCalendar = this.byId("calendar");

  oModel.read("/Deliv_palnSet", {
    filters: [
      new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln),
      new sap.ui.model.Filter("Status2", sap.ui.model.FilterOperator.EQ, true),
    ],
    success: function (oData) {
      if (oData.results.length === 0) {
        sap.m.MessageToast.show("청구 완료된 납기 일정이 없습니다.");
        return;
      }

      const aSorted = oData.results.sort(function (a, b) {
        return new Date(b.DelivDate) - new Date(a.DelivDate);
      });
      const oLatest = aSorted[0];
      const oLatestDate = new Date(oLatest.DelivDate);

      oCalendar.removeAllSelectedDates();
      oCalendar.addSelectedDate(new sap.ui.unified.DateRange({ startDate: oLatestDate }));
      oCalendar.focusDate(oLatestDate);

      // ✅ 버튼 눌림 해제 (비동기 UI 리프레시 후 적용)
      if (oEvent && oEvent.getSource) {
        setTimeout(() => {
          oEvent.getSource().setPressed(false);
          oEvent.getSource().getDomRef().blur(); // 선택 해제 + 포커스 제거 (선택)
        }, 100);
      }
    },
    error: function () {
      sap.m.MessageToast.show("납기 정보를 불러오는 데 실패했습니다.");
    }
  });
}


      }
    );
  }
);
