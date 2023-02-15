const LEC = {
    R: {
        index:  "Jに置いてある右手の人差し指を使って打つ。打ったら、指を元のJキーの位置に戻す。",
        middle: "Kに置いてある右手の中指を使って打つ。打ったら、指を元のKキーの位置に戻す。",
        ring:   "Lに置いてある右手の薬指を使って打つ。打ったら、指を元のLキーの位置に戻す。",
        pinky:  ";に置いてある右手の小指を使って打つ。打ったら、指を元の;キーの位置に戻す。",
        shift:  "右手の小指でSHIFTキーを押しながら、",
    },
    L: {
        index: "Fに置いてある左手の人差し指を使って打つ。打ったら、指を元のFキーの位置に戻す。",
        middle: "Dに置いてある左手の中指を使って打つ。打ったら、指を元のDキーの位置に戻す。",
        ring: "Sに置いてある左手の薬指を使って打つ。打ったら、指を元のSキーの位置に戻す。",
        pinky: "Aに置いてある左手の小指を使って打つ。打ったら、指を元のAキーの位置に戻す。",
        shift: "左手の小指でSHIFTキーを押しながら、",
    }
};

let BigHand = {};

BigHand.leckey109 =
    [["f", "d", "s", "a", null],
     ["j", "k", "l", ";", " /スペースバー", null, "+"], // for 109
     ["L/", "D/", "\x08/BSキー"],
     ["\x0d/Enterキー"],
     ["r","t","u","y"],
     ["g", "h"],
     ["q", "w", "e"],
     ["i", "o", "p", "@"], // for 109
     ["z", "x", "c"],
     [",", ".", "/", "<", ">", "?"],
     ["v", "b", "n", "m"],
     ["4", "5", "6", "7"],
     // below for 109
     ["$", "%", "&", "'"],
     ["1", "2", "3", "!", '"', "#"],
     ["8", "9", "0", "(", ")"],
     ["-", "^", "\\", "="],
     ["[", "]", ":", "{", "}", "*", "_"],
 ];

BigHand.leckey101 =
    [["f", "d", "s", "a", null],
     ["j", "k", "l", ";", " /スペースバー", null, ":"],  // for 101
     ["L/", "D/", "\x08/BSキー"],
     ["\x0d/Enterキー"],
     ["r","t","u","y"],
     ["g", "h"],
     ["q", "w", "e"],
     ["i", "o", "p"],  // for 101
     ["z", "x", "c"],
     [",", ".", "/", "<", ">", "?"],
     ["v", "b", "n", "m"],
     ["4", "5", "6", "7"],
     // below for 101
     ["$", "%", "^", "&"],
     ["1", "2", "3", "!", '@', "#"],
     ["8", "9", "0", "*", "(", ")"],
     ["-", "=","\\", "_", "+"],
     ["[", "]", "{","}", "'", '"'],
 ];

