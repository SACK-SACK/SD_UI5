/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synccasd/delivery_schedule_display/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
