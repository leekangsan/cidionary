"use strict";

// console.assert = function(x,y) { return; }

var char_list= null;

function V2(x, y) {
	//console.assert(x.constructor == Number, "bad x in V2.minus" + JSON.stringify(x));
	//console.assert(y.constructor == Number, "bad y in V2.minus" + JSON.stringify(y));
	this.x = x;
	this.y = y;
}

V2.prototype.minus = function(v2) {
	//console.assert(v2.constructor == V2, "bad v2 in V2.minus");
	return new V2(this.x - v2.x, this.y - v2.y);
}

V2.prototype.plus = function(v2) {
	//console.assert(v2.constructor == V2, "bad v2 in V2.plus");
	return new V2(this.x + v2.x, this.y + v2.y);
}

V2.prototype.multiply = function(constant) {
	//console.assert(constant.constructor == Number, "bad number in V2.plus: " + JSON.stringify(constant));
	return new V2(constant * this.x, constant * this.y);
}

Object.defineProperty(V2.prototype, "length", {
	get: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	});

V2.prototype.toPolar = function() {
	return new Polar(this.length, Math.atan2(this.y, this.x));
}

function Polar(r, phi) {
	//console.assert(r.constructor == Number, "bad r in Polar.minus" + JSON.stringify(r));
	//console.assert(phi.constructor == Number, "bad phi in Polar.minus" + JSON.stringify(phi));
	this.r = r;
	this.phi = phi;
}

Polar.prototype.toV2 = function() {
	return new V2(this.r * Math.cos(this.phi), this.r * Math.sin(this.phi));
}

// A known stroke from "strokes.txt"
// e.g. { arc = 1.35, subStrokes = [ Polar(..), .. ] }
// arc is always the sum of all r's
function KnownStroke(subStrokes, arc) {
	//console.assert(arc.constructor == Number, "bad arc in KnownStroke");
	//console.assert(subStrokes.constructor == Array, "bad substrokes in KnownStroke");
	//for (var sub of subStrokes) {
	//	console.assert(sub.constructor == Polar, "bad substroke in KnownStroke" + JSON.stringify(sub));
	//}
	this.subStrokes = subStrokes;
	this.arc = arc;
}

// A known char from "strokes.txt"
// e.g. {arc = 14, char = "我", strokes = [KnownStroke(...), ....] }
function KnownChar(strokes, arc, char) {
	// console.assert(strokes.constructor == Array, "bad substrokes in KnownChar: " + strokes);
	// for (var stroke of strokes) {
	// 	console.assert(stroke.constructor == KnownStroke, "bad substroke in KnownChar");
	// }
	// console.assert(arc.constructor == Number, "bad arc in KnownChar");
	// console.assert(char.constructor == String, "bad char in KnownChar:" + char);
	
	this.strokes = strokes;
	this.arc = arc;
	this.char = char;
}

KnownChar.prototype.test = "foo";

// stroke defined in terms of points
// e.g. { arc = 14.2, points = [ V2(..), ] }
// there are 20 equally spaced points, so position at a specifica arc can be interpolated quickly
// important method: "atNormArc"
function FindStroke(points_) {
	var points = points_.map(
		function (p) { return new V2(p.x,-p.y); }
		);

	this.arc = 0.0;
	var position = points[0];
	for (var point of points.slice(1)) {
		this.arc += point.minus(position).length;
		position = point;
	//	dot.cumulativeArc = cumulativeArc;
	}
	
	this.points = []
	this.points[0] = points[0];
	this.points[this.pointsPerStroke-1] = points[points.length-1];
	for (var i=1 ; i<this.pointsPerStroke-1 ; i++) {
		var desiredArc = this.arc * i / (this.pointsPerStroke - 1);

		var arc = 0.0;
		var position2 = points[0];
		for (var p of points) {
			arc += p.minus(position2).length;
			position2 = p;
			if (arc >= desiredArc) { break; }
		}
		this.points[i]= position2;
	}
}

FindStroke.prototype.pointsPerStroke = 20;
	
