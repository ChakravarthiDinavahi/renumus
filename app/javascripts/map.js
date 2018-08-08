var map;
var geojson = [];
var myLayer = [];
var all_lngs = [];
var all_lats = [];
var allMarkers = [];

$(document).ready(function(){
  // set map view type based on cookies
  if (jQuery.inArray(Cookies.get('map_view_preference'), ["mapbox.streets", "mapbox.satellite"]) == -1){
    Cookies.set('map_view_preference', 'mapbox.streets');
  }
  var lat, long, zoom;
  // setMap function set map based on latitude and longitude if no map set till now
  if ($("#map").length) setIntialMap();
  resetDevicesGYRFilter();
  resetTextFilter();
  getDevicesData();
  refreshFrequently();
});

// call getDevicesData() function for every 3 minutes
function refreshFrequently(){
  window.setInterval(function(){
    getDevicesData()
  }, 180000);
}

// This function contians ajax call and this call return devices data to show up on map in the form of markers
function getDevicesData(){
  $.ajax({
    url: "/devices/get_user_devices_data"
  }).done(function(result){
      onMapLoad(result);
      onClickDeviceTextFilter();
  })
  console.log("received data");
}

// This function will call to set up map after page load
function setIntialMap(){
   map = L.mapbox.map('map').addControl(L.mapbox.geocoderControl('mapbox.places', {
       autocomplete: true
   }));
   //Add Street and satellite options to mapbox
   L.control.layers({
       "Street": map.tileLayer,
       "Satellite": L.mapbox.tileLayer("mapbox.satellite")
   }, null).addTo(map);
   map.fitWorld({reset: true}).zoomIn(2);
}

function onMapLoad(devicesData) {
  removeAllMarkers();
  callChangeMapViewPreference();
  setMarkerNow(devicesData);
  // Call fitbound function and fit map bounds base don geojson marker data
  if (geojson.length) fitToBounds(geojson);
  changeMarkersVisibility();
}


// This function will set markers on map based on devices data
function setMarkerNow(devicesData){
  var device_overall_status_level;
  var marker_color;

  // Add markers for each location
  $.each(devicesData, function(index, value){
    device_overall_status_level = value.overall_status_level;
    if(is_grey_rule_pass(value.timestamp, value.running) || value.overall_status_level == null){
      marker_color = '#999999';
      device_overall_status_level = 0;
    }
    else if(value.overall_status_level == 5){
        marker_color = '#75FA0E';
      }
    else if(value.overall_status_level == 10){
      marker_color = '#FBF403';
    }
    else if(value.overall_status_level == 15){
      marker_color = '#F71E04';
    }

    marker_properties = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [ value.longitude, value.latitude]
      },
      properties: {
       'marker-color': marker_color,
       'marker-size': 'medium',
       'overall_status_level': device_overall_status_level,
       'name': value.site_name + value.sub_area_name + value.equipment_name,
       'organisation_name': value.organisation_name,
       'organisation_sub_domain': value.organisation_sub_domain,
       'serial': value.serial

     }
    }
    geojson.push(marker_properties);
    single_layer = L.mapbox.featureLayer().setGeoJSON(marker_properties).addTo(map)
    myLayer.push(single_layer);
    content = getLocationDetailMarkup(value);
    single_layer.bindPopup(content, {
               closeButton: true,
               keepInView: true,
               maxWidth: 1000,
               maxHeight: 500
    });
    var timeoutId = null;
    single_layer.on('mouseover', function(e) {
      timeoutId = window.setTimeout(function() {
        // Open Popup on marker hover
         e.layer.openPopup();
       }, 500);
    });
    single_layer.on('mouseout', function(e) {
     window.clearTimeout(timeoutId)
    });
    single_layer.on('click', function(e) {
           change_window_location(value);
    });
  });
}

function change_window_location(deviceData){
  window.location.href = "/devices/" + deviceData.serial
}


