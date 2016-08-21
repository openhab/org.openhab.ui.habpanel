(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetChart', widgetChart)
        .controller('WidgetSettingsCtrl-chart', WidgetSettingsCtrlChart)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'chart',
                displayName: 'Chart',
                description: 'Displays a chart'
            });
        });

    widgetChart.$inject = ['$rootScope', '$timeout', '$uibModal', 'OHService'];
    function widgetChart($rootScope, $timeout, $modal, OHService) {
        // Usage: <widget-chart ng-model="widget" />
        //
        // Creates: A chart widget
        //
        var directive = {
            bindToController: true,
            controller: ChartController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/chart/chart.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            $timeout(function () {
                var width = element[0].parentNode.parentNode.parentNode.style.width.replace('px', '');
                var height = element[0].parentNode.parentNode.parentNode.style.height.replace('px', '');
                if (scope.vm.widget.charttype === 'rrd4j') { // why?
                    scope.vm.width = sprintf("%d", width - 109);
                    scope.vm.height = sprintf("%d", height - 78);
                } else if (scope.vm.widget.charttype === 'default') {
                    scope.vm.width = sprintf("%d", width - 20);
                    scope.vm.height = sprintf("%d", height - 20);
                }
            });
        }
    }
    ChartController.$inject = ['$rootScope', '$scope', 'OHService'];
    function ChartController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;

    }


    // settings dialog
    WidgetSettingsCtrlChart.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlChart($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            charttype: widget.charttype,
            service: widget.service,
            period: widget.period,
            refresh: widget.refresh
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