function validateEditForm() {
  $("#serial").val($('#barcode').val());
}

$(document).ready(function() {

	$(".img-check").click(function(){
  	$(this).toggleClass("check");
  });

  // Initialize datetimepicker
  $('#installation_date').datetimepicker({
    format: "DD/MM/YYYY"
  });

});
