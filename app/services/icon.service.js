(function() {
'use strict';

    angular
        .module('app.services')
        .service('IconService', IconService)
        .directive('iconPicker', IconPicker)
        .directive('widgetIcon', WidgetIcon)

    IconService.$inject = ['$http', '$q'];
    function IconService($http, $q) {
        this.getIconUrl = getIconUrl;
        this.getIconSets = getIconSets;
        this.getIconSet = getIconSet;
        this.getIcons = getIcons;

        var iconsets = [
            { id: 'freepik-household', name: 'Builtin: Freepik Household', type: 'builtin', colorize: true },
            { id: 'freepik-gadgets', name: 'Builtin: Freepik Gadgets', type: 'builtin', colorize: true },
            { id: 'smarthome-set', name: 'Builtin: Smart Home Set', type: 'builtin', colorize: true },
            { id: 'eclipse-smarthome-classic', name: 'openHAB 2 classic', type: 'oh2', oh2iconset: 'classic', colorize: false }
        ];
        
        ////////////////

        function getIconUrl(iconset, icon) {
            var set = _.find(iconsets, ['id', iconset]);
            if (set.type === 'builtin') {
                return 'assets/icons/' + set.id + '/' + icon + '.svg';
            } else {
                return '/icon/' + icon + '?format=svg';
            }
        }

        function getIconSets() {
            // TODO: get iconsets from API if using OH2
            return iconsets;
        }

        function getIconSet(iconset) {
            return _.find(iconsets, ['id', iconset]);
        }

        function getIcons(iconset) {
            return $http.get('assets/icons/' + iconset + '.list.json');
        }

    }


    // TODO: Move these directives elsewhere
    IconPicker.$inject = ['IconService'];
    function IconPicker(IconService) {
        var directive = {
            link: link,
            restrict: 'AE',
            template: 
                //d'<select ng-options="set.id as set.name for set in iconsets" ng-model="iconset"></select>' +
                //'<br /><select ng-options="icon for icon in icons" ng-model="icon"></select>' +
                '<div class="btn-group" dropdown is-open="status.isopen2">' +
                '<a href id="iconset-picker-btn" class="btn btn-default" dropdown-toggle>' +
                '{{setdropdownlabel}}&nbsp;<span class="caret" />' +
                '</a>' +
                '<ul class="dropdown-menu" role="menu" aria-labelledby="iconset-picker-btn">' +
                '<li ng-repeat="iconset in iconsets"><a ng-click="selectIconset(iconset)">{{iconset.name}}</a></li>' +
                '</ul>' +
                '</div><br />' +
                '<div class="btn-group" dropdown is-open="status.isopen">' +
                '<a href id="icon-picker-btn" class="btn btn-default" dropdown-toggle>' +
                '<img width="64px" height="64px" ng-src="{{iconUrl}}" />&nbsp;<span class="caret" />' +
                '</a>' +
                '<ul class="dropdown-menu" role="menu" aria-labelledby="icon-picker-btn">' +
                '<li ng-repeat="icon in icons"><a ng-click="selectIcon(icon)"><img width="64px" height="64px" ng-src="{{iconService.getIconUrl(iconset, icon)}}" />&nbsp;{{icon}}</a></li>' +
                '</ul>' +
                '</div>' +
                '<br /><small><a target="_blank" href="{{noticeUrl}}">{{notice}}</a></small><br />',
            scope: {
                iconset: '=',
                icon: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            scope.iconsets = IconService.getIconSets();
            scope.iconService = IconService;
            scope.setdropdownlabel = "Select icon set";

            scope.selectIconset = function (iconset) {
                scope.icons = [];
                scope.iconset = iconset.id;
                scope.setdropdownlabel = iconset.name;

                IconService.getIcons(iconset.id).then(function (res) {
                    scope.icons = res.data.icons;
                    scope.notice = res.data.notice;
                    scope.noticeUrl = res.data.url;
                })
            }

            scope.selectIcon = function (icon) {
                scope.icon = icon;
            }

            scope.$watch('icon', function (set) {
                scope.iconUrl = IconService.getIconUrl(scope.iconset, scope.icon);
            })

        }
    }

    /* @ngInject */
    function IconPickerController () {
        
    }

    WidgetIcon.$inject = ['IconService'];
    function WidgetIcon(IconService) {
        var directive = {
            link: link,
            restrict: 'AE',
            template: '<div class="icon-backdrop"><img height="100%" ng-class="{ colorize: colorize }" class="icon-tile-backdrop" ng-src="{{iconUrl}}" /></div>',
            scope: {
                iconset: '=',
                icon: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            scope.colorize = IconService.getIconSet(scope.iconset).colorize;
            scope.iconUrl = IconService.getIconUrl(scope.iconset, scope.icon);
        }
    }

    /* @ngInject */
    function WidgetIconController () {
        
    }



})();
