// キーショップ
let KeyShop = function(param) {
    const sellable = () => ch.lostkey.split("+").shift().split("")
	  .filter(key => Keyboard.clevel(param.level).indexOf(key) != -1)
	  .slice(0, 5);
    
    if ((ch.lostkey.length == 0) || (sellable().length == 0)) {
	Dialog(param.none || "キーショップですが、//お売りできるキーはもうないようです。");
        return false;
    }

    let menu = () => {
	let keys = sellable();
	let opt = keys.map(c => {
            return ("<span style='display:inline-block; width:80px;'>" + c + "キー</span>" + Keyboard.price(c) + " spc");
        });
        opt.unshift("終了");
        let callback = keys.map(c => {
            return function() {
		if (ch.spice < Keyboard.price(c)) {
		    return Dialog(param.short || "スパイスが足りないようですね。");
		}
                ch.spice -= Keyboard.price(c);
		ch.lostkey = ch.lostkey.split(c).join("");
		Draw.status();
		let seq = [
                    {d:"ありがとうございます。//では、この" + c + "キーを//お取り付けいたしましょう。"},
		    {d:"他にご入り用は?", thru:true},
		    {func:menu},
		    {wait:true},
		];
                if (sellable().length == 0) seq = seq.slice(0, 1);
		Draw.sequence(seq);
            };
        });
        callback.unshift(() => { wandering(); });
        CLOG(opt, callback);
        submenu(opt, callback, "keyshop");
    };
    Draw.sequence([
	{d:(param.guide || "キーショップですよ。")}, 
	{func:menu},
	{wait:true},
    ]);
    return true;
};


const isKana = () => location.pathname.indexOf("kanador") != -1;

