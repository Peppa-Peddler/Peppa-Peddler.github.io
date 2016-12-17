if (window.matchMedia("(min-width: 768px)").matches) {	
	$("#theform").width($("#target").width());
}

$(document).ready(function(){

	if (window.matchMedia("(min-width: 992px)").matches) {	
		var fixDiv = function(){
		var scroll = $(window).scrollTop();
		posicion(scroll);
		};

		var offset = $("#a_lowerbound").offset().top;
		var upper = $("#a_upperbound").offset().top;
		var height = $("#theform").height();

		$(window).scroll(fixDiv);
		fixDiv();

		function posicion(scroll){
			if( scroll <= offset ){
				$("#theform")
					.css("position","absolute")
					.css("top","100px")
					.css("bottom","auto")
					.css("left","auto")
					.css("right","20px");
			}
			else if( scroll > offset && scroll < upper - 100 - height ){
				$("#theform")
					.css("position","fixed")
					.css("top","100px")
					.css("bottom","auto")
					.css("left",$("#target").offset().left-(-8)+"px");
			}
			else{
				$("#theform")
					.css("position","absolute")
					.css("top","auto")
					.css("bottom","0px")
					.css("left","auto")
					.css("right","20px");
			}};
	}
});