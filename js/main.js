var analyzer = (function($) {


  var markersArray = [];
  var GPSPointsArray = [];
  var firstStopLocation = null;
  var secondStopLocation = null;
  var circle_red = null;
  var circle_blue = null;
  var CIRCLE_RADIUS = 100; // meters
  var map;
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var oldpath;
  var lastIndx = 0;
  var line = null;
  var distanceMarker = null;

  function updateStopsMarkers() {

    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
    }
    markersArray = [];
    var draggable = false;
    for (i = 0; i < GPSPointsArray.length; i++) {
      createMarker(i, GPSPointsArray[i][0], GPSPointsArray[i][1]);
    }
  }

  function createMarker(index, lat, lng) {
    var icon = '../images/icons/number_' + (index + 1) + '.png';

    var location = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: icon
    });
    var content = '<div id="infoWindow">';
    content += '<b>Point # ' + (index + 1) + ' </b><br />';
    content += '<b>Latitude: </b>' + lat + '<br />' + '<b>Longitude: </b>' + lng + '<br /></div>';
    marker.info = new google.maps.InfoWindow({
      content: content,
      disableAutoPan: true
    });

    google.maps.event.addListener(marker, 'mouseover', function() {

      marker.info.open(map, marker);
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
      marker.info.close();
    });

    google.maps.event.addListener(marker, 'click', function() {

      markerClicked(lat, lng, icon);

    });

    markersArray.push(marker);

  }



  function markerClicked(lat, lng, icon) {

    var location = new google.maps.LatLng(lat, lng);
    if (firstStopLocation) {
      secondStopLocation = new google.maps.LatLng(lat, lng);

      if (circle_blue) {
        circle_blue.setMap(null);
      }
      circle_blue = new google.maps.Circle({
        center: location,
        map: map,
        radius: CIRCLE_RADIUS,
        fillColor: '#0000CC',
        strokeWeight: 1
      });
    } else {
      firstStopLocation = new google.maps.LatLng(lat, lng);

      if (circle_red) {
        circle_red.setMap(null);
      }
      circle_red = new google.maps.Circle({
        center: location,
        map: map,
        radius: CIRCLE_RADIUS,
        fillColor: '#AA0000',
        strokeWeight: 1
      });
    }

    if (secondStopLocation) {
      var distance = getDistance();
      addDistanceMarker(distance);
    }
  }

  function addDistanceMarker(distance) {
    var lineCoordinates = [
      firstStopLocation,
      secondStopLocation
    ];
    if (line) {
      line.setMap(null);
    }

    line = new google.maps.Polyline({

      path: lineCoordinates,
      strokeColor: '#006600',
      strokeOpacity: 1.0,
      strokeWeight: 4
    });
    line.setMap(map);
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < lineCoordinates.length; i++) {
      bounds.extend(lineCoordinates[i]);
    }
    // The Center of the polygon
    var latlng = bounds.getCenter();
    var contentString = '<div id="content">Distance is <b>' + distance.toFixed(3) + ' m </b></div>';
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    if (distanceMarker) {
      distanceMarker.setMap(null);
    }
    distanceMarker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: latlng.toString(),
      icon : '../images/information.png'
    });

    google.maps.event.addListener(distanceMarker, 'click', function() {
      infowindow.open(map, distanceMarker);
    });
    infowindow.open(map, distanceMarker);
    $("#clear-distance").show();
  }


  function getDistance() {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (secondStopLocation.lat() - firstStopLocation.lat()) * Math.PI / 180;
    var dLon = (secondStopLocation.lng() - firstStopLocation.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(firstStopLocation.lat() * Math.PI / 180) * Math.cos(secondStopLocation.lat() * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = d * 1000;
    return d;
  }

  function cleanUp() {
    firstStopLocation = null;
    secondStopLocation = null;
    if (circle_red) {
      circle_red.setMap(null);
    }
    if (circle_blue) {
      circle_blue.setMap(null);
    }
    if (line) {
      line.setMap(null);
    }
    if (distanceMarker) {
      distanceMarker.setMap(null);
    }
    $("#clear-distance").hide();
  }

  function initialize() {
    var mapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(10.32222, -84.43028),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);

    initButtons();
  }

  function initButtons() {

    $("#input-file").bind('change', handleFileSelect);

    $("#clear-distance").click(function() {

      cleanUp();
    });

  } // init buttons

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];

    readFile(file, function(data) {

      GPSPointsArray = data;

      updateStopsMarkers();
      var location = new google.maps.LatLng(data[0][0], data[0][1]);
      map.panTo(location);
      var waypts = [];

      for (var i = 0; i < data.length; i++) {

        var point = new google.maps.LatLng(data[i][0], data[i][1]);
        waypts.push({
          location: point,
          stopover: true
        });
      }

      // get directions and draw on map
      gDirRequest(directionsService, waypts, function drawGDirLine(path) {
        var line = new google.maps.Polyline({
          clickable: false,
          map: map,
          path: path,
          strokeColor: '#FF9933', 
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
      });

    });
  }


  function gDirRequest(service, waypoints, userFunction, waypointIndex, path) {
    // set defaults

    waypointIndex = typeof waypointIndex !== 'undefined' ? waypointIndex : 0;
    path = typeof path !== 'undefined' ? path : [];

    // get next set of waypoints
    var s = gDirGetNextSet(waypoints, waypointIndex);
    // build request object
    var startl = s[0].shift()["location"];
    var endl = s[0].pop()["location"];
    var request = {
      origin: startl,
      destination: endl,
      waypoints: s[0],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC,
      optimizeWaypoints: false,
      provideRouteAlternatives: false,
      avoidHighways: false,
      avoidTolls: false
    };
    service.route(request, function(response, status) {

      if (status == google.maps.DirectionsStatus.OK) {
        path = path.concat(response.routes[0].overview_path);
        oldpath = path
        if (s[1] != null) {
          lastIndx = s[1]
          gDirRequest(service, waypoints, userFunction, s[1], path)
        } else {
          userFunction(path);
        }

      } else {
        path = oldpath;
        lastIndx = lastIndx + 1
        if (s[lastIndx] != null) {
          gDirRequest(service, waypoints, userFunction, lastIndx, path)
        } else {
          userFunction(path);
        }
      }

    });
  }

  function gDirGetNextSet(waypoints, startIndex) {
    var MAX_WAYPOINTS_PER_REQUEST = 8;

    var w = []; // array of waypoints to return

    if (startIndex > waypoints.length - 1) {
      return [w, null];
    } // no more waypoints to process

    var endIndex = startIndex + MAX_WAYPOINTS_PER_REQUEST;

    // adjust waypoints, because Google allows us to include the start and destination latlongs for free!
    endIndex += 2;

    if (endIndex > waypoints.length - 1) {
      endIndex = waypoints.length;
    }

    for (var i = startIndex; i < endIndex; i++) {
      w.push(waypoints[i]);
    }

    if (endIndex != waypoints.length) {
      return [w, endIndex -= 1];
    } else {
      return [w, null];
    }
  }

  function readFile(fileToParse, callback) {

    var reader = new FileReader();
    reader.readAsText(fileToParse);
    reader.onload = function() {
      var csv = event.target.result;
      var parsedData = $.csv.toArrays(csv, {
        onParseValue: $.csv.hooks.castToScalar
      });
      callback(parsedData);
    };
    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };

  }



  return {
    initialize: initialize
  }

})(jQuery);