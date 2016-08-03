(function() {
'use strict';

    angular
        .module('app.services')
        .service('OHService', OHService);

    OHService.$inject = ['$rootScope', '$http', '$q', '$timeout', '$interval', 'atmosphereService'];
    function OHService($rootScope, $http, $q, $timeout, $interval, atmosphereService) {
        this.getItem = getItem;
        this.getItems = getItems;
        this.onUpdate = onUpdate;
        this.sendCmd = sendCmd;
        this.reloadItems = reloadItems;
        //this.clearAllLongPollings = clearAllLongPollings;

        loadItems();

        ////////////////

        function onUpdate(scope, name, callback) {
            var handler = $rootScope.$on('openhab-update', callback);
            scope.$on('$destroy', handler);
            //watchItem(name);
            //longPollUpdates(name);
        }

        function loadItems() {
            $http.get('/rest/items')
            .then(function (data) {
                console.log('Loaded OpenHAB items');
                if (data.data && data.data.item) {
                  $rootScope.items = data.data.item; // openHAB 1
                } else if (angular.isArray(data.data)) {
                  $rootScope.items = data.data;      // openHAB 2
                } else {
                  console.log("Items not found?");
                  $rootScope.items = [];
                }
                $rootScope.$emit('openhab-update');
            });
        }

        function getItem(name) {
            return _.find($rootScope.items, ['name', name]);
        }

        function getItems() {
            return $rootScope.items;
        }

        function sendCmd(item, cmd) {
            $http({
                method: 'POST',
                url: '/rest/items/' + item,
                data: cmd,
                headers: { 'Content-Type': 'text/plain' }
            }).then(function (data) {
                console.log('Command sent: ' + item + '=' + cmd);

                // should be handled by server push messages but their delivery is erratic
                // so perform a full refresh every time a command is sent
                loadItems();
            });
        }

        function reloadItems() {
            //clearAllLongPollings();
            loadItems();
            //longPollUpdates('');
        }

        $interval(function () {
          reloadItems();
        }, 5000);

        /*// watch for changes with Atmosphere.js
        var request = {
            url: '/rest/items',
            contentType: 'application/json',
            logLevel: 'debug',
            transport: 'websocket',
            fallbackTransport: 'long-polling',
            attachHeadersAsQueryString: true,
            reconnectInterval: 5000,
            enableXDR: true,
            timeout: 60000
        };

        request.headers = { "Accept": "application/json" };

        request.onClientTimeout = function(response){
            $timeout(function () {
                 socket = atmosphereService.subscribe(request);
            }, request.reconnectInterval);
        };

        request.onMessage = function (response) {
             try
             {
                 var data = atmosphere.util.parseJSON(response.responseBody);
                if ($rootScope.items && data && data != "") {
                    var item = _.find($rootScope.items, ['name', data.name]);
                    if (item) {
                        $timeout(function () {
                            console.log("Received push message: Changing " + item.name + " state from " + item.state + " to " + data.state);
                            item.state = data.state;
                            $rootScope.$emit('openhab-update');
                        });
                    }
                }
             } catch (e) {
                 console.log("Couldn't parse Atmosphere message: " + response);
             }
        };

        var socket = atmosphere.subscribe(request);*/

/*
        var longPollings = [];

        function clearAllLongPollings() {
            console.log('clearing ' + longPollings.length + ' long polling requests');
            _.each(angular.copy(longPollings), function (req) {
                cancelRequest(req);
            });
        }

        function cancelRequest(req) {
            req.resolve("cancelled");
            longPollings.splice(longPollings.indexOf(req), 1);
        }


        function longPollUpdates(name) {
            var deferred = $q.defer();
            var poller = $http.get('/rest/items/', { //} + name, {
                headers: { 'X-Atmosphere-Transport': 'long-polling',
                            'X-Atmosphere-tracking-id': Math.random().toString().substring(3),
                            'Accept': 'application/json',
                            },
                timeout: deferred.promise, 
                transformResponse: function (data) {
                    // sometimes invalid JSON is returned (multiple objects), so we can't let Angular parse it
                    try {
                        if (data) {
                            var json = JSON.parse(data);
                            return json;
                        }
                        return null;
                    } catch (e) {
                        try {
                            var json = JSON.parse('[' + data + ']');
                            return json;
                        } catch (e2) {
                            console.log('Problem parsing Atmosphere JSON response');
                            return null;
                        }
                    }
                }
            });
            longPollings.push(deferred);
            
            poller.then(function (data) {
                console.log('long polling returns: ' + name);
                if ($rootScope.items && data.data && data.data != "") {
                    if (angular.isArray(data.data)) {
                        _.each(data.data, function (newitem) {
                            var item = _.find($rootScope.items, ['name', newitem.name]);
                            if (item) item.state = newitem.state;
                        });
                        $rootScope.$emit('openhab-update');
                    } else {
                        var item = _.find($rootScope.items, ['name', data.data.name]);
                        if (item) item.state = data.data.state;
                        $rootScope.$emit('openhab-update');
                    }
                }
                cancelRequest(deferred);

                longPollUpdates(name);
            },
            function (err) {
                // add a delay before reattempting
                // console.log('long polling error: ' + name);
                // cancelRequest(deferred);
                // $interval(function () {
                //     longPollUpdates(name);
                // }, 1000);
            })
        }

        //longPollUpdates('');
*/
        
    }
})();
