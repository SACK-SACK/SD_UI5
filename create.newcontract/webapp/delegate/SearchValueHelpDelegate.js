sap.ui.define([
    "sap/ui/mdc/ValueHelpDelegate"
], function (ValueHelpDelegate) {
    "use strict";

    const CustomVHDelegate = Object.assign({}, ValueHelpDelegate);

    CustomVHDelegate.isSearchSupported = function () {
        return true;
    };

    return CustomVHDelegate;
});
