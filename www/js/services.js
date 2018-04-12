angular.module('celengan.services', [])
.constant('_urlBalance', 'https://mcsdemo-orclid.mobileenv.us2.oraclecloud.com:443/mobile/custom/celengan/inquiry?account_no=')
.constant('_urlTransfer', 'https://mcsdemo-orclid.mobileenv.us2.oraclecloud.com:443/mobile/custom/celengan/transfer?')
.constant('_urlEvent', 'https://mcsdemo-orclid.mobileenv.us2.oraclecloud.com/mobile/platform/analytics/events')
.constant('_authdata', 'T1JDTElEX01DU0RFTU9fTU9CSUxFX0FOT05ZTU9VU19BUFBJRDpqc3VuTF9meTB0Z2g2cA==')
.constant('_oracleID', '1f2b4b62-8a08-46e8-9023-552848eda6a7')

.factory('httpService', function ($http, _urlBalance, _urlTransfer, _urlEvent, _authdata, _oracleID) {
    var _headers = {
        'Oracle-Mobile-Backend-ID': _oracleID,
        'Authorization': 'Basic ' + _authdata,
        'Content-Type': 'application/json; charset=utf-8'

    };

    return {
        balanceInq: function (_noAccount) {
            return $http.get(_urlBalance+_noAccount, { headers: _headers });
        },

        transferDana: function (asal,tujuan,nilai) {
            return $http.get(_urlTransfer+'from_account_no='+asal+'&to_account_no='+tujuan+'&amount='+nilai, { headers: _headers });
        },
        event: function (_data) {
            return $http.post(_urlEvent, _data, { headers: _headers });
        },
        sendEvent: function (isSystemEvent, eventName, properties) {
            var _data = [{
                "name": "context",
                "type": "system",
                "timestamp": "2013-04-12T23:20:54.345Z",
                "properties": {
                    "userName": "GDoe321",
                    "latitude": "37.35687",
                    "longitude": "-122.11663",
                    "timezone": "-14400",
                    "carrier": "AT&T",
                    "model": "iPhone5,1",
                    "manufacturer": "Apple",
                    "osName": "iPhone OS",
                    "osVersion": "7.1",
                    "osBuild": "13E28"
                }
            },
            {
                "name": "sessionStart",
                "type": "system",
                "timestamp": "2013-04-12T23:20:55.052Z",
                "sessionID": "2d64d3ff-25c7-4b92-8e49-21884b3495ce"
            },
            {
                "name": "Balance Inquiry",
                "type": "custom",
                "timestamp": "2013-04-12T23:20:56.523Z",
                "sessionID": "2d64d3ff-25c7-4b92-8e49-21884b3495ce",
                "properties": {
                    "status": "success"   /* or “failed” */
                }
            },
            {
                "name": "Fund Transfer",
                "timestamp": "2013-04-12T23:23:58.525Z",
                "sessionID": "2d64d3ff-25c7-4b92-8e49-21884b3495ce",
                "properties": {
                    "status": "success",
                    "amount": "< 10000"  /* or “10000 – 50000” or “50000 – 100000” or “> 100000”*/
                }
            },
            {
                "name": "sessionEnd",
                "type": "system",
                "timestamp": "2013-04-12T23:25:55.052Z",
                "sessionID": "2d64d3ff-25c7-4b92-8e49-21884b3495ce"
            }];

            return $http.post(_urlEvent, _data, { headers: _headers });
        }
    }
})

