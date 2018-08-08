var device_serial = $("#get_device_image").data("device-serial");
var a;
var b;
// this function shows image in modal box on mouse hover
function showImageInModalBox() {
   $('#imagepreview').attr('src', $('#imageresource').attr('src')); // here asign the image to the modal when the user click the enlarge link
   $('#imagemodal').modal('show'); // imagemodal is the id attribute assigned to the bootstrap modal, then i use the show function
};

// get device image
$(function() {
  if ($("#get_device_image").length){


  // ajax call to get device images
    $.ajax({
    type: 'get',
    url: "/devices/device_image",
    data: {device_serial: device_serial},
    context: document.body
    }).done(function(result) {
      count = 0;
      str = '';
      // iteration to add image tags to view
      $.each( result, function( key, value ) {
        k = key.split("-").pop();
        id_value = (count== 0) ? "first-image" : "";
        display = (count == 0) ? "" : "display:none";
        str += '<a href='+ value +' title='+ k +' data-gallery>'
        str += '<img id="device_details_image" class="img-thumbnail" src='+ value +' alt='+ k +' style= "max-width: 300px;'+ display +'"  id='+ id_value +'>'
        str += '</a>'
        count += 1;
      });
      $("#links").append(str);

      // open image device slide show
      var timeoutId = null;
      $("#links a").click(function() {
        timeoutId = window.setTimeout(function() {
          $("#links, #first-image").click()
        }, 5000);
      });

      $("#links a").mouseout(function() {
        window.clearTimeout(timeoutId)
      });

    });
  }
});

