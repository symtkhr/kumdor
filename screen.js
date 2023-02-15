// 汎用関数
const GetRand = (max) => parseInt(Math.random() * max);
const inDebug = () => location.hash == "#debugging";
const CLOG = (...arg) => inDebug() ? console.log(...arg) : {};
Array.prototype.shuffle = function() {
    let array = this;
    //CLOG(array.map(v=>v.name));
    for (let i = array.length - 1; 0 < i; i--) {
	const j = parseInt(Math.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const IMGROW = 16;//(location.hash == "#original") ? 16 : 20;
const IMGCELL = 32;

let Draw = {};

Draw.map = function() {
    let lava = Map.in_lava(ch.map, ch.x, ch.y);
    let fog = ch.fog.enable || Map.in_fog(ch.map, ch.x, ch.y);
    
    $("#map .cell").each(function(){
        let n = $("#map .cell").index(this);
        let y = ch.y + parseInt(n / 11) - 4 ;
        let x = ch.x + n % 11 - 5;
        let def = (x < 0 || y < 0 || y >= Map.syb.length || x >= Map.syb[y].length) ?
            Map.sybDef[Map.base] : Map.sybDef[Map.syb[y][x]];
        let k = def[0];
        if ((k != 0x21  && ch.dark) ||
	    ((ch.map != 1 || k == 0x0a || k == 0x01) && fog))
	    return $(this).children("img").hide();

	if (ch.map == 1 && (k == 0x1b || k == 0x1c || k == 0x1d)) lava = true;

	let graph = [4, 0, 1, 1, 2, 3][Map.in_airport(ch.map, ch.x, ch.y) ? 0 : ch.map];

        $(this).children("img").show()
            .css("position", "relative")
            .css("left", ((k % IMGROW) * -IMGCELL) + "px")
            .css("top",  ((graph * 7 + parseInt(k / IMGROW)) * -IMGCELL) + "px");
    });

    $("#map").css("background",
		  ch.dark ? "black" :
		  (lava ? "red" :
		   (fog ? "white":
		    "#00ff00")));
};

Draw.me = function() {
    if (ch.jt.indexOf("t") != -1) return $("#me").hide();
    let n = ch.muki * 2 + (ch.fog.enable ? ch.fog.foot() : ((ch.x + ch.y) % 2));
    $("#me").show().children("img")
        .css("position", "relative")
        .css("top", "0px")
        .css("left",  (n * -IMGCELL) + "px");
};

// ライフの描画
Draw.life = function(flg)
{
    $("#lifecap").width(ch.lifebox * 16);
    $("#life").width((ch.life + 9) / 10);
    for (let i = 0; i < ch.lifebox; i++) {
        //DrawLine(8 + i * 16, 321, 8 + i*16, 335, 0xff00ff, true);
    }
    $("#life").text(parseInt((ch.life + 9) / 10) + "/" + (16 * ch.lifebox) + "pt.");
    if (ch.life <= 50)
       $("#bg").addClass("dying");
    else
       $("#bg").removeClass("dying");
}

// スパイス・経験値・状態異常の描画
Draw.status = function() {
    $("#expr").text(ch.expr);
    $("#exprc").text(ch.exprc);
    $("#spic").text(ch.spice);
    const jtname = {p:"毒", t:"透", m:"狂"};
    $("#abnormal").text(ch.jt.map(v => jtname[v]).join("") + (ch.dark ? "闇" : ""));
    $("#bg")[(ch.jt.indexOf("p") < 0) ? "removeClass" : "addClass"]("poison");
};

// 特殊アイテムの描画
Draw.outfits = function() {
    $("#chattable").css("visibility", ch.chattable ? "visible" : "hidden");
    $("#lang").css("visibility", ch.isdone("lang") ? "visible" : "hidden");
    $("#depth").css("visibility", ch.isdone("depth") ? "visible" : "hidden");
    $("#compass").css("visibility", ch.isdone("compass") ? "visible" : "hidden");
    $("#slipper").css("visibility", ch.isdone("slipper") ? "visible" : "hidden");
    $("#weather").css("visibility", ch.isdone("weather") ? "visible" : "hidden");
    $("#home").css("visibility", ch.isdone("myhome") ? "visible" : "hidden");
    $("#basket").css("visibility", Kago.taken ?  "visible" : "hidden");
    $("#compass img").css("left", (([3,0,1,2][ch.fog && ch.fog.north || 0]) * -IMGCELL) + "px").css("top", "-96px");
    $("#depth img").css("left",  (ch.z * -IMGCELL) + "px").css("top", "-32px");
    $(".cell img").css("filter", ((0 < ch.z) && (ch.map != 5)) ? "hue-rotate(90deg)" : "");
};

// 全描画
Draw.all = function()
{
    Draw.map();
    Draw.me();
    Draw.life();
    Draw.status();
    Draw.outfits();
};

Draw.textbox = function(is_shown)
{
    let $obj = $("#menubox, #propertybox,#abnormal,#lifecap,#life,#itemsp,#map");
    $("#gamedisp, #bg").css("background", "");
    if (is_shown) return $obj.show();
    $("#gamedisp, #bg").css("background", "black");
    return $obj.hide();
};

const TextBar = function(txt, is_human)
{
    let t = ($("#text").text() + txt.split("//").join("\n")).split("\n");
    $("#text").text(t.slice(-3).join("\n") + "\n");
}
const Dialog = function(txt, callback)
{
    if (txt[0] == "\v" || txt[0] == "\f") return TextBar(txt.slice(1)) & (callback || wandering)();
    $(window).unbind();
    let t = txt.split("//").join("\n");
    let i = 0;
    let w = 0;
    let timer = setInterval(() => {
	if (t[i] == "\t" && w < 20) return w++;
	w = 0;
        if (("\t\f\v").indexOf(t[i]) < 0) $("#text").append(t[i]);
        i++;
        $("#text").text($("#text").text().split("\n").slice(-3).join("\n"));
        if (i < t.length) return;
        clearInterval(timer);
        $("#text").append("\n");
	if (typeof callback === "string") return;
	(callback || wandering)();
    }, 10);
};
`
const HyperDialog = (txts) => {
    if (!Array.isArray(txts)) txts = [txts];
    let seq = txts.map(s => {return{d:s}});
    seq[seq.length - 1].thru = true;
    Draw.sequence(seq);
};
`
// メニュー描画
let submenu = function(options, callbacks, type)
{
    let jm = 0;
    let sln = options.length;
    let $top = $("#submenubox").show();
    let $opt = $top.find(".menuoption");
    $top.prop("class", "box " + (type || ""));
    $top.css("height", (options.length * 20 + 16) + "px");
    $top[type == "town" ? "addClass" : "removeClass"]("town");

    $("#jtext").hide();
    $opt.hide().removeClass("selected").eq(jm).addClass("selected");
    options.map((v,i) => $opt.eq(i).show().html(v));

    keytype([{ k:" ", ontype: (e) => {
        jm = (e.shiftKey ? (jm - 1 + sln) : (jm + 1)) % sln;
        $opt.removeClass("selected").eq(jm).addClass("selected");
    }}, { k:"J", ontype: () => {
        $top.hide();
        (callbacks[jm] || wandering)();
    }}, { k:"F", ontype: () => {
        if (!type) return;
        $top.hide();
        wandering();
    }}, ]);
};

// ゲームオーバイベント
let GameOver = function(message){
    TextBar(message || "命が尽きた。");
    $("#bg").css("background", "red");
    $(".cell img").css("filter", "hue-rotate(-120deg) contrast(1.5)");
    $("#me img").css("filter", "hue-rotate(-60deg)");
    $("#map").css("background", "purple");
    jwait(function(){
        $("#gamedisp div").hide();
        Draw.textbox();
        DrawString(144+8*15, 192, "[RESTART]", "red");
        jwait(function() {location.reload(); });
    });
    let DrawString = function(x, y, txt, c) {
        let v = $('<div id="str">').css("top", y+"px").css("left", x+"px")
            .css("position","absolute").text(txt).css("color", c).addClass("selected");
        $("#gamedisp").append(v);
        //$("#str").append('<div style="display:inline-block;" class="selected"></span>');
    };
}

Draw.sequence = (txts) => {
    if (!Array.isArray(txts)) txts = [txts];
    let seq = txts.map((s,i) => (typeof s === "object") ? s :
                       (typeof s === "function")? {func:s} :
                       {d:s, thru:(txts.length - 1 == i)});
    //seq[seq.length - 1].thru = true;
    //Draw.sequence(seq);

    const run_subseq = (i) => {
	if (seq.length <= i) return wandering();
	let cmd = seq[i];
	let next = () => { run_subseq(i + 1) };
	if (!cmd) return next();
	if (cmd.wait) return;
	if (cmd.func) {
	    cmd.func();
	    if (cmd.timer) return setTimeout(next, cmd.timer);
	    return next();
	}
	if (cmd.confirm) {
	    next = () => submenu(["Yes", "No"], [() => run_subseq(i + 1), cmd.cancel]);
	} else if (!cmd.thru)
	    next = () => { jwait(() => { run_subseq(i + 1); }); };
	
	if (cmd.d) return Dialog(cmd.d, next);
	if (cmd.t) TextBar(cmd.t);
	next();
    };
    run_subseq(0);
};
const HyperDialog = Draw.sequence;

Draw.stair = (jumpto, isdown) => {
    $(window).unbind();
    let init = isdown ? {top:0, bottom:"auto"} : {bottom:0,top:"auto"};
    $("#curtain").removeClass("water").addClass("stair").show().css(init)
	.animate({height:"100%"}, ()=>{
	    $("#curtain").hide().css("height",0);
	    Map.jump(jumpto);
	    wandering();
	});
};
Draw.warp = (jumpto) => {
    TextBar("ワープ ゾーン!!");
    jwait(() => {
	Map.jump(jumpto);
	wandering();
    });
};

Draw.dive = (jumpto, isdown) => {
    $(window).unbind();
    let init = isdown ? {top:0, bottom:"auto"} : {bottom:0,top:"auto"};
    $("#curtain").removeClass("stair").addClass("water").show().css(init)
	.animate({height:"100%"}, ()=>{
	    $("#curtain").hide().css("height",0);
	    Map.jump(jumpto);
            Draw.outfits();
            Draw.map();
	    return wandering();
	});
};

Draw.fill_life = (done) => {
    $(window).unbind();
    let timer = setInterval(() => {
        Draw.life();
        ch.life += 10;
        if (ch.life < ch.lifebox * LIFEBOX) return;
        clearInterval(timer);
        ch.life = ch.lifebox * LIFEBOX;
        Draw.life();
	(done || wandering)();
    }, 20);
};

let Opening = function() {
    Map.jump({loc:[56,8], map:0, z:0});
    $("#score, #keyboard").hide();
    let easy = false;

    const seq = [
	{t:"(以降、右下の点滅マークが出たら、\n 'J'を押して進行します)\n"},
	{t:"惑星クムドールの首都・クミエルに//向かうためにあなたが搭乗した飛行船は、"},
	{t:"到着直前に突然のシステム異常により//墜落してしまった。"},
	{func: () => {
	    $("#map").css("background","gray");
	    ch.z = 1;
	    ch.spice = easy ? 2000 : 0;
	    Draw.status();
	}},
	{t:"あなたは、お金を全部ばらまいてしまった。"},
	{func: () => {
	    ch.exprc = easy ? 100 : 0;
	    ch.expr = 0;
	    Draw.status();
	}},
	{t:"ショックで経験値を失った。"},
	{t:"キーボードからキーが抜けてしまった。"},
	{func: () => {
	    ch.life = easy ? 480 : 160;
	    ch.lifebox = easy ? 3 : 1;
	    if (easy) ch.pick = [[1,{x:54,y:92},17],[1,{x:8,y:66},17]];
	    Draw.life();
	}},
	{t:"ライフをかろうじて一つ残した。"},
	{func:() => {
	    $("#gamedisp").css("background", "black");
	    $("#text").show();
	    Draw.textbox(false);
	    Map.jump({loc:[19,13], map:2, z:0});
	}},
	{d:"なんだ なんだ。", thru:true},
	{d:"船が墜落したらしい。", thru: true},
	{d:"うわっ でかい穴!!"},
	{func:() => {
	    $("#gamedisp").css("background", "");
            Draw.textbox(true);
	}},
	{d:"おい、誰かいるぜ。", thru:true},
	{d:"生きてるのかい?", thru: true},
	{d:"..........。"},
    ];

    TextBar("モードを選択してください。開始時の\n経験値・所持金・ライフが変わります。\n(スペースキーで選択、'J'で決定)");
    
    submenu(["Normal","Easy"], [
	() => { Draw.sequence(seq); },
	() => { easy = true; Draw.sequence(seq); },
    ]);
};

let Ending = function() {
    const jseq = (i) => {
	if (i < event.length) event[i]();
	jwait(() => { jseq(i + 1); });
    };
    let event = [
	() => { TextBar("長い戦いに、いきなり終止符が打たれた。"); },
	() => { Map.replace(0x6f);
                $("#map").css("background","#00ff00");
		TextBar("気が付くと、そこに－//一人の少年が眠っていた。");
	      },
	() => {
	    ch.z = 0;
            ch.muki = 0;
	    Map.jump({map:4,loc:[20,109]});
            Map.replace(0xec); // 国王
            Map.replace(0xea, [19,109]); // ミド
            //Draw.map();
            Draw.all();
	    Dialog("よくやった。ホントに ホントによくやった。//クムドール国民全員にかわって//お礼を申し上げたい。", "jwait");
	},
	() => {
            $("#gamedisp div").hide();
	    let $v = $('<div id="str">').css({
		top:0, left:0, right:0, bottom:0, margin:"auto",position:"absolute",
		fontFamily:"serif", fontWeight:"bold", fontSize:"100px", 
		width:"100px", height:"100px", color:"black", lineHeight: "100px",
	    }).text("終");
	    $("#gamedisp").append($v).css("position","relative");
	},
	() => { location.reload(); },
    ];
    jseq(0);
};

// j入力待ち
let jwait = function(callback) {
    $("#jtext").show();

    keytype([{k:"J", ontype:() => {
        $("#jtext").hide();
        (callback || wandering)();
    }}]);
};

let wandering_action = function() {
    let jm = 0;
    ch.state = "wandering_action";
    let $obj = $("#menu .menuoption");
    $obj.eq(jm).addClass("selected");

    // key待ち
    keytype([{k:" ", ontype: (e) => {
        let sln = $obj.size();
        jm = (e.shiftKey ? (jm - 1 + sln) : (jm + 1)) % sln;
        $obj.removeClass("selected").eq(jm).addClass("selected");
        return;
    }}, {k:"F", ontype: () => {
        $obj.removeClass("selected");
        wandering();
    }}, {k:"J", ontype: () => {
        $obj.removeClass("selected");
        if (jm == 0) { ch.hanasu(); }
        if (jm == 1) { Shojihin.menu(); }
        if (jm == 2) { Jumonsho(); }
        if (jm == 3) { Keyboard.show(); }
        if (jm == 4) { BigHand.score(); }
        if (jm == 5) { SysOpt(); }
    }}, ]);
}

let SysOpt = function() {
    let Kill = function(){
	TextBar("セーブデータを消去しますか?");
        submenu(["Yes", "No"], [() => {
            localStorage.removeItem("save");
            location.reload();
        }]);
    };
    let Redraw = function(){
        Draw.textbox(true);
        TextBar("\n\n");
        Draw.all();
        wandering();
    };
    let Bgm = function(){
	TextBar("(本機能は未実装です)");
        wandering();
    };
    let Walkthrough = function(){
	let hint = ["村長に詫びを入れに行く。",
	 "大きな手の部屋に入る。",
	 "キーショップでキーを買う。",
	 "隣のジュクルン村に行く。",
	 "キーショップでキーを買う。",
	 "ジュクルン村の大きな手の部屋に入る。",
	 "BSキーとライフの箱を拾う",
	 "洞窟の呪文の壁を読む。",
	 "ルチュ村のキーショップでキーを買う。",
	 "クェー村のキーショップでキーを買う。",
	 "クェー村でダイビングする人に話しかける。",
	 "クェー村でアクアラングを買う。",
	 "ルチュ村でダイビングのやり方を教わる。",
	 "ルチュ湖に潜る。",
	 "湖底の呪文の壁を読む。",
	 "イオパ村のキーショップでキーを買う。",
	 "霧の谷の西にあるライフの箱を拾う。",
	 "霧の谷の東にある洞窟で変わった形の水晶を探す。",
	 "霧の谷を水晶の向きにしたがって進む。",
	];
	Dialog("攻略のヒント://" + hint[GetRand(hint.length)] + "//(本機能は未実装です)");
    }
    let KeyLayout = function(){
        const options = ["101(英字)", "109(日本語)"];
        let from = ch.layout == 101 ? 0 : 1;
        let to   = ch.layout == 101 ? 1 : 0;
        TextBar("キーボード設定は" + options[from] + "配列です。\n" +
                options[to] + "配列に変更しますか?\n(最後にセーブした箇所からやり直します)");

        submenu(["Yes", "No"], [() => {
            ch.load();
            Keyboard.changelayout(ch.layout == 101 ? 109 : 101);
            ch.save();
            location.reload();
        }], "layout");
    };

    submenu(["再描画", "キー配列","セーブ消去", //"攻略", "BGM", 
            ],[Redraw, KeyLayout, Kill, //Walkthrough, Bgm
            ], "system");
};

let dumpdebug = () => {
    $("#debug").text(
	"(" + ch.map + ", " + ch.x + "," + ch.y + ")" + Map.symbol(ch.towhere()) +
	    (ch.map==1 ? ";stage:" + inhabitation[parseInt(ch.y/4)][parseInt(ch.x/4)]:"")
    );
    if (!$("#lmapok").size())
	$("#debug").after("<input type=checkbox id=lmapok>largemap");
    if ($("#lmapok").prop("checked")) draw_largemap();
}

let draw_largemap = () => {
    const IMGROW = 16;
    const IMGCELL = 5;
    const CELLW = 60;
    const CELLH = 80;

    if (!$("#lmap").size()) {

	$("#gamedisp").append("<div id='lmap' style='display:flex; flex-wrap:wrap;'>");
	let $cell = '<div style="overflow:hidden;position:relative;"><img src="fig/kummap.png"></div>';
	$("#lmap").html($cell.repeat(CELLW*CELLH))
	    .css({background:"#0f0",width:CELLW*IMGCELL,position:"absolute",
		  top:0,left:"640px",
	    });
	$("#lmap div").css({width:IMGCELL, height:IMGCELL});
	$("#lmap div img").css({width:IMGROW*IMGCELL, position:"absolute"});
    }

    let xedge = ch.x - CELLW/2;
    let yedge = ch.y - CELLH/2;
    if (xedge < 0) xedge = 0;
    if (yedge < 0) yedge = 0;
    if (128 <= xedge + CELLW) xedge = 128 - CELLW;
    if (128 <= yedge + CELLH) yedge = 128 - CELLH;

    $("#lmap div").each(function(i) {
	let graph = [4, 0, 1, 1, 2, 3][Map.in_airport(ch.map, ch.x, ch.y) ? 0 : ch.map];
        let x = i % CELLW + xedge;
        let y = parseInt(i / CELLW) + yedge;

        let def = (x < 0 || y < 0 || y >= Map.syb.length || x >= Map.syb[y].length) ?
            Map.sybDef[Map.base] : Map.sybDef[Map.syb[y][x]];
	let k = def[0];
	
        $(this).children("img").show()
            .css("position", "relative")
            .css("left", ((k % IMGROW) * -IMGCELL) + "px")
            .css("top",  ((graph * 7 + parseInt(k / IMGROW)) * -IMGCELL) + "px")
	if (ch.x == x && ch.y == y)
	    $(this).css({"border":"red solid 2px","box-sizing":"border-box"});
	else 
	    $(this).css({"border":"none"});
    });


};

// Main
$(function() {
    const PNGPATH = "fig/kumtop.png";
    const PNGPATHx = "fig/kummap.png";
    $("#itemsp .cell").html('<img src="' + PNGPATH + '">');
    $("#map .cell").html('<img src="' + PNGPATHx + '">');
    $("#me").html('<img src="' + PNGPATH + '">');
    $("#keyinput").focus().blur(function() {$("#keyinput").focus(); });
    $("#gamedisp").click(function() {
        $("#keyinput").focus();
    });
    $("#text").css("white-space", "pre-wrap");

    load_original_map();
});
