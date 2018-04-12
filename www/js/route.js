angular.module('celengan.routes', [])

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.icon('ion-chevron-left');
    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.navBar.alignTitle('center');
    $stateProvider
     .state('app', {
         url: "/app",
         abstract: true,
         templateUrl: "templates/menu.html",
         controller: 'AppCtrl'
     })

     .state('app.settingBluetooth', {
         url: "/settingBluetooth",
         views: {
             'menuContent': {
                 templateUrl: "templates/settingBluetooth.html",
                 controller: 'BlueCtrl'
             }
         }
     })

    .state('app.detailBluetooth', {
        url: "/settingBluetooth/:address",
        views: {
            'menuContent': {
                templateUrl: "templates/detailBluetooth.html",
                controller: 'BlueDetailCtrl'
            }
        }
    })
     .state('app.profile', {
         url: "/listKerja/profile",
         views: {
             'menuContent': {
                 templateUrl: "templates/profile.html",
                 controller: 'ProfileCtrl'

             }
         }
     })
    //.state('app.login', {
    //    url: "/login",
    //    views: {
    //        'menuContent': {
    //            templateUrl: "templates/login.html",
    //            controller: 'LoginCtrl'
    //        }
    //    }
    //})
        .state('app.daftarKerja', {
            url: "/daftarKerja",
            views: {
                'menuContent': {
                    templateUrl: "templates/DaftarKerja.html",
                    controller: 'daftarKerjaCtrl'
                }
            }
        })

         .state('app.listKerja', {
             url: "/listKerja",
             views: {
                 'menuContent': {
                     templateUrl: "templates/listKerja.html",
                     controller: 'daftarKerjaCtrl'
                 }
             }
         })

         .state('app.transferDana', {
             url: "/listKerja/:nilai",
             views: {
                 'menuContent': {
                     templateUrl: "templates/transferDana.html",
                     controller: 'transferDanaCtrl'
                 }
             }
         })

        .state('app.addKerja', {
            url: "/addKerja/:id",
            views: {
                'menuContent': {
                    templateUrl: "templates/addKerja.html",
                    controller: 'addKerjaCtrl'
                }
            }
        })

        .state('app.beriNilai', {
            url: "/beriNilai",
            views: {
                'menuContent': {
                    templateUrl: "templates/beriNilai.html",
                    controller: 'beriNilaiCtrl'
                }
            }
        })

        //.state('login', {
        //    url: "/login",
        //    templateUrl: "templates/login.html",
        //    controller: 'LoginCtrl'
        //})

        .state('app.login', {
            url: "/login",
            views: {
                'menuContent': {
                    templateUrl: "templates/login.html",
                    controller: "LoginCtrl"
                }
            }
        })

        .state('app.changePassword', {
            url: "/changePassword",
            views: {
                'menuContent': {
                    templateUrl: "templates/changePassword.html",
                    controller: "ChangePassCtrl"
                }
            }
        })

        .state('app.changePIN', {
            url: "/changePIN",
            views: {
                'menuContent': {
                    templateUrl: "templates/changePIN.html",
                    controller: "ChangePINCtrl"
                }
            }
        })
     //.state('changePassword', {
     //    url: "/changePassword",
     //    templateUrl: "templates/changePassword.html",
     //    controller: 'ChangePassCtrl'
     //})

    //.state('changePIN', {
    //    url: "/changePIN",
    //    templateUrl: "templates/changePIN.html",
    //    controller: 'ChangePINCtrl'
    //})

  .state('app.listAccount', {
      url: "/listAccount",
      views: {
          'menuContent': {
              templateUrl: "templates/listAccount.html",
              controller: 'listAccountCtrl'
          }
      }
  })

 .state('app.addAccount', {
     url: "/addAccount/:pemilik/:noRek",
     views: {
         'menuContent': {
             templateUrl: "templates/addAccount.html",
             controller: 'addAccountCtrl'
         }
     }
 })

.state('app.riwayat', {
    url: "/riwayat",
    views: {
        'menuContent': {
            templateUrl: "templates/riwayatTransaksi.html",
            controller: 'riwayatCtrl'
        }
    }
})

 .state('app.test', {
     url: "/test",
     views: {
         'menuContent': {
             templateUrl: "templates/test.html",
             controller: "TestCtrl"
         }
     }
 })

        .state('app.signup', {
            url: "/signup",
            views: {
                'menuContent': {
                    templateUrl: "templates/signup.html",
                    controller: "SignUpCtrl"
                }
            }
        });
    //.state('signup', {
    //    url: "/signup",
    //    templateUrl: "templates/signup.html",
    //    controller: 'SignUpCtrl'
    //});

   

    $urlRouterProvider.otherwise('/app/login')



});