var data_table_list;
var list_table;
// Commonly used functions
function chart_colors() {
  return [{ // Healthy
      from: 0.00,
      to: 0.066,
      color: '#e0f4e0'
  }, { // Healthy
      from: 0.066,
      to: 0.132,
      color: '#e0f4e0'
  }, { // Healthy
      from: 0.132,
      to: 0.198,
      color: '#e0f4e0'
  }, { // Healthy
      from: 0.198,
      to: 0.264,
      color: '#e0f4e0'
  }, { // Healthy
      from: 0.264,
      to: 0.33,
      color: '#e0f4e0'
  }, { // Moderate
      from: 0.33,
      to: 0.396,
      color: '#f0efd4'
  }, { // Moderate
      from: 0.396,
      to: 0.462,
      color: '#f0efd4'
  },{ // Moderate
      from: 0.462,
      to: 0.528,
      color: '#f0efd4'
  },{ // Moderate
      from: 0.528,
      to: 0.594,
      color: '#f0efd4'
  },{ // Moderate
      from: 0.594,
      to: 0.66,
      color: '#f0efd4'
  },{ // Serious
      from: 0.66,
      to: 0.726,
      color: '#f4d7d5'
  },{ // Serious
      from: 0.726,
      to: 0.792,
      color: '#f4d7d5'
  },{ // Serious
      from: 0.792,
      to: 0.858,
      color: '#f4d7d5'
  },{ // Serious
      from: 0.858,
      to: 0.924,
      color: '#f4d7d5'
  },{ // Serious
      from: 0.924,
      to: 1.0,
      color: '#f4d7d5'
  }]
}

function getStatusByValue(value){
  if(value >= 0.0 && value <= 0.33)
    return "Healthy";
  else if(value >= 0.33 && value <= 0.66)
    return "Changing";
  else
    return "Serious";
}

function getBattery(level) {
  if (level == null){
    return "<div class='email-slider-track'>\
      <div class='email-slider-thumb' style='margin-left: 0px;'>\
      </div>\
    </div>"
  }else {
    return "<div class='email-slider-track'>\
      <div class='email-slider-thumb' style='margin-left: " + ((level-1)*(248.0/14)) + "px;'>\
      </div>\
    </div>"
  }
}

function filterDeviceByCondition(min, max, filterValue) {
  if ( ( isNaN( min ) && isNaN( max ) ) ||
  ( isNaN( min ) && filterValue <= max ) ||
  ( min <= filterValue   && isNaN( max ) ) ||
  ( min <= filterValue   && filterValue <= max ) )
  {
    return true;
  }
  return false;
}

