var map;
$(document).ready(function(){
  devicesData = $("#map-pdf").data("device-details");
});
var deviceData;
var geojson = [];
var myLayer = [];
var all_lngs = [];
var all_lats = [];
var allMarkers = [];

$(document).ready(function(){

  if (Cookies.get('map_view_preference') != "mapbox.streets" && Cookies.get('map_view_preference') != "mapbox.satellite"){
    Cookies.set('map_view_preference', 'mapbox.streets');
  }

var lat, long, zoom;
   if ($("#map-pdf").length){
    deviceData = devicesData[0];
    map = L.mapbox.map('map-pdf').addControl(L.mapbox.geocoderControl('mapbox.places', {
        autocomplete: true
    }));

    //Add Street and satellite options to mapbox
    L.control.layers({
        "Street": map.tileLayer,
        "Satellite": L.mapbox.tileLayer("mapbox.satellite")
    }, null).addTo(map);
    if (devicesData.length){
      lat = deviceData.latitude;
      long = deviceData.longitude;
      zoom = 10;
    }// if (deviceData.length) close
    else{
      lat = "-30.3352621";
      long = "133.7801179";
      zoom = 4;
    }
    map.setView([lat, long], zoom);
    // map.on('load', function() {
    //   map.setView([lat, long], zoom);
    // });
    onMapLoad();

    setTimeout( function(){
    setMarkerNow();
    changeMarkersVisibility();
  }  , 2000 );

  }// if close
  $("#reset-text-filter-on-map").click(function(){
    $("#device-text-filter-field").val("");
    changeMarkersVisibility();
  });
jQuery('#device-text-filter-field').on('input', function() {
    // do your stuff
    changeMarkersVisibility();
});
$("#reset-device-filter-on-map").click(function(){
  $(".device-condition-filter").slider( "value", "0" );
  //setAllMarkerAsVisible();
changeMarkersVisibility();
})

});

function onMapLoad() {
  callChangeMapViewPreference();
  setMarkerNow();
  // Call fitbound function and fit map bounds base don geojson marker data
  if (geojson.length) fitToBounds(geojson);
}

function setMarkerNow(){
  var device_overall_status_level;

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
       'name': value.site_name + value.sub_area_name + value.equipment_name
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


function getLocationDetailMarkup(deviceData){
  console.log(deviceData);
  deviceData.status = getDeviceConditionByOverallStatusLevel(deviceData.overall_status_level);
  //deviceData.device_status_chart = device_status_chart(deviceData.vibration_condition_level);
  //deviceData.show_fan = (deviceData.running == null) ? true  : ((deviceData.running == false) ? true : deviceData.running)
  //return  HandlebarsTemplates['map/popover'](deviceData);
  str = '';
  str += '<div class="row" ><div class="col-sm-12">Device:<strong style="overflow: hidden; color: #1ebfae">'+ deviceData.name +'</strong>'+'</div>'+'</div><br>'
  if (deviceData.calibrating) {
    //  str += "<img src=" + calibrating_img + " width='250px' height='50px'>"
    if(typeof deviceData.calibration_percentage != "undefined") {
      console.log(deviceData.calibration_percentage);
      percentage = 'Device ' + deviceData.calibration_percentage  + '% calibrated...'
    } else {
      console.log(deviceData.calibration_percentage);
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
    running = is_grey_rule_pass(timestamp, running) ? false : running
    var icon;
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

function changeMarkersVisibility(){
  var nameFilterValue = $("#device-text-filter-field").val();
  var conditionFilterValue = $("#filter-on-location-page").slider( "value" );
  $.each(myLayer, function(index, marker){
      map.removeLayer(marker);
  });

  $.each(myLayer, function(index, marker){
    if(nameFilterValue != ""){
      var markerTitle = marker._geojson.properties.name.toLowerCase();
      var searchTextDowncase = nameFilterValue.toLowerCase();
      if(markerTitle.indexOf(searchTextDowncase) >= 0 && marker._geojson.properties.overall_status_level >= conditionFilterValue)
          {
              map.addLayer(marker);
          }
      }
      else{
          if(marker._geojson.properties.overall_status_level >= conditionFilterValue)
             map.addLayer(marker);
      }
    });
}
