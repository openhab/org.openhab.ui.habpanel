// (function() {
// 'use strict';

	angular
		.module('app')
		.controller('DashboardViewCtrl', DashboardViewController);

	DashboardViewController.$inject = ['$scope', '$rootScope', '$timeout', 'dashboard', 'PersistenceService', 'OHService', 'Fullscreen'];
	function DashboardViewController($scope, $rootScope, $timeout, dashboard, PersistenceService, OHService, Fullscreen) {
		var vm = this;
		vm.dashboard = dashboard;

		vm.gridsterOptions = {
			margins: [5, 5],
			columns: 12,
			pushing: false,
			floating: false,
			mobileModeEnabled: false,
			draggable: { enabled: false },
			resizable: { enabled: false }
		};

		var fullscreenhandler = Fullscreen.$on('FBFullscreen.change', function(evt, enabled) {
			vm.fullscreen = enabled;
		})
		$scope.$on('$destroy', function() {
			fullscreenhandler();
			//OHService.clearAllLongPollings();
		});
		
		activate();

		////////////////



		function activate() {
			OHService.reloadItems();
			//Fullscreen.all();
		}

		vm.refresh = function () {
			OHService.reloadItems();
		};

		vm.goFullscreen = function () {
			Fullscreen.toggleAll();
		};
	}
// });

