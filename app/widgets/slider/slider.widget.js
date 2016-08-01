(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetSlider', widgetSlider)
        .controller('WidgetSettingsCtrl-slider', WidgetSettingsCtrlSlider)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'slider',
                displayName: 'Slider',
                description: 'A slider for setting numerical OpenHAB items'
            });
        });

    widgetSlider.$inject = ['$rootScope', '$modal', 'OHService'];
    function widgetSlider($rootScope, $modal, OHService) {
        // Usage: <widget-Slider ng-model="widget" />
        //
        // Creates: A Slider widget
        //
        var directive = {
            bindToController: true,
            controller: SliderController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/slider/slider.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    SliderController.$inject = ['$rootScope', '$scope', 'OHService', '$timeout'];
    function SliderController ($rootScope, $scope, OHService, $timeout) {
        var vm = this;
        this.widget = this.ngModel;
        vm.slider = {
            value: 0,
            options: {
                id: 'slider-' + vm.widget.item,
                floor: (vm.widget.floor) ? vm.widget.floor : 0,
                ceil: (vm.widget.ceil) ? vm.widget.ceil : 100,
                step: (vm.widget.step) ? vm.widget.step : 1,
                keyboardSupport: false,
                vertical: vm.widget.vertical,
                showSelectionBar: true,
                hideLimitLabels: vm.widget.hidelimits,
                hidePointerLabels: vm.widget.hidepointer,
                showTicks: vm.widget.showticks,
                showTicksValues: vm.widget.showticksvalues,
                enforceStep: false,
                translate: function (value) {
                    return (vm.widget.unit) ? value + vm.widget.unit : value;
                },
                onEnd: function (id) {
                    console.log('slider onEnd:' + id);
                    OHService.sendCmd(vm.widget.item, vm.slider.value);
                }
            }
        };

        function updateValue() {
            vm.slider.value = parseInt(OHService.getItem(vm.widget.item).state);
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
            });
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlSlider.$inject = ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlSlider($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            vertical: widget.vertical,
            hidelabel: widget.hidelabel,
            floor: widget.floor || 0,
            ceil: widget.ceil || 100,
            step: widget.step || 1,
            unit: widget.unit,
            hidelimits: widget.hidelimits,
            hidepointer: widget.hidepointer,
            showticks: widget.showticks,
            showticksvalues: widget.showticksvalues,

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