$(document).ready(function() {

  // Set the datepicker's date format
  $.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    onSelect: function () {
        this.onchange();
        this.onblur();
    }
  });
  onboardEpoch = new Date(parseInt($('#onboard_epoch').data('onboard-epoch')));
  startTimestamp = null
  endTimestamp = null
  // Display position of device in iso table
  var isoClass = $('#iso-table').data('iso-class');
  running_cutoff = $('#device-real-temp-vib-rms-chart').data('running-cutoff');
  var vibrationRms = $('#iso-table').data('vibration-rms');
  var maxRms = null
  if(vibrationRms != '') {
    var tRow = iso_table_element(isoClass, vibrationRms)
    $('#' + tRow).append("<div id='rms_point_in_iso_table' style='border: 1px solid #000; border-radius:100%; margin: 0 auto; width:25px; background-color: #fff;text-align:center'>X</div>")
  }
  vals = []
  // Load 1 Month device samples for highcharts initially and once it's success get all samples
  $.ajax({
   type: "get",
   contentType: "application/json; charset=utf-8",
   url: "/devices/"+ ""+device_serial+" " +"/samples",
   dataType: "json",
   data: {id: device_serial},
   success: function (result) {
     if(typeof result["vibration_conditions"][0] !== 'undefined') {
       startTimestamp = result["vibration_conditions"][0][0]
       endTimestamp = result["vibration_conditions"][result["vibration_conditions"].length - 1][0]
     }
     rmsValues = []
     for(var i=0; i<result["rms_history"].length; i++) {
       rmsValues.push(result["rms_history"][i][1]);
     }
     maxRms = (Math.max.apply(null, rmsValues) < running_cutoff) ? running_cutoff : Math.max.apply(null, rmsValues);

     TempAndVibCombinedHighChart('device-vibration-temperature-combine-history-chart', result);
     initializeDeviceRealTmpANdRmsChart('device-real-temp-vib-rms-chart',result, running_cutoff, maxRms);
     initializeDeviceEquipmentUsageAndPowerUsage('device-equipment-power-usage-chart', result);

     for(i = 0 ; i < result["equipment_usage"].length - 1; i++) {
       vals.push(result["equipment_usage"][i][0])
     }

    //  Load weather data if exists
    //  if(typeof weatherSeriesData !== 'undefined' && typeof chart2 !== 'undefined') {
    //    chart2.addSeries(weatherSeriesData, false);
    //  }
   },
   error: function () {
     console.log("Something wrong with charts!");
   }
  });


 function weatherChartData() {
   // the below ajax function call API to return location temperature based on latitude and longitude
   latitude = $("#device_latitude").attr("value")
   longitude = $("#device_longitude").attr("value")

   $.ajax({
    type: "get",
    contentType: "application/json; charset=utf-8",
    url: "/api/location_temperature",
    dataType: "json",
    data: {latitude: latitude, longitude: longitude},
    success: function (result) {
      weatherSeriesData={name: "Temperatue_weather", data: result, type: 'spline', tooltip: {valueSuffix: '°C'}, showInLegend: false};
      chart2.addSeries(weatherSeriesData, false);
    },
      error: function () {
        console.log("Something wrong with Weather chart!");
    }

    });
  }


  // ajax call to get device details
  function updateDeviceDetails() {
    $.ajax({
      type: 'get',
      url: "/devices/"+device_serial+"/device_details",
      data: {id: device_serial},
      dataType: "json",
      success: function (result) {
        if(result["fan"] == true) {
          running_image = "<img src='" + running_fan_url + "' alt='Running fan working' width='50' height='50'>"
          $("#fan").html(running_image)
        } else {
          not_running_image = "<img src='" + not_running_fan_url + "' alt='Running fan working' width='50' height='50'>"
          $("#fan").html(not_running_image)
        }
        $('#calibration_percentage_indicator').html(result["calibration_percentage"]);
        $('#condition_level').attr("data-level",result["condition_level"]);
        $('#degradation_level').attr("data-level",result["degradation_level"])
        sliderCalculator()
        $('#rms_indicator').html(result["rms_indicator"])
        $('#rms_value').html(result["rms_value"])
        $('#iso_class').html(result["iso_class"])
        var isoClass = result["data_iso_class"];
        var vibrationRms = result["data_vibration_rms"];
        $('#rms_point_in_iso_table').remove()
        if(vibrationRms != '') {
         var tRow = iso_table_element(isoClass, vibrationRms)
         $('#' + tRow).append("<div id='rms_point_in_iso_table' style='border: 1px solid #000; border-radius:100%; margin: 0 auto; width:25px; background-color: #fff;text-align:center'>X</div>")
        }
        $('#tmp_indicator').html(result["tmp_indicator"])
        $('#tmp_value').html(result["tmp_value"])
        $('#baseline_temperature').html(result["baseline_temperature"])
        $('#day_utilisation').html(result["day_utilisation"])
        $('#week_utilisation').html(result["week_utilisation"])
        $('#month_utilisation').html(result["month_utilisation"])
        $('#year_utilisation').html(result["year_utilisation"])
        $('#day_power_usage').html(result["day_power_usage"])
        $('#week_power_usage').html(result["week_power_usage"])
        $('#month_power_usage').html(result["month_power_usage"])
        $('#year_power_usage').html(result["year_power_usage"])
        console.log("completed");
      },
      error: function () {
        console.log("Failed to update device details!");
      }
    });

  } // End updateDeviceDetails method

    // Refresh device details every 5 minutes
   setInterval(updateDeviceDetails, 300000); // last arg is in milliseconds

});

Date.prototype.isSameDateAs = function(pDate) {
  return (
    this.getFullYear() === pDate.getFullYear() &&
    this.getMonth() === pDate.getMonth() &&
    this.getDate() === pDate.getDate()
  );
}

