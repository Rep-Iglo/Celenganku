angular.module('celengan.controllers', ['celengan.services'])

.controller('AppCtrl', function ($scope, $ionicHistory,$rootScope, $location, sqlService) {
    
    $scope.logout = function () {
        sqlService.logout($rootScope.username);
        
        $rootScope.isLogin = false;
        $ionicHistory.nextViewOptions({
            historyRoot:true
        });
        $location.path('/app/login');       
    }

/*-just for demo-*/
    $scope.ClearData = function () {
        sqlService.deleteDataCelengan()
                 .then(function (res) {
                     alert('Clear Data Sukses');
                 });
    }

})

.controller('LoginCtrl', function ($scope, $rootScope,$ionicSideMenuDelegate, $ionicHistory, $cordovaSQLite, $cordovaToast, $location, $ionicPopup,httpService,session) {
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.user = {};
    $scope.login = function () {
        $cordovaSQLite.execute(db, 'SELECT * FROM User WHERE UserName=? AND Password=?', [$scope.user.username, $scope.user.password])
        .then(function (res) {
            if (res.rows.length > 0) {
                $rootScope.username = res.rows.item(0).UserName;
                $rootScope.fullname = res.rows.item(0).FullName;
                $rootScope.pin = res.rows.item(0).PIN;
                $cordovaSQLite.execute(db, 'UPDATE User SET isLogin=1 WHERE UserName=?', [$scope.user.username])
                .then(function (res2) {
                    $rootScope.isLogin = true;
                    var _log = [];
                    _log.push(session.context());
                    _log.push(session.start());
                    httpService.event(_log).then(function (res) {
                    }, function (err) {
                        alert(JSON.stringify(err));
                    });
                });

                $cordovaToast.show('Welcome ' + res.rows.item(0).FullName, 'long', 'center');
                $ionicHistory.nextViewOptions({
                    historyRoot: true
                });
                $location.path('/app/listKerja');
                
            } else {
                var alertpopup = $ionicPopup.alert({
                    title: 'login failed!',
                    template: 'please check your credentials!'
                });
                $rootScope.isLogin = false;
                $rootScope.pin = null;
                $rootScope.username = null;
            }
        }, function (error) {
            alert(error);
        });
    }


})

.controller('ChangePassCtrl', function ($scope, $rootScope) {
    $scope.change = {};
    $scope.save = function () {
        if ($scope.change.password == $rootScope.pass) {
            if ($scope.change.newpass == $scope.change.confpass) {
                $cordovaSQLite.execute(db, 'UPDATE User SET Password=?', [$scope.change.newpass])
                    .then(function (res) {
                        $rootScope.pass = $scope.change.newpass;
                        $cordovaToast.show('Password has been change', 'long', 'center');
                        $location.path('/app/edit-profile');
                    }, function (error) {
                        alert('fail to change password: ' + error);
                    });

            } else {
                alert('Your new password does not match');
            }
        } else {
            alert('Your current password is wrong');
        }
    }

})

.controller('ChangePINCtrl', function ($scope, $rootScope) {
    $scope.change = {};
    $scope.save = function () {
        if ($scope.change.pin == $rootScope.pin) {
            if ($scope.change.newPin == $scope.change.confPin) {
                $cordovaSQLite.execute(db, 'UPDATE User SET PIN=?', [$scope.change.newPin])
                    .then(function (res) {
                        $rootScope.pin = $scope.change.newPin;
                        $cordovaToast.show('Password has been change', 'long', 'center');
                        $location.path('/app/profile');
                    }, function (error) {
                        alert('fail to change PIN: ' + error);
                    });

            } else {
                alert('Your new PIN does not match');
            }
        } else {
            alert('Your current PIN is wrong');
        }
    }

})

.controller('ProfileCtrl', function ($scope, $rootScope, $cordovaCamera, $ionicPopup, $timeout, $cordovaFile, $cordovaSQLite, $cordovaToast) {
        $scope.changePhoto = function () {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 110,
                targetHeight: 110,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function (sourcePath) {
                var sourceDirectory = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1);
                var sourceFileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1, sourcePath.length);
                sourceFileName = sourceFileName.split('?')[0];

                var d = new Date(),
                    n = d.getTime(),
                    newFileName = n + ".jpg";
                //Move the file to permanent storage
                $cordovaFile.moveFile(sourceDirectory, sourceFileName, cordova.file.dataDirectory, newFileName)
                    .then(function (success) {

                        $rootScope.profilePath = cordova.file.dataDirectory + newFileName;
                        $cordovaSQLite.execute(db, 'UPDATE User SET ProfilePath=? WHERE UserName=?', [$rootScope.profilePath, $rootScope.username])
                            .then(function (res2) {
                            });
                    }, function (error) {
                        console.dir(error);
                    });
            }, function (err) {
                // An error occured. Show a message to the user
            });
        }

        $scope.editname = function () {
            $scope.user = {}
            $scope.user.fullname = $rootScope.fullname;
            // An elaborate, custom popup
            var editPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="user.fullname">',
                title: 'Mengubah Nama',
                subTitle: 'Silahkan ubah nama Anda',
                scope: $scope,
                buttons: [
                  { text: 'Batal' },
                  {
                      text: '<b>Simpan</b>',
                      type: 'button-positive',
                      onTap: function (e) {
                          if ($scope.user.fullname != "" && $scope.user.fullname != null) {
                              $cordovaSQLite.execute(db, 'UPDATE User SET FullName=?', [$scope.user.fullname])
                        .then(function (res) {
                            $rootScope.fullname = $scope.user.fullname;
                            $cordovaToast.show('Nama Anda sudah berubah', 'long', 'center');

                        }, function (error) {
                            alert('Gagal mengganti nama: ' + error);
                        });
                          } else {
                              alert('Nama tidak boleh kosong')
                              e.preventDefault();
                          }
                      }
                  }
                ]
            });

            //editPopup.then(function (res) {
            //    console.log('Tapped!', res);
            //});

            $timeout(function () {
                editPopup.close(); //close the popup after 30 seconds for some reason
            }, 30000);

        }
    })

.controller('SignUpCtrl', function ($scope, $cordovaSQLite, $cordovaToast, $location) {
    $scope.user = {};
    $scope.submit = function () {
        if ($scope.user.password == $scope.user.confpass) {
            if ($scope.user.pin == $scope.user.confpin) {
                $cordovaSQLite.execute(db, 'INSERT INTO User (FullName, UserName , Email, Password,Pin) VALUES(?,?,?,?,?)', [$scope.user.fullname, $scope.user.username, $scope.user.email, $scope.user.password, $scope.user.pin])
            .then(function (result) {
                $cordovaToast.show('Sign Up berhasil', 'long', 'center');
                $location.path('/app/login');
            }, function (error) {
                alert('Gagal Sign Up : ' + error);
            })
            } else {
                alert('pin tidak sama');
            }
        } else {
            alert('password tidak sama');
        }
    }


})

