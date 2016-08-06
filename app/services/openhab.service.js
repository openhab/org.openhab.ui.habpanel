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

        var liveUpdatesEnabled = false;

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

                if (data.data && data.data.item) { // openHAB 1
                    $rootScope.items = data.data.item;
                    if (!liveUpdatesEnabled) registerAtmosphere();
                } else if (angular.isArray(data.data)) { // openHAB 2
                    $rootScope.items = data.data;
                    if (!liveUpdatesEnabled) registerEventSource();
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
                //loadItems();
            });
        }

        function reloadItems() {
            //clearAllLongPollings();
            loadItems();
            //longPollUpdates('');
        }

        
        function registerEventSource() {
            if (typeof(EventSource) !== "undefined") {
                var source = new EventSource('/rest/events');
                liveUpdatesEnabled = true;

                source.onmessage = function (event) {
                    try {
                        var evtdata = JSON.parse(event.data);
                        var topicparts = evtdata.topic.split('/');

                        if (evtdata.type === 'ItemStateEvent') {
                            var payload = JSON.parse(evtdata.payload);
                            var newstate = payload.value;
                            var item = _.find($rootScope.items, ['name', topicparts[2]]);
                            if (item && item.state !== payload.value) {
                                $timeout(function () {
                                    console.log("Updating " + item.name + " state from " + item.state + " to " + payload.value);
                                    item.state = payload.value;
                                    $rootScope.$emit('openhab-update');
                                });
                            }
                        }

                    } catch (e) {
                        console.log('SSE event issue: ' + e.message);
                    }
                }
                source.onerror = function (event) {
                    console.log('SSE connection error, reconnecting in 5 seconds');
                    liveUpdatesEnabled = false;
                    $timeout(registerEventSource, 5000);
                }
            }
        }

        function registerAtmosphere() {
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
                        liveUpdatesEnabled = true;
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

            var socket = atmosphere.subscribe(request);
            liveUpdatesEnabled = true;
        }
    }
})();
