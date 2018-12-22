(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(AuthenticationService) {
        var vm = this;

        initController();

        function initController() {
            AuthenticationService.Profile(function (result) {
                console.log("da", result)
                vm.userProfile = result;
                vm.test = "result";
            });
        }
    }

})();