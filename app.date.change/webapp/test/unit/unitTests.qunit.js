/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synccasd/app.date.change/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
