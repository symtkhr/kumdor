const LIFEBOX = 160;
const NOT_FOUND = "特別なものは何もない。";

///////// 主人公
let Dog = function() {
    this.map = 0;
    this.x = 19;
    this.y = 13;
    this.z = 0;
    this.muki = 0;
    this.life = LIFEBOX * 8; 
    this.lifebox = 8;
    this.spice = 5000000;
    this.expr = 999;
    this.exprc = 999;
    this.invent = [];
    this.score = [];
    this.targetspeed = 2;
    this.lostkey = `ABCDEGHIKLMNOPQRSTUVWXYZ1234567890\\[],./;:@-^_+shift+bs+enter+esc`;
    this.jt = [];  // 異常種類p,t,mを掛かった順に記録
    this.dark = false;
    this.poison = 0;
    this.chattable = false;
    //this.wall = [];
    this.walldp = "0".repeat(80);
    this.pick = [];
    this.tree = [];
    this.done = [];
    this.warp = [];
    this.visited = ["ASDF"];
    this.step = 0;
    this.dream = 0;
    this.bgm = true;
};

let ch = new Dog;

ch.load = function()
{
    if (!loadDebug()) {
        let save = localStorage.getItem("save");
        if (save) {
            let ret = JSON.parse(save);
            Object.keys(ret).map(key => ch[key] = ret[key]);
        }
    }

    Keyboard = new ObjKeyboard();
    Map.load({z:ch.z,map:ch.map});
    Draw.all();
    Bgm.run();
    (ch.map == 0) ? Opening() : wandering();
};

ch.savezone = function() {
    const seq = ch.life <= 50 ? "[SaveZone]...\nしかし体力が5pt.以下ではセーブできない。"
          : [
              {t:"[SaveZone] セーブしますか?", confirm:true},
              () => ch.save(),
              "\vセーブ完了。",
          ];
    Draw.sequence(seq);
};

ch.save = () => {
    let ret = {};
    "map,x,y,z,muki,life,lifebox,spice,expr,exprc,jt,dark,invent,score,targetspeed,chattable,lostkey,walldp,tree,warp,done,pick,visited,layout,bgm"
        .split(",")
        .map(key => { ret[key] = ch[key]; });
    localStorage.setItem("save", JSON.stringify(ret));
};

ch.record_jump = (opt) =>
{
    if (!opt) { ch.lastwarp = null; return; }
    CLOG(ch, JSON.stringify(opt));
    if (ch.map == 5 && opt.rec) {
	ch.warp.push([opt.jump.map || ch.map, opt.jump.loc]);
    }
    if (ch.map == 1 && opt.name && ch.visited.indexOf(opt.name) < 0) {
	ch.visited.push(opt.name);
    }
    let from = ch.towhere(-1);
    ch.lastwarp = {to: opt.jump, from: [ch.map, from.x, from.y]};
};

ch.record_wall = (map, p, replacer) =>
{
    const inside = (min,x,max) => (min <= x && x <= max);

    if (map == 5 && inside(40, p.x, 80) && inside(85, p.y, 97)) {
	let x = (p.x - 44);
	let y = (p.y - 88);
	let n = parseInt(x / 4) + 8 * y;
        if (ch.walldp.length < 80) ch.walldp += "0".repeat(80);
	let res = ch.walldp.split("").map(c => parseInt(c,16)).slice(0,80);
	res[n] = res[n] | (1 << (x % 4));
	ch.walldp = res.map(v => v.toString(16)).join("");
    } else {
	ch.pick.push([map, p, replacer]);
    }
};

ch.towhere = function(p) {
    p = p || 1;
    let x = ch.x;
    let y = ch.y;
    let muki = ch.muki;

    if (muki == 0) y -= p; //上
    if (muki == 1) x += p; //右
    if (muki == 2) y += p; //下
    if (muki == 3) x -= p; //左

    return {x:x, y:y};
};

