$(".cont-carro").click(function(){
	$(".cont-carro").addClass("active-icono");
	$(".cont-casa").removeClass("active-icono");
});

$(".cont-casa").click(function(){
	$(".cont-carro").removeClass("active-icono");
	$(".cont-casa").addClass("active-icono");
});

$(".cont-dolar").click(function(){
	$(".cont-dolar").addClass("active-icono");
	$(".cont-sol").removeClass("active-icono");
});

$(".cont-sol").click(function(){
	$(".cont-dolar").removeClass("active-icono");
	$(".cont-sol").addClass("active-icono");
});

$(".tiempos-form").click(function(d){
	$(".tiempos-form").removeClass("active-icono");
	$(this).addClass("active-icono");
})