.factory('sqlService', function ($cordovaSQLite) {
    return {
        logout: function (_user) {
            return $cordovaSQLite.execute(db, 'UPDATE User SET isLogin=0 WHERE UserName=?', [_user])
            .then(function () {
                var _log = [];
                _log.push(session.context());
                _log.push(session.end());
                httpService.event(_log);
            }, function (error) {
                alert('Gagal Logout : ' + error);
            });
        },
        deleteDataCelengan: function () {
            return $cordovaSQLite.execute(db, 'DELETE FROM Celengan');
        }
        //,
        //getUser: function (_user,_pass) {
        //    return $cordovaSQLite.execute(db, 'SELECT * FROM User WHERE UserName=? AND Password=?', [_user, _pass])
        //},
        //insertUser: function (_fullName, _userName, _email, _pass, _pin) {
        //    return $cordovaSQLite.execute(db, 'INSERT INTO User (FullName, UserName , Email, Password,Pin) VALUES(?,?,?,?,?)', [_fullName, _userName, _email, _pass, _pin]);
        //},
        //insertCelengan: function (_pekerjaan, _nilai, _nama, _rekeningAsal, _rekeningTujuan) {
        //    return $cordovaSQLite.execute(db, 'INSERT INTO Celengan (Pekerjaan,Nilai,Nama,RekeningAsal,RekeningTujuan) VALUES(?,?,?,?,?)', [_pekerjaan, _nilai, _nama, _rekeningAsal, _rekeningTujuan]);
        //},
        //insertDaftarKerja: function (_pekerjaan, _iconPath, _nilai) {
        //    return $cordovaSQLite.execute(db, 'INSERT INTO DaftarKerja (Pekerjaan,IconPath,Nilai) VALUES(?,?,?)', [_pekerjaan, _iconPath, _nilai]);
        //},
        //getDaftarKerja: function () {
        //   return $cordovaSQLite.execute(db, 'SELECT * FROM DaftarKerja');
        //}

    }
})

.factory('session', function ($cordovaDevice, $rootScope, $http) {
    var dt = new Date();
    var uuid = UUIDjs.create(1);

    return {
        context: function () {
            var _info = {
                "name": "context",
                "type": "system",
                "timestamp": dt.toISOString(),
                "properties": {
                    "userName": $rootScope.username,
                    "latitude": $rootScope.latitude.toString,
                    "longitude": $rootScope.longitude.toString,
                    "timezone": dt.getTimezoneOffset().toString,
                    "carrier": "",
                    "model": $cordovaDevice.getModel(),
                    "manufacturer": $cordovaDevice.getPlatform(),
                    "osName": $cordovaDevice.getPlatform(),
                    "osVersion": $cordovaDevice.getVersion(),
                    "osBuild": ""
                }
            };
            return _info;
        },
        balance: function () {
            var _info = {
                "name": "Balance Inquiry",
                "type": "custom",
                "timestamp": dt.toISOString(),
                "sessionID": uuid.toString(),
                "properties": {
                    "status": "success"   /* or “failed” */
                }
            };
            return _info;
        },

        transfer: function () {
            var _info = {
                "name": "Fund Transfer",
                "timestamp": dt.toISOString(),
                "sessionID": uuid.toString(),
                "properties": {
                    "status": "success",
                    "amount": "10000"  /* or “10000 – 50000” or “50000 – 100000” or “> 100000”*/
                }
            };
            return _info;
        },

        start: function () {
            var _info = {
                "name": "sessionStart",
                "type": "system",
                "timestamp": dt.toISOString(),
                "sessionID": uuid.toString()
            };

            return _info;
        },


        end: function () {
            var _info = {
                "name": "sessionEnd",
                "type": "system",
                "timestamp": dt.toISOString(),
                "sessionID": uuid.toString()
            };
            return _info;
        }
    }
})

.factory('timestamp', function () {
    var now = new Date();

    // Create an array with the current month, day and time
    var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];

    // Create an array with the current hour, minute and second
    var time = [now.getHours(), now.getMinutes(), now.getSeconds()];

    // Determine AM or PM suffix based on the hour
    var suffix = (time[0] < 12) ? "AM" : "PM";

    // Convert hour from military time
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;

    // If hour is 0, set it to 12
    time[0] = time[0] || 12;

    // If seconds and minutes are less than 10, add a zero
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }

    // Return the formatted string
    return date.join("/") + " " + time.join(":") + " " + suffix;

})

.factory('user', function ($cordovaSQLite) {

})


.factory('formatNumber', function () {
    return {
        currency: function (n, currency) {
            return currency + " " + n.toFixed(0).replace(/./g, function (c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "." + c : c;
            });
        }
    }
});