BigHand.direction = [
 ["左手のホームポジションについて…",
  "左手の人差し指はFの上に置く。",
  "左手の中指はDの上に置く。",
  "左手の薬指はSの上に置く。",
  "左手の小指はAの上に置く。",
  "左手の親指は使わない。\nそれ以外の4本の指はいつも、この位置で待機せよ。",],

 ["右手のホームポジションについて…",
  "右手の人差し指はJの上に置く。",
  "右手の中指はKの上に置く。",
  "右手の薬指はLの上に置く。",
  "右手の小指は;の上に置く。",
  "右手の親指はスペースバーの上に置く。",
  "右手の5本の指はいつも、この位置で待機せよ。",
  "なお、%sをタイプする時は、左手の小指でSHIFTキーを押しながら\n右手の小指で;キーを押す。", // + for 109, : for 101
 ],

 ["SHIFTキーとBSキーについて…",
  "右手で打つキーを大文字にする時は\n左手の小指でSHIFTキーを押しながら打つ。",
  "左手で打つキーを大文字にする時は\n右手の小指でSHIFTキーを押しながら打つ。",
  "1文字打ち直しのための BS(バックスペース)キーは、右手の小指を伸ばして打つ。\n" +
  "右手をホームポジションから外さないよう注意。",
  ],

 ["Enterキーは…",
  "右手の小指を伸ばして打つが、\n右手をホームポジションから外さないよう注意。",
  ],
 [
  "R T Y Uキーについて…",
  "Rは、" + LEC.L.index,
  "Tも、Rと同様に左手の人差し指で。",
  "Uは、" + LEC.R.index,
  "Yも、Uと同様に右手の人差し指で。"
  ],
 [
  "G Hキーについて…",
  "Gは、" + LEC.L.index,
  "Hは、" + LEC.R.index,
  ],

 ["Q W Eキーについて…",
  "Qは、" + LEC.L.pinky,
  "Wは、" + LEC.L.ring,
  "Eは、" + LEC.L.middle,
  ],

 ["%sキーについて…",
  "Iは、" + LEC.R.middle,
  "Oは、" + LEC.R.ring,
  "Pは、" + LEC.R.pinky,
  "%sも、" + LEC.R.pinky, // @ for 109
  ],
 
 ["Z X Cキーについて…",
  "Zは、" + LEC.L.pinky,
  "Xは、" + LEC.L.ring,
  "Cは、" + LEC.L.middle,
  ],
 
 [", . /キーについて…",
  ",は、" + LEC.R.middle,
  ".は、" + LEC.R.ring,
  "/は、" + LEC.R.pinky,
  "また、<は" + LEC.L.shift + LEC.R.middle,
  ">も、" + LEC.L.shift + LEC.R.ring,
  "?も、" + LEC.L.shift + LEC.R.pinky,
  ],
 
 ["V B N Mキーについて…",
  "Vは、" + LEC.L.index,
  "Bも、" + LEC.L.index,
  "Nは、" + LEC.R.index,
  "Mも、" + LEC.R.index,
  ],
 
 ["4 5 6 7キーについて…",
  "4は、" + LEC.L.index,
  "5も、" + LEC.L.index,
  "6は、" + LEC.R.index,
  "7も、" + LEC.R.index,
  ],

 ["%sキーについて…",
  "$は、" + LEC.R.shift + LEC.L.index.split("\n").join(""),
  "%も、" + LEC.R.shift + LEC.L.index.split("\n").join(""),
  "%sは、" + LEC.L.shift + LEC.R.index.split("\n").join(""), // & for 109, ^ for 101
  "%sは、" + LEC.L.shift + LEC.R.index.split("\n").join(""), // ' for 109, & for 101
  ],
 
 ["1 2 3キーについて…",
  "1は、" + LEC.L.pinky,
  "2は、" + LEC.L.ring,
  "3は、" + LEC.L.middle,
  "!は、" + LEC.R.shift + LEC.L.pinky,
  "%sは、" + LEC.R.shift + LEC.L.ring,  // " for 109, @ for 101
  "#は、" + LEC.R.shift + LEC.L.middle,
  ],

 ["8 9 0キーについて…",
  "8は、" + LEC.R.middle,
  "9は、" + LEC.R.ring,
  "0は、" + LEC.R.pinky,
  "%sは、" + LEC.L.shift + LEC.R.middle, // * for 101, ( for 109
  "%sは、" + LEC.L.shift + LEC.R.ring,   // ( for 101, ) for 109
  "%sは、" + LEC.L.shift + LEC.R.pinky,  // ) for 101
  ],

 ["%sキーについて…",
  "-は、" + LEC.R.pinky,
  "%sも、" + LEC.R.pinky,  // = for 101, ^ for 109
  "\\も、" + LEC.R.pinky,
  "%sは、" + LEC.L.shift + LEC.R.pinky,  // _ for 101, = for 109
  "%sも、" + LEC.L.shift + LEC.R.pinky,  // + for 101
  ],
 
 ["%sキーについて…",
  "[は、" + LEC.R.pinky,
  "]も、" + LEC.R.pinky,
  "%sは、" + LEC.R.pinky,  // : for 109, ' for 101
  "{は、" + LEC.L.shift + LEC.R.pinky,
  "}も、" + LEC.L.shift + LEC.R.pinky,
  "%sは、" + LEC.L.shift + LEC.R.pinky,  // * for 109, " for 101
  "%sは、" + LEC.L.shift + LEC.R.pinky,  // _ for 109
  ]
];

let layoutset = () => {
    if (BigHand.leckey) return;

    BigHand.leckey = (ch.layout == 101) ? BigHand.leckey101 : BigHand.leckey109;
    BigHand.direction =
        BigHand.direction.map((seq, lecid) => seq.map((dir, i) => {
            if (dir.indexOf("%s") < 0) return dir;
            if (0 < i) {
                let c = BigHand.leckey[lecid][i - 1];
                return c ? dir.split("%s").join(c) : null;
            }
            return dir.split("%s").join(BigHand.leckey[lecid].join(" ").toUpperCase());

            let from = replacer[0].split("");
             i = from.findIndex(c => dir.indexOf(c) != -1);
            if (i < 0) return dir;
            let to = replacer[1];
            return dir.split(from[i]).join(to[i]);
        }).filter(v => v));
    //layoutset = () => {};
};

