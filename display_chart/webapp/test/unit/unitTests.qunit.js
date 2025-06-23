/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"display_chart/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
