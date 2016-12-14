$("#form0").show();
$("#form1").hide();
$("#form2").hide();
$("#form3").hide();

$(".btn-next").click(function(){
	var number = $(this).attr("id").slice(-1);
	number = +number + 1;
	$("#form" + (number-1)).fadeOut(1000,function(){
		$("#form" + number).fadeIn(800);
	});
	$('html, body').stop().animate({
          'scrollTop': 0
    }, 1000, 'swing');
});

$(".volver").click(function(){
	var number = $(this).attr("id").slice(-1);
	number = +number;
	$("#form" + (number+1)).fadeOut(1000,function(){
		$("#form" + number).fadeIn(800);
	});
	$('html, body').stop().animate({
          'scrollTop': 0
    }, 1000, 'swing');
});