.controller('listAccountCtrl', function ($scope,$ionicHistory, $cordovaSQLite,$ionicPopup, $cordovaToast, $location,$filter) {
    //$scope.rekAnak = [{'NoRek':'09874567','Nama':'Kaylan Oliver','Target':'','JatuhTempo':''},{'NoRek':'06546','Nama':'Katlyn','Target':'','JatuhTempo':''}];
    //$scope.rekOrtu = [{ 'NoRek': '034645', 'Nama': 'Yacobus Sandi' }];
    $ionicHistory.clearHistory();
    $scope.rekAnak = [];
    $scope.rekOrtu = [];
    $cordovaSQLite.execute(db, 'SELECT * FROM Rekening WHERE Pemilik="Orang Tua"')
       .then(function (res) {
           if (res.rows.length > 0) {
               for (var i = 0; i < res.rows.length; i++) {
                   $scope.rekOrtu.push({
                       NoRek: res.rows.item(i).NoRek,
                       Nama: res.rows.item(i).Nama
                   });
               }
           }
       }, function (error) {
           alert('Gagal menggugah rekening : ' + error);
       })

    $cordovaSQLite.execute(db, 'SELECT * FROM Rekening WHERE Pemilik="Anak"')
       .then(function (res) {
           if (res.rows.length > 0) {
               for (var i = 0; i < res.rows.length; i++) {
                   $scope.rekAnak.push({
                       NoRek: res.rows.item(i).NoRek,
                       Nama: res.rows.item(i).Nama,
                       Target: res.rows.item(i).Target,
                       JatuhTempo: $filter('date')(new Date(res.rows.item(i).JatuhTempo), 'dd-MM-yyyy')
                   });
               }
           }
       }, function (error) {
           alert('Gagal menggugah rekening : ' + error);
       })
    
$scope.addAccount = function () {
    $location.path('/app/addAccount/new/00');
}

$scope.editAccount = function (p,n) {
    if (p == 'Orang Tua') {
        $location.path('/app/addAccount/'+p+'/' + $scope.rekOrtu[n].NoRek);
    } else {
        $location.path('/app/addAccount/' + p + '/' + $scope.rekAnak[n].NoRek);
    }
}

$scope.deleteAccount = function (p, n) {
    if (p == 'Orang Tua') {
        NoRek=$scope.rekOrtu[n].NoRek;
    } else {
        NoRek=$scope.rekAnak[n].NoRek;
    }
    var confirmPopup = $ionicPopup.confirm({
        title: 'Hapus Rekening',
        template: 'Anda yakin akan menghapus rekening ini?'
    });

    confirmPopup.then(function (res) {
        if (res) {
            $cordovaSQLite.execute(db, 'DELETE FROM Rekening WHERE NoRek=?', [NoRek])
            .then(function () {
                $cordovaToast.show('Rekening ' + NoRek + ' berhasil dihapus', 'long', 'center');
                if (p == 'Orang Tua') {
                    $cordovaSQLite.execute(db, 'SELECT * FROM Rekening WHERE Pemilik="OrangTua"')
                        .then(function (res) {
                            $scope.rekOrtu = [];
                            if (res.rows.length > 0) {
                                for (var i = 0; i < res.rows.length; i++) {
                                    $scope.rekOrtu.push({
                                        NoRek: res.rows.item(i).NoRek,
                                        Nama: res.rows.item(i).Nama
                                    });

                                }
                                $scope.$apply();
                            }
                        }, function (error) {
                            alert(error);
                        });
                } else {
                    $cordovaSQLite.execute(db, 'SELECT * FROM Rekening WHERE Pemilik="Anak"')
                        .then(function (res) {
                            $scope.rekAnak = [];
                            if (res.rows.length > 0) {
                                10
                                for (var i = 0; i < res.rows.length; i++) {
                                    $scope.rekAnak.push({
                                        NoRek: res.rows.item(i).NoRek,
                                        Nama: res.rows.item(i).Nama,
                                        Target: res.rows.item(i).Target,
                                        JatuhTempo: res.rows.item(i).JatuhTempo
                                    });

                                }
                                $scope.$apply();
                            }
                        }, function (error) {
                            alert(error);
                        });
                }
                }, function (error) {
                    alert(error);
                });
            
        } else {

        }
    });
}


})

.controller('addAccountCtrl', function ($scope, $ionicPlatform, $location, $stateParams,$cordovaSQLite, $cordovaToast) {
    $ionicPlatform.ready(function () {
        $scope.rekening = {};
        $scope.rekening.pemilik = 'Orang Tua';
        if ($stateParams.pemilik == 'Orang Tua') {
            $cordovaSQLite.execute(db, 'SELECT * FROM Rekening WHERE NoRek=?', [$stateParams.noRek])
                .then(function (result) {
                    $scope.rekening.noRek = result.rows.item(0).NoRek;
                    $scope.rekening.nama = result.rows.item(0).Nama;
                    $scope.rekening.pemilik = 'Orang Tua';
                }, function (error) {
                    alert('Gagal load data : ' + error);
                })
        } else if ($stateParams.pemilik == 'Anak') {
            $cordovaSQLite.execute(db, 'SELECT * FROM Rekening WHERE NoRek=?', [$stateParams.noRek])
                .then(function (result) {
                    $scope.rekening.noRek = result.rows.item(0).NoRek;
                    $scope.rekening.nama = result.rows.item(0).Nama;
                    $scope.rekening.target = result.rows.item(0).Target;
                    $scope.rekening.jatuhTempo = new Date(result.rows.item(0).JatuhTempo);
                    $scope.rekening.pemilik = 'Anak';
                }, function (error) {
                    alert('Gagal load data : ' + error);
                })
        }
    })
   
    $scope.save = function () {
        if ($stateParams.pemilik == 'new') {
            $cordovaSQLite.execute(db, 'INSERT INTO Rekening (NoRek,Nama,Target,JatuhTempo,Pemilik) VALUES(?,?,?,?,?)', [$scope.rekening.noRek, $scope.rekening.nama, $scope.rekening.target, $scope.rekening.jatuhTempo, $scope.rekening.pemilik])
            .then(function (result) {
                $cordovaToast.show('Rekening berhasil disimpan ', 'long', 'center');
                $location.path('/app/listAccount');
            }, function (error) {
                alert('Gagal simpan data : ' + error);
            })
        } else {
            $cordovaSQLite.execute(db, 'UPDATE Rekening SET NoRek=?,Nama=?,Target=?,JatuhTempo=?,Pemilik=? WHERE NoRek=?', [$scope.rekening.noRek, $scope.rekening.nama, $scope.rekening.target, $scope.rekening.jatuhTempo, $stateParams.pemilik,$stateParams.noRek])
            .then(function (result) {
                $cordovaToast.show('Rekening berhasil diupdate ', 'long', 'center');
                $location.path('/app/listAccount');
            }, function (error) {
                alert('Gagal update data : ' + error);
            })
        }
    }


})

