(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetDummy', widgetDummy)
        .controller('WidgetSettingsCtrl-dummy', WidgetSettingsCtrlDummy)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'dummy',
                displayName: 'Dummy',
                description: 'A dummy widget - displays the value of an OpenHAB item'
            });
        });

    widgetDummy.$inject = ['$rootScope', '$modal', 'OHService'];
    function widgetDummy($rootScope, $modal, OHService) {
        // Usage: <widget-dummy ng-model="widget" />
        //
        // Creates: A dummy widget
        //
        var directive = {
            bindToController: true,
            controller: DummyController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/dummy/dummy.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    DummyController.$inject = ['$rootScope', '$scope', 'OHService'];
    function DummyController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            vm.value = OHService.getItem(vm.widget.item).state;
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlDummy.$inject = ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlDummy($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            // background: widget.background,
            // foreground: widget.foreground,
            font_size: widget.font_size,
            nolinebreak: widget.nolinebreak,
            unit: widget.unit,
            backdrop_iconset: widget.backdrop_iconset,
            backdrop_icon: widget.backdrop_icon,
            backdrop_center : widget.backdrop_center,
            iconset: widget.iconset,
            icon: widget.icon,
            icon_size: widget.icon_size,
            icon_nolinebreak: widget.icon_nolinebreak,
            icon_replacestext: widget.icon_replacestext
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
