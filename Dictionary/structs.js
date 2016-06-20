"use strict"

// Example
// Pinyin("wang4")
// { silable : "wang", tone = 4 }
function Pinyin(silable, tone) {
	//console.assert(silable.constructor == String,
	//	"bad silable in Pinyin: " + JSON.stringify(silable));
	this.silable = silable.match(/[a-zA-Z]*/)[0];
	var tone = silable.match(/[1-5]/);
	if (tone != "") {
		this.tone =parseInt(tone);
	}
	silables[this.silable.toLowerCase()] = true;
}

var silables = {}

// Example
// { traditional : "...", simplified : "...", pinyin : [ Pinyin(...) , ... ], [ "translation", ...] } 
function DictEntry(traditional, simplified, pinyin, english) {
	// console.assert(traditional.constructor == String,
	// 	"bad traditional in DictEntry: " + JSON.stringify(traditional));
	// console.assert(simplified.constructor == String,
	// 	"bad simplified in DictEntry: " + JSON.stringify(simplified));
	// console.assert(pinyin.constructor == Array,
	// 	"bad Pinyin in DictEntry: " + JSON.stringify(pinyin));
	// for (var pin of pinyin) {
	// 	console.assert(pin.constructor == Pinyin,
	// 		"bad Pinyin in DictEntry: " + JSON.stringify(pin));
	// }
	// console.assert(english.constructor == Array,
	// 	"bad english in DictEntry: " + JSON.stringify(english));
	// for (var eng of english) {
	// 	console.assert(eng.constructor == String,
	// 		"bad English in DictEntry: " + JSON.stringify(eng));
	// }
	this.traditional = traditional;	
	this.simplified = simplified;
	this.pinyin = pinyin;
	this.english = english;
}

