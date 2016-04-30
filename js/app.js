angular.module('fbGroupImageCrawler', [])
  .controller('main', function($rootScope, $window, $scope, $http, $location) {
  	$scope.images = [];
  	$scope.ready = false;
  	// $scope.since = new Date();
  	$window.fbAsyncInit = function() {
	    // Executed when the SDK is loaded
	    FB.init({ 
	    	appId: '',                         /*************PUT FACEBOOK APP ID HERE***************/ 
	    	/* 
	    		Adding a Channel File improves the performance 
	    		of the javascript SDK, by addressing issues 
	    		with cross-domain communication in certain browsers. 
	    	*/
	    	channelUrl: 'channel.html', 
	    	cookie: true, 
	    	xfbml: true,
	    	version: 'v2.5'
	    });
  	};

  	(function(d){
      var fbGroupId = '';  /*******************PUT FACEBOOK GROUP ID WHERE PHOTOS COME FROM HERE**********************/
    // load the Facebook javascript SDK
	    var js, 
	    id = 'facebook-jssdk', 
	    ref = d.getElementsByTagName('script')[0];
	    js = d.createElement('script'); 
	    js.id = id; 
	    js.async = true;
	    js.src = "https://connect.facebook.net/zh_TW/sdk.js";
	    ref.parentNode.insertBefore(js, ref);
  	}(document));

    $scope.getImage = function(){
    	document.getElementById("getImageButton").setAttribute("disabled","disabled");
    	document.getElementById("getImageButton").innerHTML = "Processing";
    	FB.login(function(){
    		var request = {
    			"fields":"full_picture,created_time",
    			"limit":"1000"
    		};
    		if($scope.since) request.since = $scope.since.toJSON();
    		if($scope.until) request.until = $scope.until.toJSON();
    		FB.api(
				'/'+ fbGroupId +'/feed',
				'GET',
				request,
				function(response) {
					var after = Date.parse($scope.since.toJSON());
					var before = Date.parse($scope.until.toJSON());
					$scope.$apply(function(){
						$scope.ready = true;
						$scope.images = response.data.filter(function(image){
									var time = Date.parse(image.created_time);
									return (after <  time && before > time);
								})
					});
					document.getElementById("getImageButton").removeAttribute("disabled");
    				document.getElementById("getImageButton").innerHTML = "Get Images";
				}
			);
		}, {scope: ''});
    };
    $scope.downloadAllImages = function(){
		var zip = new JSZip();
		var deferreds = [];
		for(var i=0; i<$scope.images.length; i++){
			if($scope.images[i].full_picture){
				deferreds.push( addToZip(zip, $scope.images[i]) );
			}
		}
		$.when.apply(window, deferreds).done(generateZip);
	}
	function generateZip(zip){
		var content = zip.generate({type:"blob"});
		// see FileSaver.js
		var filename = "images_";
		if($scope.since) filename=filename+$scope.since.getFullYear()+"-"+($scope.since.getMonth()+1)+"-"+$scope.since.getDate()+"-"+$scope.since.getHours()+"-"+$scope.since.getMinutes();
		if($scope.until) filename=filename+"_to_"+$scope.until.getFullYear()+"-"+($scope.until.getMonth()+1)+"-"+$scope.until.getDate()+"-"+$scope.until.getHours()+"-"+$scope.until.getMinutes();
		filename = filename+".zip";
		saveAs(content, filename);
	}
	function addToZip(zip, img) {
		var deferred = $.Deferred();
		JSZipUtils.getBinaryContent(img.full_picture, function (err, data) {
			if(err) {
				alert("Problem happened when download img: " + img.full_picture);
				console.erro("Problem happened when download img: " + img.full_picture);
				deferred.resolve(zip); // ignore this error: just logging
				// deferred.reject(zip); // or we may fail the download
			} else {
				zip.file(img.created_time+".jpg", data, {binary:true});
				deferred.resolve(zip);
			}
		});
		return deferred;
	}
});

 
