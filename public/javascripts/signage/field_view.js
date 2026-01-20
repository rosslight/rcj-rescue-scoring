// register the directive with your app module
var app = angular.module('ddApp', ['ngTouch', 'ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies']);
var marker = {};
var socket;
// function referenced by the drop target
app.controller('ddController', ['$scope', '$uibModal', '$log', '$timeout', '$http', '$cookies', function ($scope, $uibModal, $log, $timeout, $http, $cookies) {

    $http.get(`/api/fields/${fieldId}`).then(function (response) {
        $scope.field = response.data;
    })

    $http.get(`/api/competitions/${competitionId}`).then(function (response) {
        $scope.competition = response.data;
    })

    function getGameList(league, status) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `/api/runs/${league}/find/${competitionId}/${fieldId}/${status}`, false);
        xhr.send();
        let json = JSON.parse(xhr.response);
        json.map((j) => {
            j.league = league;
        })
        return json;
    }

    function sortGames(list, order = 1) {
        return list.sort(function(a, b) {
            if (a.startTime > b.startTime) {
              return 1 * order;
            } else {
              return -1 * order;
            }
        });
    }

    $scope.iframeUrl = null;
    $scope.nextGame = null;
    function update() {
        let league = new URL(window.location.href).searchParams.get('league') || 'all';
        let gameList;
        if (league == 'line') {
            gameList = getGameList('line', 2);
        } else if (league == 'maze') {
            gameList = getGameList('maze', 2);
        } else {
            gameList = getGameList('line', 2);
            gameList = gameList.concat(getGameList('maze', 2));
        }
        gameList = sortGames(gameList, -1);
        
        if (gameList.length > 0) {
            let game = gameList[0];
            $scope.iframeUrl = `/${game.league}/view/${game._id}/iframe`;
            $scope.nextGame = null;
            return;
        }

        if (league == 'line') {
            gameList = getGameList('line', 3);
        } else if (league == 'maze') {
            gameList = getGameList('maze', 3);
        } else {
            gameList = getGameList('line', 3);
            gameList = gameList.concat(getGameList('maze', 3));
        }
        gameList = sortGames(gameList, -1);

        if (gameList.length > 0) {
            let game = gameList[0];
            $scope.iframeUrl = `/${game.league}/view/${game._id}/iframe`;
            $scope.nextGame = null;
            return;
        }

        $scope.iframeUrl = null;
        if (league == 'line') {
            gameList = getGameList('line', 0);
        } else if (league == 'maze') {
            gameList = getGameList('maze', 0);
        } else {
            gameList = getGameList('line', 0);
            gameList = gameList.concat(getGameList('maze', 0));
        }
        gameList = sortGames(gameList);

        if (gameList.length > 0) {
            $scope.nextGame = gameList[0];
            return;
        }
        $scope.nextGame = null;
    }

    update();

    setInterval(function () {
        update();
        $scope.$apply();
    }, 5000);

    $scope.behindSchedule = function (game) {
        // Check if the game has a start time and if it is in the past more then 5 minutes
        if (game.startTime && game.startTime < Date.now() - 5 * 60 * 1000) {
            return true;
        }
        return false;
    }
}])