(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetSwitch', widgetSwitch)
        .controller('WidgetSettingsCtrl-switch', WidgetSettingsCtrlSwitch)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'switch',
                displayName: 'Switch',
                description: 'A ON/OFF toggle for OpenHAB switches'
            });
        });

    widgetSwitch.$inject = ['$rootScope', '$modal', 'OHService'];
    function widgetSwitch($rootScope, $modal, OHService) {
        // Usage: <widget-Switch ng-model="widget" />
        //
        // Creates: A Switch widget
        //
        var directive = {
            bindToController: true,
            controller: SwitchController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/switch/switch.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    SwitchController.$inject = ['$rootScope', '$scope', 'OHService'];
    function SwitchController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            vm.value = OHService.getItem(vm.widget.item).state;
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        vm.toggleSwitch = function () {
            if (vm.value == "ON") {
                OHService.sendCmd(this.widget.item, "OFF");
            } else {
                OHService.sendCmd(this.widget.item, "ON");
            }
        }

        vm.valueAsBool = function () {
            return vm.value == 'ON';
        }

    }


    // settings dialog
    WidgetSettingsCtrlSwitch.$inject = ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlSwitch($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            hidelabel: widget.hidelabel,
            hideicon: widget.hideicon,
            hideonoff: widget.hideonoff,
            iconset: widget.iconset,
            icon: widget.icon
        };

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);

            $modalInstance.close(widget);
        };

    }


})();