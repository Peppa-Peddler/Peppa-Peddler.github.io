$(document).ready(function(){

	if($("#right-flotante").css("display")=="none") return;

	var right_width = $("#col-hidden").width();

	$("#right-fixed").width(right_width);
	$("#right-flotante").width(right_width);

	var right_height = $("#get-h").height();

	var fixDiv = function(){
		var scroll = $(window).scrollTop();
		posicion(scroll);
	};

	$(window).scroll(fixDiv);
	fixDiv();

	function posicion(scroll){
		var cnt = "#fullpage";
		var $cache = $(cnt);

		var lowerbound = $cache.offset().top;
		var upperbound = $("#upperbound").offset().top;

		if (scroll <= (+lowerbound) + 80 ){
			$("#right-fixed")
				.css("position","static")
				.css("top","auto");

			$("#right-flotante")
				.css("bottom","auto")
				.css("top","180px");
		}
		else if( scroll > (+lowerbound) && scroll + right_height + 200 < +upperbound){
			$("#right-fixed")
				.css("position","fixed")
				.css("top","100px");
		}
		else {
			$("#right-fixed")
				.css("position","static")
				.css("top","auto")
				.css("bottom","0");

			$("#right-flotante")
				.css("top","auto")
				.css("bottom","82px");
		}
	};
});