// This function will set popup and elements on popup
function getLocationDetailMarkup(deviceData){
  deviceData.status = getDeviceConditionByOverallStatusLevel(deviceData.overall_status_level);
  str = '';
  str += '<div class="row" ><div class="col-sm-12">Device:<strong style="overflow: hidden; color: #1ebfae">'+ deviceData.name +'</strong>'+'</div>'+'</div><br>'
  if (deviceData.calibrating) {
    //  str += "<img src=" + calibrating_img + " width='250px' height='50px'>"
    if(typeof deviceData.calibration_percentage_value != "undefined" && deviceData.calibration_percentage_value != null) {
      percentage = 'Device ' + deviceData.calibration_percentage  + '% calibrated...'
    } else {
      percentage = 'Device calibrating...'
    }
    str += "<div style='text-align:center;margin:0;border:0;padding:0;'>" + percentage + "</div><br>\
                Condition\
                <div class='email-slider-track' style='background: #999;'></div>\
                Degradation\
                <div class='email-slider-track' style='background: #999;'></div>"
  }
  else {
    str += "<div class='row'style='text-align: center'><div class='col-sm-12'>"
    str += getBattery(deviceData.condition_level)
    str += "</div></div><br>"
    str += "<div class='row' style='text-align: center'><div class='col-sm-12'>"
    str += getBattery(deviceData.degradation_level)
    str += "</div></div><br>"
    str += "<div class='row' style='text-align: center'><div class='col-sm-4'>"
    str += getVibrationImage(deviceData.rms_status, deviceData.timestamp, deviceData.running)
    str += "</div>"
    str += "<div class='col-sm-4'>"
    str += getTemperatureImage(deviceData.tmp_status, deviceData.timestamp, deviceData.running)
    str += "</div>"
    str += "<div class='col-sm-4'>"
    str += fanImage(deviceData.running, deviceData.timestamp)
    str += "</div>"
    str += "</div>"
  }
  return str;
  }

  // This function checks last data receive time and device running value and return result
  function is_grey_rule_pass(timestamp, running_value){
    var dt = new Date();
    difference = Date.parse(dt) - timestamp;
    return ((difference/60000) >= 1440);
  }

  function getVibrationImage(rms_status, timestamp, running_value){
    var icon;
    rms_status = is_grey_rule_pass(timestamp, running_value) ? "grey" : rms_status
    if (rms_status == "green"){
      icon = vibration_icon_green;
    } else if (rms_status == "yellow"){
      icon = vibration_icon_yellow;
    } else if (rms_status == "red"){
      icon = vibration_icon_red;
    }
      else if (rms_status == "grey"){
        icon = vibration_icon_grey;
    } else {
      icon = vibration_icon;
    }
    return  '<img src= '+ icon +' height="30" width="30">';
  }

  function getTemperatureImage(tmp_status, timestamp, running_value){
    var icon;
    tmp_status = is_grey_rule_pass(timestamp, running_value) ? "grey" : tmp_status
    if(tmp_status == "green"){
      icon = temperature_icon_green;
    } else if (tmp_status == "yellow"){
      icon = temperature_icon_yellow;
    } else if (tmp_status == "red"){
      icon = temperature_icon_red;
    } else if (tmp_status == "grey"){
      icon = temperature_icon_gey;
    }
    else {
      icon = temperature_icon;
    }
    return  '<img src= '+ icon +' height="30" width="30">';
  }


  function fanImage(running, timestamp){
    var icon;
    running = is_grey_rule_pass(timestamp, running) ? false : running
    if(running){
      icon = running_fan_url;
    } else {
      icon = not_running_fan_url;
    }
    return  '<img src= '+ icon +' height="30" width="30">';
  }

function getDeviceConditionByOverallStatusLevel(level){
  if((level >= 1) && (level <= 5)){
    var status = {color: "green", condition: "Healthy"};
  }
  else if((level >= 6) && (level <= 10)){
    var status = {color: "yellow", condition: "Changing"}
  }
  else{
    var status = {color: "red", condition: "Serious"}
  }
  return status;
}

