var radio_layer_tags;
var lat, lng;
var map;
// Fit map bounds based on sensor lat , long
var bounds = [];
var marker = [];
var markersArray = [];
var id;

$(document).ready(function() {
    id = $("#map-wizard").data("id");
    getLatLong();
});

// Uses geolocation to get users current location on map. If failed to fetch location it zooms to organisation site area
function getLatLong() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    //Get the latitude and the longitude;
    function successFunction(position) {
      if (id){
        lat = document.getElementById('latitude').value;
        lng = document.getElementById('longitude').value;
      }else{
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }
      fillLatLngValues(lat, lng);//Fills latitude and longitude
      mapIntialize(lat, lng);
      setMarkerOnMap(lat, lng);
      if(!id){ setSiteName(); }
      callChangeMapViewPreference();
    }
    function errorFunction(err) {
      lat = document.getElementById('latitude').value;
      lng = document.getElementById('longitude').value;
      if (id){
        fillLatLngValues(lat, lng);//Fills latitude and longitude
        mapIntialize(lat, lng);
        setMarkerOnMap(lat, lng);
        callChangeMapViewPreference();
      }else{
        map = L.mapbox.map('map-wizard', 'mapbox.streets').addControl(L.mapbox.geocoderControl('mapbox.places', {
          autocomplete: true
        }));;
        //Add Street and satellite options to mapbox
        L.control.layers({
          "Street": L.mapbox.tileLayer("mapbox.streets"),
          "Satellite": L.mapbox.tileLayer("mapbox.satellite")
        }, null).addTo(map);
        zoomMapAsPerDevicesLocation();
        showError();
        setSiteName();
        clickOnMap();
        callChangeMapViewPreference();
      }

    }

  }else{

    lat = "-27.916766641249065";
    lng = "-212.3876953125";
    fillLatLngValues(lat, lng);//Fills latitude and longitude
    mapIntialize(lat, lng);
    setMarkerOnMap(lat, lng);
    if(id == ""){  setSiteName(); }
    callChangeMapViewPreference();
  }
}

function fillLatLngValues(lat, lng){
  document.getElementById('latitude').value = lat;
  document.getElementById('longitude').value = lng;
}

// Intailizes map on onboarding new page when it calls with latitude and longitude as parameters
function mapIntialize(lat, lng){
  map = L.mapbox.map('map-wizard').addControl(L.mapbox.geocoderControl('mapbox.places', {
      autocomplete: true
  }));;
  //Add Street and satellite options to mapbox
  L.control.layers({
      "Street": L.mapbox.tileLayer("mapbox.streets"),
      "Satellite": L.mapbox.tileLayer("mapbox.satellite")
  }, null).addTo(map);
  map.setView([lat, lng], 14);
  setMapType(Cookies.get('map_view_preference'));
  clickOnMap();

}

function clickOnMap(){
  map.on('click', function (e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    fillLatLngValues(lat, lng);
    if (marker.length){
      $.each(marker, function(index, value){
        map.removeLayer(value);
      });
      marker = [];
    }
    setMarkerOnMap(lat, lng);
    if(id == ""){setSiteName()};
  });

}

function setMarkerOnMap(lat, lng){
  marker.push(L.marker([lat, lng], {
    icon: L.mapbox.marker.icon({
      'marker-color': '#9c89cc'
    })
  }).addTo(map))
}

// The method zooms the map to the given locations
function zoomMapAsPerDevicesLocation() {
  // Add markers for each location
  $.each(devicesData, function(index, value){
  // storing latitude and longitude of all devices
    bounds.push([value.latitude, value.longitude]);
  });
  //This check bounds and add default lat and long to bounds
  bounds = bounds.length ? bounds : [["-27.932913", "153.368269"]]
  // add latitude and longitude bounds to map
  map.fitBounds(bounds);
}

// Displays error in location
function showError() {
  document.getElementById('location_help').innerHTML = "Sorry we could not get your current location Please Select your position in map.";
}

// wizad.This stepwizard form is comman for both edit and new devices
$(document).ready(function () {

    var navListItems = $('div.setup-panel div a'),
            allWells = $('.setup-content'),
            allNextBtn = $('.nextBtn'),
            allPrevBtn = $('.prevBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
                $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            // $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(function(){
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url'],select,input[type='number']"),
            isValid = true;

        $(".form-group").removeClass("has-error");
        for(var i=0; i<curInputs.length; i++){
            if (!curInputs[i].validity.valid){
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }

        if (isValid)
            nextStepWizard.removeAttr('disabled').trigger('click');
    });

    allPrevBtn.click(function(){
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            prevStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");

        $(".form-group").removeClass("has-error");
        prevStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a.btn-primary').trigger('click');
});