FindStroke.prototype.atNormArc = function(arc) {
	var arc_ = arc*(this.pointsPerStroke-1);
	var floor = Math.min(Math.floor(arc_),this.pointsPerStroke-2);
	return (this.points[floor].multiply(floor+1-arc_).plus(this.points[floor+1].multiply(arc_ - floor)));
};

// Just a letter together with how good it matches what's written on the canvas
function CharMatch(char, quality) {
	console.assert(char.constructor == String, "bad char in CharMatch" + JSON.stringify(char));
	console.assert(quality.constructor == Number, "bad quality in CharMatch" + JSON.stringify(quality));
	this.char = char;
	this.quality = quality;
}

function determineChar(e) {
	//console.log(JSON.stringify(e.data));
	var findStrokes = e.data.map(
		function(stroke) { return new FindStroke(stroke); }
		);
	
	var findArc = 0;
	for (var s of findStrokes) {
		findArc += s.arc;
	}
	
	var matchList = [];
	for (var char of char_list){
		var dotP = 0;
		if (char.strokes.length != findStrokes.length) { continue; }
		char.strokes.map(function(knownStroke, j) {
			var findStroke = findStrokes[j];
			var max = Math.max(findStroke.arc/findArc, knownStroke.arc/char.arc);
			var min = Math.min(findStroke.arc/findArc, knownStroke.arc/char.arc);
			dotP += min*(1/max);
			var cumulativeArc = 0;
			knownStroke.subStrokes.map(function(knownSubstroke,k) {
				var newCumulativeArc = cumulativeArc + knownSubstroke.r;
				var pointOld = findStroke.atNormArc( 
					2/3*cumulativeArc/knownStroke.arc + 1/3*newCumulativeArc/knownStroke.arc);
				var pointNew = findStroke.atNormArc(
					1/3*cumulativeArc/knownStroke.arc + 2/3*newCumulativeArc/knownStroke.arc); 
				var polar = pointNew.minus(pointOld).toPolar();
				if (char.char == "目") {console.log(polar.phi + " " +
					JSON.stringify(pointOld) + " " +JSON.stringify(pointNew) + " " + JSON.stringify(findStroke));}
				dotP += Math.cos(knownSubstroke.phi-polar.phi)/knownStroke.subStrokes.length;
				cumulativeArc = newCumulativeArc;
				return;
			});
		});
		matchList.push(new CharMatch(char.char, dotP));
	}
	matchList.sort(function(a,b) { return b.quality-a.quality; });
	// remove duplicates
	var matchList2 = [];
	matchList.slice(0,50).map(function(val) {
		for (var ele of matchList2) {
			if (ele === val.char) { return; }
		}
		matchList2.push(val.char);
	});
	return matchList2;
};


var myRequest = new XMLHttpRequest();

myRequest.onreadystatechange = function() {
	if (myRequest.readyState != 4 || myRequest.status != 200) { return; }

	var text = myRequest.responseText;
	var lines = text.match(/^[0-9a-f]{2}.*$/mg);
	char_list = lines.map(function(line) {
		var charArc = 0;
		var strokes = line.split(" | ");
		var char = String.fromCharCode(parseInt("0x" + strokes[0]));
		
		var strokes2 = strokes.slice(1).map(function(stroke) {
			var strokeArc = 0;
			var substrokes = stroke.split(" # ");
			return new KnownStroke(substrokes.map(function(substroke) {
				var phir = substroke.slice(1,-1).split(",");
				charArc += parseFloat(phir[1]);
				strokeArc += parseFloat(phir[1]);
				return new Polar (parseFloat(phir[1]), parseFloat(phir[0]));
			}), strokeArc);
		});
		return new KnownChar(strokes2, charArc, char);
		//alert(JSON.stringify(strokes2));
	});
	console.log("character recognition loaded");
	postMessage([]);
};
myRequest.open('GET', 'strokes.txt', true);
myRequest.overrideMimeType("text/plain; charset=UTF-8");
myRequest.send();

function computeAndPostChars(strokes) {
	if (char_list==null) { return; }
	postMessage(determineChar(strokes));
};
onmessage = computeAndPostChars;