let ObjKeyboard = function() {

    const KEYALIGN109 =
          "*1234567890-^\\**" +
          "*QWERTYUIOP@[***" +
          "*ASDFGHJKL;:]***" +
          "*ZXCVBNM,./_****" +
          "** **";

    const KEYALIGN109_S =
          ".!\"#$%&'().=~|.."+
          ".qwertyuiop`{..." +
          ".asdfghjkl+*}..." +
          ".zxcvbnm<>?_...." +
          ".. ..";

    const KEYALIGN109K =
          "*ﾇﾌｱｳｴｵﾔﾕﾖﾜﾎﾍｰ**" +
          "*ﾀﾃｲｽｶﾝﾅﾆﾗｾﾞﾟ***" +
          "*ﾁﾄｼﾊｷｸﾏﾉﾘﾚｹﾑ***" +
          "*ﾂｻｿﾋｺﾐﾓﾈﾙﾒﾛ****" +
          "** **";
    
    const KEYALIGN109K_S =
          "*ﾇﾌｧｩｪｫｬｭｮｦﾎﾍｰ**" +
          "*ﾀﾃｨｽｶﾝﾅﾆﾗｾﾞ｢***" +
          "*ﾁﾄｼﾊｷｸﾏﾉﾘﾚｹ｣***" +
          "*ｯｻｿﾋｺﾐﾓ､｡･ﾛ****" +
          "** **";
    const KEYALIGN101 =
          "`1234567890-=***" +
          "*QWERTYUIOP[]\\**" +
          "*ASDFGHJKL;'****" +
          "*ZXCVBNM,./*****" +
          "** **";

    const KEYALIGN101_S =
          "~!@#$%^&*()_+..."+
          ".qwertyuiop{}|.." +
          ".asdfghjkl:\"...." +
          ".zxcvbnm<>?....." +
          ".. ..";

    const KEYLEVEL109 =
          "FBBBAAAACCCDDD3*" +
          " 55533336666EA**" +
          " 1111442222EE***" +
          "37779999888E3***" +
          "  2  ";
    const KEYLEVEL101 =
          "FBBBAAAACCCDD3**" +
          " 5553333666EED**" +
          " 1111442222EA***" +
          "377799998883****" +
          "  2  ";

    let layout = isKana() ? 109 : ch.layout;
    const KEYALIGN = (layout == 101) ? KEYALIGN101 : KEYALIGN109;
    const KEYALIGN_S = (layout == 101) ? KEYALIGN101_S : KEYALIGN109_S;
    const KEYLEVEL = (layout == 101) ? KEYLEVEL101 : KEYLEVEL109;

    // キーボード表示
    this.show = function(for_lecture)
    {
        $(".key").removeClass("lost").removeClass("light");
        let lostkey = ch.lostkey.split("+");
        lostkey.shift().split("").forEach(c => {
            let index = KEYALIGN.indexOf(c);
            if (index < 0) return;
            $(".keyrow").eq(parseInt(index / 0x10))
                .children(".key").eq(index % 0x10).addClass("lost");
        });
        lostkey.forEach(key => {
            const pos = {esc:[[0,0]], bs:[[0,-1]], enter:[[1,-1],[2,-1]], shift:[[3,0],[3,-1]],};
            (pos[key]||[]).map(v => $(".keyrow").eq(v[0]).children(".key").eq(v[1]).addClass("lost"));
        });
        $("#keyboard").show();

        if (layout == 101) {
            $(".keyrow").each(function(row) {
                if (row == 0) {
                    $(this).find(".key").eq(14).css("width","40px");
                    $(this).find(".key").eq(13).hide();
                }
                if (row == 1)
                    $(this).find(".enterkey").removeClass("enterkey");
                if (row == 2)
                    $(this).find(".key").eq(12).css("width","44px").text("Enter");
                if (row == 3) {
                    $(this).find(".key").eq(12).css("width","62px");
                    $(this).find(".key").eq(11).hide();
                }
            });
        } else {
            //$(".keyrow div").addClass("key");//.css("width","");
        }
        $(".keyrow").each(function(row) {
            $(this).find(".key").each(function(i) {
                let pos = 0x10 * row + i;
                let c = isKana() ? KEYALIGN109K[pos] : KEYALIGN[pos];
                if (c == "*") return;
                $(this).text(c);
                let cx = isKana() ? KEYALIGN109K_S[pos] : KEYALIGN_S[pos];
                if (cx.toUpperCase() == c || cx == ".") return;
                $(this).html("<span>" + c + "</span><span>" + cx + "</span>");
            });
        });

        $("#lecture").text("");
        if (for_lecture) return $("#kbclose").show();
        $("#kbclose").hide();
        {
            let $top = $("#submenubox").show();
            let $opt = $top.find(".menuoption");
            let jm = 0;
            let cancel = 0;
            let input = false;

            // Pressイベントの走らないキー:Escape,Backspace,Shift,Tab,Control,Alt
            let event = "Escape,Alt,Tab,CapsLock,Control,Shift,Backspace,Enter"
                .split(",").map(key => { return {
                    k: key, ontype:(e) => {
                        //Keyboard.light(e.key, true);
                        if (!input || e.key != "Backspace" || ch.lostkey.indexOf("+bs") != -1) return;
                        text_edit(e.key);
                    }
                }});
            event.push({ k:" ", ontype: (e) => {
                if (input) return;
                jm = (jm + 1) % 2;
                $opt.removeClass("selected").eq(jm).addClass("selected");
            }}, {c:"any", ontype:(c) => {
                //Keyboard.light(c, true);
                let c0 = c.toLowerCase();
                if (input) {
                    text_edit(c);
                    if (c0 != "f") { cancel = 0; return; }
                    cancel++;
                    if (4 <= cancel) wandering();
                    return;
                }
                if (c0 == "j") {
                    input = true;
                    $top.hide();
                    if (jm == 0) return wandering();
                    text_edit("");
                    return $("#kbclose").show();
                }
            }});

            const text_edit = (c) => {
                let $cursor = '<span style="background-color:white">_</span>';
	        let txt = $("#lecture").text().slice(0,-1);
                if (c == "Backspace")
                    $("#lecture").text(txt.slice(0,-1));
                else {
                    if (c == "Enter") c = "\n";
	            $("#lecture").text(txt + this.tokana(c));
                }
                $("#lecture").append($cursor);
            };
            let upevent = (e) => Keyboard.light(e.key, false);
            const downevent = (e) => Keyboard.light(e.key, true);

            submenu(["終了","試し打ち"],[], true);
            keytype(event, true, upevent, downevent);
        }

    };

    //シフト押下時の文字
    this.shift = function(s)
    {
        return s.split("").map(c => {
            let index = KEYALIGN.indexOf(c);
            if (index < 0) return 0;
            let shift = KEYALIGN_S[index];
            return (shift == ".") ? "" : shift;
        }).join("");
    };
    
    //シフト押下前の文字
    this.unshift = function(s)
    {
        return s.split("").map(c => {
            let index = KEYALIGN_S.indexOf(c);
            if (index < 0 || c == ".") return c;
            let key = KEYALIGN[index];
            return (key == "*") ? "" : key;
        }).join("");
    }

    this.light = function(c, is_on)
    {
        let $domset = (r, i) =>
            $(".keyrow").eq(r).children(".key").eq(i)[is_on ? "addClass" : "removeClass"]("light");

        let pos = [KEYALIGN.indexOf(c)];
        if (c == "*" || pos[0] < 0) pos = [KEYALIGN_S.indexOf(c)];
        if (pos[0] < 0) pos = (() => {
            // Pressイベントの走らないキー:Escape,Backspace,Shift,Tab,Control,Alt
            let i = "Escape,Backspace,Shift,Tab,Control,Alt,Enter".split(",").indexOf(c);
            if (i < 0) return [];
            return [[0x00], [0x0e], [0x30, 0x3c], [0x10], [0x40, 0x44], [0x41, 0x43],
                    [layout == 101 ? 0x2c : 0x1d]][i];
        })();

        pos.forEach(index => $domset(parseInt(index / 0x10), index % 0x10));
    };

    // キー価格
    this.price = function(c) {
        let index = KEYALIGN.indexOf(c);
        if (index < 0) return 0;
        let level = parseInt("0x" + KEYLEVEL[index]);
        if (!level) return 0;
        return [20,30,40,45,50,60,65,70,80,85,90,95,100,105][level - 1] || 0;
    };

    // list[位置] = キーコード
    this.keycodelist = function()
    {
        let list = KEYALIGN.split("").map(c => c == "*" ? -1 : c.charCodeAt(0));
        list[0x00] = 0x1b; // Esc
        list[0x0e] = 0x08; // BS
        list[0x10] = 0x09; // Tab
        list[layout == 101 ? 0x2c : 0x1d] = 0x0d; // Enter
        list[0x20] = 0xf0; // Caps
        list[0x30] = 0x10; // shift
        list[0x3c] = 0x10; // shift
        list[0x40] = 0x11; // Ctrl
        list[0x41] = 0x12; // Alt
        list[0x43] = 0x12; // Alt
        list[0x44] = 0x11; // Ctrl
        return list;
    };

    // 指定レベルのキーが揃っているか
    this.check = function(level, s)
    {
        return s.split("").some(c => {
            let index = KEYALIGN.indexOf(c);
            if (index < 0) return;
            return (level == parseInt("0x" + KEYLEVEL[index]));
        });
    };

    // 指定レベルのキー文字
    this.clevel = function(range)
    {
	let max = range;
	let min = range;
	if (Array.isArray(range)) [min, max] = range;
	CLOG("key.clevel=", max,min);
        return KEYALIGN.split("").filter((c,i) => {
            let l = parseInt("0x" + KEYLEVEL[i]);
            return (c != "*") && (l <= max) && (min <= l);
        }).join("");
    };
    
    this.changelayout = function(layout)
    {
        const MAPPING = ["^:_@".split(""), "='`".split("").concat("+at")];
        const from = layout == 101 ? MAPPING[0] : MAPPING[1];
        const into = layout == 101 ? MAPPING[1] : MAPPING[0];
        ch.lostkey = ch.lostkey.split("+").map((k,n)=> {
            if (n) {
                let i = from.indexOf("+" + k);
                return i < 0 ? ("+" + k) : into[i];
            }
            return k.split("").map(c => {
                let i = from.indexOf(c);
                return i < 0 ? c : into[i];
            }).sort((a,b) => a.length-b.length).join("");
        }).join("");
        ch.layout = layout;
    };

    this.pick = (key, replacer) => {
	const seq = [
            {t:(key + "キーが落ちている。拾いますか?"), confirm:true},
	    {func: () => {
		ch.lostkey = ch.lostkey.split("+" + key.toLowerCase()).join("");
		Map.replace(replacer);
            }},
	    {t:(key + "キーを拾いキーボードに取り付けた。"), thru:true},
	];

        Draw.sequence(seq);
    };
    
    this.stolen = () => {
        const keys = KEYALIGN.split("").filter(c => "FJ `*SPARE".indexOf(c) < 0);
        let c = keys[GetRand(keys.length)];
        if (ch.lostkey.indexOf(c) != -1) return false;
        ch.lostkey += c;
        return true;
    };

    // 入力された英数字のかな化
    this.tokana = (s) => {
        if (!isKana()) return s;
        return s.split("").map(c => {
            let index = KEYALIGN109.toLowerCase().indexOf(c);
            if (0 <= index) return KEYALIGN109K[index];
            index = KEYALIGN109_S.toUpperCase().indexOf(c);
            if (0 <= index) return KEYALIGN109K_S[index];
            return c;
        }).join("");

    };
};
let Keyboard = new ObjKeyboard();