// DictEntry.prototype.toRow = function() {
// 	var output = document.getElementById("output");
// 	var res = (text.match(new RegExp("^.*" + input.value + ".*$","mgi"))||["noResult noResult [,] /no results/"]);
// 	output.innerHTML = res.slice(0,25).map(function(r) {
// 		var r = parseLine(r);
// 		if (r == null) { return ""; }
// 		return "<tr class=\"dict_entry\">"+
// 			"<td>" + r.simplified + "</td>" +
// 			"<td>" + r.pinyin + "</td>" +
// 			"<td>" + r.english +"</td>" + "</tr>"; }).join("");
// }
// 
// 
// var cedict = function() {
// 	var dictionary = [];
// 	var myRequest = new XMLHttpRequest();
// 	var text = null;
// 
// 	var silableList = [
// 															"zhi",	"chi",	"shi",	"ri",	"zi",	"ci",	"si",
// 	"a",	"ba",	"pa",	"ma",	"fa",	"da",	"ta",	"na",	"la",	"ga",	"ka",	"ha",				"zha",	"cha",	"sha",	"za",		"ca",	"sa",
// 	"o",	"bo",	"po",	"mo",	"fo",				"lo",
// 	"e",			"me",		"de",	"te",	"ne",	"le",	"ge",	"ke",	"he",				"zhe",	"che",	"she",	"re",	"ze",	"ce",	"se",
// 	"ai",	"bai",	"pai",	"mai",		"dai",	"tai",	"nai",	"lai",	"gai",	"kai",	"hai",				"zhai",	"chai",	"shai",		"zai",	"cai",	"sai",
// 	"ei",	"bei",	"pei",	"mei",	"fei",	"dei",	"tei",	"nei",	"lei",	"gei",	"kei",	"hei",				"zhei",		"shei",		"zei",		"sei",
// 	"ao",	"bao",	"pao",	"mao",		"dao",	"tao",	"nao",	"lao",	"gao",	"kao",	"hao",				"zhao",	"chao",	"shao",	"rao",	"zao",	"cao",	"sao",
// 	"ou",		"pou",	"mou",	"fou",	"dou",	"tou",	"nou",	"lou",	"gou",	"kou",	"hou",				"zhou",	"chou",	"shou",	"rou",	"zou",	"cou",	"sou",
// 	"an",	"ban",	"pan",	"man",	"fan",	"dan",	"tan",	"nan",	"lan",	"gan",	"kan",	"han",				"zhan",	"chan",	"shan",	"ran",	"zan",	"can",	"san",
// 	"en",	"ben",	"pen",	"men",	"fen",	"den",		"nen",		"gen",	"ken",	"hen",				"zhen",	"chen",	"shen",	"ren",	"zen",	"cen",	"sen",
// 	"ang",	"bang",	"pang",	"mang",	"fang",	"dang",	"tang",	"nang",	"lang",	"gang",	"kang",	"hang",				"zhang",	"chang",	"shang",	"rang",	"zang",	"cang",	"sang",
// 	"eng",	"beng",	"peng",	"meng",	"feng",	"deng",	"teng",	"neng",	"leng",	"geng",	"keng",	"heng",				"zheng",	"cheng",	"sheng",	"reng",	"zeng",	"ceng",	"seng",
// 	"er",
// 	"yi",	"bi",	"pi",	"mi",		"di",	"ti",	"ni",	"li",				"ji",	"qi",	"xi",
// 	"ya",					"dia",		"nia",	"lia",				"jia",	"qia",	"xia",
// 	"yo",
// 	"ye",	"bie",	"pie",	"mie",		"die",	"tie",	"nie",	"lie",				"jie",	"qie",	"xie",
// 	"yai",
// 	"yao",	"biao",	"piao",	"miao",	"fiao",	"diao",	"tiao",	"niao",	"liao",				"jiao",	"qiao",	"xiao",
// 	"you",			"miu",		"diu",		"niu",	"liu",				"jiu",	"qiu",	"xiu",
// 	"yan",	"bian",	"pian",	"mian",		"dian",	"tian",	"nian",	"lian",				"jian",	"qian",	"xian",
// 	"yin",	"bin",	"pin",	"min",				"nin",	"lin",				"jin",	"qin",	"xin",
// 	"yang",	"biang",				"diang",		"niang",	"liang",				"jiang",	"qiang",	"xiang",
// 	"ying",	"bing",	"ping",	"ming",		"ding",	"ting",	"ning",	"ling",				"jing",	"qing",	"xing",
// 	"wu",	"bu",	"pu",	"mu",	"fu",	"du",	"tu",	"nu",	"lu",	"gu",	"ku",	"hu",				"zhu",	"chu",	"shu",	"ru",	"zu",	"cu",	"su",
// 	"wa",									"gua",	"kua",	"hua",				"zhua",	"chua",	"shua",	"rua",
// 	"wo",					"duo",	"tuo",	"nuo",	"luo",	"guo",	"kuo",	"huo",				"zhuo",	"chuo",	"shuo",	"ruo",	"zuo",	"cuo",	"suo",
// 	"wai",									"guai",	"kuai",	"huai",				"zhuai",	"chuai",	"shuai",
// 	"wei",					"dui",	"tui",			"gui",	"kui",	"hui",				"zhui",	"chui",	"shui",	"rui",	"zui",	"cui",	"sui",
// 	"wan",					"duan",	"tuan",	"nuan",	"luan",	"guan",	"kuan",	"huan",				"zhuan",	"chuan",	"shuan",	"ruan",	"zuan",	"cuan",	"suan",
// 	"wen",					"dun",	"tun",	"nun",	"lun",	"gun",	"kun",	"hun",				"zhun",	"chun",	"shun",	"run",	"zun",	"cun",	"sun",
// 	"wang",									"guang",	"kuang",	"huang",				"zhuang",	"chuang",	"shuang",
// 	"weng",					"dong",	"tong",	"nong",	"long",	"gong",	"kong",	"hong",				"zhong",	"chong",	"shong",	"rong",	"zong",	"cong",	"song",
// 	"yu",							"nü",	"lü",				"ju",	"qu",	"xu",
// 	"yue",							"nüe",	"lüe",				"jue",	"que",	"xue",
// 	"yuan",												"juan",	"quan",	"xuan",
// 	"yun",								"lün",				"jun",	"qun",	"xun",
// 	"yong",												"jiong",	"qiong",	"xiong"]
// 
// 	function uColonToUe(sil) {
// 		
// 	}
// 
// 	// takes "tong3" to "tong"
// 	function placeTone(silable) {
// 		if (/^[a-zA-Z·,]$/.test(silable)) { return silable; }
// 		var sil = silable.slice(0,-1);
// 		if (sil == "r") { return sil; }
// 		sil = sil.replace("u:", "ü");
// 		var tone = silable.slice(-1);
// 		var tone = parseInt(tone);
// 		if (
// 			(silableList.indexOf(sil) === -1
// 			&& (silableList.indexOf(sil.slice(0,-1)) === -1 || sil[-1] !="r")
// 			)
// 			|| isNaN(tone)) { alert(silable + " is not a proper silable"); }
// 		
// 		var tonePos = null;
// 		var indexA = sil.indexOf("a");
// 		var indexE = sil.indexOf("e");
// 		var indexO = sil.indexOf("o");
// 		var indexI = sil.indexOf("i");
// 		var indexU = sil.indexOf("u");
// 		var indexV = sil.indexOf("v");
// 		
// 		if (indexA != -1) { tonePos = indexA; }
// 		else if (indexE != -1) { tonePos = indexE; }
// 		else if (indexO != -1) { tonePos = indexO; }
// 		else if (indexV != -1) { tonePos = indexV; }
// 		else { tonePos = Math.max(indexI, indexU); }
// 		
// 		var accent = null;
// 		if (tone == 1) { accent = "&#772;"; }
// 		else if (tone == 2) { accent =  "&#769;"; }
// 		else if (tone == 3) { accent =  "&#780;"; }
// 		else if (tone == 4) { accent =  "&#768;"; }
// 		
// 		var ret = null;
// 		if (accent == null) { ret = sil; }
// 		else { ret = sil.substring(0,tonePos+1) + accent + sil.substring(tonePos+1,sil.length); }
// 		
// 		return ret;
// 	}
// 
// 	function parseLine(line) {
// 		var rest = line;
// 		var index = null;
// 		var index2 = null;
// 		if (rest.substring(0,1) === "#" || rest === "") { return null; }
// 		index = rest.indexOf(" ");
// 		var traditional = rest.substring(0,index);
// 		rest = rest.substring(index+1,rest.length);
// 		index = rest.indexOf(" ");
// 		var simplified = rest.substring(0,index);
// 		rest = rest.substring(index+1,rest.length);
// 		index = rest.indexOf("[");
// 		index2 = rest.indexOf("]");
// 		var pinyin = rest.substring(index+1, index2);
// 		pinyin = pinyin.split(" ").map(
// 			function(sil) { return new Pinyin(sil, undefined) ;}
// 			);
// 		rest = rest.substring(index2+2,rest.length);
// 		var english = rest.substring(1,rest.length-1).split("/");
// 		return new DictEntry(traditional, simplified, pinyin, english);
// 	}
// 	
// 	myRequest.onreadystatechange = function() {
// 		if (myRequest.readyState != 4 || myRequest.status != 200) { return; }
// 		text = myRequest.responseText
// 		dictionary = [];
// 		for (var line of myRequest.responseText.split("\n")) {
// 			var entry = parseLine(line);
// 			if (entry != 0) {
// 				console.log(entry);
// 				dictionary.push(entry);
// 			}
// 		}
// 		var input = document.getElementById("input");
// 		input.oninput= updateOutput;
// 	};
// 	myRequest.open('GET', 'Dictionary/cedict.txt', true);
// 	myRequest.overrideMimeType("text/plain; charset=UTF-8");
// 	myRequest.send();
// 	
// 
// 	return { text: text };
// } ()
// 
