
let Item = function()
{
    const ITEMS = [
        null,
        {name:"ケムリ苔", price:[15,10]},
        {name:"砲丸豆",   life:[7,9],     price:[10,  7]},
        {name:"クムの実", life:[13,18],   price:[20, 15]},
        {name:"着色タラコ", life:[21,30], price:[40, 30]},
        {name:"おにぎり",   life:[3,3],   price:[ 0 ,  3]},
        {name:"佃煮",       life:[5,6],   price:[200,120]},
        {name:"立喰いソバ", life:[82,112],price:[200,150]},
        {name:"豚イモ",     life:[9,12],  price:[ 0 ,  9]},
        {name:"星チーズ",   life:[11,15],  price:[ 15, 10]},
        {name:"空気アメ",   life:[15,18],  price:[ 0 , 13]},
        {name:"煮干",       life:[15,20],  price:[ 0 , 15]},
        {name:"キノコナッツ", life:[20,20], price: [ 0 , 18]},
        {name:"水晶",       price: [0,3]},
        {name:"博士のメモ", price: [0,0]},
        {name:"タマオリン", price: [45,33]},
        {name:"◆AKARI"},
        {name:"◆DASSHUTU"},
        {name:"◆KOUGEKI"},
        {name:"◆MAKE BED"},
        {name:"◆MATI"},
        {name:"◆NAOSU"},
        {name:"◆NIGERU"},
        {name:"◆SPARE"},
        {name:"◆TAIRYOKU",life:[65,95],},
    ];
    // "kgmcs" -> {name,price}
    this.spec = function(id) {
	if (!Array.isArray(id)) return ITEMS[id];
	return id.map(v => {
            let i = "kgmc  s       t".indexOf(v);
            return (i < 0) ? {} : ITEMS[i + 1];
        });
    };
    // "kgmcs" -> ch.invent.concat(id)
    this.add = function(items) {
        if (32 < ch.invent.length + items.length)
            return false;
        ch.invent = ch.invent.concat(items.map(v => {
	    if (ITEMS[v]) return v;
            let i = "kgmc  s       t".indexOf(v);
            if (i != -1) return (i + 1);
	    return {"onigiri":5,"tsukuda":6,"cheese":9,
                    "pig":8,"air":10,"niboshi":11,"nuts":12,
                    "memo":14,"crystal":13}[v];
        }).filter(v => v));
        return true;
    };
    this.remove = function(id) {
	let v = {"tsukuda":6, "memo":14}[id];
	let i = ch.invent.indexOf(v);
	if (i != -1) ch.invent.splice(i,1);
    };
    this.has = function(id) {
	let v = {"tsukuda":6, "memo":14}[id];
	return ch.invent.indexOf(v) != -1
    };
    
    this.use = function(item_id, inbattle) {
        // ケムリ苔
        if (1 == item_id) {
            return ch.cure();
        }
        // 回復アイテム
        if (item_id <= 12) {
            return ch.supply(this.spec(item_id).life);
        }

        // 水晶
        if (13 == item_id) {
            if (Map.is_front_of_doors()) {
                TextBar("鍵が外れた。");
                //ch.wall.push([ch.map, ch.towhere()]);
                return true;
            }
            TextBar("何も起こらない。");
            return false;
        }

        // 博士のメモ
        if (14 == item_id) {
            TextBar("何も起こらない。");
            return false;
        }

        // タマオリン
        if (15 == item_id) {
            if (ch.chattable) {
                TextBar("もう飲めない。");
                return false;
            }

            ch.chattable = true;
            TextBar("チャト効果が現れた。");
            Draw.outfits();

            return true;
        }
        // 呪文書
        if (16 <= item_id) {
            TextBar(inbattle ? "何も起こらない。"
                    : "呪文書は唱えることにより効果を発揮する。");
            return false;
        }
        return false;
    };
};