.controller('transferDanaCtrl', function ($scope, $rootScope, $stateParams, $location, $ionicPopup, $cordovaPinDialog,$ionicLoading, httpService,session) {
    $scope.uang = {};
    $scope.uang.nilai = $stateParams.nilai;
    $scope.user = {};
   
    //$scope.inputPin = function () {
    //    if ($scope.uang.nilai == 0 || $scope.uang.nilai == undefined || $scope.uang.nilai == null) {
    //        alert('Nominal tidak boleh kosong');
    //    } else {

    //        $cordovaPinDialog.prompt('Masukan PIN Anda', 'PIN Verifikasi').then(function (result) {
    //            if (result.input1 === $rootScope.pin) {
    //                $ionicLoading.show({
    //                    template: '<table style="text-align:left"><tr><td rowspan="2" style="vertical-align:middle;padding-right:10px"><ion-spinner style="vertical-align:middle" icon="bubbles"></ion-spinner></td><td>Loading...</td></tr> <tr><td>Pastikan koneksi internet Anda stabil.</td></tr></table>'
    //                });

    //                var request = { "getBalance": { "accountNo": $scope.uang.rekeningTujuan } };
                    
    //                httpService.balanceInq(request).then(function (res) {    
    //                    jumlah=JSON.stringify(res.data.Body.getBalanceResponse.balance);
    //                    uang.balance = parseFloat(jumlah.replace(/[^0-9-,]/g, ''));
    //                    $location.path('/app/beriNilai');
    //                    var _log = [];
    //                    _log.push(session.context());
    //                    _log.push(session.balance());
    //                    httpService.event(_log);
    //                    $ionicLoading.hide();
    //                },
    //                function (error) {
    //                    alert(error);
    //                });

    //                var jsonRequest = {
    //                    "transfer": {
    //                        "fromAct": $scope.uang.rekeningAsal,
    //                        "toAct": $scope.uang.rekeningTujuan,
    //                        "amt": $scope.uang.nilai
    //                    }
    //                };
    //                httpService.transferDana(jsonRequest).then(function (res) {
    //                    var status = JSON.stringify(res.data.Body.transferResponse.status);
    //                    if (status = "000") {

    //                        alert('Transfer berhasil :'+JSON.stringify(res.data.Body.transferResponse));
    //                        var _log = [];
    //                        _log.push(session.context());
    //                        _log.push(session.transfer());
    //                        httpService.event(_log);
    //                    }

    //                },
    //                function (error) {
    //                    alert(error);
    //                });
    //                uang.nilai = $stateParams.nilai;
    //                uang.rekeningAsal = $scope.uang.rekeningAsal;
    //                uang.rekeningTujuan = $scope.uang.rekeningTujuan;
    //                uang.pekerjaan = 'Test';
    //                uang.nama = 'Silvia';
                   
    //            } else {
    //                alert("Anda memasukan PIN yang salah");
    //            }
    //        }, function (error) {
    //            console.error(error);
    //        });
    //    } 
    //}
    
    

    $scope.payload = function () {
        var test = [];
        test.push(session.context());
        test.push(session.start());
        test.push(session.end());
        alert(JSON.stringify(test));

        //httpService.sendEvent().then(function (res) {
        //    alert(JSON.stringify(res));
        //},
        //function (error) {
        //    alert(JSON.stringify(error));
        //});
    }
    

    $scope.inputPin = function () {
        if ($scope.uang.nilai == 0 || $scope.uang.nilai == undefined || $scope.uang.nilai == null) {
            alert('Nominal tidak boleh kosong');
        } else {
            var myPopup = $ionicPopup.show({
                template: '<input type="tel"  style="-webkit-text-security:disc;" ng-model="user.pin">',
                title: 'Masukan PIN Anda',
                cssClass: 'pin-popup',
                scope: $scope,
                buttons: [
                  {
                      text: '<b>OK</b>',
                      type: 'button-dark',
                      onTap: function (e) {
                          if ($scope.user.pin === $rootScope.pin) {
                              $ionicLoading.show({
                                  template: '<table style="text-align:left"><tr><td rowspan="2" style="vertical-align:middle;padding-right:10px"><ion-spinner style="vertical-align:middle" icon="bubbles"></ion-spinner></td><td>Loading...</td></tr> <tr><td>Pastikan koneksi internet Anda stabil.</td></tr></table>'
                              });

                              //var request = { "getBalance": { "accountNo": $scope.uang.rekeningTujuan } };
                              var request = $scope.uang.rekeningTujuan;

                              /*-- sementara jika ws mati--*/
                              //uang.balance = 720000;
                              //$location.path('/app/beriNilai');
                              //$ionicLoading.hide();
                              /*------*/
                              httpService.balanceInq(request).then(function (res) {
                                 // alert(JSON.stringify(res));
                                  jumlah = JSON.stringify(res.data.saldo);
                                  uang.balance = parseFloat(jumlah.replace(/[^0-9-,]/g, ''));
                                  //alert(uang.balance);
                                  $location.path('/app/beriNilai');
                                  var _log = [];
                                  _log.push(session.context());
                                  _log.push(session.balance());
                                  httpService.event(_log);
                                  $ionicLoading.hide();
                              },
                              function (error) {
                                  $ionicLoading.hide();
                                  alert(JSON.stringify(error));
                              });

                              //var jsonRequest = {
                              //    "transfer": {
                              //        "fromAct": $scope.uang.rekeningAsal,
                              //        "toAct": $scope.uang.rekeningTujuan,
                              //        "amt": $scope.uang.nilai
                              //    }
                              //};
                              
                              httpService.transferDana($scope.uang.rekeningAsal,$scope.uang.rekeningTujuan,$scope.uang.nilai).then(function (res) {
                                  //alert(JSON.stringify(res));
                                  //var status = JSON.stringify(res.data.Body.transferResponse.status);
                                  //if (status = "1") {

                                      alert('Transfer berhasil '); //':' + JSON.stringify(res.data.Body.transferResponse));
                                      var _log = [];
                                      _log.push(session.context());
                                      _log.push(session.transfer());
                                      httpService.event(_log);
                                  //}

                              },
                              function (error) {
                                  alert(error);
                              });
                              uang.nilai = $stateParams.nilai;
                              uang.rekeningAsal = $scope.uang.rekeningAsal;
                              uang.rekeningTujuan = $scope.uang.rekeningTujuan;
                              uang.pekerjaan = 'Test';
                              uang.nama = 'Silvia';

                          } else {
                              alert("Anda memasukan PIN yang salah");
                          }


                      }
                  }
                ]
            })
        }
    }


})