function getDevicesSamplesByTimestamp(fromTime, toTime) {
  chart1.showLoading();
  chart2.showLoading();
  chart3.showLoading();
  $('input.highcharts-range-selector', $(chart1.container).parent()).datepicker('disable');
  $('input.highcharts-range-selector', $(chart2.container).parent()).datepicker('disable');
  $('input.highcharts-range-selector', $(chart3.container).parent()).datepicker('disable');
  $("body").addClass("loading");
  $.ajax({
   type: "get",
   contentType: "application/json; charset=utf-8",
   url: "/devices/"+ ""+device_serial+" " +"/samples",
   dataType: "json",
   data: {id: device_serial, from_time: fromTime, to_time: toTime},
   success: function (result) {
     if(typeof result["vibration_conditions"][0] !== 'undefined') {
       startTimestamp = result["vibration_conditions"][0][0]
       endTimestamp = result["vibration_conditions"][result["vibration_conditions"].length - 1][0]
     }
     rmsValues = []
     for(var i=0; i<result["rms_history"].length; i++) {
       rmsValues.push(result["rms_history"][i][1]);
     }
     maxRms = (Math.max.apply(null, rmsValues) < running_cutoff) ? running_cutoff : Math.max.apply(null, rmsValues);

     TempAndVibCombinedHighChart('device-vibration-temperature-combine-history-chart', result);
     initializeDeviceRealTmpANdRmsChart('device-real-temp-vib-rms-chart',result, running_cutoff, maxRms);
     initializeDeviceEquipmentUsageAndPowerUsage('device-equipment-power-usage-chart', result);

     for(i = 0 ; i < result["equipment_usage"].length - 1; i++) {
       vals.push(result["equipment_usage"][i][0])
     }
     console.log(new Date(fromTime));
     console.log(new Date(startTimestamp));
     console.log("===================");
     console.log(new Date(toTime));
     console.log(new Date(endTimestamp));
     if(!(new Date(fromTime)).isSameDateAs(new Date(startTimestamp)) || !(new Date(toTime)).isSameDateAs(new Date(endTimestamp))) {
      $('#noDataMessage').modal('toggle');
     }
     $("body").removeClass("loading");
   },
   error: function () {
     console.log("Something wrong with charts!");
   }
  });
}

Date.prototype.isLessDateOf = function(pDate) {
  var first_date = this
  var second_date = pDate

  return (
    first_date.setHours(0,0,0,0) < second_date.setHours(0,0,0,0)
  );
}

Date.prototype.isGreatDateOf = function(pDate) {
  var first_date = this
  var second_date = pDate

  return (
    first_date.setHours(0,0,0,0) > second_date.setHours(0,0,0,0)
  );
}



