(function () {
	var tab_xie = document.getElementById("tab_xie");
	var tab_ci = document.getElementById("tab_ci");
	var tab_zi = document.getElementById("tab_zi");
	var char_input = document.getElementById("char_input");
	var div_canvas_input = document.getElementById("div_canvas_input");
	var div_output = document.getElementById("div_output");
	var div_input = document.getElementById("div_input");
	
	function deactivateAll() {
		div_canvas_input.style.display = "none";
		div_input.style.display = "none";
		div_output.style.display = "none";
		tab_xie.style.background = "white";
		tab_ci.style.background = "white";
		tab_zi.style.background = "white";
	}
	function activateCi() {
		deactivateAll();
		div_input.style.display = "block";
		div_output.style.display = "block";
		tab_ci.style.background = "lightblue";
	}
	function activateXie() {
		deactivateAll();
		div_input.style.display = "block";
		div_canvas_input.style.display = "block";
		tab_xie.style.background = "lightblue";
		resizeCanvas();
	}
	activateCi();
	tab_xie.onclick = activateXie;
	tab_ci.onclick = activateCi;

	function resizeCanvas() {
		//alert(div_canvas_input.innerWidth());
		char_input.width = div_canvas_input.clientWidth-15;
		char_input.height = div_canvas_input.clientWidth-15;
	}
	window.onresize = resizeCanvas;
} ());
