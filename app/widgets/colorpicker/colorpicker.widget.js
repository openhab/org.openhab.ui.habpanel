(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetColorPicker', widgetColorPicker)
        .controller('WidgetSettingsCtrl-colorpicker', WidgetSettingsCtrlColorPicker)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'colorpicker',
                displayName: 'Color Picker',
                description: 'Displays an color picker'
            });
        });

    widgetColorPicker.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetColorPicker($rootScope, $modal, OHService) {
        // Usage: <widget-colorpicker ng-model="widget" />
        //
        // Creates: A colorpicker widget
        //
        var directive = {
            bindToController: true,
            controller: ColorPickerController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/colorpicker/colorpicker.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    ColorPickerController.$inject = ['$rootScope', '$scope', 'OHService'];
    function ColorPickerController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;

    }


    // settings dialog
    WidgetSettingsCtrlColorPicker.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlColorPicker($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            url: widget.url,
            iconset: widget.item
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