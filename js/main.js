var analyzer = (function($) {


  var markersArray = [];
  var pointsArray = [];
  var stopsArray = [];
  var REDSTOP = 1;
  var BLUESTOP = 2;
  var lat1 = 0;
  var lon1 = 0;
  var lat2 = 0;
  var lon2 = 0;
  var circle = null;
  var CIRCLE_RADIUS = 100;



  function cleanErrors() {
    $("#input-file").removeClass('error-input');
    $("#bus-id").removeClass('error-input');
    $("#error-message").hide();
  }

  function updateStopsMarkers() {

    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
    }
    markersArray = [];
    var draggable = false;
    for (i = 0; i < stopsArray.length; i++) {
      createMarker(i, stopsArray[i][0], stopsArray[i][1]);
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

      clickRedMarker(lat, lng, icon);

    });

    markersArray.push(marker);

  }

  function clickBlueMarker(lat, lng, icon) {
    lat2 = lat;
    lon2 = lng;
    $('#blue-image').attr("src", icon);
    if (lat1 != 0 && lon1 != 0) {
      var d = getDistance();
      $('#distance').text(d.toFixed(4) + ' m');
    }
  }

  function clickRedMarker(lat, lng, icon) {
    lat1 = lat;
    lon1 = lng;
    var location = new google.maps.LatLng(lat, lng);
    if (circle != null) {
      circle.setMap(null);
    }
    circle = new google.maps.Circle({
      center: location,
      map: map,
      radius: CIRCLE_RADIUS,
      fillColor: '#AA0000',
      strokeWeight: 1
    });
    $('#red-image').attr("src", icon);
    if (lat2 != 0 && lon2 != 0) {
      var d = getDistance();
      $('#distance').text(d.toFixed(4) + ' m');
    }
  }



  function centerMap(type, stop) {
    var location = null;
    if (type == REDSTOP) {
      location = new google.maps.LatLng(stopsArray[stop].lat, stopsArray[stop].lng);
    } else {
      location = new google.maps.LatLng(pointsArray[stop].lat, pointsArray[stop].lng);
    }
    map.panTo(location);
  }


  function setStops(stops, tempStops) {
    console.log("Set stops");
    clearInformation();
    stopsArray = stops;
    tempStopsArray = tempStops;

    updateStopsMarkers();
    map.setZoom(16);
    centerMap(BLUESTOP, 0);
  }

  function getDistance() {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = d * 1000;
    return d;
  }

  function cleanUp() {
    lat1 = 0;
    lon1 = 0;
    lat2 = 0;
    lon2 = 0;
    $('#red-image').attr("src", "");
    $('#blue-image').attr("src", "");
    $('#distance').text('');
    if (circle != null) {
      circle.setMap(null);
    }
  }
  /****************************************************************/


  var map;

  function initialize() {
    var mapOptions = {
      zoom: 16,
      center: new google.maps.LatLng(10.32222, -84.43028),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    geocoder = new google.maps.Geocoder();
    initButtons();
  }

  function initButtons() {

    $("#input-file").bind('change', handleFileSelect);

  } // init buttons

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];

    readFile(file, function(data) {

      stopsArray = data;

      updateStopsMarkers();
      var location = new google.maps.LatLng(data[0][0], data[0][1]);
      map.panTo(location);
    });
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