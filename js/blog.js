$("#cont-Emp").show();
$("#cont-Inv").hide();

$("#inv").click(function(){
	$("#cont-Emp").fadeOut(500,function(){
		$("#cont-Emp").hide();
		// $("#cont-Inv").show();
		$("#cont-Inv").fadeIn(500);
	});
	$("#emp").removeClass("pestana-selected");
	$("#inv").addClass("pestana-selected");
});

$("#emp").click(function(){
	$("#cont-Inv").fadeOut(500,function(){
		$("#cont-Inv").hide();
		$("#cont-Emp").fadeIn(500);
	});
	$("#inv").removeClass("pestana-selected");
	$("#emp").addClass("pestana-selected");
});