// キーボード入力(メインメニュー・大きな手)
// 文字列s・配列keycodes内のいずれかのキーが打たれたらcallback実行
// 指定外の文字が打たれればcancel実行
const keywait = function(callback, s, keycodes = [], cancel) {
    CLOG("wait" , keycodes, s);
    if (!cancel) cancel = () => {};

    $(window).unbind().keydown(function(e){
        Keyboard.light(e.key, true);
        if (keycodes.indexOf(e.keyCode) == -1) return;
        callback();
        s = "";
    })
    .keyup(function(e){
        Keyboard.light(e.key, false);
    })
    .keypress(function(e){
        if (s.indexOf(e.key) == -1) return cancel(e.key);
        callback();
        keycodes = [];
    });
};

const keytype = function(option, is_upwait, upevent, downevent) {
    is_upwait = option.some(v => v.c);

    $(window).unbind().keyup(function(e){
        is_upwait = false;
        if (upevent) upevent(e);
    }).keypress(function(e) {
        if (is_upwait) return;
        let c = e.key;
        let k = c.toUpperCase();
	let k0 = Keyboard.unshift(k);
	let fkey = ch.lostkey.split("+");
	let lostkey = fkey.shift();
        if (lostkey.indexOf(k) != -1 || lostkey.indexOf(k0) != -1) return;
	if (fkey.indexOf("shift") != -1 && e.shiftKey) c = k0.toLowerCase();
        let opt = option.find(v => v.c && (v.c.toUpperCase() == k || v.c == "any"));
        if (!opt) return;
        if (opt.c == "any" && ch.jt.indexOf("m") != -1) {
            c = GetRand(2) < 1 ? c.toUpperCase() : c.toLowerCase();
        }
        opt.ontype(opt.c == "any" ? c : e);
    }).keydown(function(e) {
        let opt = option.find(v => v.k && v.k.toUpperCase() == e.key.toUpperCase());
        if (opt) opt.ontype(e);
        if (downevent) downevent(e);
    });
};