function device_status_chart(level){
  var str = "";
  var class_name;
  str += "<div class='battery-component'>"
  for(i=1; i <= 15; i++){
    if(i <= level){
      class_name = get_color_by_level(i);
      str +=  "<div class='battery-level " + class_name + "'></div>" ;
    }
    else{
      str +=  "<div class='battery-level'></div>" ;
    }
  }
  str += "";
  str += "<span class='battery-lookup healthy'>Healthy</span>"
  str += "<span class='battery-lookup changing'>Changing</span>"
  str += "<span class='battery-lookup serious'>Serious</span>"
  return str + "</div>";
}

// Fit the map to the bounds.
var fitToBounds = function (markersObj) {
  var bounds = getBounds(markersObj);
  map.fitBounds(bounds);
}

// Returns a Leaflet `LatLngBounds` object.
// see: http://leafletjs.com/reference.html#latlngbounds
var getBounds = function (markersObj) {
  $.each( markersObj, function( key, value ) {
    all_lngs.push(parseFloat(value.geometry.coordinates[0]));
  });
  $.each( markersObj, function( key, value ) {
    all_lats.push(parseFloat(value.geometry.coordinates[1]));
  });

  var maxLat = Math.max.apply(Math,all_lats);
  var minLat = Math.min.apply(Math,all_lats);
  var maxLng = Math.max.apply(Math,all_lngs);
  var minLng = Math.min.apply(Math,all_lngs);

  var southWest = new L.LatLng(minLat, minLng);
  var northEast = new L.LatLng(maxLat, maxLng);
  return new L.LatLngBounds(southWest, northEast);
}

function clearAllMarkers(){
  all_markers.forEach(function(g) {
        g.clearLayers();
    });
}

// This function calls whenever user changes GYR filter and add value in text filter
function changeMarkersVisibility(){
  var nameFilterValue = $("#device-text-filter-field").val();
  var conditionFilterValue = $("#filter-on-location-page").slider( "value" );
  $.each(myLayer, function(index, marker){
      map.removeLayer(marker);
  });

  $.each(myLayer, function(index, marker){
    if(nameFilterValue != ""){
      var searchTextDowncase = nameFilterValue.toLowerCase();
      var markerTitle = marker._geojson.properties.name.toLowerCase();
      var device_organisation_name = marker._geojson.properties.organisation_name.toLowerCase();
      var device_organisation_sub_domain = marker._geojson.properties.organisation_sub_domain.toLowerCase();
      var device_serial = marker._geojson.properties.serial
      if((device_organisation_name.indexOf(searchTextDowncase) >= 0 || device_organisation_sub_domain.indexOf(searchTextDowncase) >= 0 || markerTitle.indexOf(searchTextDowncase) >= 0 || device_serial.indexOf(searchTextDowncase) >= 0) && marker._geojson.properties.overall_status_level >= conditionFilterValue)
          {
              map.addLayer(marker);
          }
      }
      else{
          if(marker._geojson.properties.overall_status_level >= conditionFilterValue) map.addLayer(marker);
      }
    });
}

function resetDevicesGYRFilter(){
  $("#reset-device-filter-on-map").click(function(){
    $(".device-condition-filter").slider( "value", "0" );
  changeMarkersVisibility();
  })
}

function resetTextFilter(){
  $("#reset-text-filter-on-map").click(function(){
    $("#device-text-filter-field").val("");
    changeMarkersVisibility();
  });
}

function onClickDeviceTextFilter(){
  jQuery('#device-text-filter-field').on('input', function() {
      changeMarkersVisibility();
  });
}

// This will remove all markes on map
function removeAllMarkers(){
  if (myLayer.length){
    $.each(myLayer, function(index, marker){
        map.removeLayer(marker);
    });
    myLayer = [];
  }
}
