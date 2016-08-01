(function() {
'use strict';

    angular
        .module('app')
        .controller('MenuCtrl', MenuController);

    MenuController.$inject = ['$rootScope', 'dashboards', '$interval', '$location', 'PersistenceService', 'prompt', 'Fullscreen'];
    function MenuController($rootScope, dashboards, $interval, $location, PersistenceService, prompt, Fullscreen) {
        var vm = this;
        vm.dashboards = dashboards;
        vm.editMode = false;
        vm.clock = new Date();

        activate();

        ////////////////

        function activate() {
            var tick = function () {
                vm.clock = Date.now();
            }
            $interval(tick, 1000);
        }

        vm.addNewDashboard = function() {
            prompt({
                title: "New dashboard",
                message: "Name of your new dashboard",
                input: true
            }).then(function (name) {
                dashboards.push({ id: name, name: name, widgets: [] });
                PersistenceService.saveDashboards();
            });

        }

        vm.toggleEditMode = function () {
            vm.editMode = !vm.editMode;
        }

        vm.removeDashboard = function (dash) {
            prompt({
                title: "Remove dashboard",
                message: "Please confirm you want to delete this dashboard: " + dash.name,
            }).then(function () {
                dashboards.splice(dashboards.indexOf(dash), 1);
                PersistenceService.saveDashboards();
            });
        }

        vm.viewDashboard = function (dash) {
            $location.url('/view/' + dash.id);
        }

		vm.goFullscreen = function () {
			Fullscreen.toggleAll();
		}

        vm.showConfiguration = function () {
            prompt({
                title: "Show configuration",
                message: "This is the raw configuration object. You can use this to backup/restore your entire config by copy-pasting the JSON to or from somewhere else. Be careful though - no checks are performed here!",
                input: true,
                label: "Configuration JSON object",
                value: JSON.stringify(dashboards) 
            }).then(function (confstr) {
                try {
                    var newconf = JSON.parse(confstr);
                // maybe add some checks here eventually
                    angular.copy(newconf, $rootScope.dashboards);
                    PersistenceService.saveDashboards();
                    PersistenceService.getDashboards();
                } catch (e) {
                    prompt({
                        title: "Error",
                        message: "Configuration parsing error, nothing has been modified: " + e,
                        buttons: [{ label:'OK', primary: true }]
                    });
                }
            });
        }
    }
})();