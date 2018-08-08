L.mapbox.accessToken = 'pk.eyJ1IjoibWFkaHVzdWRoYW41MTgiLCJhIjoiY2lydzByc2V4MDBpMWhwbTFhN2VqOXljciJ9.FfiA5jceADf_rK3bVd-H7A';

// Ajax call to save mapbox view to api
function changeMapViewPreference(type){
  changeUserPreference("map_view_preference", type);
  L.mapbox.tileLayer(type).addTo(map);
  Cookies.set('map_view_preference', type);
}

function changeUserPreference(preference_name, level){
$.ajax({
  type:"PUT",
  url: "/users/update_user_view_preference ",
  data: {preference_name: preference_name,level: level, value: true}
}).done(function() {
});

}

function callChangeMapViewPreference(){

  radio_layer_tags = $('.leaflet-control-layers-base input:radio');
  setMapType(Cookies.get('map_view_preference'));

  $('.leaflet-control-layers-selector').click(function(){
    $( radio_layer_tags ).each(function( index, element ) {
    i = 0;
    if (element.checked){
     i = index
     if (i == 0){
      type = 'mapbox.streets';
     }else if (i == 1){
      type = 'mapbox.satellite';
     }
     changeMapViewPreference(type);
    }
    });
  });

}

function setMapType(mapType){
  L.mapbox.tileLayer(mapType).addTo(map);
  $( radio_layer_tags ).each(function( index, element ) {
    if ( index == 0 & mapType == 'mapbox.streets'){
      element.checked = true;
    }else if( index == 1 & mapType == 'mapbox.satellite'){
      element.checked =  true;
    }
  });
}
