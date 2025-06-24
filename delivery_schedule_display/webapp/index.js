sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function(
	ComponentContainer
) {
	"use strict";
    new ComponentContainer({
        name : 'sync.ca.sd.deliveryscheduledisplay',
        height : "100%",
        settings : {
            id : "deliverApp"
        },
        manifest: true
    }).placeAt('content');
});