ch.walking = function() {
    //進めるかの判定
    if (ch.fog.enable) {
        ch.fog.walk();
    } else {
        if (Map.kabe(ch.towhere())) {
            return Bgm.kabe();
        }
        if (Map.in_fog(ch.map, ch.x, ch.y) && (ch.muki == ch.fog.north)) {
            ch.y--;
            ch.step++; //上 
        } else {
            ch.step = 0;
            if (ch.muki == 0) ch.y--; //上
            else if (ch.muki == 1) ch.x++; //右
            else if (ch.muki == 2) ch.y++; //下
            else if (ch.muki == 3) ch.x--; //左
        }
        ch.fog.north = 0;

        if (ch.map == 5 && 80 < ch.x) { ch.x = ((ch.x - 80) + 24) % 48 + 80; }
        if (ch.map == 1 && ch.x < 64 && ch.y <= 12) { ch.y += 96; }
        if (ch.map == 1 && ch.x < 64 && 108 <= ch.y) { ch.y -= 96; }
    }

    const poisoning = () => {
        ch.poison++;
        if (ch.poison < 4) return;
        ch.poison = 0;
        ch.damage(10, true);
    };

    Draw.map();
    Draw.me();
    Draw.life();
    if (ch.stepon()) return;
    Draw.outfits();

    if (!Map.enemy) return;
    if (ch.jt.some(v => v == "p")) poisoning();
    if (ch.life <= 0) return GameOver();

    if (GetRand(14) == 0) {
        Encounter();
    }
};

ch.stepon = function()
{
    let k = Map.symbol({x:ch.x, y:ch.y});
    let obj = Map.FootEvents.find(v => (
        (v.sym == k && !v.loc && !v.range) ||
            (v.loc && v.loc[0] == ch.x && v.loc[1] == ch.y && ((v.sym || k) == k)) ||
            (v.range && (v.sym == k) &&
             (v.range.x[0] - 6) < ch.x && ch.x < (v.range.x[1] + 6) &&
             (v.range.y[0] - 3) < ch.y && ch.y < (v.range.y[1] + 3))
    ));

    if (!obj) {
        if (Map.jumper.indexOf(k) < 0) return;
        // 近場のジャンプイベントを採る
	CLOG("nearest point");
        let foots = Map.FootEvents.filter(v => v.loc && v.sym == k)
            .sort((a,b) => (a.loc[0] - ch.x)**2 + (a.loc[1] - ch.y)**2 - (b.loc[0] - ch.x)**2 - (b.loc[1] - ch.y)**2);
        obj = foots.shift();
    }
    // 踏みイベントなし
    if (!obj) return;

    // 飛びイベントあり
    if (obj.jump) {
	// 踏み・飛びイベントの両方がある場合(大きな手の部屋など)、踏みイベントでtrueのときに飛ぶ
	if (obj.onstep && !obj.onstep()) return;
	// 階段イベント
	if (Map.is_stair(ch.map, k)) {
	    Draw.stair(obj.jump, k == 0x29);
	    return true;
	}
	// ワープイベント
	if (k == 0x09 || k == 0x21) {
	    ch.record_jump(obj);
	    Draw.warp(obj.jump);
	    return true;
	}
	ch.record_jump((k == 0x01) ? null : obj);
	return Map.jump(obj.jump);
    }
    // 踏みイベントあり、trueが返る場合(溶岩など)は敵襲・中毒を継続
    if (!obj.onstep || obj.onstep()) return;

    // 踏みイベント後は敵襲・中毒なし
    return true;
};


    
ch.diving = function(is_down)
{
    const kabe = () => TextBar(is_down ? "ここは潜れない。" : "ここは浮上できない。");
    const is_waterfront = (p) => {
	let k = Map.symbol(p);
	return ((k == 5) || (k == 6) || (k == 7));
    };
    let m = ch.map;

    if ((m != 1) && (m != 4)) return kabe();
    
    // rtyu:  26.72 - 41.81 ==> 106.05 - 121.15
    // north: 46.77 - 61.88 ==>  85.05 - 100.16
    // kinen: 16.44 - 20.46 ==>  29.61 - 33.63
    let delta = (x, y, z) => {
	if (m == 4) return {x:29-16, y:61-44};
        if (x == 58 && y == 73) return;
        let is_rtyu = (x < 45 || 105 < x);
        let dx = (1 < z) ?  0 : (is_rtyu ? 80 : 39);
        let dy = (1 < z) ? 16 : (is_rtyu ? -67 : -72);
        return {x:dx, y:dy};
    };

    if (is_down) {
        if (!is_waterfront(ch)) return kabe();

        let d = delta(ch.x, ch.y, ch.z + 1);
        if (!d) return TextBar("水が噴き上げてくるので、潜れない。");

	let to = {x:(ch.x + d.x), y:(ch.y + d.y)};
	if ((m == 4) && (Map.kabe(to) || Map.symbol(to) == 1)) return kabe();
	if (ch.z == 0) ch.record_jump({});
	return Draw.dive({loc:[to.x, to.y], z:ch.z+1}, true);
    }

    let d = delta(ch.x, ch.y, ch.z);
    let to = {x:(ch.x - d.x), y:(ch.y - d.y)};
    if (!is_waterfront(to)) return kabe();
    if (ch.z - 1 == 0) ch.record_jump();

    return Draw.dive({loc:[to.x, to.y], z:ch.z-1});
};

