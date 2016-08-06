(function() {
    'use strict';

    angular.module('app.widgets', [
        'app.services',
        'rzModule',
        'web.colorpicker'
    ])
    .value('WidgetTypes', [])
    .factory('Widgets', WidgetsService)
    .directive('genericWidget', GenericWidgetDirective);

    WidgetsService.$inject = ['WidgetTypes'];
    function WidgetsService(widgetTypes) {

        var service = {
            registerType: registerType,
            getWidgetTypes: getWidgetTypes
        }

        return service;

        ////////////////
        
        function registerType(widget) {
            widgetTypes.push(widget);
            console.log("Registered widget type: " + widget.type);
        }

        function getWidgetTypes() {
            return widgetTypes;
        }

    }

    GenericWidgetDirective.$inject = ['$compile', 'Widgets'];
    function GenericWidgetDirective($compile, widgets) {
        var directive = {
            restrict: 'AE',
            replace: true,
            scope: {
                type: '=',
                ngModel: '='
            },
            link: function (scope, element, attrs) {
                element.html('<widget-' + scope.type + ' ng-model="ngModel"></widget-' + scope.type + '>');
                $compile(element.contents())(scope);
            }
        }

        return directive;

    }

})();
