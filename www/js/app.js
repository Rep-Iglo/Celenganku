// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var db = null;
var uang = [];
angular.module('celengan', ['ionic', 'ksSwiper', 'ngCordova', 'ng-currency', 'celengan.controllers', 'celengan.routes', 'celengan.services', 'duParallax'])

.run(function ($ionicPlatform, $rootScope, $cordovaSQLite, $cordovaBluetoothSerial, $cordovaGeolocation) {
    $ionicPlatform.ready(function () {
        $rootScope.isLogin = false;
    if (cordova.platformId === "ios" && window.cordova && window.cordova.plugins.Keyboard) {
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

    if (cordova.platformId === 'ios') {
        db = $cordovaSQLite.openDB({ name: "celengan.db", iosDatabaseLocation: 'Documents' });
    } else {
        if (typeof cordova.plugins.settings.openSetting != undefined) {
            cordova.plugins.settings.openSetting("location_source", function () {
                console.log("opened settings")
            },
                function () {
                    console.log("failed to open settings")
                });
        }
        //cordova.plugins.diagnostic.isGpsLocationEnabled(function (enabled) {

        //    if (!enabled) {
        //        alert("GPS and Bluetooth must be enable. Do you want to go to settings menu?");
        //        cordova.plugins.diagnostic.switchToLocationSettings();
        //    } 

        //}, function (error) {
        //    console.error("The following error occurred: " + error);
        //});
        db = $cordovaSQLite.openDB({ name: "celengan.db", location: 'default' });
    }

    $cordovaBluetoothSerial.isEnabled().then(
      function () { /* Not  used */
      },
     function () {
         $cordovaBluetoothSerial.enable();
     }
    );

    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS User (FullName TEXT, UserName TEXT PRIMARY KEY, Email TEXT,Password TEXT,PIN TEXT,ProfilePath TEXT DEFAULT "img/profile.png",isLogin NUMERIC DEFAULT 0)');
    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS DaftarKerja (Pekerjaan TEXT,IconPath TEXT DEFAULT "img/no-image-icon.png",Nilai INTEGER,Id INTEGER PRIMARY KEY )');
    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Celengan (Pekerjaan TEXT,Nilai INTEGER,Nama TEXT,RekeningAsal TEXT,RekeningTujuan TEXT, Id INTEGER PRIMARY KEY )');
    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Transfer (Jumlah INTEGER,NamaAnak TEXT,RekeningAsal TEXT,RekeningTujuan TEXT, Id INTEGER PRIMARY KEY )');
    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Rekening (Nama, NoRek TEXT PRIMARY KEY,Pemilik TEXT,Target INTEGER, JatuhTempo Date)');
   
    $cordovaGeolocation.getCurrentPosition()
                   .then(function (position) {
                       $rootScope.latitude = position.coords.latitude;
                       $rootScope.longitude = position.coords.longitude;
                   }, function (err) {
                       $rootScope.latitude = 37.38;
                       $rootScope.longitude = -122.09;
                   });

        // begin a watch
    //var options = {
    //    frequency: 1000,
    //    timeout: 3000,
    //    enableHighAccuracy: true
    //};

    //var watch = $cordovaGeolocation.watchPosition(options);
    //watch.promise.then(function () { /* Not  used */
    //},
    //    function (err) {
    //        $rootScope.latitude = 37.38;
    //        $rootScope.longitude = -122.09;
    //    }, function (position) {
    //        $rootScope.latitude = position.coords.latitude;
    //        $rootScope.longitude = position.coords.longitude;
    //    });

    
    });
})
