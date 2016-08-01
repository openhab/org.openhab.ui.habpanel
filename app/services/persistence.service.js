(function() {
'use strict';

    angular
        .module('app.services')
        .service('PersistenceService', PersistenceService);

    PersistenceService.$inject = ['$rootScope', 'localStorageService'];
    function PersistenceService($rootScope, localStorageService) {
        this.getDashboards = getDashboards;
        this.getDashboard = getDashboard;
        this.saveDashboards = saveDashboards;
        
        ////////////////

        function loadDashboards() {
            $rootScope.dashboards = localStorageService.get("dashboards") || [];
        }

        function getDashboards() {
            if (!$rootScope.dashboards) {
                loadDashboards();
            }
            
            return $rootScope.dashboards; 
        }

        function getDashboard(id) {
            if (!$rootScope.dashboards) {
                loadDashboards();
            }

            return _.find($rootScope.dashboards, ['id', id]);
        }

        function saveDashboards() {
            if (!$rootScope.dashboards) return;

            localStorageService.set("dashboards", $rootScope.dashboards);
        }
    }
})();