let ShojihinMenu = function()
{
    let mode = {};

    let nothing = (done) => {
        if (0 < ch.invent.length) return;
        TextBar("何も持っていない。");
        jwait(done || wandering);
        return true;
    };

    let show_inventory = function() {
        $("#item").css({left: ""});
        $("#inventory").show().removeClass("battle");

        if (mode.action == "battle") {
            $("#inventory").addClass("battle");
            $("#inventory_sellmenu, #inventory_menu").hide();
        } else if (mode.action == "sell") {
            $("#inventory_menu").hide();
            $("#inventory_sellmenu").show();
        } else {
            $("#inventory_menu").show();
            $("#inventory_menu .menuoption").removeClass("checked selected");
            $("#inventory_sellmenu").hide();
        }
        redraw_items();
    };

    const redraw_items = function() {
        $("#item td").text("").removeClass("checked selected");
        ch.invent.map((v,i) => {
            if (!v) return;
            // 行列入れ替え
            let j = parseInt(i / 8) + (i % 8) * 4;
            $("#item td").eq(j).text(Items.spec(v).name);
        });
    };

    // 操作選択
    //[ "終了","使う","移動","ソート","捨てる",("売る"),("所持品使用") ]
    const select_operation = function() {
        if (nothing(mode.cancel)) return;

	if (mode.action == "sell") {
            TextBar("どの品を?");
            return item_table();
        }

	if (mode.action == "battle") {
            return item_table();
        }

	let jm = 0;
        const $obj = $("#inventory_menu .menuoption");
        $obj.removeClass("checked selected").eq(jm).addClass("selected");
        $("#item td").removeClass("checked selected");

        keytype([{
            k:"F", ontype: () => {
                $("#inventory").hide();
                wandering();
            }
        }, {
            k:" ", ontype: (e) => {
                jm = (e.shiftKey ? (jm - 1 + $obj.size()) : (jm + 1))
                    % $obj.size();
                $obj.removeClass("selected").eq(jm).addClass("selected");
            }
        }, {
            k:"J", ontype: () => {
                // 終了
                if (jm == 0) {
                    $("#inventory").hide();
                    return wandering();
                }
                // ソート
                if (jm == 3) {
                    ch.invent.sort((a, b) => (a - b));
                    return redraw_items();
                }

                $obj.removeClass("selected").eq(jm).addClass("checked");
                mode.action = ["use", "move", "sort", "discard"][jm - 1];
                item_table();
            }
        }]);
    };


    // 所持品選択
    const item_table = function() {
        let jm = 0;
        let cliph = -1;
        const $obj = $("#item td");
        
        const jcursor = (nth, s) => {
            if (nth < 0) return $obj.removeClass("selected checked");
            let idx = parseInt(nth / 8) + (nth % 8) * 4;
            $obj.removeClass("selected").eq(idx).addClass("selected");
            if (s)
                $obj.eq(idx).addClass("checked").removeClass("selected");
        };

        const remove = (nth) => {
            ch.invent.splice(nth, 1);
            redraw_items();
            if (nothing(mode.cancel)) return jcursor(-1);
            select_item();
        };

        const action = {
            use: () => {
                if (Items.use(ch.invent[jm])) {
                    remove(jm);
                }
            },
            battle: () => {
                jcursor(jm, "checked");
                if (Items.use(ch.invent[jm], true)) {
                    ch.invent.splice(jm, 1);
                }
                return mode.done();
            },
            move: () => {
                if (cliph < 0) {
                    cliph = jm;
                    return jcursor(cliph, "checked");
                }
                let item = ch.invent[cliph];
                ch.invent.splice(cliph, 1);
                cliph = -1;
                ch.invent.splice(jm, 0, item);
                redraw_items();
                jcursor(jm);
            },
            discard: () => {
                TextBar(Items.spec(ch.invent[jm]).name + "を捨てた。");
                remove(jm);
            },
            sell: () => {
                let item_id = ch.invent[jm];
                jcursor(jm, "checked");
                let spc = (item_id >= 16) ? 22 : Items.spec(item_id).price[1];
                let onyes = () => {
                    TextBar(Items.spec(item_id).name + "を売った。");
                    ch.spice += spc;
                    Draw.status();
                    remove(jm);
                };
		let onno = () => {
                    Dialog("他には?", () => {
			jcursor(-1);
			select_item();
		    });
                };
                
                Dialog(spc + "スパイスでいかがでしょう。",
		       () => { submenu(["Yes", "No"], [onyes, onno]); });
            },
        };
        
        let select_item = function() {
            const cancel = mode.cancel || select_operation;

            if (ch.invent.length <= jm) {
                jm = ch.invent.length - 1;
            }
            jcursor(jm);

            keytype([{
                k:"F", ontype: () => {
                    jcursor(-1);
                    cancel();
                }
            }, {
                k:" ", ontype: (e) => {
                    let havnum = ch.invent.length;
                    jm = (e.shiftKey ? (jm - 1 + havnum) : (jm + 1)) % havnum;
                    jcursor(jm);
                    if (mode.action == "battle") {
                        $("#item").css("left", (20 - 130 * parseInt(jm / 8)) + "px");
                    }
                }
            }, {
                k:"J", ontype: () => { action[mode.action](); }
            }]);
        };

        select_item();
    };


    this.menu = function() {
        mode = {action: "list"};
        show_inventory();
        return select_operation();
    };

    this.battle = function(callback) {
	mode = callback;
	mode.action = "battle";
	show_inventory();
        return select_operation();
    };

    this.sell = function() {
	mode = {};
	mode.action = "sell";
        mode.cancel = wandering;
	const seq = [
	    {d:"不要になった品物がございましたら//買い取りますが…。",
	     confirm:true },
            {func: () => {
		show_inventory();
		select_operation();
	    }},
	    {wait:true},
	];
	Draw.sequence(seq);
    };
};