ch.hanasu = function()
{
    let to = ch.towhere();
    let k = Map.symbol(to);

    //CLOG(k, Map.across);
    if ((Map.across || []).indexOf(k) != -1) {
        to = ch.towhere(2);
        k = Map.symbol(to);
    }

    // 対人
    if (Map.is_talker(ch.map, k)) {
	if (ch.jt.indexOf("t") != -1) {
	    return Dialog(".........???");
	}
	if (ch.jt.indexOf("m") != -1 && GetRand(2) == 0) {
	    return ch.punch(k);
	}
    }

    // event = {onspoken:func, branch:func, talk:[str...]} を返す.
    let get_speaking_event = () => {
	let obj = Map.speakEvents.find(v => (
            (!v.sym || v.sym == k) &&
		(!v.loc || (v.loc[0] == to.x && v.loc[1] == to.y))
	));
	let json = Map.talk.find(v => v.map == ch.map &&
				 ((v.sym && !v.loc && v.sym == k) ||
				  (v.loc && v.loc[0] == to.x && v.loc[1] == to.y)));
        CLOG(json, obj);
        if (json && (ch.map == 1 || Map.is_talker(ch.map, k))) {
            return obj ? {
                onspoken: obj.onspoken,
                branch: obj.branch,
                talk: (json.talk || obj.talk || "").split("%s").join("犬神").split("|")
            }:
            { talk: json.talk.split("|") };
        }
        return obj || { onspoken: () => { 
            TextBar(NOT_FOUND);
            wandering();
        }};
    };

    let event = get_speaking_event();
    CLOG(event);
    if (event.branch) {
	return Draw.sequence(event.branch(event.talk || []));
    }
    if (!event.onspoken) {
	return Draw.sequence(event.talk); 
    }
    CLOG(event);
    return event.onspoken(event.talk || []);
};

ch.punch = function(k)
{
    const isrobot =
	  (k == 0xe7 && Map.in_airport(ch.map, ch.x, ch.y)) ||
	  (k == 0xe8 && (ch.map == 2 || ch.map == 3));

    const seq = [
	{d:"がぶがぶがぶ!!", thru:true},
	{t:"(あなたは急に嚙みついた)"}, 
	isrobot ? {d:"へーぜん。", thru:true} : {d:"何するんだ、やり返しだ!"},
	(isrobot || ch.life <= 20) ? null : {func: () => ch.damage(20, true) },
    ];

    Draw.sequence(seq);
};

ch.sleep = function()
{
    TextBar("ベッドに入った。");
    jwait(function() {
	if (ch.lifebox * LIFEBOX == ch.life) {
            TextBar("全然眠くない。");
            return wandering();
	}
	$("#bg").addClass("sleep");
	Draw.fill_life(() => {
	    TextBar("体力回復。");
            $("#bg").removeClass("sleep");

	    if (ch.hotel && ch.hotel.loc[0] == ch.x && ch.hotel.loc[1] == ch.y)
		ch.hotel = null;
	    jwait();
	});
    });
};

