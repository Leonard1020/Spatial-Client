// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'btford.socket-io'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).
factory('mySocket', function (socketFactory) {
  return {
    getSocket: function(ip) {
      var myIoSocket = io.connect('http://' + ip + ':45101');
      mySocket = socketFactory({
        ioSocket: myIoSocket
      });
      return mySocket;
		}
  }

}).
controller('AppCtrl', function ($scope, $cordovaDeviceMotion, mySocket) {
  var watch;
  $scope.x = 0;
  $scope.y = 0;
  $scope.z = 0;

  var socket;

  $scope.setIP = function(ip) {
    if (ip) {
      localStorage.setItem('ip', ip);
      socket = mySocket.getSocket(ip);
    }
  }

  $scope.ip = '';
  if (localStorage.getItem('ip')) {
    $scope.ip = localStorage.getItem('ip');
    $scope.setIP($scope.ip);
  }

  $scope.autoFiring = false;
  $scope.fire = function() {
    if (socket) {
      socket.emit('fire', {});
      if ($scope.autoFiring) {
        socket.emit('autofire', {autofire: false});
      }
    }
    $scope.autoFiring = false;
  }
  $scope.autofire = function() {
    $scope.autoFiring = true;
    if (socket) {
      socket.emit('autofire', {autofire: true});
    }
  }

  var handleUpdate = function(result) {
    $scope.x = result.x;
    $scope.y = result.y;
    $scope.z = result.z;
    $scope.timestamp = result.timestamp;
    if (socket) {
      socket.emit('message', result);
    }
  };

  var watchAcceleration = function() {
    watch = $cordovaDeviceMotion.watchAcceleration({ frequency: 100 });
    watch.then(
      null,
      function(error) {
      // An error occurred
      },
      handleUpdate
    );
  };

  document.addEventListener("deviceready", watchAcceleration, false);
  document.addEventListener("resume", watchAcceleration, false);
  document.addEventListener("pause", function() { watch.clearWatch() }, false);
});