// 呪文書を読む
const Jumonsho = function(callback)
{
    let myscript = "";
    const dump_myscript = () => {
        const $cursor = '<span style="background-color:#0f0">_</span>';
        $("#myscript").text("◆ " + myscript).append($cursor);
    };

    if (!callback) callback = {done: wandering, cancel: wandering, mode:"normal"};
    $("#scriptbook").show();

    let execute = (input) => {
        let scriptbook = "◆" + input.toUpperCase().split(" ").join("");
        let i = ch.invent.findIndex(v => Items.spec(v).name.split(" ").join("") === scriptbook);
        if (i < 0) return TextBar("その呪文書は持っていない。");
        const exhaust = () => ch.invent.splice(i, 1);
        let item = ch.invent[i];

        TextBar(Items.spec(item).name + "を唱えた。");
        jwait(() => {
            if (use_scriptbook(item - 16)) {
                if (item == 20) return Map.town(exhaust); // MATI
                exhaust();
                $("#scriptbook").hide();
                if (item == 18) return callback.attack(); // KOUGEKI
                if (item == 22) return callback.runaway(); // NIGERU
            } else {
                TextBar("何も起こらない。");
            }
            (callback.done || wandering)();
        });
    };

    let use_scriptbook = function(id) {

	let inbattle = (callback.mode == "battle");
	
	let onscript = [
	    // AKARI
	    (ch.dark && !inbattle) ? () => {
		ch.dark = false;
		TextBar("暗闇の暗示が解けた。");
		Draw.map();
		Draw.status();
		return true;
	    } : false,

            // DASSHUTU
            () => {
		if (inbattle) return false;
		if (!ch.lastwarp) return false;
		if (ch.map != 5 && ch.map != 1) return false;
		let from = ch.lastwarp.from;
		ch.lastwarp = null;
		Map.jump({map:from[0], loc:from.slice(1)});
		return true;
            },

            // KOUGEKI
            () => inbattle,

            // MAKE BED
            () => Map.make_bed(),
	    
            // MATI
            () => !inbattle,

            // NAOSU
            () => ch.cure(true),

            // NIGERU
            () => inbattle,

            // SPARE
            (ch.lostkey.length) ? () => {
                if (!ch.lostkey.split("+").shift().length) return;
		TextBar(ch.lostkey[0] + "キーを補充した。");
		ch.lostkey = ch.lostkey.slice(1);
		return true;
            }: false,
	    
            // TAIRYOKU
            () => ch.supply(Items.spec(id + 16).life),
	];

	let onuse = onscript[id];
	return onuse ? onuse() : false;
    };

    keytype([{
        c:"F", ontype: () => {
            (callback.cancel || wandering)();
            $("#scriptbook").hide();
        }
    }, {
        c:"Enter", ontype: () => {
	    if (ch.lostkey.indexOf("+enter") != -1) return;
            execute(myscript, callback.done);
        }
    }, {
        c:"any", ontype: (c) => {
            if (10 <= myscript.length) return;
            myscript += c;
            dump_myscript();
        }
    }, {
        k:"Backspace", ontype: () => {
            if (myscript.length == 0) return;
	    if (ch.lostkey.indexOf("+bs") != -1) return;
            myscript = myscript.slice(0, -1);
            dump_myscript();
        }
    }], true);

    dump_myscript();
};