var keywait0 = function(callback, s, keycodes) {
    $(window).unbind();

    let keyarr = Keyboard.keycodelist();

    var is_alnum = function(c) {
        if (0x30 <= c && c <= 0x39) return true;
        if (0x41 <= c && c <= 0x5a) return true;
        if (c == 0x20) return true;
    };

    var keylight = function(index, is_on) {
        var t = $(".keyrow").eq(parseInt(index / 0x10))
        .children(".key").eq(index % 0x10);
        //t.css("background-color", is_on ? "green" : "yellow");
    };

    $(window)
    .keydown( function(e){
        CLOG(e);//JSON.stringify(e));
        var c = e.keyCode;
        //CLOG(c);
        var index = keyarr.indexOf(c);
        if (index < 0) return;

        // 英数字
        if (is_alnum(c)) {
            keylight(index, true);
        }
        
        // 文字の出ない機能系
        if ((0 < index) && ((c < 0x20) || (0x5a < c))) {
            keylight(index, true);
            //return false;
        }
        // 記号系
        
        //コールバック
        if (c != keycode) return;
        callback();
    })

    .keyup(function(e){
        //CLOG(e);//JSON.stringify(e));
        var c = e.keyCode;
        var index = keyarr.indexOf(c);
        if (index < 0) return;
        
        // 英数字
        if (is_alnum(c)) {
            keylight(index, false);
            return false;
        }
        // 文字の出ない機能系
        if ((0 < index) && ((c < 0x20) || (0x7f < c))) {
            keylight(index, false);
            return false;
        }
        // 記号系は取り敢えず全消し
        var symbols = [0xb, 0xc, 0xd, 0x1b, 0x1c, 0x2a, 0x2b, 0x2c, 0x38, 0x39, 0x3a, 0x3b]
            .map(pos => keylight(pos, false));

        return;
    })
    .keypress( function(e){ 
        //入力文字の表示
        var c = (e.charCode) ? e.charCode : e.keyCode;
        CLOG(e);//JSON.stringify(e));
        var index = keyarr.indexOf(c);
        if (index < 0) return;
        if (0x20 <= c && c < 0x80) {
            $("#typed").append(String.fromCharCode(c));
        }
        if ((0x30 <= c && c <= 0x39) || (0x41 <= c && c <= 0x5a)) {
            return;
        }
        
        var keypos101 = [0xb,0xc,0xd,0x1b,0x1c,0x2a,0x2b,0x2c,0x38,0x39,0x3a,0x3b];
        var keypos106 = [0xb,0xc,0xd,0x1b,0x1c,0x2a,0x2b,0x2c,0x38,0x39,0x3a,0x3b];
        var keychar = "=-~^\\|@`[{;+:*]}<,>./?_";
        
        // 記号系
        var index = keychar.indexOf(String.fromCharCode(c));
        CLOG(index);
        if (0 <= index) {
            keylight(keypos106[parseInt(index/2)], true);
        }
        
        //コールバック
        if (c != keycode) return;
        callback();
        return;
    });
};