ch.supply = function(range)
{
    let maxlife = ch.lifebox * LIFEBOX;
    if (maxlife - ch.life < 10) {
        TextBar("お腹が空いていない。");
        return false;
    }
    let before = parseInt((ch.life + 9) / 10);
    let recv = GetRand(10 * (range[1] - range[0])) + 10 * range[0];
    ch.life = ch.life + recv;
    if (maxlife < ch.life) ch.life = maxlife;

    TextBar((parseInt((ch.life + 9) / 10) - before) + "pt.回復。");
    Draw.life();
    return true;
};

ch.getexp = function(exp)
{
    if (exp + ch.expr > ch.exprc) { exp = ch.exprc - ch.expr; }
    ch.expr += exp;
    return exp;
};

ch.damage = function(damage, flash)
{
    ch.life -= damage;
    if (ch.life < 0) ch.life = 0;
    if (flash) {
	$("#bgdam").show();
	setTimeout(() => $("#bgdam").hide(), 30);
    }
    Draw.life();
    return ch.life;
};

ch.grow_life = function()
{
    ch.lifebox++;
    Draw.life();
    Draw.fill_life(wandering);
};

ch.pickup = function(desc, name, replacer, done)
{
    let isinventory = typeof done != "function";
    const seq = [
	{t:(desc + "がある。拾いますか?"), confirm:true},
	{func: () => {
	    if (isinventory && !Shojihin.add([done])) {
 		return TextBar("荷物がいっぱいで拾えない。");
	    }
            TextBar((name || desc) + "を拾った。");
            Map.replace(replacer);
	    if (isinventory) return;
	    done();
	    ch.pick.push([ch.map, ch.towhere(), replacer]);
        }},
    ];
    Draw.sequence(seq);
};

ch.cure = function(all)
{
    if (ch.jt.length == 0) {
        TextBar("体に異常はない。");
        return false;
    }
    let cure = (jt) => {
        if (jt == "p"){ TextBar("体から毒が消えた。"); ch.poison = 0; }
        if (jt == "t"){ TextBar("体が元に戻った。"); Draw.me(); }
        if (jt == "m"){ TextBar("呪いが解けた。");  }
    };
    if (all) {
        ch.jt.map(jt => cure(jt));
        ch.jt = [];
    } else {
        cure(ch.jt.pop());
    }
    Draw.status();
    return true;
};

ch.setdone = function(event)
{
    if (!ch.isdone(event)) ch.done.push(event);
};

ch.isdone = function(event)
{
    return (ch.done.indexOf(event) != -1);
};

ch.settarget = function(t)
{
    if (t < ch.targetspeed)
        TextBar("目標w/mが下がった。");
    if (ch.targetspeed < t)
        TextBar("目標w/mが上がった。");
    ch.targetspeed = t;
};

ch.purchase = function(param)
{
    const buy = () => {
        if (ch.spice < param.spice) {
            return Dialog(param.short || "スパイスが足りないようです。");
        } 
        if (param.agree() == "full") {
            return Dialog(param.full || "荷物がいっぱいのようですね。");
        }
        ch.spice -= param.spice;
        Draw.status();
        wandering();
    };

    const cancel = param.cancel ? () => Dialog(param.cancel) : wandering;
    Draw.sequence([
        {d:(param.query || "買いますか?"), confirm: true, cancel: cancel },
        {func:buy},
    ]);
};

ch.remand = function()
{
    let to = ch.towhere(-1);
    if (Map.kabe(to)) return;
    ch.x = to.x;
    ch.y = to.y;
    setTimeout(()=> { Draw.map(); Draw.me(); }, 100);
};

