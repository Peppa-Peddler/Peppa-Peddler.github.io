$(".load-news").hide();
var esize = $(".load-Emp").lenght();
var isize = $(".load-Inv").lenght();

if( esize == 0 ) $("#load-news-Emp").hide();
if( isize == 0 ) $("#load-news-Inv").hide();

$(".load-news").click(function(){
	var category = $(this).attr("id").slice(-3);
	$(".load-"+category)
		.slice(0,5)
		.removeClass(".load-"+category)
		.addClass("cont-"+category)
		.fadeIn(800);
	esize = $(".load-Emp").lenght();
	isize = $(".load-Inv").lenght();
	if( esize == 0 ) $("#load-news-Emp").hide();
	if( isize == 0 ) $("#load-news-Inv").hide();
});