.controller('beriNilaiCtrl', function ($scope, $cordovaBluetoothSerial, $location, $cordovaSQLite, $ionicPlatform, $ionicPopup, $ionicSideMenuDelegate,formatNumber) {
    $ionicSideMenuDelegate.canDragContent(false);
    totalNilai = uang.nilai;
    $scope.showMoney = true;
    $scope.uang = {};
    
    $cordovaBluetoothSerial.write(formatNumber.currency(uang.balance, 'Rp.') + ",-#")
   .then(function () {
       $scope.uang.total = uang.balance;
   });

    //$scope.swiper = {};

    //$scope.onReadySwiper = function (swiper) {

    //    swiper.on('slideChangeStart', function () {
    //        console.log('slide start');
    //    });

    //    swiper.on('onSlideChangeEnd', function () {
    //        console.log('slide end');
    //    });
    //};

    $scope.uang.total=0;
    //$scope.SaveMoney = function (nilai) {
    //    $cordovaBluetoothSerial.isConnected()
    //                      .then(function () {
    //                          switch (nilai) {
    //                              case 1:
    //                                  $scope.uang.nilai = 500;
    //                                  break;
    //                              case 2:
    //                                  $scope.uang.nilai = 1000;
    //                                  break;
    //                              case 3:
    //                                  $scope.uang.nilai = 2000;
    //                                  break;
    //                              case 4:
    //                                  $scope.uang.nilai = 5000;
    //                                  break;
    //                              case 5:
    //                                  $scope.uang.nilai = 10000;
    //                                  break;
    //                              case 6:
    //                                  $scope.uang.nilai = 20000;
    //                                  break;
    //                              case 7:
    //                                  $scope.uang.nilai = 50000;
    //                                  break;
    //                          }
    //                          if ((totalNilai - $scope.uang.nilai) >= 0) {
    //                              $cordovaSQLite.execute(db, 'INSERT INTO Celengan (Pekerjaan,Nilai,Nama,RekeningAsal,RekeningTujuan) VALUES(?,?,?,?,?)', [uang.pekerjaan, $scope.uang.nilai, uang.nama, uang.rekeningAsal, uang.rekeningTujuan])
    //                             .then(function (result) {
    //                                 $scope.uang.total = eval($scope.uang.total + $scope.uang.nilai);
    //                                 $scope.showMoney = false;
    //                                 totalNilai = totalNilai - $scope.uang.nilai;
                                     
    //                                 $cordovaBluetoothSerial.write(formatNumber.currency($scope.uang.total, 'Rp.') + ",-#")
    //                                 .then(function (result) {//
    //                                     var myPopup = $ionicPopup.show({
    //                                         template: '</br><b>Terima Kasih!</b></br>Anda baru saja berhasil menabung</br><b>Rp.{{uang.nilai}},-</b>',
    //                                         scope: $scope,
    //                                         cssClass: 'ok-popup',
    //                                         buttons: [
    //                                           {
    //                                               text: 'OK',
    //                                                type: 'button-positive',
    //                                               onTap: function (e) {
    //                                                   if (totalNilai == 0) {
    //                                                       $location.path('/app/listKerja');
    //                                                   }
    //                                                   $scope.showMoney = true;

    //                                               }
    //                                           }
    //                                         ]
    //                                     })
                                         
    //                                 }, function (error) {
    //                                     $cordovaToast.show('Gagal Connect', 'short', 'center');
    //                                 })//
    //                             });



    //                          } else {
    //                              alert('transfer dana melebihi yang sudah ditentukan')
    //                          }
                              
    //                      }, function (error) {
    //                          alert('Gagal simpan data : ' + error);
    //                      })//
    //}

    //$scope.saveMoney = function (nilai) {
    //    switch (nilai) {
    //        case 1:
    //            $scope.uang.nilai = 500;
    //            break;
    //        case 2:
    //            $scope.uang.nilai = 1000;
    //            break;
    //        case 3:
    //            $scope.uang.nilai = 2000;
    //            break;
    //        case 4:
    //            $scope.uang.nilai = 5000;
    //            break;
    //        case 5:
    //            $scope.uang.nilai = 10000;
    //            break;
    //        case 6:
    //            $scope.uang.nilai = 20000;
    //            break;
    //        case 7:
    //            $scope.uang.nilai = 50000;
    //            break;
    //    }

    //    if ((totalNilai - $scope.uang.nilai) >= 0) {
    //        $cordovaSQLite.execute(db, 'INSERT INTO Celengan (Pekerjaan,Nilai,Nama,RekeningAsal,RekeningTujuan) VALUES(?,?,?,?,?)', [uang.pekerjaan, $scope.uang.nilai, uang.nama, uang.rekeningAsal, uang.rekeningTujuan])
    //       .then(function (result) {
    //        $("#duit" + nilai).animate({
    //            bottom: '300px',
    //            height: '100px',
    //            width: '100px'
    //        }, 53);

    //        $("#duit" + nilai).animate({
    //            bottom: '400px',
    //            height: '80px',
    //            width: '80px'
    //        }, 53);

    //        $("#duit" + nilai).animate({
    //            bottom: '500px',
    //            height: '60px',
    //            width: '60px'
    //        }, 53);

    //        $("#duit" + nilai).animate({
    //            bottom: '450px',
    //            height: '40px',
    //            width: '40px'
    //        }, 53);

    //        $("#duit" + nilai).animate({
    //            bottom: '350px',
    //            height: '30px',
    //            width: '30px'
    //        }, 53);

    //        $("#duit" + nilai).animate({
    //            bottom: '350px',
    //            height: '30px',
    //            width: '30px'
    //        }, 100);
    //        $("#duit" + nilai).fadeOut(300, function () {
    //            if (nilai > 2) {
    //                $("#duit" + nilai).animate({
    //                    bottom: '50px',
    //                    width: '25%',
    //                    height: '40%'
    //                }, 0);
    //            } else {
    //                $("#duit" + nilai).animate({
    //                    bottom: '50px',
    //                    width: '25%',
    //                    height: '17%'
    //                }, 0);
    //            }

    //            $scope.uang.total = eval($scope.uang.total + $scope.uang.nilai);
    //            // $scope.showMoney = false;
    //            totalNilai = totalNilai - $scope.uang.nilai;

    //            var myPopup = $ionicPopup.show({
    //                template: '</br><b>Terima Kasih!</b></br>Anda baru saja berhasil menabung</br><b>Rp.{{uang.nilai}},-</b>',
    //                scope: $scope,
    //                cssClass: 'ok-popup',
    //                buttons: [
    //                  {
    //                      text: 'OK',
    //                      type: 'button-positive',
    //                      onTap: function (e) {
    //                          if (totalNilai == 0) {
    //                              $location.path('/app/listKerja');
    //                          } else {                                 
    //                              $("#duit" + nilai).fadeIn(1000);
    //                              //  $scope.showMoney = true;
    //                          }
    //                      }
    //                  }
    //                ]
    //            })
    //        });
            

            
    //       });



    //    } else {
    //        alert('transfer dana melebihi yang sudah ditentukan')
    //    }

       
    //};

    function moveMoney(moneyID){
        $("#duit" + moneyID).animate({
            bottom: '300px',
            height: '100px',
            width: '100px'
        }, 53);

        $("#duit" + moneyID).animate({
            bottom: '400px',
            height: '80px',
            width: '80px'
        }, 53);

        $("#duit" + moneyID).animate({
            bottom: '500px',
            height: '60px',
            width: '60px'
        }, 53);

        $("#duit" + moneyID).animate({
            bottom: '450px',
            height: '40px',
            width: '40px'
        }, 53);

        $("#duit" + moneyID).animate({
            bottom: '350px',
            height: '30px',
            width: '30px'
        }, 53);

        $("#duit" + moneyID).animate({
            bottom: '350px',
            height: '30px',
            width: '30px'
        }, 100);
        $("#duit" + moneyID).fadeOut(1000, function () { 

        });
        if (moneyID > 2) {
            $("#duit" + moneyID).animate({
                bottom: '50px',
                width: '30%',
                height: '45%'
            }, 0);
        } else {
            $("#duit" + moneyID).animate({
                bottom: '50px',
                width: '30%',
                height: '20%'
            }, 0);
        }
        $("#duit" + moneyID).fadeIn(1000);
        // $("#duit" + duitID).stop();
        // $("#duit" + duitID).removeAttr('style');
    }

    $scope.saveMoney = function (nilai) { //tanpa bluetooth
        switch (nilai) {
            case 1:
                $scope.uang.nilai = 500;
                break;
            case 2:
                $scope.uang.nilai = 1000;
                break;
            case 3:
                $scope.uang.nilai = 2000;
                break;
            case 4:
                $scope.uang.nilai = 5000;
                break;
            case 5:
                $scope.uang.nilai = 10000;
                break;
            case 6:
                $scope.uang.nilai = 20000;
                break;
            case 7:
                $scope.uang.nilai = 50000;
                break;
        }

        if ((totalNilai - $scope.uang.nilai) >= 0) {
            $cordovaSQLite.execute(db, 'INSERT INTO Celengan (Pekerjaan,Nilai,Nama,RekeningAsal,RekeningTujuan) VALUES(?,?,?,?,?)', [uang.pekerjaan, $scope.uang.nilai, uang.nama, uang.rekeningAsal, uang.rekeningTujuan])
           .then(function (result) {

               $("#duit" + nilai).animate({
                   bottom: '1000px'        
               }, 1000, function () {
                   $scope.uang.total = eval($scope.uang.total + $scope.uang.nilai);
                   // $scope.showMoney = false;
                   totalNilai = totalNilai - $scope.uang.nilai;

                   $cordovaBluetoothSerial.write(formatNumber.currency($scope.uang.total, 'Rp.') + ",-#")
                   .then(function (result) {
                       var myPopup = $ionicPopup.show({
                           template: '</br><b>Terima Kasih!</b></br>Anda baru saja berhasil menabung</br><b>Rp.{{uang.nilai}},-</b>',
                           scope: $scope,
                           cssClass: 'ok-popup',
                           buttons: [
                             {
                                 text: 'OK',
                                 type: 'button-positive',
                                 onTap: function (e) {
                                     if (totalNilai == 0) {
                                         $location.path('/app/listKerja');
                                     }
                                     //  $scope.showMoney = true;
                                     $("#duit" + nilai).removeAttr('style');

                                 }
                             }
                           ]
                       })
                   }, function (error) {
                       $cordovaToast.show('Gagal Connect', 'short', 'center');
                   })
               });
 
             
                  
           },function(error){
               alert('Gagal simpan data : ' + error);
           })
        } else {
            alert('transfer dana melebihi yang sudah ditentukan')
        }


    };
})

