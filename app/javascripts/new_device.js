var siteNames = $('#new_site_name').data("device-sitenames");
$(document).ready(function () {
	devicesData = $("#map-wizard").data("devices-info");
	// Initialize datetimepicker
		$('#installation_date').datetimepicker({
		  format: "DD/MM/YYYY"
		});
});

// It takes lat n lng values and calculate near by site names. It is dependent on lat lng values
var distanceObj = [];
function setSiteName() {
  var mylat = $("#latitude").val();
  var mylng = $("#longitude").val();
  var siteNames = []
  var i = 0;
  $.each(devicesData, function (a, b) {
    distanceObj[i] = { distance: calculateNearDevices(mylat, mylng, b.latitude, b.longitude), device_serial: b.device_serial, site_name: b.site_name };
    ++i;
  });

  distanceObj.sort(function(a,b) {
    return parseInt(a.distance) - parseInt(b.distance)
  });

  if (distanceObj.length) $("#site_name").val(distanceObj[0].site_name);

  $.each(distanceObj, function (i, item) {
    if(jQuery.inArray(item.site_name, siteNames) == -1) {
      siteNames.push(item.site_name)
    }
  });
  $('#site_name_1').empty();
  $.each(siteNames, function (i, item) {
    $('#site_name_1').append($('<option>', {
        value: item,
        text : item
    }));
  });

}

// It checks when the site name select list is changed and changes site name to the same
$('#site_name_1').on('change', function (e) {
  var valueSelected = this.value;
  $('#site_name').val(valueSelected);
});

// It checks when the site name select list is changed and changes site name to the same
$('#new_site_name').on('change', function (e) {
  var valueSelected = this.value;
  $('#site_name').val(valueSelected);
});

// It shows site name select list
function getSelectList() {
  $('#site_name_0_col').hide();
  $('#site_name_1_col').show();
}

// It enables new site name input field
function enableNewSiteName() {
  var r = confirm("Are you Sure you want to add new site name?");
  if (r == true ) {
    $('#site_name_1')[0].selectedIndex = 0;
    $('#site_name_2_col').show();
    $('#site_name_1_col').hide();
    $("#new_site_name").prop('disabled', false);
  }
}

// Method makes disables new site name input element and enables site_name elsement
function revertSiteName() {
  $("#new_site_name").prop('disabled', false);
  $("#site_name").val(distanceObj[0].site_name);
  $('#site_name_0_col').show();
  $('#site_name_2_col').hide();
}

// Method takes input location and existing location to find out the distance between those two locations
function calculateNearDevices(myLongitude, myLatitude, long1, lat1) {
  erdRadius = 6371;

  myLongitude = myLongitude * (Math.PI / 180);
  myLatitude = myLatitude * (Math.PI / 180);
  long1 = long1 * (Math.PI / 180);
  lat1 = lat1 * (Math.PI / 180);

  x0 = myLongitude * erdRadius * Math.cos(myLatitude);
  y0 = myLatitude * erdRadius;

  x1 = long1 * erdRadius * Math.cos(lat1);
  y1 = lat1 * erdRadius;

  dx = x0 - x1;
  dy = y0 - y1;

  d = Math.sqrt((dx * dx) + (dy * dy));


  return Math.round(d * 1000);
}

// Validates form elements on form submit
function validateForm() {
  $("#site_name").prop('disabled', false);
  $("#serial").val($('#barcode').val());
}

$('#step-1-next').click(function() {
  $("#serial").val($('#barcode').val());
});

$('#device_organisation_id').change(function() {
    $('#client_name').val($(this).find('option:selected').text())
});