function iso_table_element(isoClass, vibrationRms) {
  str = ""
  if (vibrationRms >= 0.00 && vibrationRms < 0.45) {
    if (isoClass == "Class I") {
      str += "class_1_step_1"
    } else if (isoClass == "Class II") {
      str += "class_2_step_1"
    } else if (isoClass == "Class III") {
      str += "class_3_step_1"
    } else {
      str += "class_4_step_1"
    }
  } else if (vibrationRms >= 0.45 && vibrationRms < 0.71) {
    if (isoClass == "Class I") {
      str += "class_1_step_2"
    } else if (isoClass == "Class II") {
      str += "class_2_step_2"
    } else if (isoClass == "Class III") {
      str += "class_3_step_2"
    } else {
      str += "class_4_step_2"
    }
  } else if (vibrationRms >= 0.71 && vibrationRms < 1.12) {
    if (isoClass == "Class I") {
      str += "class_1_step_3"
    } else if (isoClass == "Class II") {
      str += "class_2_step_3"
    } else if (isoClass == "Class III") {
      str += "class_3_step_3"
    } else {
      str += "class_4_step_3"
    }
  } else if (vibrationRms >= 1.12 && vibrationRms < 1.80) {
    if (isoClass == "Class I") {
      str += "class_1_step_4"
    } else if (isoClass == "Class II") {
      str += "class_2_step_4"
    } else if (isoClass == "Class III") {
      str += "class_3_step_4"
    } else {
      str += "class_4_step_4"
    }
  } else if (vibrationRms >= 1.80 && vibrationRms < 2.80) {
    if (isoClass == "Class I") {
      str += "class_1_step_5"
    } else if (isoClass == "Class II") {
      str += "class_2_step_5"
    } else if (isoClass == "Class III") {
      str += "class_3_step_5"
    } else {
      str += "class_4_step_5"
    }
  } else if (vibrationRms >= 2.80 && vibrationRms < 4.50) {
    if (isoClass == "Class I") {
      str += "class_1_step_6"
    } else if (isoClass == "Class II") {
      str += "class_2_step_6"
    } else if (isoClass == "Class III") {
      str += "class_3_step_6"
    } else {
      str += "class_4_step_6"
    }
  } else if (vibrationRms >= 4.50 && vibrationRms < 7.10) {
    if (isoClass == "Class I") {
      str += "class_1_step_7"
    } else if (isoClass == "Class II") {
      str += "class_2_step_7"
    } else if (isoClass == "Class III") {
      str += "class_3_step_7"
    } else {
      str += "class_4_step_7"
    }
  } else if (vibrationRms >= 7.10 && vibrationRms < 11.20) {
    if (isoClass == "Class I") {
      str += "class_1_step_8"
    } else if (isoClass == "Class II") {
      str += "class_2_step_8"
    } else if (isoClass == "Class III") {
      str += "class_3_step_8"
    } else {
      str += "class_4_step_8"
    }
  } else if (vibrationRms >= 11.20 && vibrationRms < 18.00) {
    if (isoClass == "Class I") {
      str += "class_1_step_9"
    } else if (isoClass == "Class II") {
      str += "class_2_step_9"
    } else if (isoClass == "Class III") {
      str += "class_3_step_9"
    } else {
      str += "class_4_step_9"
    }
  } else if (vibrationRms >= 18.00 && vibrationRms < 28.00) {
    if (isoClass == "Class I") {
      str += "class_1_step_10"
    } else if (isoClass == "Class II") {
      str += "class_2_step_10"
    } else if (isoClass == "Class III") {
      str += "class_3_step_10"
    } else {
      str += "class_4_step_10"
    }
  } else if (vibrationRms >= 28.00 && vibrationRms < 45.00) {
    if (isoClass == "Class I") {
      str += "class_1_step_11"
    } else if (isoClass == "Class II") {
      str += "class_2_step_11"
    } else if (isoClass == "Class III") {
      str += "class_3_step_11"
    } else {
      str += "class_4_step_11"
    }
  } else {
    if (isoClass == "Class I") {
      str += "class_1_step_12"
    } else if (isoClass == "Class II") {
      str += "class_2_step_12"
    } else if (isoClass == "Class III") {
      str += "class_3_step_12"
    } else {
      str += "class_4_step_12"
    }
  }
  return str
}

// End commonly used functions

// This will generate the redirect link with parameters if datatable is searched or sorted.
function getRedirectLink(deviceSerial) {
  if($('.dataTables_filter input').val() || ($('#devices-list').dataTable().fnSettings().aaSorting.length != 0)) {
    // need to change this column number when we chnage columns in dataTable
    // var searchDataSerials = $('#devices-list').DataTable().column(12, { search : 'applied'} ).data();
    var searchDataSerials = $('#devices-list').DataTable().column(26, { search : 'applied'} ).data();
    Cookies.set('filtered_device_ids', searchDataSerials.join(','));
    window.location="/devices/"+deviceSerial
  } else {
    window.location="/devices/"+deviceSerial
  }
}

function changeHiddenDeviceMarkerGyrFilterColor(l){
  var color_1 = '#90EE90',
      color_2 = '#90EE90',
      color_3 = '#90EE90',
      color_4 = '#90EE90',
      color_5 = '#90EE90',
      color_6 = '#ffd700',
      color_7 = '#ffd700',
      color_8 = '#ffd700',
      color_9 = '#ffd700',
      color_10 = '#ffd700',
      color_11 = '#cd1414',
      color_12 = '#cd1414',
      color_13 = '#cd1414',
      color_14 = '#cd1414',
      color_15 = '#cd1414';
  for(var i = 1; i <= l; i++){
    eval("color_" + i + "  = '#DDD'");
  }
  $('.device-condition-filter').css('background', 'linear-gradient( to right,'+ color_1 +' 0%, '+ color_2 +' 10%, '+ color_3 +' 14%, '+ color_4 +' 21%, '+ color_5 +' 30%,'+ color_6 +' 36%, '+ color_7 +' 42%, '+ color_8 +' 50%, '+ color_9 +' 54%, '+ color_10 +' 64%,'+ color_11 +' 69%, '+ color_12 +' 76%, '+ color_13 +' 83%, '+ color_14 +' 91%, '+ color_15 +' 100%)');
}