// This function generate combined Highchart for temperature and vibration
function TempAndVibCombinedHighChart(container_name, result){
  chart1 = Highcharts.stockChart(container_name, {
    chart: {
        zoomType: 'xy'
    },
    title : {
      text : 'Artificial Intelligence data',
      verticalAlign: 'middle',
      y: -4,
      style: {
        "color": "#999999"
      }
    },
      rangeSelector: {
        buttons: [{
            type: 'day',
            count: 1,
            text: '1d'
        }, {
            type: 'week',
            count: 1,
            text: '1w'
        }, {
            type: 'month',
            count: 1,
            text: '1m'
        }, {
            type: 'all',
            text: 'All'
        }],
        // selected: 3,
        inputDateFormat: '%Y-%m-%d'
    },
    xAxis: {
      events: {
        setExtremes: function(e) {

          // var newFromDateSplit = $('#'+ container_name + ' :input.highcharts-range-selector:eq(0)').val().split('-');
          // var newToDateSplit = $('#'+ container_name + ' :input.highcharts-range-selector:eq(1)').val().split('-');
          // converting string to integer and converting  to UTC
          // var newUtcFromDate = Date.UTC(parseInt(newFromDateSplit[0]), parseInt(newFromDateSplit[1]) - 1, parseInt(newFromDateSplit[2]));
          // var newUtcToDate = Date.UTC(parseInt(newToDateSplit[0]), parseInt(newToDateSplit[1]) - 1, parseInt(newToDateSplit[2]));

          var newFromDate = new Date($('#'+ container_name + ' :input.highcharts-range-selector:eq(0)').val());
          var newToDate = new Date($('#'+ container_name + ' :input.highcharts-range-selector:eq(1)').val());

          var conditionOne = newFromDate.isLessDateOf(new Date(startTimestamp));
          var conditionTwo = newToDate.isGreatDateOf(new Date(endTimestamp));

          if(conditionOne || conditionTwo) {
            getDevicesSamplesByTimestamp(newFromDate.getTime(), newToDate.getTime())
          }

          if(chart1.rangeSelector.selected != chart2.rangeSelector.selected && chart1.rangeSelector.selected != chart3.rangeSelector.selected) {
            chart2.rangeSelector.clickButton(chart1.rangeSelector.selected, true);
            chart3.rangeSelector.clickButton(chart1.rangeSelector.selected, true);
          }

        }
      }
    },
    yAxis:[{
      min:0,
      max:1,
      tickPositions: [0, 0.33, 0.66, 1.00, 1.01],
      lineWidth: 0,
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      gridLineColor: 'transparent',
      lineColor: 'transparent',
      labels: {
        style: {color: "#2bae23"}
      },
        title: {
            text: 'Overall Condition',
            style: {color: "#2bae23"}
      },
      minorTickLength: 0,
      tickLength: 0,
      plotBands: chart_colors(),
      opposite:false
    },{
      min:0,
      max:1,
      tickPositions: [0, 0.25, 0.5, 0.75, 1, 1.01],
      lineWidth: 0,
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      gridLineColor: 'transparent',
      lineColor: 'transparent',
      labels: {
        style: {color: Highcharts.getOptions().colors[0]}
      },
      title: {
        text: 'Vibration/Noise',
        style: {color: Highcharts.getOptions().colors[0]}
      },
    minorTickLength: 0,
    tickLength: 0
    },
    {
      // min:0,
      // max:1,
      // tickPositions: [0, 0.25, 0.5, 0.75, 1, 1.01],
      // lineWidth: 0,
      // minorGridLineWidth: 0,
      // gridLineWidth: 0,
      // gridLineColor: 'transparent',
      // lineColor: 'transparent',
      // labels: {
      //   style: {color: Highcharts.getOptions().colors[2]}
      // },
      title: {
        text: 'Temp',
        style: {color: Highcharts.getOptions().colors[1]}
      },
    minorTickLength: 0,
    tickLength: 0
    }],
    plotOptions: {
        series: {
            showInNavigator: true
        }
    },
    tooltip : {
      formatter: function () {
        var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %Y, %H:%M:%S', this.x) + '<br/>';
        $.each(this.points, function () {
          s += '<span>'+ this.series.name + '</span> - ' + getStatusByValue(this.y) + '<br/>';
        });
        return s;
      }
    },
    series : [
      {name: "Vibration", showInNavigator: true, data: result["vibration_conditions"], dataGrouping: {approximation: "high"}},
      {name: "Temperature", navigatorOptions: {type: 'line', color: 'black'}, data: result["temperature_conditions"], dataGrouping: {approximation: "high"}},
      {name: "Overall Condition",navigatorOptions: {type: 'line', color: '#2bae23'}, data: result["overall_conditions"], dataGrouping: {approximation: "high"}}
    ]
  }, function (chart) {
        // apply the date pickers
        setTimeout(function () {
          $('input.highcharts-range-selector', $(chart.container).parent()).datepicker({ minDate: onboardEpoch, maxDate: new Date() });
        }, 0);
    });
}

