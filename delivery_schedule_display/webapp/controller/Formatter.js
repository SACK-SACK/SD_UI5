sap.ui.define(
  ["sap/ui/core/library", "sap/ui/core/format/NumberFormat"],
  function (coreLibrary, NumberFormat) {
    "use strict";

    const { ValueState } = coreLibrary;

    const Formatter = {
      // 상태 색상
      plancreate: function (sPlancreate) {
        if (sPlancreate === "X") {
          return ValueState.Success; // 초록색
        } else if (!sPlancreate || sPlancreate === " ") {
          return ValueState.Error; // 빨간색
        } else {
          return ValueState.None; // 기본 회색
        }
      },

      // 상태 텍스트
      plancreateText: function (sPlancreate) {
        return sPlancreate === "X" ? "납기 일정 생성" : "납기 일정 미생성";
      },

      // 상태 아이콘
      plancreateIcon: function (sPlancreate) {
        if (sPlancreate === "X") {
          return "sap-icon://accept"; // 생성됨
        } else {
          return "sap-icon://decline"; // 생성되지 않음
        }
      },

      // 금액 문자열 조합
      combinedAmountText: function (sLabel, sAmount) {
        if (!sAmount || isNaN(sAmount)) return "";
        const formattedAmount = parseFloat(sAmount).toLocaleString();
        return `${sLabel} ${formattedAmount}`;
      },

      dateRangeText: function (oStart, oEnd) {
        // 💡 Date 객체로 강제 변환
        const dStart = new Date(oStart);
        const dEnd = new Date(oEnd);

        if (
          !dStart ||
          !dEnd ||
          isNaN(dStart.getTime()) ||
          isNaN(dEnd.getTime())
        ) {
          return "";
        }

        const oFormat = sap.ui.core.format.DateFormat.getInstance({
          pattern: "yyyy-MM-dd",
        });
        return oFormat.format(dStart) + " ~ " + oFormat.format(dEnd);
      },

    };

    return Formatter;
  }
);
