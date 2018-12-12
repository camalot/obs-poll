var app = angular.module('app', [])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/assets/web/app/views/main.html',
				controller: 'MainCtrl'
			});
	});