.controller('addKerjaCtrl', function ($scope,$ionicPlatform, $location, $stateParams, $ionicModal, $cordovaSQLite, $cordovaToast) {
    $ionicPlatform.ready(function () {     
        $scope.listNilai = [{ value: 500, text: "Rp. 500,-" },
            { value: 1000, text: "Rp. 1.000,-" },
            { value: 2000, text: "Rp. 2.000,-" },
            { value: 5000, text: "Rp. 5.000,-" },
            { value: 10000, text: "Rp. 10.000,-" },
            { value: 20000, text: "Rp. 20.000,-" },
            { value: 50000, text: "Rp. 50.000,-" }];
        $scope.add = {};
        if ($stateParams.id == -99) {
            $scope.add.iconPath = 'img/no-icon.png';
        } else {
            $cordovaSQLite.execute(db, 'SELECT * FROM DaftarKerja WHERE Id=?', [$stateParams.id])
                .then(function (result) {
                    $scope.add.pekerjaan = result.rows.item(0).Pekerjaan;
                    $scope.add.iconPath = result.rows.item(0).IconPath;
                    $scope.add.nilai = result.rows.item(0).Nilai;
                }, function (error) {
                    alert('Gagal load data : ' + error);
                })
        }
    })
    $ionicModal.fromTemplateUrl('templates/customModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
    //$scope.add={};
    //$scope.add.iconPath = 'img/no-icon.png';

    $scope.savePath = function (num) {
        $scope.add.iconPath = 'img/icon-' + num + '.png';
        $scope.modal.hide();
    };
    
    $scope.onChange = function (nilai) {
        $scope.add.nilai = nilai.value;
    }
    $scope.save = function () {
        if ($stateParams.id == -99) {
            $cordovaSQLite.execute(db, 'INSERT INTO DaftarKerja (Pekerjaan,IconPath,Nilai) VALUES(?,?,?)', [$scope.add.pekerjaan, $scope.add.iconPath, $scope.add.nilai])
            .then(function (result) {
                $cordovaToast.show('Pekerjaan berhasil disimpan ', 'long', 'center');
                $location.path('/app/daftarKerja');
            }, function (error) {
                alert('Gagal simpan data : ' + error);
            })
        } else {
            $cordovaSQLite.execute(db, 'UPDATE DaftarKerja SET Pekerjaan=?,IconPath=?,Nilai=? WHERE Id=?', [$scope.add.pekerjaan, $scope.add.iconPath, $scope.add.nilai, $stateParams.id])
            .then(function (result) {
                $cordovaToast.show('Pekerjaan berhasil diupdate ', 'long', 'center');
                $location.path('/app/daftarKerja');
            }, function (error) {
                alert('Gagal update data : ' + error);
            })
        }
    }


})

.controller('daftarKerjaCtrl', function ($scope, $rootScope, $ionicPopup, $cordovaToast, $ionicPlatform, $cordovaSQLite, $location, $http, httpService, session, parallaxHelper) {

    $scope.showAds = function () {
        var adsPopup = $ionicPopup.confirm({
            title: '',
            template: '<button class="button icon ion-close" ng-click="closeAds()"></button>   <img src="img/popup.jpg" />',
            cssClass: 'ads-popup',
            scope:$scope,
            buttons: []
        });

        adsPopup.then(function (res) {
           
        });

        $scope.closeAds = function () {
            adsPopup.close();
        }
    } 

    $scope.background = parallaxHelper.createAnimator(-0.5);
//    $scope.jobs = [{ pekerjaan: 'MENGERJAKAN PR', iconPath: 'img/icon-1.png', nilai: '2000' },
//            { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-2.png', nilai: '1000' },
//    { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-3.png', nilai: '1000' },
//    { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-4.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-1.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-2.png', nilai: '1000' },
//    { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-3.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-4.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-1.png', nilai: '1000' },
//    { pekerjaan: 'MENGERJAKAN PR', iconPath: 'img/icon-1.png', nilai: '2000' },
//            { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-2.png', nilai: '1000' },
//    { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-3.png', nilai: '1000' },
//    { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-4.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-1.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-2.png', nilai: '1000' },
//    { pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-3.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-4.png', nilai: '1000' },
//{ pekerjaan: 'TIDUR SEBELUM JAM 10', iconPath: 'img/icon-1.png', nilai: '1000' }];
   
    $ionicPlatform.ready(function () {

        $cordovaSQLite.execute(db, 'SELECT * FROM User')
          .then(function (res) {
              if (res.rows.length > 0) {
                  if (res.rows.item(0).isLogin == 1) {
                      $rootScope.isLogin = true;
                      $rootScope.profilePath = res.rows.item(0).ProfilePath;
                      $rootScope.username = res.rows.item(0).UserName;
                      $rootScope.fullname = res.rows.item(0).FullName;
                      $rootScope.pass = res.rows.item(0).Password;
                      $rootScope.email = res.rows.item(0).Email;
                      $rootScope.pin = res.rows.item(0).PIN;
                  }
                  else {
                      $location.path('/login');
                  }
              } else {
                  $location.path('/login');

              }
          }, function (error) {
              alert('failed to load user : ' + error);
          })

        $scope.jobs = [];
        $cordovaSQLite.execute(db, 'SELECT * FROM DaftarKerja')
           .then(function (res) {
               if (res.rows.length > 0) {
                   //   $scope.jobs = JSON.parse(res);
                   for (var i = 0; i < res.rows.length; i++) {
                       $scope.jobs.push({
                           pekerjaan: res.rows.item(i).Pekerjaan,
                           iconPath: res.rows.item(i).IconPath,
                           nilai: res.rows.item(i).Nilai,
                           id: res.rows.item(i).Id
                       }
                       );

                   }

               }
           }, function (error) {
               alert('failed to load user : ' + error);
           })
    });

    $scope.goTo = function (n) {
        $location.path('/app/listKerja/' + $scope.jobs[n].nilai);
    }
    
    $scope.addKerja = function () {
        $location.path('/app/addKerja/-99');
    }

    $scope.editKerja = function (n) {
        $location.path('/app/addKerja/' + $scope.jobs[n].id);
    }

    $scope.deleteKerja = function (n) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Hapus Pekerjaan',
            template: 'Anda yakin akan menghapus pekerjaan ini?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                $cordovaSQLite.execute(db, 'DELETE FROM DaftarKerja WHERE Id=?', [$scope.jobs[n].id])
                .then(function () {
                    $cordovaToast.show('Pekerjaan ' +$scope.jobs[n].pekerjaan +' berhasil dihapus', 'long', 'center');
                    $cordovaSQLite.execute(db, 'SELECT * FROM DaftarKerja')
                        .then(function (res) {
                            $scope.jobs=[];
                            if (res.rows.length > 0) {
                                for (var i = 0; i < res.rows.length; i++) {
                                    $scope.jobs.push({
                                        pekerjaan: res.rows.item(i).Pekerjaan,
                                        iconPath: res.rows.item(i).IconPath,
                                        nilai: res.rows.item(i).Nilai,
                                        id: res.rows.item(i).Id
                                    });

                                }
                                $scope.$apply();
                            }
                        }, function (error) {
                            alert(error);
                        });
                }, function (error) {
                    alert(error);
                });
            } else {

            }
        });
    }

    $scope.getBalance = function () {
        var jsonRequest = { "getBalance": { "accountNo": "00000000116954388" } };
        var log = {};
        httpService.balanceInq(jsonRequest).then(function (res) {
            //log=
            alert(JSON.stringify(res.data.Body.getBalanceResponse.balance));
        },
        function (error) {
            alert(error);
        });
    }

    $scope.transfer = function () {
        var jsonRequest = {
            "transfer": {
                "fromAct": "00000000116954399",
                "toAct": "00000000116954388",
                "amt": "10000000"
            }
        };
        httpService.transferDana(jsonRequest).then(function (res) {
            alert(JSON.stringify(res.data.Body));
        },
        function (error) {
            alert(error);
        });
    }

    $scope.payload = function () {
        //var test = [];
        //test.push(session.context());
        //test.push(session.start());
        //test.push(session.end());
        //alert(JSON.stringify(test));

        httpService.sendEvent().then(function (res) {
            alert(JSON.stringify(res));
        },
        function (error) {
            alert(JSON.stringify(error));
        });
    }
   
})