// initalize highcharts on device details page
function initializeDeviceRealTmpANdRmsChart(container_name, result, running_cutoff, maxRms) {

  chart2 = Highcharts.stockChart(container_name, {
    chart: {
        zoomType: 'xy'
    },
    title:{
        text: 'Measured Data',
        verticalAlign: 'middle',
        y: -4,
        style: {
          "color": "#999999"
        }
    },
    rangeSelector: {
      buttons: [{
        type: 'day',
        count: 1,
        text: '1d'
      }, {
        type: 'week',
        count: 1,
        text: '1w'
      }, {
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'all',
        text: 'All'
      }],
      // selected: 3,
      inputDateFormat: '%Y-%m-%d'
    },
    xAxis: {
        events: {
          setExtremes: function(e) {

            // var newFromDateSplit = $('#'+ container_name + ' :input.highcharts-range-selector:eq(0)').val().split('-');
            // var newToDateSplit = $('#'+ container_name + ' :input.highcharts-range-selector:eq(1)').val().split('-');
            // converting string to integer and converting  to UTC
            // var newUtcFromDate = Date.UTC(parseInt(newFromDateSplit[0]), parseInt(newFromDateSplit[1]) - 1, parseInt(newFromDateSplit[2]));
            // var newUtcToDate = Date.UTC(parseInt(newToDateSplit[0]), parseInt(newToDateSplit[1]) - 1, parseInt(newToDateSplit[2]));

            var newFromDate = new Date($('#'+ container_name + ' :input.highcharts-range-selector:eq(0)').val());
            var newToDate = new Date($('#'+ container_name + ' :input.highcharts-range-selector:eq(1)').val());
            var conditionOne = newFromDate.isLessDateOf(new Date(startTimestamp));
            var conditionTwo = newToDate.isGreatDateOf(new Date(endTimestamp));

            if(conditionOne || conditionTwo) {
              getDevicesSamplesByTimestamp(newFromDate.getTime(), newToDate.getTime())
            }

            if(chart2.rangeSelector.selected != chart1.rangeSelector.selected && chart2.rangeSelector.selected != chart3.rangeSelector.selected) {
              chart1.rangeSelector.clickButton(chart2.rangeSelector.selected, true);
              chart3.rangeSelector.clickButton(chart2.rangeSelector.selected, true);
            }
          }
        }
    },
    yAxis: [{
      labels: {
          format: '{value}°C',
          style: {
              color: Highcharts.getOptions().colors[1]
          }
      },
      title: {
          text: 'Temperature - Equipment',
          style: {
              color: Highcharts.getOptions().colors[1]
          }
      },
      opposite:false
    },{
      lineWidth: 0,
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      labels: {
          format: '{value}mm/s',
          style: {
              color: Highcharts.getOptions().colors[0]
          }
      },
      title: {
          text: 'RMS',
          style: {
              color: Highcharts.getOptions().colors[0]
          }
      },
      plotLines: [{
        value: running_cutoff,
        color: 'red',
        width: 2
      }],
      opposite: true,
      min: 0,
      max: maxRms,
      minorTickLength: 0,
      tickLength: 0
    },
    { // Cut-off yAxis
          title: {
              text: 'Running Cut-Off: ' + running_cutoff,
              style: {
                  color: 'red'
              }
          },
          opposite: true

      }
    ],
    plotOptions: {
        series: {
            showInNavigator: true
        }
    },
    tooltip: {
        shared: true,
        valueDecimals: 2
    },
    series: [
      {name: "RMS", data: result["rms_history"], type: 'spline', yAxis: 1, tooltip: {valueSuffix: 'mm/s'}, showInLegend: false, dataGrouping: {approximation: "high"}},
      {name: "Temperature", navigatorOptions: {type: 'line', color: 'black'}, data: result["tmp_history"], type: 'spline', tooltip: {valueSuffix: '°C'}, showInLegend: false, dataGrouping: {approximation: "high"}}
    ]
}, function (chart) {
      // apply the date pickers
      setTimeout(function () {
        $('input.highcharts-range-selector', $(chart.container).parent()).datepicker({ minDate: onboardEpoch, maxDate: new Date() });
      }, 0);
  });

}


