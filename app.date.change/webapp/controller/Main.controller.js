sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("sync.ca.sd.app.date.change.controller.Main", {
      onInit() {
        const oCountModel = new sap.ui.model.json.JSONModel({
          Total: 0,
          Pending: 0,
          Approved: 0,
          Rejected: 0,
        });
        this.getView().setModel(oCountModel, "count");
      },
      _updateCountsFromModel: function () {
        const oModel = this.getView().getModel(); // OData 모델
        const oCountModel = this.getView().getModel("count"); // JSONModel("count")

        oModel.read("/APP_CHANGESet", {
          success: function (oData) {
            const aResults = oData.results || [];

            let iPending = 0,
              iApproved = 0,
              iRejected = 0;

            aResults.forEach(function (oRow) {
              switch (oRow.Approve) {
                case "W":
                  iPending++;
                  break;
                case "A":
                  iApproved++;
                  break;
                case "R":
                  iRejected++;
                  break;
              }
            });

            // 🔁 View의 바인딩 키와 정확히 맞춰 세팅
            oCountModel.setData({
              Total: aResults.length,
              Pending: iPending,
              Approved: iApproved,
              Rejected: iRejected,
            });
          },
          error: function (oError) {
            console.error("❌ 카운트 조회 실패:", oError);
          },
        });
      },

      onApprovePress: function () {
  const oTable = this.byId("appChangeTable");
  const aSelectedItems = oTable.getSelectedItems();

  if (aSelectedItems.length === 0) {
    MessageToast.show("선택된 항목이 없습니다.");
    return;
  }

  const oModel = this.getView().getModel();
  const sGroupId = "batchApproveGroup";

  // Deferred 그룹 세팅
  oModel.setDeferredGroups([sGroupId]);

  let iApprovedCount = 0;
  let bHasInvalid = false;

  aSelectedItems.forEach(function (oItem) {
    const oCtx = oItem.getBindingContext();
    const oData = oCtx.getObject();

    if (oData.Approve === "W") {
      const sPath = oCtx.getPath();
      oModel.update(sPath, { Approve: "A" }, {
        groupId: sGroupId
      });
      iApprovedCount++;
    } else {
      bHasInvalid = true;
    }
  });

  if (iApprovedCount === 0) {
    MessageToast.show("선택된 항목 중 승인 가능한 항목이 없습니다.");
    return;
  }

  // 한 번에 batch 요청 전송
  oModel.submitChanges({
    groupId: sGroupId,
    success: function () {
      if (iApprovedCount > 0 && bHasInvalid) {
        MessageToast.show("대기 상태인 건만 승인되었습니다.");
      } else {
        MessageToast.show("승인 완료");
      }
      // 카운트 갱신
      this._updateCountsFromModel();
      // 선택 초기화
      oTable.removeSelections();
    }.bind(this),
    error: function (oError) {
      console.error("❌ 일괄 승인 실패:", oError);
      MessageToast.show("일괄 승인 실패");
    }
  });
},
     onRejectPress: function () {
  const oTable = this.byId("appChangeTable");
  const aSelectedItems = oTable.getSelectedItems();

  if (aSelectedItems.length === 0) {
    MessageToast.show("선택된 항목이 없습니다.");
    return;
  }

  const oModel = this.getView().getModel();
  const sGroupId = "batchRejectGroup";

  oModel.setDeferredGroups([sGroupId]);

  let iRejectedCount = 0;
  let bHasInvalid = false;

  aSelectedItems.forEach(function (oItem) {
    const oCtx = oItem.getBindingContext();
    const oData = oCtx.getObject();

    if (oData.Approve === "W") {
      const sPath = oCtx.getPath();
      oModel.update(sPath, { Approve: "R" }, {
        groupId: sGroupId
      });
      iRejectedCount++;
    } else {
      bHasInvalid = true;
    }
  });

  if (iRejectedCount === 0) {
    MessageToast.show("선택된 항목 중 반려 가능한 항목이 없습니다.");
    return;
  }

  oModel.submitChanges({
    groupId: sGroupId,
    success: function () {
      if (iRejectedCount > 0 && bHasInvalid) {
        MessageToast.show("대기 상태인 건만 반려되었습니다.");
      } else {
        MessageToast.show("반려 완료");
      }
      this._updateCountsFromModel();
      oTable.removeSelections();
    }.bind(this),
    error: function (oError) {
      console.error("❌ 일괄 반려 실패:", oError);
      MessageToast.show("일괄 반려 실패");
    }
  });
},
      onFilterSelect: function (oEvent) {
        const sKey = oEvent.getParameter("key");
        const oTable = this.byId("appChangeTable");
        const oBinding = oTable.getBinding("items");

        if (!oBinding) {
          console.warn("❗ 테이블 바인딩이 없습니다.");
          return;
        }

        let aFilters = [];

        if (sKey !== "All") {
          aFilters.push(new sap.ui.model.Filter("Approve", "EQ", sKey));
        }

        oBinding.filter(aFilters);

        // 🔁 탭 선택할 때 count 다시 계산
         this._updateCountsFromModel();
      },
    });
  }
);
