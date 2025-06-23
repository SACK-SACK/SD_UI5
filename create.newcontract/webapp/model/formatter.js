sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
  "use strict";

  var mStatusState = {
    A: "Success",
    O: "Warning",
    D: "Error",
  };

  var formatter = {
    /**
     * 가격 포맷
     */
    price: function (sValue) {
      if (!sValue) {
        return "0";
      }

      var numberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
        currencyCode: false,
        showMeasure: false,
        maxFractionDigits: 0,
        groupingEnabled: true,
      });

      return numberFormat.format(Number(sValue), "KRW"); // ← 여기 숫자 변환!
    },

    /**
     * 자재당 총합 계산 (수량 * 가격)
     */
    totalCartPrice: function (aItems) {
      if (!Array.isArray(aItems)) {
        return "0";
      }

      var fTotal = aItems.reduce(function (sum, item) {
        var fPrice = parseFloat(item.Regprice) || 0;
        var iQty = parseInt(item.Quantity) || 0;
        console.log("🧪 아이템 가격:", fPrice, "수량:", iQty);
        return sum + fPrice * iQty;
      }, 0);

      var numberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
        currencyCode: false,
        showMeasure: false,
        maxFractionDigits: 0,
        groupingEnabled: true,
      });

      return numberFormat.format(Number(fTotal), "KRW"); // ← 여기 숫자 변환!
    },
    /**
     * 상태 텍스트 (i18n 의존)
     */
    statusText: function (sStatus) {
      var oBundle = this?.getResourceBundle?.();
      if (!oBundle) return sStatus;

      var mStatusText = {
        A: oBundle.getText("statusA"),
        O: oBundle.getText("statusO"),
        D: oBundle.getText("statusD"),
      };
      return mStatusText[sStatus] || sStatus;
    },

    /**
     * 상태 색상 (Success / Warning / Error / None)
     */
    statusState: function (sStatus) {
      return mStatusState[sStatus] || "None";
    },

    /**
     * 이미지 상대 경로 처리
     */
    pictureUrl: function (sName) {
      if (!sName) return undefined;

      // 공백 포함된 이름 그대로 이미지 파일로 가정
      // const sPath = "img/" + sName + ".jpg";
      // return sap.ui.require.toUrl(sPath);
      return sap.ui.require.toUrl(
        "sync/ca/sd/create/newcontract/img/" + sName + ".jpg"
      );
    },

    /**
     * 두 개 중 하나라도 아이템이 있으면 true
     */
    hasItems: function (aItems) {
      // const a = Array.isArray(aItems) && aItems.length > 0;
      // const aArray = Array.isArray(aItems) ? aItems : Object.values(aItems); // 강제 배열

      // return aArray.length > 0;
      // const a =  aArray.length > 0;
      // console.log("hasItems 호출됨", aArray, aArray.length);
      // console.log("hasItems 호출됨", a);
      // return Boolean(a);
      console.log("🧪 실제 배열 변환 결과:", aItems);
      return !!aItems && "0" in aItems;
      // return aArray;
    },
    //step2 section에서 사용
    isProduct: function (sMatnr) {
      return typeof sMatnr === "string" && sMatnr.startsWith("MAT4");
    },

    isSemiProduct: function (sMatnr) {
      return typeof sMatnr === "string" && sMatnr.startsWith("MAT3");
    },
    deliveryUnit: function (valdel, valunit) {
      const unitMap = {
        D: "일",
        W: "주",
        M: "월",
      };
      return valdel + " " + (unitMap[valunit] || valunit);
    },
  };

  return formatter;
});
