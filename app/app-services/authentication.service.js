(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthenticationService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.Login = Login;
        service.Logout = Logout;
        service.Profile = Profile;

        return service;

        function Login(username, callback) {
            $http.post('/api/authenticate', { email: username })
                .then(function (response) {
                    console.log("User Already registered", response);
                    // login successful if there's a token in the response
                    if (response.data.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: username, token: response.token };

                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;

                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                });
        }

        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }

        function Profile(callback) {
            $http.get('/api/profile', { params : { email: $localStorage.currentUser.username }})
                .then(function (response) {
                    if (response.data.result) {
                        callback(response.data.result);
                    } else {
                        callback(response);
                    }
                });
        }
    }
})();