let wandering = function() {
    ch.state = "wandering";
    $("#jtext, #bgdam, #keyboard, #score, #scriptbook, #inventory, #longscript, #enemy, #kagobox, #submenubox").hide();
    Draw.outfits();
    if(inDebug()) dumpdebug();
    if (3 <= ch.dream) return jwait(Ending);
    
    // key待ち
    $(window).unbind().keydown(function(e) {
        let inkey = e.keyCode;
        if (inkey == 0x20) {    // SPACE
            ch.muki = (ch.muki + (e.shiftKey ? 3 : 1)) % 4;
            Draw.me();
            return;
        }
        if (inkey == 0x46) { // F
            ch.walking();
            return;
        }
        if (inkey == 0x4A) { // J
            wandering_action();
        }

        if (ch.isdone("lang") && inkey == "D".charCodeAt(0)) {
            ch.diving(true);
            return;
        }

        if (inkey == "U".charCodeAt(0) && ch.z) {
            ch.diving(false);
            return;
        }
    });
};

///////// 霧の谷
let FogValley = function() {
    const HEIGHT = 18;
    const EASTEND = 110;
    const NORTHEND = 57;
    const HOLDSTEP = 16;
    let step = 0;
    let forefoot = 0;
    this.north = 0;
    this.enable = false;
    this.foot = () => forefoot;

    let findgate = () => {
	let p = ch.towhere(-1);
	let SYMGATE = 0x2b; //Map.symbol(ch.towhere(-1));
	let SYMFOG  = 0x22; //Map.symbol(ch);
	let fog = [];
	let gate = [];
	let scan = (x, y) => {
	    if (fog.indexOf(x * 128 + y) != -1) return;
	    if (Map.symbol({x:x, y:y}) == SYMGATE && !(x == p.x && y == p.y)) {
		gate.push([x, y]);
		return;
	    }
	    if (Map.symbol({x:x, y:y}) != SYMFOG) return;
	    fog.push(x * 128 + y);
	    scan(x+1, y);
	    scan(x-1, y);
	    scan(x, y+1);
	    scan(x, y-1);
	};
	scan(ch.x, ch.y);
	CLOG(JSON.stringify(gate), fog, ch.x, ch.y);
	return gate.length == 1 ? gate.pop() : [ch.x, ch.y];
    };
    
    this.enter = function () {
        if (this.enable) return;
	CLOG("enter");

	forefoot = (ch.x + ch.y) % 2;
	if (ch.map == 1) {
	    ch.y = 6 + NORTHEND;
	    ch.x = 5 + EASTEND;
	}
	if (ch.map == 5) {
	    Map.jump({loc:findgate()});
	}
	step = ch.map == 1 ? HOLDSTEP : 10;
        this.enable = true;
        this.make_north();
	Draw.map();
    };

    this.exit = function () {
	CLOG("exit");

        if (ch.map == 1 || !step) {
	    this.enable = false;
	    this.north = 0;
	    return true;
	}

	step = 10;
        this.make_north();
	return true;
    };

    this.walk = function () {
        if (ch.muki != this.north) return this.exit();
	//if (Map.kabe(ch.towhere())) return;

	step--;
	forefoot = (forefoot + 1) % 2;
	CLOG("step:" + step);
	if (ch.map == 1 && step < 4) ch.y = NORTHEND + 2 + step;
	if (step <= 0) return this.exit();
	this.make_north();
        return true;
    };

    this.make_north = function() {
        this.north = GetRand(4);
        Draw.outfits();
    };

};
ch.fog = new FogValley();

const Hotel = (param) => {
    if (ch.life == LIFEBOX * ch.lifebox || !param.loc) {
        return Dialog(param.talk || "体力が減ったら、お泊まりください。");
    }
    if (!param.spice) param.spice = 10;
    if (!param.room) param.room = "ごゆっくり。";
    if (ch.hotel) return Dialog(ch.hotel.room);
    
    const seq = [
	{d:(param.guide || ("一泊" + param.spice + "スパイスです。")),
	 confirm:true},
	{func: () => {
	    if (ch.spice < param.spice) {
                return Dialog(param.short || "スパイスが足りないようですね。");
	    } 
	    ch.spice -= param.spice;
            Map.replace(param.replacer || 0x2b, param.loc);
	    Draw.status();
	    ch.hotel = {loc:param.loc, room:param.room};
            Dialog(param.room);
        }},
	{wait:true},
    ];
    Draw.sequence(seq);
};