BigHand.lecture = function(key) {
    layoutset();
    Keyboard.show(true);
    $("#keyboard .key").removeClass("light");

    let level = BigHand.leckey.map(keys=>keys.map(v=>v?v.split("/").shift():"").join(""))
	.findIndex(keys => keys.indexOf(key[0].toLowerCase()) != -1);

    let lecs = BigHand.direction[level].map((s,i) => {
        let ret = { direction: s, target: i == 0 ? null : BigHand.leckey[level][i - 1] };
        if (!ret.target || ret.target.indexOf("/") <= 0) return ret;
        let p = ret.target.split("/");
        ret.target = p.pop();
        ret.targetv = p.shift();
        if (ret.target == "") { ret.char = 1; ret.target = ret.targetv; }
        return ret;
    });

    let cancel = 0;
    const lec_section = function() {
        if (lecs.length == 0) {
            $("#lecture").text("");
            return Draw.sequence([{t:"以上。"}]);
        }

        let p = lecs.shift();
        $("#lecture").html(p.direction.split("//").join("<br />"));
        if (!p.target) return jwait(lec_section);

        // d  : ("dD", [])  dを打て
        // D  : ("D", [])   Dをタイプ
        // sp : (" ", [20]) スペースバー
        // BS : ("\x08", [8]) BSキー
        // En : ("\x0d", [13]) Enterキー

        Dialog("(" + p.target + "を" + (p.char ? "タイプせよ" : "打て") + ")", "keywait");
        keywait(
            () => {
                $(window).unbind().keyup((e) => {
                    Keyboard.light(e.key, false);
                    lec_section();
                });
            },
            p.targetv || (p.target + p.target.toUpperCase()),
            (!p.targetv || p.char) ? [] : [p.targetv.charCodeAt(0)],
            (c) => {
                if (c.toLowerCase() != "f") { cancel = 0; return; }
                cancel++;
                if (4 <= cancel) wandering();
            },
        );
    };

    Draw.sequence([
	{d:lecs.shift().direction}, 
	{func:() => { $(window).keyup(lec_section); }},
	{wait:true},
    ]);
};

BigHand.practice = function(level) {
    let timer = {
        sec: 0,
        handler: null,
    };
    let uchiowari = function(mistype, sec) {
        //clearInterval(timer.handler);
        let misrate = Math.round(100 * mistype / 88);
        let speed = Math.round(88 * 600 / 5 / sec);
	let exp = (misrate > 20) ? 0 : parseInt(speed / 10 * (mistype == 0 ? 2 : 1) + 6);
        if (exp) {
            ch.exprc += exp;
            ch.score.push([speed, misrate, level]);
            ch.score = ch.score.slice(-20);
        }

        let seq = [
	    {t: (exp ? ("スピード: " + speed + "ワード/m") : "(ミスタイプが多すぎる)")
             + "\n"
	     + ("ミスタイプ: " + mistype + "字(" + misrate + "%)")},
	    {func:() => {
		$("#longscript").hide();
		Draw.status();
	    }},
	    exp ? {t:"経験値許容度が " + exp + "pt.増えた。"} : null,
            {d:"続けるかい?", confirm:true},
            {func:go_into_practice},
	    {wait: true}
	];

	Draw.sequence(seq);
    };

    const escape = function() {
        clearInterval(timer.handler);
	$("#longscript").hide();
	wandering();
    };
    const go_into_practice = function() {
        $("#longscript").show();
        let battle = {
            jumon: Spellcast.make({level:level}),
            jumonline: 2,
            uchiowari: uchiowari,
            type: "bighand",
	    escape: escape,
        }
        Jumongaeshi(2, battle);
        timer.sec = 0;
        timer.handler = setInterval(() => {
            timer.sec++;
        }, 100);
    };

    Draw.sequence([
	{d:"試してみるかね?", confirm:true},
	{func:go_into_practice},
	{wait:true},
    ]);

}

BigHand.gate = function(level) {
    CLOG("gate");
    if (ch.lostkey.split("+").shift().split("")
	.every(key => Keyboard.clevel([0, level]).indexOf(key) < 0)) return true;
    CLOG("NG");
    let to = ch.towhere(-1);
    if (Map.kabe(to)) return;
    ch.x = to.x;
    ch.y = to.y;
    Draw.map();
};

// ユーザデータ表示
BigHand.score = function() {
    $("#score").show();
    $("#graph .level") .each(function(i) { $(this).css("left", i * 24); });
    $("#graph .miss")  .each(function(i) { $(this).css("left", i * 24 + 8); });
    $("#graph .speed") .each(function(i) { $(this).css("left", i * 24 + 9); });
    $("#graph .yscale").each(function(i) { $(this).css("bottom", i * 20 - 8); })
        .removeClass("target").eq(ch.targetspeed).addClass("target");
    $("#graph .xaxis") .each(function(i) { $(this).css("bottom", i * 20); })
        .removeClass("target").eq(ch.targetspeed).addClass("target");
    $(".miss, .speed, .level").hide();

    ch.score.map((v,i) => {
        let level = v[2];
        let miss = v[1];
        let speed = v[0];
        $(".level").eq(i).show().text((level < 15) ? level : " *");
        $(".miss").eq(i).show().css("height", miss * 2);
        $(".speed").eq(i).show().css("bottom", speed * 2 - 3);
    });

    let svg = ch.score.map(
        (v, i, self) =>
            (i == 0) ? ("m 12," + (160 - v[0] * 2))
            : ("l 24," + (self[i - 1][0] - v[0]) * 2)).join(" ");

    let scr = ch.score;
    let avg = scr.reduce((sum, v) => sum + v[0], 0) / (scr.length || 1);

    $("#linegraph").attr("d", svg);
    $("#avgscore").text(parseInt(100 * avg) / 100);

    keytype([{c:"F", ontype:() => {
        $("#score").hide();
        wandering();
    }}]);
}
