sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/m/MessageToast"],
  (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("sync.ca.sd.create.newcontract.controller.Main", {
      onInit() {
        
      },
      onAfterRendering: function () {
        const oContractModel = this.getView().getModel("contractModel");

        // 오늘 날짜 객체 생성
        const oToday = new Date();
        const yyyy = oToday.getFullYear();
        const mm = String(oToday.getMonth() + 1).padStart(2, "0");
        const dd = String(oToday.getDate()).padStart(2, "0");
        const sToday = `${yyyy}-${mm}-${dd}`; // "2025-06-04"
        
        // const sToday = "2025-06-06"; // 테스트용 고정 날짜  

        // 모델에 오늘 날짜 설정 (Vuntdat: 계약 체결일)
        oContractModel.setProperty("/Vuntdat", sToday);

        console.log("onAfterRendering에서 오늘 날짜 설정 완료:", sToday);
        

        //날짜 유효성 , 최소, 최대 설정
        // 오늘로부터 13일 뒤 날짜 계산
        oToday.setDate(oToday.getDate() + 21);
        //시간을 00:00:00으로 고정 (핵심!)
        oToday.setHours(0, 0, 0, 0);
        console.log("oToday",oToday)

        // 최대값: 오늘 + 3년
        const oMaxDate = new Date();
        oMaxDate.setFullYear(oMaxDate.getFullYear() + 3);
        oMaxDate.setHours(23, 59, 59, 999); // 하루의 끝으로
        console.log(oMaxDate);

        const oDateVenddat = this.byId("datePickerVenddat")
        oDateVenddat.setMaxDate(oMaxDate);
        
        //기본값 설정
        const y = oToday.getFullYear();
        const m = String(oToday.getMonth() + 1).padStart(2, "0");
        const d = String(oToday.getDate()).padStart(2, "0");
        const sFormattedDate = `${y}-${m}-${d}`; // "2025-06-20"
        console.log(sFormattedDate);
        // 모델에 설정
        oContractModel.setProperty("/Vbegdat", sFormattedDate);

        //계약 시작일 < 계약 종료일 
        const oStartDate = sFormattedDate; // 계약 시작일(Date)
        const oEndPicker = this.byId("datePickerVenddat");

        if (!oStartDate || !oEndPicker) return;

        // 종료일 최소 선택 가능 날짜를 시작일 다음날로 설정
        const oMinEndDate = new Date(oStartDate);
        oMinEndDate.setDate(oMinEndDate.getDate() + 1);
        oMinEndDate.setHours(0, 0, 0, 0);

        oEndPicker.setMinDate(oMinEndDate);
        
        
        // 🔽 렌더링 이후 강제로 minDate 설정
        setTimeout(() => {
          const oDatePicker = this.byId("datePickerVbegdat");
          
          if (oDatePicker) {
            oDatePicker.setMinDate(oToday);
            console.log("📌 minDate 설정 완료:", oToday.toDateString());
          } else {
            console.warn("⛔ datePickerVbegdat 컨트롤이 아직 준비되지 않음");
          }
        }, 0);
      },

      onEndDateChanged: function (oEvent) {
        const oEndPicker = oEvent.getSource();
        const dEnd = oEndPicker.getDateValue(); // 사용자가 선택한 종료일

        //값이 있으면 status 상태 초기화
          if (dEnd) {
            oEndPicker.setValueState("None");
          }
        const oModel = this.getView().getModel("contractModel");
        const dStart = new Date(oModel.getProperty("/Vbegdat"));

        if (!dEnd || !dStart) return;

        if (dEnd < dStart) {
          sap.m.MessageToast.show("계약 종료일은 시작일보다 이후여야 합니다.");
          // 종료일을 시작일로 자동 보정
          oEndPicker.setDateValue(dStart);
          oModel.setProperty("/Venddat", dStart.toISOString().split("T")[0]);
        }
      },


      onProceed: function () {
        if (!this.validateInputs()) {
          MessageToast.show("필수 항목을 모두 입력해주세요.");
          return;
        }

        this.getOwnerComponent()
          .getRouter()
          .navTo("step2", { layout: "OneColumn" });
      },

      // onCustomerSelected: function (oEvent) {
      //   const sKunnr = oEvent.getParameter("value"); // 'C0007'처럼 고객 코드가 직접 들어옴
      //   if (!sKunnr) {
      //     MessageToast.show("고객 코드를 확인할 수 없습니다.");
      //     return;
      //   }

      //   console.log("선택된 고객 코드:", sKunnr);

      //   var path = `/CustomerSet('${sKunnr}')`;
      //   console.log("바인딩 경로:", path);

      //   this.byId("idSimpleForm").bindElement(path);

      //   const oContractModel = this.getView().getModel("contractModel");
      //   // oContractModel.setProperty("/Cusname", sKunnr); // 고객 코드로 이름 설정 (원랙 코드)
      //   oContractModel.setProperty("/Cuscode", sKunnr); // 고객 코드를 코드 설정

      //   // 고객 이름을 설정하기 위해
      //   const oCustomerModel = this.getView().getModel(); // 고객 정보 모델 ( OData 모델 )
      //   oCustomerModel.read(path, {
      //     success: function (oData) {
      //       oContractModel.setProperty("/Cusname", oData.Name1);
      //       oContractModel.setProperty("/Bpadrr", oData.Bpadrr);
      //       oContractModel.setProperty("/Bphaed", oData.Bphaed);
      //       oContractModel.setProperty("/Bpcsnr", oData.Bpcsnr);
      //       console.log(
      //         "업데이트된 contractModel 데이터:",
      //         oContractModel.getData()
      //       );
      //     }.bind(this),
      //   });
      // },
      onCustomerSelected: function (oEvent) {
  const sInput = oEvent.getParameter("value"); // 입력된 값 (고객 코드 또는 이름)
  console.log(sInput);
  if (!sInput) {
    MessageToast.show("값을 직접 입력하지 마세요. 오른쪽 목록(돋보기)에서 선택해주세요.");
    return;
  }
  const oField = oEvent.getSource();
  const sValue = oField.getValue();

  if (sValue && sValue.trim() !== "") {
    oField.setValueState("None"); // 빨간 테두리 제거
  }

  const oView = this.getView();
  const oODataModel = oView.getModel(); // 기본 OData 모델
  const oContractModel = oView.getModel("contractModel");

  // 고객 코드 패턴 (예: 'C0007')이면 코드로 바로 조회
  const bIsCode = /^C\d+$/i.test(sInput);

  if (bIsCode) {
    const sPath = `/CustomerSet('${sInput}')`;

    oView.byId("idSimpleForm").bindElement(sPath);
    oContractModel.setProperty("/Cuscode", sInput); // 고객 코드 저장

    oODataModel.read(sPath, {
      success: function (oData) {
        oContractModel.setProperty("/Cusname", oData.Name1);
        oContractModel.setProperty("/Bpadrr", oData.Bpadrr);
        oContractModel.setProperty("/Bphaed", oData.Bphaed);
        oContractModel.setProperty("/Bpcsnr", oData.Bpcsnr);
        console.log("업데이트된 contractModel 데이터 (고객코드):", oContractModel.getData());
      },
      error: function () {
        MessageBox.error("고객 정보를 불러오지 못했습니다.");
      }
    });
  } else {
    // 고객명이 입력된 경우: 필터로 검색
    oODataModel.read("/CustomerSet", {
      filters: [new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, sInput)],
      success: function (oData) {
        if (oData.results.length === 1) {
          const oCustomer = oData.results[0];
          oContractModel.setProperty("/Cuscode", oCustomer.Kunnr);
          oContractModel.setProperty("/Cusname", oCustomer.Name1);
          oContractModel.setProperty("/Bpadrr", oCustomer.Bpadrr);
          oContractModel.setProperty("/Bphaed", oCustomer.Bphaed);
          oContractModel.setProperty("/Bpcsnr", oCustomer.Bpcsnr);

          const sPath = `/CustomerSet('${oCustomer.Kunnr}')`;
          oView.byId("idSimpleForm").bindElement(sPath);

          console.log("업데이트된 contractModel 데이터 (고객명):", oContractModel.getData());
        } else if (oData.results.length > 1) {
          MessageBox.warning("입력한 이름과 일치하는 고객이 여러 명 존재합니다.");
        } else {
          MessageBox.error("입력한 고객명을 찾을 수 없습니다.");
        }
      },
      error: function () {
        MessageBox.error("고객 조회 중 오류가 발생했습니다.");
      }
    });
  }
},




        // console.log("고객 정보:", oContractModel.getData());

        // const oModel = this.getOwnerComponent().getModel(); // OData 모델
        // const oContractModel = this.getView().getModel("contractModel");

        // const sPath = `/CustomerSet('${sKunnr}')`;
        // oModel.read(sPath, {
        //     success: function (oData) {
        //         console.log("고객 정보:", oData);
        //         oContractModel.setData({
        //             // Cusname: oData.Name1,
        //             Email: oData.Zemail,
        //             // Phone: oData.Telno,
        //             Bpaddr: oData.Bpadrr,
        //             Vbegdat: null,
        //             Venddat: null,
        //             Valdel: "",
        //             Valunit: "",
        //         });
        //     },
        //     error: function () {
        //         MessageToast.show("고객 정보를 불러오지 못했습니다.");
        //     }
        // });
      
      calculateTotalDelivery: function () {
        const oModel = this.getView().getModel("contractModel");
        const sStart = oModel.getProperty("/Vbegdat"); // ex: "2025-06-01"
        const sEnd = oModel.getProperty("/Venddat"); // ex: "2025-08-31"
        const sCycle = oModel.getProperty("/Valdel"); // ex: "7"
        const iCycle = parseInt(sCycle, 10);

        const start = sStart;
        if (!start) {
          MessageBox.error("계약 시작일을 입력해주세요.");
          return;
        }
        const end = sEnd;
        if (!end) {
          MessageBox.error("계약 종료일을 입력해주세요.");
          return;
        }
        if (!sCycle || isNaN(sCycle) || parseInt(sCycle) <= 0) {
          MessageBox.error("계약 주기를 올바르게 입력해주세요.");
          return;
        }
        const cycle = parseInt(sCycle);
        if (cycle <= 0) {
          MessageBox.error("계약 주기는 1일 이상이어야 합니다.");
          return;
        }

        // 날짜 형식 변환 ( "YYYY-MM-DD" -> Date 객체 )
        const d1 = new Date(sStart);
        const d2 = new Date(sEnd);

        const diffInDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        const total = Math.floor(diffInDays / cycle) + 1;
        console.log("계약 기간:", total, "일");

        // 🔴 주기가 계약 기간보다 크면 경고
        if (iCycle > diffInDays) {
          MessageBox.error(
            `납품 주기(${iCycle}일)가 계약 기간(${diffInDays}일)을 초과할 수 없습니다.`
          );
          oModel.setProperty("/Totdelvnum", 0);
          return;
        }

        oModel.setProperty("/Totdelvnum", total);
      },

      onDeliveryInputChanged: function (oEvent) {
        const oView = this.getView();
        const oModel = oView.getModel("contractModel");

        const oInput = oEvent.getSource(); // ← 여기서 input field 참조
        const sRawValue = oView.byId("valdelInput").getValue();
        const sUnit = oView.byId("valunitSelect").getSelectedKey(); // D/W/M


        const iRaw = parseInt(sRawValue, 10);
        
        // ❗유효성 검사 분리
        if (!sRawValue) {
          // 아무것도 입력 안 한 경우
          oInput.setValueState("Error");
          oInput.setValueStateText("납품 주기를 입력해주세요.");
          oModel.setProperty("/Valdel", null);
          oModel.setProperty("/Totdelvnum", null);
          return;
        }

        if (isNaN(iRaw) || iRaw <= 0) {
          // 숫자가 아니거나 0 이하일 경우
          oInput.setValueState("Error");
          oInput.setValueStateText("납품 주기는 숫자이며, 1 이상이어야 합니다.");
          oModel.setProperty("/Valdel", null);
          oModel.setProperty("/Totdelvnum", null);
          return;
        }

        // ✅ 유효하면 에러 상태 해제
        oInput.setValueState("None");

        let iDays = iRaw;
        switch (sUnit) {
          case "W":
            iDays = iRaw * 7;
            break;
          case "M":
            iDays = iRaw * 30;
            break;
          case "D":
          default:
            iDays = iRaw;
            break;
        }

        // 💡 단위와 값이 같든 다르든 무조건 강제 반영
        oModel.setProperty("/Valdel", iDays); // 일 수로 저장
        oModel.setProperty("/Valunit", "D"); // 무조건 D 고정
        oModel.setProperty("/UIValunit", sUnit); // UI용 단위 보존 (옵션)

        // 항상 계산 실행
        this.calculateTotalDelivery();
      },

      onTest: function () {
        const oContractModel = this.getView().getModel("contractModel");
        console.log("고객 정보:", oContractModel.getData());
      },

      validateRequiredFields: function () {
        const oView = this.getView();
        let bValid = true;

        // 1. 고객명 (mdc:Field)
        const oCustomerField = oView.byId("customerInput");
        if (!oCustomerField.getValue()) {
          oCustomerField.setValueState("Error");
          oCustomerField.setValueStateText("고객명을 선택해주세요.");
          bValid = false;
        } else {
          oCustomerField.setValueState("None");
        }

        // 2. 계약 시작일
        const oStartDatePicker = oView.byId("Vbegdat");
        const oStartDate = oStartDatePicker.getDateValue();
        if (!oStartDate) {
          oStartDatePicker.setValueState("Error");
          oStartDatePicker.setValueStateText("계약 시작일을 입력해주세요.");
          bValid = false;
        } else if (oStartDate < new Date()) {
          oStartDatePicker.setValueState("Error");
          oStartDatePicker.setValueStateText("시작일은 오늘 이후여야 합니다.");
          bValid = false;
        } else {
          oStartDatePicker.setValueState("None");
        }

        // 3. 계약 종료일
        const oEndDatePicker = oView.byId("Venddat");
        const oEndDate = oEndDatePicker.getDateValue();
        if (!oEndDate) {
          oEndDatePicker.setValueState("Error");
          oEndDatePicker.setValueStateText("계약 종료일을 입력해주세요.");
          bValid = false;
        } else if (oStartDate && oEndDate <= oStartDate) {
          oEndDatePicker.setValueState("Error");
          oEndDatePicker.setValueStateText("종료일은 시작일 이후여야 합니다.");
          bValid = false;
        } else {
          oEndDatePicker.setValueState("None");
        }

        // 4. 납품 주기
        const oCycleInput = oView.byId("Valdel");
        if (!oCycleInput.getValue()) {
          oCycleInput.setValueState("Error");
          oCycleInput.setValueStateText("납품 주기를 입력해주세요.");
          bValid = false;
        } else {
          oCycleInput.setValueState("None");
        }

        return bValid;
      },

      onVbegdatChanged: function (oEvent) {
        const oDatePicker = oEvent.getSource();
        const oSelectedDate = oDatePicker.getDateValue(); // Date 객체

        // 🚨 날짜가 비어 있을 경우: 필수 입력 오류 처리
        if (!oSelectedDate) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("계약 시작일은 필수 입력값입니다.");
          oContractModel.setProperty("/Vbegdat", ""); // 모델에도 빈 값 반영
          return;
        }else{
          // 값이 유효하면 상태 초기화
            oDatePicker.setValueState("None");
        }


        const oMinDate = new Date();
        oMinDate.setDate(oMinDate.getDate() + 6);

        oMinDate.setHours(0,0,0,0);

        const oMaxDate = new Date();
        oMaxDate.setFullYear(oMaxDate.getFullYear() + 3);
        oMaxDate.setHours(23, 59, 59, 999);

        if (oSelectedDate < oMinDate || oSelectedDate > oMaxDate) {
          sap.m.MessageToast.show("계약 시작일은 오늘로부터 3주 이후 ~ 3년 이내로 선택해주세요.");
          oDatePicker.setDateValue(oMinDate);

          const yyyy = oMinDate.getFullYear();
          const mm = String(oMinDate.getMonth() + 1).padStart(2, "0");
          const dd = String(oMinDate.getDate()).padStart(2, "0");
          const sFixedDate = `${yyyy}-${mm}-${dd}`;

          this.getView().getModel("contractModel").setProperty("/Vbegdat", sFixedDate);
        }
      },

      onValdelChanged: function () {
        this.calculateTotalDelivery(); // 납품주기 입력 후 계산
      },
      
      // 필수 값 처리 
      validateInputs: function () {
      const oView = this.getView();
      const oModel = oView.getModel("contractModel");

      // 필수값 목록
      const aRequiredFields = [
        { id: "customerInput", path: "/Cusname", label: "고객명" },
        { id: "valdelInput", path: "/Valdel", label: "납품 주기" },
        { id: "datePickerVbegdat", path: "/Vbegdat", label: "계약 시작일" },
        { id: "datePickerVenddat", path: "/Venddat", label: "계약 종료일" }
      ];

      let bValid = true;

      aRequiredFields.forEach(function (field) {
        const oControl = oView.byId(field.id);
        const sValue = oModel.getProperty(field.path);

        if (!sValue || sValue.toString().trim() === "") {
          oControl.setValueState("Error");
          oControl.setValueStateText(field.label + "은(는) 필수 입력입니다.");
          bValid = false;
        } else {
          oControl.setValueState("None");
        }
      });

      return bValid;
    },


    onChange: function (oEvent) {
      const oDatePicker = oEvent.getSource();
      const oDateValue = oDatePicker.getDateValue(); // Date 객체

      if (oDateValue) {
        oDatePicker.setValueState("None");
      } else {
        oDatePicker.setValueState("Error");
        oDatePicker.setValueStateText("필수 입력값입니다.");
      }
    }
    });
  }
);