// initalize Equipment Usage and Power Usage highchart on device details page
function initializeDeviceEquipmentUsageAndPowerUsage(container_name, result) {

  chart3 = Highcharts.stockChart(container_name, {
    chart: {
        zoomType: 'xy'
    },
    plotOptions: {
      series: {
            showInNavigator: true
        }

    },
    rangeSelector: {
      buttons: [{
        type: 'day',
        count: 1,
        text: '1d'
      }, {
        type: 'week',
        count: 1,
        text: '1w'
      }, {
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'all',
        text: 'All'
      }],
      // selected: 3,
      inputDateFormat: '%Y-%m-%d'
    },
    xAxis: {
      events: {
        setExtremes: function(e) {

          // var newFromDateSplit = $('#'+ container_name + ' :input.highcharts-range-selector:eq(0)').val().split('-');
          // var newToDateSplit = $('#'+ container_name + ' :input.highcharts-range-selector:eq(1)').val().split('-');
          // converting string to integer and converting  to UTC
          // var newUtcFromDate = Date.UTC(parseInt(newFromDateSplit[0]), parseInt(newFromDateSplit[1]) - 1, parseInt(newFromDateSplit[2]));
          // var newUtcToDate = Date.UTC(parseInt(newToDateSplit[0]), parseInt(newToDateSplit[1]) - 1, parseInt(newToDateSplit[2]));

          var newFromDate = new Date($('#'+ container_name + ' :input.highcharts-range-selector:eq(0)').val());
          var newToDate = new Date($('#'+ container_name + ' :input.highcharts-range-selector:eq(1)').val());
          var conditionOne = newFromDate.isLessDateOf(new Date(startTimestamp));
          var conditionTwo = newToDate.isGreatDateOf(new Date(endTimestamp));

          if(conditionOne || conditionTwo) {
              getDevicesSamplesByTimestamp(newFromDate.getTime(), newToDate.getTime())
          }

          if(chart3.rangeSelector.selected != chart1.rangeSelector.selected && chart3.rangeSelector.selected != chart2.rangeSelector.selected) {
            chart1.rangeSelector.clickButton(chart3.rangeSelector.selected, true);
            chart2.rangeSelector.clickButton(chart3.rangeSelector.selected, true);
          }
        }
      }
    },
    yAxis: [
      { // Primary yAxis
        title: {
            text: 'Power Usage/day',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {
            format: '{value} Kwh',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: false
    },
    { // Secondary yAxis
          gridLineWidth: 0,
          labels: {
              format: '{value} %',
              style: {
                  color: Highcharts.getOptions().colors[0]
              }
          },
          title: {
              text: 'Equipment Usage/day %',
              style: {
                  color: Highcharts.getOptions().colors[0]
              }
          },
          min: 0,
          max: 100,
          tickPositions: [0, 25, 50, 75, 100, 101]
      },
      { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Stopped',
            style: {
                color: '#D3D3D3'
            }
        },
        labels: {
            format: ' ',
            style: {
                color: '#D3D3D3'
            }
        },
        max: 1
    }
  ],
    tooltip: {
        shared: true,
    },
    series : [{
      data: result["equipment_usage"],
      navigatorOptions: {type: 'line', color: 'blue'}, yAxis: 1,
      name: "Equipment Usage",type: 'spline', tooltip: {valueSuffix: ' %'},
      showInNavigator: true, marker: { enabled: false, radius: 3 }
    }, {
      data: result["power_usage"],
      navigatorOptions: {type: 'line', color: 'black'},
      name: "Power Usage", type: 'spline', tooltip: {valueSuffix: ' Kwh'}, showInNavigator: true, marker: { enabled: false, radius: 3 }
    }, {
      data: result["running"],
      navigatorOptions: {type: 'area', color: '#D3D3D3', step: 'left'},
      tooltip: {pointFormatter: function() {
                  return (this.y == 1) ? '<span style="color:#D3D3D3">\u25CF</span> Not Running: <b>' + this.y + '</b>' : '<span style="color:#D3D3D3">\u25CF</span> Running: <b>' + this.y + '</b>'}
                },
      yAxis: 2, type: 'area', step: 'left', color: '#D3D3D3', showInNavigator: true, zIndex: -1000, fillOpacity: 0.5, dataGrouping: {enabled: false}, lineWidth: 0}
    ]
  }, function (chart) {
        // apply the date pickers
        setTimeout(function () {
          $('input.highcharts-range-selector', $(chart.container).parent()).datepicker({ minDate: onboardEpoch, maxDate: new Date() });
        }, 0);
    });
}