.controller('BlueCtrl', function ($scope, $cordovaBluetoothSerial, $cordovaToast, $ionicPlatform, $ionicLoading) {
    $ionicPlatform.ready(function () {
        $cordovaBluetoothSerial.isEnabled().then(
        function () {
            //$cordovaToast.show('OK', 'long', 'center');
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>finding bluetooth please wait...'
            });

            $cordovaBluetoothSerial.discoverUnpaired().then(function (res) {
                $scope.unpairedDevices = res;
            })

            $cordovaBluetoothSerial.list()
        .then(function (resb) {

            $scope.devices = resb;
            $ionicLoading.hide();
           // var debugString = JSON.stringify(resb);
            
           // $cordovaToast.show('Berhasil ' + debugString, 'long', 'center');

            /*       var alertPopup = $ionicPopup.alert({
               title: 'Bluetooth',
               template: debugString
             });
          
             alertPopup.then(function(res) {
               console.log('Bluetooth List');
             });*/



        }, function (error) {
            $cordovaToast.show('Error  ' + debugString, 'long', 'center');
        }).finally(
            function () {
                $scope.$broadcast('scroll.refreshComplete');
            }
        )
        },
       function () {
           $cordovaToast.show('NOT OK', 'long', 'center');
       }
    );

    });


    // pull to refresh
    $scope.onRefresh = function () {
        $cordovaBluetoothSerial.discoverUnpaired().then(function (res) {
            $scope.unpairedDevices = res;
        })

        $cordovaBluetoothSerial.list()
        .then(function (resb) {

            $scope.devices = resb;
            var debugString = JSON.stringify(resb);
            $cordovaToast.show('Berhasil ' + debugString, 'long', 'center');

            /*       var alertPopup = $ionicPopup.alert({
               title: 'Bluetooth',
               template: debugString
             });
          
             alertPopup.then(function(res) {
               console.log('Bluetooth List');
             });*/



        }, function (error) {
            $cordovaToast.show('Error  ' + debugString, 'long', 'center');
        }).finally(
            function () {
                $scope.$broadcast('scroll.refreshComplete');
            }
        )

    };



})