$(document).ready(function () {

  // datatable condition filter handler  -> it handles condition filter
  $.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
      var min = $(".device-condition-filter").slider("value");
      var max = 15;
      var filterValue = $(jQuery.parseHTML(data[0])).data("search");
      if($(".device-condition-filter").slider("value")){
        return filterDeviceByCondition(min, max, filterValue);
      }
      else{
        return true;
      }
    }
  );

  list_table = $('#devices-list').DataTable({
    "responsive": true,
    "columnDefs": [
      {
        "targets": [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
        "visible": false,
        "searchable": true
      },
    ],
    "paging": false,
    "aaSorting": [],
    "language": {
      sSearch: "",
      searchPlaceholder: "Filter"
    }
  });


$("#devices-list_filter").append("&nbsp;<button id='deviceListDataTableFilterClearButton' type='button' class='btn btn-sm btn-default'>X</button>");
  $('#deviceListDataTableFilterClearButton').click(function() {
    list_table.search('')
    .columns().search('')
    .draw();
      });


  // condition filter  view
  $("#devices-list_filter").append("<div id='devices-list_filter-slider' class='form-horizontal'>\
      <div class='device-condition-filter' id='filter-on-list-page' \style='width: 210px; float: left;'>\
        <div class='battery-level-small-1 filt-1'></div>\
        <div class='battery-level-small-1 filt-2'></div>\
        <div class='battery-level-small-1 filt-3'></div>\
        <div class='battery-level-small-1 filt-4'></div>\
        <div class='battery-level-small-1 filt-5'></div>\
        <div class='battery-level-small-1 filt-6'></div>\
        <div class='battery-level-small-1 filt-7'></div>\
        <div class='battery-level-small-1 filt-8'></div>\
        <div class='battery-level-small-1 filt-9'></div>\
        <div class='battery-level-small-1 filt-10'></div>\
        <div class='battery-level-small-1 filt-11'></div>\
        <div class='battery-level-small-1 filt-12'></div>\
        <div class='battery-level-small-1 filt-13'></div>\
        <div class='battery-level-small-1 filt-14'></div>\
        <div class='battery-level-small-1 filt-15'></div>\
      </div>\
      <button class='btn-sm btn' id='reset-device-filter-on-list'>X</button>\
      <button id='toggleNotes' type='button' class='btn btn-sm btn-default'>Toggle Notes</button>\
    </div>");

    $('#toggleNotes').on( 'click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = list_table.column(11);

        // Toggle the visibility
        column.visible( ! column.visible() );
    } );

    $("#reset-device-filter-on-list").click(function(){
      $(".device-condition-filter").slider( "value", "0" );
      list_table
       .columns().search( '' )
       .draw();
    });
    var rainbow = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

    $(".device-condition-filter")
    .slider({
      max: rainbow.length - 1,
      min: 0,
      value: 0,
      change: function( event, ui ) {
        var level = parseInt($(this).slider( "option", "value" ), 10) + parseInt(1, 10);
        changeHiddenDeviceMarkerGyrFilterColor(level);
        if($(this).attr("id") == "filter-on-list-page"){
          // using range filter instead of search to get devices with status >= instead of ==
          //filterDevicesOnListPage(level)
          console.log(level);
          console.log("first");
          level = (level >= 1 && level <= 5) ? 5 : (level >= 5 && level <= 10) ? 10 : (level >= 10 && level <= 15) ? 15 : -1
          console.log(level);
          list_table.columns(0).search(level).draw();
          // list_table.draw();
          // Ajax call to change user settings(view preference)
          changeUserPreference("gyr_filter_list_view", $(".device-condition-filter").slider("value"));
        }
        else{
          //Using function to filter markers
          changeMarkersVisibility();
          // Ajax call to change user settings(view preference)
          changeUserPreference("gyr_filter_map_view", $(".device-condition-filter").slider("value"));
        }
      }
    })
    .slider("pips", {
      rest: "label",
      labels: rainbow
     });

    // Set Highcharts options
    Highcharts.setOptions({
        global : {
            useUTC : false
        }
    });

});