// 買い物カゴ
var ObjKago = function()
{
    const KAGOMAX = 10;
    this.bucket = [];
    this.taken = false;
    this.set = function(sym) {
        //let sym = Map.symbol(ch.towhere());
        let item = Items.spec([sym]).shift();
        TextBar(item.name + "(一個 " + item.price[0] + "spc)がある。");
        if (!this.taken) return wandering();
        jwait(() => { haikai(); });

        // 籠の徘徊
        var haikai = () => {
            var kago = this;
            let busket = this.busket;
            let options = ["商品を取る", "終了"];
            var jm = 0;
            var sln = 0;
            var $top = $("#kagobox").show();
            var $opt = $top.find(".menuoption");
            var redraw = () => {
                sln = this.busket.length + 2;
                if (sln <= jm) jm = kago.busket.length + 1;
                $opt.hide();
                options.map((v,i) => $opt.eq(i).show().text(v));
                $opt.removeClass("selected").eq(jm).addClass("selected");
                //console.log(this.busket);
                let list = Items.spec(this.busket);
                list.map((v, i) => $opt.eq(i + 2).text(v.name).show());
                let spc = list.reduce((sum, v) => sum + v.price[0], 0);
                $("#kagosum").text(spc + " spc")
            };
            $("#jtext").hide();
            redraw();

            keytype([{
                c:"J", ontype: () => {
                    if (jm == 1) { // 終了
                        $top.hide();
                        return wandering();
                    }
                    if (jm == 0) { // 追加
                        if (KAGOMAX <= kago.busket.length) {
                            return TextBar("カゴが一杯で入らない。");
                        }
                        kago.busket.push(sym);
                        return redraw();
                    }
                    // 削除
                    kago.busket.splice(jm - 2, 1);
                    return redraw();
                }
            }, {
                c:" ", ontype: (e) => {
                    jm = (e.shiftKey ? (jm - 1 + sln) : (jm + 1)) % sln;
                    $opt.removeClass("selected").eq(jm).addClass("selected");
                }
            }]);
            return;
        };
    };

    this.toggle = function () {
        this.taken = !this.taken;
        TextBar(this.taken ? "カゴを取った。" : "カゴを置いた。");
        if (this.taken) this.busket = [];
        wandering();
    }

    this.off = function() {
        if (this.taken) {
            this.toggle();
        }
    }

    this.casher = function(message, fulload) {
        message = message || {
            confirm: "全部で[spc]spc.です。",
            done: "ありがとうございます。",
            error: "荷物がいっぱいです。",
            short: "スパイスが足りないようです。",
        };
        if (!this.taken || (0 == this.busket.length)) return;
        //var shoji = Shojihin("spec");
        let spc = (Items.spec(this.busket) || [])
            .reduce((sum, v) => sum + v.price[0], 0);
        let confirm = (message.confirm || "[spc]").split("[spc]").join(spc.toString());
        let onyes = () => {
            if (ch.spice < spc) {
                return Dialog(message.short);
            }
            let done = Items.add(this.busket);
            Dialog(done ? message.done : message.error);
            if (!done) return;
            ch.spice -= spc;
            this.taken = false;
            Draw.status();
            Draw.outfits();
        };
        let onno = () => { Dialog(message.cancel || "...???"); };

        Dialog(confirm, () => submenu(["Yes", "No"], [onyes, onno]));
    };
}

let Items = new Item();
let Shojihin = new ShojihinMenu();
let Kago = new ObjKago();
Shojihin.add = Items.add;