.controller('BlueDetailCtrl', function ($scope, $stateParams, $cordovaBluetoothSerial, $cordovaToast, $ionicPlatform) {
    $scope.address = $stateParams.address;

    $scope.turnOn = function () {
        $cordovaBluetoothSerial.isEnabled().then(
         function () {
             $cordovaBluetoothSerial.connect($scope.address)
             .then(function (result) {
                 $cordovaToast.show('Berhasil terkoneksi' + result, 'long', 'center');

             }, function (error) {
                 $cordovaToast.show('Gagal Connect', 'long', 'center');
             })
         },
        function () {
            $cordovaToast.show('NOT OK', 'long', 'center');
        }

        );
    };


    $scope.move = function () {
        $cordovaBluetoothSerial.isConnected().then(
          function () {
              $cordovaBluetoothSerial.write("M 1 2000 \n\r")
         .then(function (result) {
             $cordovaToast.show('Move' + result, 'short', 'center');
         }, function (error) {
             $cordovaToast.show('Gagal Connect', 'short', 'center');
         })
          },

function () {
    $cordovaToast.show('NOT OK', 'long', 'center');
}

);


    };


    $scope.stop = function () {
        $cordovaBluetoothSerial.isConnected().then(
          function () {
              $cordovaBluetoothSerial.write("M 0 \n\r")
         .then(function (result) {
             $cordovaToast.show('Stop' + result, 'short', 'center');
         }, function (error) {
             $cordovaToast.show('Gagal Connect', 'short', 'center');
         })

          },
function () {
    $cordovaToast.show('NOT OK', 'long', 'center');
}

);


    };

})

.controller('riwayatCtrl', function ($scope, $rootScope) {
    $scope.listAnak = [{ value: 'Semua', text: 'Semua' }, { value: 'Kaylan Oliver', text: 'Kaylan Oliver' },
            { value: 'Kathlyn Olivia', text: 'Kathlyn Olivia' }];

})

.controller('TestCtrl', function ($scope, $ionicSideMenuDelegate, $ionicSlideBoxDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.showMoney = true;

    $scope.next = function () {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
        $ionicSlideBoxDelegate.previous();
    };
})

.directive('draggable', function ($document, $timeout) {
    
    return function (scope, element, attr) {
        var w = (element.parent().prop('clientWidth') - element.prop('clientWidth'))/2;
        var h = (element.parent().prop('clientHeight') - element.prop('clientHeight')-50) / 2;
        var startX = 0, startY = 0, x = 0, y = 0, width = 0, elementW = 0, elementH = 0, parentHeight, parentWidth;
        element.css({
            left: 0,
            top: 0,
            right: 0,
            bottom:0,
       cursor: 'pointer',
      });
        parentHeight = element.parent().prop('clientHeight');
        parentWidth = element.parent().prop('clientWidth');
        $timeout(function () {
            elementW = element.prop('clientWidth');
            elementH = element.prop('clientHeight');
        }, 200);
        
        element.on('dragstart', function (event) {
            // Prevent default dragging of selected content           
            event.gesture.preventDefault();
            startX = event.gesture.center.pageX - x;
            startY = event.gesture.center.pageY - y;
            $document.on('drag', move);
            $document.on('dragend', release);
        });


        function move(event) {
            y = event.gesture.center.pageY - startY;
            x = event.gesture.center.pageX - startX;
            if (x >= -300 && x <= (parentWidth - elementW)) {
                element.css({
                    left: x + 'px'
                });
            }
            if (y >= -300 && y <= parentHeight - elementH) {
                element.css({
                    top: y + 'px'
                });
            }
        }
        
        function release() {
        $document.unbind('drag', move);
        $document.unbind('dragend', release);
        $timeout(function () {
            element.css({ left: 0 , top: 0 ,right:0,bottom:0 });
            startX = 0, startY = 0, x = 0, y = 0, width = 0, elementW = 0, elementH = 0;

        }, 300);
        
        }
    };
})

    .directive('draggable2', function ($document, $timeout) {

        return function (scope, element, attr) {
            var w = (element.parent().prop('clientWidth') - element.prop('clientWidth')) / 2;
            var h = (element.parent().prop('clientHeight') - element.prop('clientHeight') - 50) / 2;
            var startX = w, startY = h, x = w, y = h, width = 0, elementW = 0, elementH = 0, parentHeight, parentWidth;
            element.css({
                left: w + 'px',
                top: h + 'px',
                cursor: 'pointer',
            });
            parentHeight = element.parent().prop('clientHeight');
            parentWidth = element.parent().prop('clientWidth');
            $timeout(function () {
                elementW = element.prop('clientWidth');
                elementH = element.prop('clientHeight');
            }, 200);

            element.on('dragstart', function (event) {
                // Prevent default dragging of selected content           
                event.gesture.preventDefault();
                startX = event.gesture.center.pageX - x;
                startY = event.gesture.center.pageY - y;
                $document.on('drag', move);
                $document.on('dragend', release);
            });


            function move(event) {
                y = event.gesture.center.pageY - startY;
                x = event.gesture.center.pageX - startX;
                if (x >= 0 && x <= (parentWidth - elementW)) {
                    element.css({
                        left: x + 'px'
                    });
                }
                if (y >= 0 && y <= parentHeight - elementH) {
                    element.css({
                        top: y + 'px'
                    });
                }
            }

            function release() {
                $document.unbind('drag', move);
                $document.unbind('dragend', release);
                $timeout(function () {
                    element.css({ left: w + 'px', top: h + 'px' });
                    startX = w, startY = h, x = w, y = h, width = 0, elementW = 0, elementH = 0;

                }, 300);

            }
        };
    })

.directive('panahkiri', function () {
    return function (scope, element, attr) {
        var h = (100+element.parent().prop('clientHeight') - element.prop('clientHeight') - 50) / 2;
        element.css({
            left: 5 + 'px',
            top: h + 'px'
        });
    };
})

.directive('panahkanan', function () {

    return function (scope, element, attr) {
        var h = (100+element.parent().prop('clientHeight') - element.prop('clientHeight') - 50) / 2;
        element.css({
            right: 5+ 'px',
            top: h + 'px'
        });          
    };
})

.directive('stellax', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {

            $timeout(function () {
                $('.scroll').stellar({
                    scrollProperty: 'transform',
                    positionProperty: 'transform',
                    horizontalScrolling: false,
                    verticalOffset: -150
                });
            });



        }
    };
})

.directive('elasticHeader', function ($ionicScrollDelegate) {
    return {
        restrict: 'A',
        link: function (scope, scroller, attr) {
            var scrollerHandle = $ionicScrollDelegate.$getByHandle(attr.delegateHandle);
            var header = document.getElementById(attr.elasticHeader);
            var headerHeight = header.clientHeight;
            var translateAmt, scaleAmt, scrollTop, lastScrollTop;
            var ticking = false;

            // Set transform origin to top:
            header.style[ionic.CSS.TRANSFORM + 'Origin'] = 'center bottom';
            // Update header height on resize:
            window.addEventListener('resize', function () {
                headerHeight = header.clientHeight;
            }, false);

            scroller[0].addEventListener('scroll', requestTick);

            function requestTick() {
                if (!ticking) {
                    ionic.requestAnimationFrame(updateElasticHeader);
                }
                ticking = true;
            }

            function updateElasticHeader() {

                scrollTop = scrollerHandle.getScrollPosition().top;

                if (scrollTop >= 0) {
                    // Scrolling up. Header should shrink:
                    translateAmt = scrollTop / 4;
                    scaleAmt = 1;
                } else {
                    // Scrolling down. Header should expand:
                    translateAmt = 0;
                    scaleAmt = -scrollTop / headerHeight + 1;
                }

                // Update header with new position/size:
                header.style[ionic.CSS.TRANSFORM] = 'translate3d(0,' + translateAmt + 'px,0) scale(' + scaleAmt + ',' + scaleAmt + ')';

                ticking = false;
            }
        }
    }
})

.filter("customCurrency", function (numberFilter) {
    function isNumeric(value) {
        return (!isNaN(parseFloat(value)) && isFinite(value));
    }

    return function (inputNumber, currencySymbol, decimalSeparator, thousandsSeparator, decimalDigits, prefixWithSymbol) {
        if (isNumeric(inputNumber)) {
            // Default values for the optional arguments
            currencySymbol = (typeof currencySymbol === "undefined") ? "$" : currencySymbol;
            decimalSeparator = (typeof decimalSeparator === "undefined") ? "." : decimalSeparator;
            thousandsSeparator = (typeof thousandsSeparator === "undefined") ? "," : thousandsSeparator;
            decimalDigits = (typeof decimalDigits === "undefined" || !isNumeric(decimalDigits)) ? 2 : decimalDigits;
            prefixWithSymbol = (typeof prefixWithSymbol === "undefined") ? true : prefixWithSymbol;

            if (decimalDigits < 0) decimalDigits = 0;

            // Format the input number through the number filter
            // The resulting number will have "," as a thousands separator
            // and "." as a decimal separator.
            var formattedNumber = numberFilter(inputNumber, decimalDigits);

            // Extract the integral and the decimal parts
            var numberParts = formattedNumber.split(".");

            // Replace the "," symbol in the integral part
            // with the specified thousands separator.
            numberParts[0] = numberParts[0].split(",").join(thousandsSeparator);

            // Compose the final result
            var result = numberParts[0];

            if (numberParts.length == 2) {
                result += decimalSeparator + numberParts[1];
            }

            return (prefixWithSymbol ? currencySymbol + " " : "") + result + (prefixWithSymbol ? "" : " " + currencySymbol);
        } else {
            return inputNumber;
        }
    };
})

.directive('currencyInput', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            return ctrl.$parsers.push(function (inputValue) {
                var inputVal = element.val();

                //clearing left side zeros
                while (inputVal.charAt(0) == '0') {
                    inputVal = inputVal.substr(1);
                }

                inputVal = inputVal.replace(/[^\d.\',']/g, '');

                var point = inputVal.indexOf(",");
                if (point >= 0) {
                    inputVal = inputVal.slice(0, point + 3);
                }

                var decimalSplit = inputVal.split(",");
                var intPart = decimalSplit[0];
                var decPart = decimalSplit[1];

                intPart = intPart.replace(/[^\d]/g, '');
                if (intPart.length > 3) {
                    var intDiv = Math.floor(intPart.length / 3);
                    while (intDiv > 0) {
                        var lastComma = intPart.indexOf(".");
                        if (lastComma < 0) {
                            lastComma = intPart.length;
                        }

                        if (lastComma - 3 > 0) {
                            intPart = intPart.slice(0, lastComma - 3) + "." + intPart.slice(lastComma - 3);
                        }
                        intDiv--;
                    }
                }

                if (decPart === undefined) {
                    decPart = "";
                }
                else {
                    decPart = "," + decPart;
                }
                var res = intPart + decPart;

                if (res != inputValue) {
                    ctrl.$setViewValue(res);
                    ctrl.$render();
                }

            });

        }
    };
});

