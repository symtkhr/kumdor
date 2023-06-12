
///////// マップ

let Map = {
    syb: [],         // マップ
    sybDef: [],      // シンボル定義 {シンボル:[画像番号・透過]}
    footEvents: [],  // 踏むイベント
    speakEvents: [], // 話すイベント
    jumper: [],      // 踏むとジャンプするシンボル
    across: [],      // 話すと1つ奥のものと同じ応答をするシンボル
    enemy: false,    // 敵の有無
    base: 0x01,  // 未定義位置の表示シンボル
    towns: [],   // map=1(out)で他mapにジャンプするシンボル一覧
    warps: [],   // map=5(DP)で他mapにジャンプするシンボル一覧
    retalk: [],  // 話しかけた回数
    make_bed: () => {},
    is_front_of_doors : () => {},
    type: 1, //0:ダンジョン 1:タウン 2:ドリームポイント
};

Map.symbol = function(p) {
    if (!Map.syb[p.y] || Map.syb[p.y][p.x] === undefined) return Map.base;
    return Map.syb[p.y][p.x];// || Map.base;
};

Map.kabe = function(p) {
    return (Map.sybDef[Map.symbol(p)][1] % 2 == 1);
};

// シンボルの差し替え
Map.replace = function(value, p) {
    let to = p ? {x: p[0], y:p[1]} : ch.towhere();
    if (value == -1) {
        let sym = Map.symbol(to);
        Map.sybDef[sym][1] = 0;
        return;
    }
    Map.syb[to.y][to.x] = value;
    if (!p) Draw.map();
};

// 呪文書イベント
Map.town = function(exhaust) {
    let jumpto = Map.towns.map(v => {
        if (ch.visited.indexOf(v.name) == -1) return;
        return {
            map:1, loc: v.loc && [v.loc[0], v.loc[1] + 1],
            z: v.jump.z
        };
    }).filter(v=>v);
    let options = ["キャンセル"].concat(ch.visited);//.map(v => v.name);
    let onselect = options.map((v,i) => {
        if (i == 0) return wandering;
        return () => { Map.jump(jumpto[i - 1]); exhaust(); wandering(); };
    });
    submenu(options, onselect, "town");
};

Map.warning = (jumpto) => {
    if ((jumpto.map == 1) && (jumpto.sym == 0x14) &&
        !ch.isdone("loop") && ch.lostkey.split("").some(c => "ASD".indexOf(c) != -1)) {
        Draw.sequence(["\v(注意:キーなしで魔獣と戦うのは危険です。"
                       +"\n 村内でキーを入手してください。)",
                       " "]);
    }
};

// ジャンプイベント
// 引数jumpto = {sym:N, map:N, range:{x:[A,B],y:[A,B]}, loc:[X,Y], stepin:BOOL}
Map.jump = function(jumpto) {
    // マップ外移動
    if ((jumpto.map || jumpto.map == 0) && (ch.map != jumpto.map) && Map.load(jumpto)) return;
    Map.warning(jumpto);

    // マップ内移動
    ch.map = jumpto.map || ch.map;
    ch.z = (ch.map == 1 || ch.map == 4) ? (jumpto.z || 0) : ch.z;

    [ch.x, ch.y] = (() => {
        // ジャンプ先が範囲指定の場合(街など)
        if (jumpto.range) {
            let range = jumpto.range;
            let muki = ch.muki;
            let x = (muki == 1) ? range.x[0]
                : (muki == 3) ? range.x[1]
                : parseInt((range.x[0] + range.x[1]) / 2);
            let y = (muki == 0) ? range.y[1]
                : (muki == 2) ? range.y[0]
                : parseInt((range.y[0] + range.y[1]) / 2);
            //移動先が壁の場合(asdf,rtyu南,lake東西,iopa,4567,airport東西北,park)
            while (Map.kabe({x:x,y:y})) {
                // 進行方向左右いずれかにずれる
                if (muki % 2 == 0) x++; else y++;
                // jumperならstepin(airport北)
                while (Map.jumper.indexOf(Map.symbol({x:x,y:y})) != -1) {
                    if (muki == 0) y--;
                    if (muki == 1) x++;
                    if (muki == 2) y++;
                    if (muki == 3) x--;
                }
            }
            return [x, y];
        }

        // ジャンプ先が座標指定の場合
        if (jumpto.loc) {
            let loc = jumpto.loc;
	    CLOG("loc=", loc, jumpto.sym, Map.symbol({x:loc[0], y:loc[1]}));
            if (!jumpto.sym || Map.symbol({x:loc[0], y:loc[1]}) == jumpto.sym) return loc;
            // 指定した座標に一致しないシンボルがある場合は、近傍を検索する
	    // (Todo:Map.FootEventを書き換える操作)
            jumpto.range = {};
            jumpto.range.x = [loc[0] - 5, loc[0] + 5];
            jumpto.range.y = [loc[1] - 5, loc[1] + 5];
        }
     
        // シンボルのみ指定で、マップ内に入り口が複数ある場合
        let objlist = Map.syb.map((row, y) => {
            return row.map((v,x) => v== jumpto.sym ? [x,y] : null).filter(v=>v);
        }).reduce((ret, a) => ret.concat(a), [])
        CLOG("entrance=", objlist);

        if (jumpto.range) {
	    // Todo:Map.FootEventを書き換える操作
            let range = jumpto.range;
            if (!range.x) range.x = [0, Map.syb[0].length];
            if (!range.y) range.y = [0, Map.syb.length];

            if (objlist.length == 0) return [range.x[0], range.y[0]];

            objlist = objlist.filter(
                v => 
                    range.x[0] <= v[0] && v[0] <= range.x[1] &&
                    range.y[0] <= v[1] && v[1] <= range.y[1]
            );

        }
        if (objlist.length == 0) return [ch.x, ch.y];

        return ((muki) => {
            // 東西側から入る
            if (muki % 2) {
                objlist.sort((a,b) => a[0] - b[0]);
                return (muki == 3) ? objlist.pop() : objlist.shift();
            }
            // 南北側から入る
            objlist.sort((a,b) => a[1] - b[1]);
            return (muki == 0) ? objlist.pop() : objlist.shift();
        })(ch.muki);
    })();

    // ドリームポイントの深さ
    if (ch.map == 5) {
	ch.z = parseInt(ch.x / 40) * 3 + parseInt(ch.y / 40) + 1;
	if (7 <= ch.z) ch.z = 7;
    }
    
    if (jumpto.stepin) {
        let to = ch.towhere(jumpto.stepin);
        if (!Map.kabe(to)) {
            ch.x = to.x;
            ch.y = to.y;
        }
    }
    Draw.map();
    Kago.off();
    Bgm.run();
    return true;
};

Map.load = function(opt)
{
    //if (location.hash !== "#original") return;
    //if (opt && opt.map) ch.map = opt.map;
    opt = opt || {map:ch.map};
    ch.dark = false;
    ch.hotel = null;
    ch.map = opt.map;
    ch.z = opt.z || 0;

    // Todo:これらのテーブルは外部で書き換えられているため現状は毎度読み直し
    // OUTtoTOWN
    Map.towns = [
        {sym:0x14, loc:[32,96], jump:{map:2, sym:0x10, range:{x:[6,30], y:[ 6,18]}}, name:"ASDF", },
        {sym:0x14, loc:[51,95], jump:{map:2, sym:0x10, range:{x:[6,20], y:[24,34]}}, name:"JKL;", },
        {sym:0x14, loc:[39,82], jump:{map:2, sym:0x10, range:{x:[6,20], y:[40,51]}}, name:"RTYU", },
        {sym:0x14, loc:[30,89], jump:{map:2, sym:0x10, range:{x:[6,16], y:[57,62]}}, name:"GH",   },
        {sym:0x14, loc:[20,81], jump:{map:2, sym:0x10, range:{x:[6,18], y:[68,75]}}, name:"QWE",  },
        {sym:0x14, loc:[21,77], jump:{map:3, sym:0x14, range:{x:[6,22], y:[ 6,19]}}, name:"IOP@", },
        {sym:0x14, loc:[10,73], jump:{map:3, sym:0x23, range:{x:[6,16], y:[25,35]}}, name:"製材所",
	 onstep:() => BigHand.gate(7) },
        {sym:0x14, loc:[12,56], jump:{map:3, sym:0x14, range:{x:[6,22], y:[41,53]}}, name:"VBNM",   },
        {sym:0x14, loc:[11,44], jump:{map:3, sym:0x14, range:{x:[6,20], y:[59,71]}}, name:"4567", },
        {sym:0x14, loc:[34,25], jump:{map:4, sym:0x10, range:{x:[6,36], y:[ 6,26]}}, name:"首都",   },
        {sym:0x1e, loc:[32,34], jump:{map:3, sym:0x18, range:{x:[6,19], y:[79,103]}},name:"空港",   },
        {sym:0x16, loc:[34,14], jump:{map:4, loc:[21,121]},                          name:"宮殿", },
        {sym:0x14, loc:[55,42], jump:{map:4, sym:0x10, range:{x:[6,24], y:[32,50]}}, name:"記念館", },
        {sym:0x14, loc:[79,19], jump:{map:2, sym:0x10, range:{x:[6,16], y:[81,89]}, z:2}, name:"湖底村", },
    ];
    
    // DPtoTOWN/OUT (Todo:JSON化)
    Map.warps = [
        {"sym":33,"loc":[16,7]},{"sym":33,"loc":[25,51]},{"sym":33,"loc":[31,65]},{"sym":33,"loc":[8,101]},
        {"sym":33,"loc":[59,21]},{"sym":33,"loc":[51,63]},{"sym":33,"loc":[55,105]},{"sym":33,"loc":[64,75]},
        {"sym":33,"loc":[89,14]},{"sym":33,"loc":[93,14]},{"sym":33,"loc":[113,14]},{"sym":33,"loc":[117,14]},
    ].map((v,n) => {
	v.rec = true;
        if (n < 7)
            v.jump = {map:4, loc:[[6,3],[0,1],[0,3],[1,0],[2,1],[3,2],[4,1]].map((v,i) => [v[0]+27, v[1]+70])[n]};
	if (n == 0) v.jump = {loc:[30,62],z:1,map:4};
	if (n == 7) v.jump = {map:1,loc:[11,82]};
	if (n == 8 || n == 10) v.jump = {map:4,loc:[35,83]};
	if (n == 9 || n == 11) v.jump = {map:1,loc:[22,23]};
        return v;
    });
    
    Map.syb = Map.data.split("\n").slice(ch.map * 128, (ch.map + 1) * 128)
	.map(row => (row.split(" ").pop().split(":").pop().match(/../g) || [])
	     .map(v => parseInt("0x" + v)));
    Map.sybDef = [...Array(256)].map((v,i) => [i % 128, i < 128 ? 0:1]); 
    Map.base = 0x01;

    // 各マップのイベント登録
    let ret = ([event_solphes, event_outmap, event_town2map, event_town3map, event_town4map, event_dreampoint])[ch.map]();
    Object.keys(ret).map(key => Map[key] = ret[key]);

    ch.pick.filter(v => v[0] == ch.map).map(v => Map.replace(v[2], [v[1].x,v[1].y]));

    Draw.all();
};

Map.record_talk = (id, count) => {
    if (!Map.retalk[id]) Map.retalk[id] = 0;
    Map.retalk[id] += count || 0;
    return Map.retalk[id];
};

Map.itembox = function(replacer, item_id)
{
    let id = item_id ||
        (ch.isdone("loop") ? (16 + GetRand(9)) : [16,17,18,19,21,22,24][GetRand(7)]);
    let name = id < 0 ? "スパイス" : (id < 16 ? Items.spec(id).name : "呪文書");
    let seq = [
	{t:"ヒトデ型の箱を開けると、中から\n" + name + "が出てきた。拾いますか?",
	 confirm:true},
	{func:
         () => {
             if (id < 0) {
                 let spice = GetRand(200);
                 spice += (ch.isdone("myhome") || (1000 < ch.spice)) ? 100 : (1100 - ch.spice);
                 name = spice + name;
                 ch.spice += spice;
                 Draw.status();
             } else if (!Shojihin.add([id])) {
                 return TextBar("荷物がいっぱいで拾えない。");
	     }
	     TextBar(name + "を拾った。");
	     Map.replace(replacer);
	     ch.pick.push([ch.map, ch.towhere(), replacer]);
         }},
    ];
    Draw.sequence(seq);
};

Map.chattree = (solid, talks) => {
    if (!ch.chattable)  return ch.isdone("tamaorin") ? "言葉が通じない。" : NOT_FOUND;
    if (solid) return ChatTree({replacer: 0x12, onrevive:talks[0]});

    // 復活時 return "クムの木は眠っている。";
    let to = ch.towhere();
    return talks[(to.x * 40 + to.y) % talks.length];

    TextBar("クムの木はいきなり呪文を放ってきた。");
};
Map.rocktree = (talks) => {
    if (ch.chattable) {
        TextBar("クムの木はいきなり呪文を放ってきた。");
	return jwait(() => { ChatTree({replacer: 0x12, onrevive:talks}); });
    } 
    TextBar(ch.isdone("tamaorin") ? "言葉が通じない。" : NOT_FOUND);
    wandering();
};

let common_town_speakevents = () => [
    {sym:0xc2, onspoken: function() { Kago.set("m"); }},
    {sym:0xc3, onspoken: function() { Kago.set("g"); }},
    {sym:0xc4, onspoken: function() { Kago.set("c"); }},
    {sym:0xc5, onspoken: function() { Kago.set("k"); }},
    {sym:0xc6, onspoken: function() { Kago.set("s"); }},
    {sym:0xc7, onspoken: function() { Kago.set("t"); }},
    {sym:0xc0, onspoken: function() { Kago.toggle(); }},
].concat(
    [...Array(0x20)].map((v,i) => {
        let texts = ["えーと、どなたでしたっけ?", "私、その他大勢です。",
                     "ども、コンチワ。", "(その他大勢のようだ。)"];
        let text = texts[GetRand(texts.length)];
        return {sym: (i+0x80+0x50), talk:text  };
    })
);

const interact_footevents = (footlist, jumper) => {
    // 階段の自動算出
    let foots = footlist.map((v,i,self) => {
        if (ch.map == 5) return v;
        if (v.jump) return v;
        if (v.sym == 42) return {};
        if (v.sym != 41) return v;
        // 下り階段と同じx座標を持つ上り階段を探す
        let to = self.filter(w => w.sym == 42 && !w.jump && w.loc[0] == v.loc[0]);
        if (!to.length) return v;
        if (1 == to.length) { v.jump = {sym:42, loc:to[0].loc}; return v; }
        // 候補が複数ある場合はy座標が正方向で最寄りの上り階段を探す
        let yd = v.loc[1];
        let yu = to.map(v => v.loc[1]).sort((a,b)=>a-b).filter(yu => 3 < yu - yd).shift();
        //CLOG("yu=",to.map(v=>v.loc[1]),"xd/yd=",v.loc);
        v.jump = {sym:42, loc:[v.loc[0], yu]};
        return v;
    });
    
    return foots.concat(
        // 相互ジャンプ(map内)
        foots.filter(v => !v.map && v.jump && v.jump.loc && jumper.indexOf(v.jump.sym) != -1).map(v => {
            return {sym: v.jump.sym, // v.jump.loc ? Map.symbol({x:v.jump.loc[0],y:v.jump.loc[1]}) : v.jump.sym,
                    loc:v.jump.loc, jump: {sym:v.sym, loc:v.loc, stepin:v.jump.stepin}};
        })
    ).concat(
        // 相互ジャンプ(map外) // Todo:townsとwarpsを書き換える操作になっている
        Map.towns.filter(v => v.jump && v.jump.map == ch.map).map(v => {
            let ret = v.jump;
            ret.sym = 1;
            ret.jump = {sym: v.sym, loc:v.loc, map:1, z:v.jump.z};
            return ret;
        }),
        Map.warps.filter(v => v.jump && v.jump.map == ch.map).map(v => {
            let ret = v.jump;
            ret.map = null;
            ret.sym = 9;
            ret.jump = {sym: 0x21, loc:v.loc, map:5};
            return ret;
        })
    ).sort((a,b)=> (a.loc ? (a.onstep?0:1): 2) - (b.loc ? (b.onstep ?0:1) : 2));
};


let load_original_map = () => {
    $.ajax({
        url: "./ref/kummap.dat",
        type: 'get',
        success: (data) => {
            Map.data = data;
            ch.load();
        },
        timeout: 10000,
    });
    $.ajax({
        url: "./onspeak.json",
        type:"get",
        dataType: "json",
        success:(data) => {
            Map.talk = data;
        }
    });
};

`
map3 poision:
   <sth>        <airportStuff[70,0]-[127,60]> 
   <market[55,61]-[72,70]>
   <sth>     <hosp2[67.76]-[77.79]>  <hotel[84.76]-[94.79]>  <tower[101.70]-[112.119]>
   <sth>     <hosp1[67.87]-[77-90]>  <hotel[85.86]-[94.91]> 
        <hand  [62.98]-[78.114]>    <house[84.98]-[95,102]>
                                    <save[84.109]-[95.112]>
`

Map.in_lava = function(map, x, y)
{
    const inside = (min,x,max) => (min <= x && x <= max);

    if (map == 5 && 80 < x) return true;
    if (map != 3) return;
    if (Map.in_airport(map, x, y)) return true;

    if (61 < x && 61 < y) {
        return !(inside(67,x,77) && inside(74,y,81));  // 4567 hospital upstair
    }
    if ((55 < x) && inside(61,y,70)) return true; // 4567 market
    let range = Map.towns.find(v => v.name == "4567").jump.range;
    return inside(range.x[0], x, range.x[1]) && inside(range.y[0], y, range.y[1]);
};

Map.in_airport = (map, x, y) => (map == 3 && ((x < 20 && 75 < y) || (70 < x && y < 60)));
Map.in_fog = (map, x, y) => (map == 1 && 103 < x && 52 < y && y < 80);
Map.is_stair = (map, k) => (k == 0x29 || k == 0x2a || (map == 4) && (k == 0x0a || k == 0x3a));
Map.is_talker = (map, k) => (map != 1) && (0x50 + 0x80 <= k && k < 0x70 + 0x80);

/////////////////////////////////// MapEvents
const event_outmap = () => {
    let ret = {};
    ret.jumper = [0x01, 0x15, 0x1a, 0x09, 0x14, 0x16, 0x1e, 0x1f] // 緑穴霧ワ街宮空断
    ret.across = [];
    ret.retalk = [];
    ret.enemy = true;
    ret.base = 0x99;
    ret.make_bed = () => {};

    let footlist = [
        {sym:0x15, loc:[48,91], jump:{sym: 0x1, loc:[112,115] }}, // 洞窟(JKL)
        {sym:0x15, loc:[51,89], jump:{sym: 0x1, loc:[121,105] }}, // 洞窟(湖)
        {sym:0x15, loc:[44,84], jump:{sym: 0x1, loc:[102, 85] }}, // 洞窟(RTY)
        {sym:0x15, loc:[23,69], jump:{sym: 0x1, loc:[ 83,104] }}, // 洞窟(IOP)
        {loc:[41,101], onstep: () => { ch.setdone("loop"); return true; }}, // 南北端をつなぐクムの木

        {sym:0x1a, loc:[16,62], jump:{sym:0x03, range:{x:[110,121], y:[57,75]}}}, // 霧の谷
        {sym:0x0a, onstep: () => { ch.fog.enter(); return true; }}, // 霧の谷・亜空間
        {sym:0x01, range:{x:[110,121], y:[57,75]}, jump:{loc:[16,62], sym:0x1a, stepin:1}}, // 霧の谷・脱出

        {sym:0x1f, onstep: () => { // 断層
            let p = ch.towhere();
            let k = Map.symbol(p);
            if (!ch.isdone("weather") || Map.kabe(p) || k == 0x00 || k == 0x1f) return ch.remand();
            Map.jump({loc:[p.x,p.y]});
            return true;
        }},
        {sym:0x00, onstep: () => { // 断層
            let p = ch.towhere();
            let k = Map.symbol(p);
            if (!ch.isdone("weather") || Map.kabe(p) || k == 0x00 || k == 0x1f) return ch.remand();
            Map.jump({loc:[p.x,p.y]});
            return true;
        }},
        // DP入口
        {sym:0x1c, loc:[43,58], onstep: () => {
            Draw.sequence([
                "\v飲み込まれた。",
                () => { 
                    $("#gamedisp").css("background", "black");
	            $("#text").show();
	            Draw.textbox(false);
                    Map.jump({map:5, loc:[23,30]}); 
                    Bgm.run("none");
                },
                "ド \t リ \t ー \t ム \t ポ \t イ \t ン \t ト。",
                "あいたたたたた。\n\t誰だい人のアタマを踏んづけるのは。",
                "私をベッドか何かと勘違いしているのかね。",
                () => {
	            $("#gamedisp").css("background", "");
                    Draw.textbox(true);
                    Bgm.run();
                },
            ]);
        }},
        // 目標設定
        {sym:0x3c, loc:[57,70], onstep:() => ch.settarget(3) },
        {sym:0x3c, loc:[61,69], onstep:() => ch.settarget(4) },
        {sym:0x3c, loc:[59,69], onstep:() => ch.settarget(5) },
        // 溶岩
        {sym:0x1b, onstep: () => {
            ch.damage(ch.isdone("slipper") ? 20 : 160, true);
            return true;
        }},
        {sym:0x1c, onstep: () => {
            ch.damage(ch.isdone("slipper") ? 20 : 160, true);
            if (ch.map == 1 && 40 <= ch.x && ch.x <= 46) {
                let dv = [];
                if (ch.x - 43 < 0) dv.push(1); //右
                if (ch.x - 43 > 0) dv.push(3); //左
                if (ch.y - 58 < 0) dv.push(2); //下
                if (ch.y - 58 > 0) dv.push(0); //上
                CLOG(dv);
                ch.fog.north = dv[GetRand(dv.length)];
                Draw.outfits();
            }
            return true;
        }},
        // 水流
        {loc:[91,72], onstep: () => {
            TextBar("激しい水流に噴き上げられた。");
            ch.record_jump();
            jwait(() => {
                if (ch.lostkey.indexOf("+esc") != -1) return GameOver();
                Map.jump({sym:0x07, loc:[58, 73], z:0});
                wandering();
            });
        }},
        {loc:[60,73], onstep: () => {
            TextBar("激しい水流に巻き込まれた。");
            ch.record_jump({});
            jwait(() => { Map.jump({sym:0x30, loc:[97, 71], z: 5}); wandering(); });
        }}, 
    ].concat(Map.towns);

    ret.FootEvents = interact_footevents(footlist, ret.jumper);

    ret.speakEvents = [
        //壁読み
        {sym:0xaa, loc:[102,87], onspoken: () => OpenWall({replacer:0x2b, level:2}) },
        {sym:0xaa, loc:[115,37], onspoken: () => OpenWall({replacer:0x2c, level:5}) },
        {sym:0xaa, loc:[96,106], onspoken: () => OpenWall({replacer:0x2b, level:8}) },
        {sym:0xaa, loc:[90,90],  onspoken: () => OpenWall({replacer:0x2b, level:8}) },
        {sym:0xaa, loc:[94,91],  onspoken: () => OpenWall({replacer:0x2b, level:8}) },
        {sym:0xaa, loc:[76,93],  onspoken: () => OpenWall({replacer:0x2b, level:8}) },
        {sym:0xaa, loc:[115,58], onspoken: () => OpenWall({replacer:0x2d, level:8}) },
        {sym:0xaa, loc:[33,53],  onspoken: () => OpenWall({replacer:0x2f, level:9}) },
        {sym:0xaa, loc:[27,40],  onspoken: () => OpenWall({replacer:0x2e, level:10}) },
        {sym:0xaa, loc:[44,32],  onspoken: () => OpenWall({replacer:0x2f, level:12}) },
        {sym:0xaa, onspoken: () => OpenWall({replacer:0x2f, level:14}) },
        // クムの木とチャット
        {sym: 0x12, branch: (talks) => {
            if (!ch.chattable)  return ch.isdone("tamaorin") ? "\v言葉が通じない。" : "\v" + NOT_FOUND;
            let to = ch.towhere();
            if (ch.tree.find(v => v[0] == ch.map && v[1].x == to.x && v[1].y == to.y)) return "\vクムの木は眠っている。";

            // 話した順にランダムにセリフを割り付ける
            if (!ch.treetalk || ch.treetalk.length == talks.length) ch.treetalk = [];
            let talks0 = [...Array(talks.length)].map((v,i)=>ch.treetalk.indexOf(i) < 0 ? i : -1).filter(v => v!= -1);
            let k = talks0[GetRand(talks0.length)];
            ch.treetalk.push(k);
            CLOG("addspeakevents");
            Map.speakEvents.unshift({sym:0x12, loc:[to.x,to.y], branch: t => t[k]});
            return talks[k];
        }},
        {sym: 0x93,"loc":[41,101],onspoken: (talks) => Map.rocktree(talks),
         talk:["\fクムの木は語り始めた。",
               "ドリームポイントが目覚めている。\n誰かが、その場所に侵入したようだ。\nそこは、あらゆる事が可能になる場所だ。",
               "まだ思うようにコントロール出来ないようだが\nその人間の想像力が、取るに足らない物\nである事を願っているだけでは不十分だ。",
               "その人間が何を企んでいるのか判らないし−\n早くその場所に行って、そいつを倒さねば。\t\nまず、この北東にある湖に..."],
        },
        {sym: 0x93,"loc":[59,71],onspoken: (talks) => Map.rocktree(talks),
         talk:["どの道を行っても、同じ場所に出るけど−\n自分のスコアと相談して選んだ方が…"]},
        {sym: 0x93,"loc":[24,22],onspoken: (talks) => Map.rocktree(talks),
         talk:["ドリームポイントにいるのは\nミドという名前の少年だ。\nミドは…"]},
        {sym: 0x93,"loc":[24,21],onspoken: (talks) => Map.rocktree(talks),
         talk:["ミドは道に迷った末、偶然に\nドリームポイントに入ってしまったらしい。\nしかし…"]},
        {sym: 0x93,"loc":[24,20],onspoken: (talks) => Map.rocktree(talks),
         talk:["ミドは今、ドリームポイントの中で\n自分の意識と戦っている。\nミドを責めてはいけない…"]},
        {sym: 0x93,"loc":[24,19],onspoken: (talks) => Map.rocktree(talks),
         talk:["ミドと親しい人間−\nその人間の強い思念が必要だ。\nもしかしたら…"]},
        {sym: 0x93, onspoken: (talks) => {
            let branch = () => {
                if (!ch.isdone("loop")) return talks[0];
                if (ch.lostkey.indexOf("+esc") != -1) return talks[1];
                if (ch.warp.length == 0) return talks[2 + GetRand(2)];
                if (ch.dream == 0) return talks[4 + GetRand(4)];
                return talks[8];
            };
            Map.rocktree([branch()]);
        }},
        
        // チャトフィッシュとチャット
        //{sym: 0xea, talk:["クム クム クム"]},
        //{sym: 0xe9, talk:["異変の時にみんなで\nエスケープしてきたんだよ。"]},
        //{sym: 0xe8, talk:["そこの村の人はみんな避難しちゃったみたい。"]},

        //拾得イベント
        {sym:0xba, loc:[39,93], onspoken: () => Keyboard.pick("SHIFT", 0x11) },
        {sym:0xba, loc:[47,83], onspoken: () => Keyboard.pick("BS",    0x11) },
        {sym:0xba, loc:[32,49], onspoken: () => Keyboard.pick("Enter", 0x11) },
        {sym:0xba, loc:[95,69], onspoken: () => Keyboard.pick("ESC",   0x11) },
        {sym:0x98, onspoken: () => ch.pickup("LIFEの箱", null, 0x11, () => ch.grow_life())},
        {sym:0xb8, onspoken: () => ch.pickup("水晶",     null, 0xa2, "crystal")},
        {sym:0xb3, onspoken: () => ch.pickup("水深計",   null, 0x31, () => ch.setdone("depth"))},
        {sym:0xb9, onspoken: () => ch.pickup("変わった形の水晶", "水晶の磁石", 0xa2, () => ch.setdone("compass"))},
        {sym:0xc0, onspoken: () => { Map.itembox(0x11); }},
        {sym:0xc1, loc:[88,88], onspoken: () => { Map.itembox(0x20, 8); }},
        {sym:0xc1, loc:[77,90], onspoken: () => { Map.itembox(0x20, 4); }},
        {sym:0xc2, loc:[112,28], onspoken: () => { Map.itembox(0x31, 1); }},
        {sym:0xc2, onspoken: () => { Map.itembox(0x05, -1); }},
    ];

    // ch記録によるマップの書き換え
    //ch.wall.filter(v => v[0] == ch.map).map(v => Map.replace(0x2b, [v[1].x, v[1].y]));
    ch.tree.map(v => Map.replace(0x12, [v[1].x, v[1].y]));
    ch.warp.filter(v => v[0] == ch.map).forEach(v => Map.replace(0x09, v[1]));
    if (ch.isdone("loop"))  Map.replace(0x12, [41, 101]); // 再石化しない
    if (ch.lostkey.indexOf("+shift") < 0) Map.replace(0x11, [39,93]);
    if (ch.lostkey.indexOf("+bs")    < 0) Map.replace(0x11, [47,83]);
    if (ch.lostkey.indexOf("+enter") < 0) Map.replace(0x11, [32,49]);
    if (ch.lostkey.indexOf("+esc")   < 0) Map.replace(0x11, [95,69]);

    //霧の谷イベント用
    const X0 = 110;
    const Y0 = 57;
    [...Array(20)].map((v,i)=> {
        [2,3,4,5].map(y => (i==5 && y==2) ? "" : Map.replace(0x0a, [X0+i,Y0+y])); // 亜空間
        Map.replace(1, [X0+i, Y0-1]); // 域外
        Map.replace(1, [X0+i, Y0+19]);
        Map.replace(1, [X0-1, Y0+i]);
        Map.replace(1, [X0+12,Y0+i]);
    });
    
    return ret;
};


/////////////////////////////////// MapEvents
const event_solphes = () => {
    let ret = {};
    ret.jumper = [0x01, 0x0c, 0x1c, 0x37, 0x29, 0x2a, 0x3f]; // 緑扉扉扉㊦㊤ワ
    ret.across = [0x25 + 0x80, 0x32 + 0x80];
    ret.enemy = false;
    ret.make_bed = () => {};
    return ret;
};

const event_town2map = () => {
    let ret = {};
    ret.jumper = [0x01, 0x0c, 0x1c, 0x37, 0x29, 0x2a, 0x3f]; // 緑扉扉扉㊦㊤ワ
    ret.across = [0x25 + 0x80, 0x32 + 0x80];
    ret.enemy = false;
    ret.make_bed = () => {
        if (Map.symbol(ch.towhere()) !== 0xab) return false;
        Map.replace(0x2b);
        return true;
    };

    let footlist = [
        //扉
        // ASDF
        {"sym":28,"loc":[14,16],"jump":{"sym":1,stepin:1, loc:[78,35]}},  // 2house
        {"sym":28,"loc":[22,9], "jump":{"sym":1,stepin:1,"loc":[84,47]}}, // 3house
        {"sym":28,"loc":[9,10], "jump":{"sym":1,stepin:1,"loc":[49,23]}}, // mayor
        {"sym":28,"loc":[14,10],"jump":{"sym":1,stepin:1,"loc":[55,47]}}, // hotel
        {"sym":28,"loc":[8,13], "jump":{"sym":1,stepin:1, loc:[43,35]}},  // market
        {"sym":28,"loc":[24,14],"jump":{"sym":1,stepin:1,"loc":[66,23]}}, // keyshop
        {"sym":28,"loc":[28,16],"jump":{"sym":1,stepin:1,"loc":[89,23]}}, // bighand
        // JKL
        {"sym":28,"loc":[9,28], "jump":{"sym":1,stepin:1,"loc":[114,59]}},// 2house
        {"sym":28,"loc":[12,28],"jump":{"sym":1,stepin:1,loc:[97,35]}},   // keyshop
        {"sym":28,"loc":[16,28],"jump":{"sym":1,stepin:1,loc:[114,35]}},  // hotel
        {"sym":28,"loc":[9,31], "jump":{"sym":1,stepin:1,"loc":[101,47]}},// market
        {"sym":26,"loc":[15,32],"jump":{  sym:1,stepin:1,"loc":[107,4]}}, // bighand
        // RTYU
        {sym:0x37, loc:[9,44],  jump:{sym:1, stepin:1, loc:[35,83]}}, //hotel
        {sym:0x37, loc:[9,49],  jump:{sym:1, stepin:1, loc:[35,71]}}, //market
        {"sym":55,"loc":[18,49],"jump":{"sym":1,stepin:1,"loc":[64,83]}},  // keyshop
        {"sym":55,"loc":[18,44],"jump":{"sym":1,stepin:1,"loc":[41,119]}}, // diving
        {"sym":55,"loc":[13,49],"jump":{"sym":1,stepin:1,"loc":[63,59]}},  // 2house
        {"sym":55,"loc":[12,42],"jump":{"sym":1,stepin:1,"loc":[29,95]}},  // nagaya1
        {"sym":55,"loc":[13,42],"jump":{"sym":1,stepin:1,"loc":[35,95]}},  // nagaya2
        {"sym":55,"loc":[14,42],"jump":{"sym":1,stepin:1,"loc":[41,95]}},  // nagaya3
        // GH
        {"sym":28,"loc":[13,59],"jump":{"sym":1,stepin:1,"loc":[52,119]}}, // robothotel
        {"sym":28,"loc":[15,61],"jump":{"sym":1,stepin:1,"loc":[63,119]}}, // 2robots
        {"sym":28,"loc":[7,61], "jump":{"sym":1,stepin:1,"loc":[52,107]}, // bighand
         onstep: () => BigHand.gate(4) }, 
        // QWE
        {sym:0x37, loc:[16,74], jump:{sym:1, stepin:1, loc:[81,107]}, },    // market
        {sym:0x1c, loc:[10,74], jump:{sym:1, stepin:1, loc:[81,89]}, },     // keyshop
        {"sym":28,"loc":[12,71],"jump":{"sym":1,stepin:1,"loc":[75,77]}}, // hotel
        {"sym":55,"loc":[7,71], "jump":{"sym":1,stepin:1,"loc":[80,59]}}, // oyako
        // Laketown
        {"sym":28,"loc":[9,84], "jump":{"sym":1,stepin:1,"loc":[108,71]}}, // market
        {"sym":28,"loc":[13,85],"jump":{"sym":1,stepin:1,"loc":[114,101]}},// hotel
        {"sym":28,"loc":[8,87], "jump":{"sym":1,stepin:1,"loc":[102,83]}}, // 1house+2beds
        {"sym":28,"loc":[10,87],"jump":{"sym":1,stepin:1,"loc":[114,83]}}, // 2robots+save
        //階段
        {sym:0x2a, loc:[33,78], jump:{sym:0x29, loc:[61,66]}, },
        {"sym":41,"loc":[57,6]},{"sym":41,"loc":[72,6]},{"sym":41,"loc":[115,9]},{"sym":41,"loc":[50,54]},
        {"sym":41,"loc":[51,67]},{"sym":41,"loc":[27,102]},{"sym":41,"loc":[43,102]},
        {"sym":42,"loc":[57,18]},{"sym":42,"loc":[72,18]},{"sym":42,"loc":[115,21]},{"sym":42,"loc":[50,66]},
        {"sym":42,"loc":[51,79]},{"sym":42,"loc":[27,114]},{"sym":42,"loc":[43,114]},
        
        {sym:0x2e, loc:[88, 13], onstep: () => { BigHand.lecture("ASDF"); }}, // ajdf
        {sym:0x2f, loc:[90,  7], onstep: () => { BigHand.practice(1); }},
        {sym:0x24, loc:[89, 16], onstep: () => { BigHand.gate(1); }},
        {sym:0x2e, loc:[107,20], onstep: () => { BigHand.lecture("JKL"); }}, // jkl;
        {sym:0x2f, loc:[101,19], onstep: () => { BigHand.practice(2); }},
        {sym:0x24, loc:[113,19], onstep: () => { BigHand.gate(2); }},
        {sym:0x2e, loc:[42, 61], onstep: () => { BigHand.lecture("RTYU"); }}, // rtyu
        {sym:0x2f, loc:[40, 55], onstep: () => { BigHand.practice(3); }},
        {sym:0x24, loc:[41, 64], onstep: () => { BigHand.gate(3); }},
        {sym:0x2e, loc:[52, 98], onstep: () => { BigHand.lecture("GH"); }},  //gh
        {sym:0x2e, loc:[64, 98], onstep: () => { BigHand.lecture("\x08"); }},
        {sym:0x2f, loc:[58, 92], onstep: () => { BigHand.practice(4); }},
        {sym:0x2e, loc:[80, 98], onstep: () => { BigHand.lecture("QWE"); }}, //qwe
        {sym:0x2f, loc:[86, 97], onstep: () => { BigHand.practice(5); }},
        {sym:0x24, loc:[75,100], onstep: () => { BigHand.gate(5); }},
        
        {sym:0x2b, onstep: () => { ch.sleep(); }},
        {sym:0x28, onstep: () => { ch.savezone(); }},
        {sym:0x0b, onstep: () => { ch.savezone(); }},
        
        {loc: [37,78], onstep: () => { Kago.casher(); }}, // rtyu
        {loc: [37,81], onstep: () => { Kago.wrongway(); }}, 
        {loc: [36,78], onstep: () => { Kago.off(); }}, 
        {loc: [83,84], onstep: () => { Kago.casher(); }}, // qwe
        {loc: [83,87], onstep: () => { Kago.wrongway(); }},
        {loc: [82,84], onstep: () => { Kago.off(); }}, 
        {loc: [102,42], onstep: () => { Kago.casher(); }}, // jkl;
        {loc: [102,45], onstep: () => { Kago.wrongway(); }},
        {loc: [101,42], onstep: () => { Kago.off(); }}, 
    ];

    ret.FootEvents = interact_footevents(footlist, ret.jumper);
        
    ret.speakEvents = [
        // キーショップ
        {loc:[65,8], onspoken: function() { //ASDF
            KeyShop({guide:"キーをお買いください。", none:"A,S,Dのキーは既にお持ちみたいですね。", level:1});
        }},
        {loc:[97,30], onspoken: function() { //JKL;
            KeyShop({
                guide: "キーをお買いください。",
                none: "こちらで販売しているキーは//既にお持ちのようですが…。",
                level:2
            });
        }},
        {loc:[52,57], onspoken: function(talks) { //RTYU
            if (ch.lostkey.indexOf("+bs") != -1)
                return Dialog(talks[1]);
            KeyShop({guide:"キーショップですよ。", none: "お売りできるキーはないようです。", level:3,});
        }},
        {sym:0xda, loc:[81,102],
         branch: ch.isdone("qwekey") ? (talk) => [ //QWEGH
             () => KeyShop({
                 level:[4,5], guide:talk[1], //"キーショップに衣替えしました。"
                 none:"お売りできるキーはもうなさそうです。",
             }), {wait:true}, ]
         : (talk) => {
             ch.setdone("qwekey");
             return talk[0]; //"剣と盾が売れませんね。//え。他の町ではキーを売ってる?"
         }},

        // マーケット
        {loc:  [42, 30], onspoken: () => {Shojihin.sell();}}, // asdf
        {loc:  [28, 79], onspoken: () => {Shojihin.sell();}}, // jkl
        {loc:  [74, 84], onspoken: () => {Shojihin.sell();}}, // rtyu
        {loc: [114, 44], onspoken: () => {Shojihin.sell();}}, // qwe

        // ホテル
        {loc:[55,42], onspoken: (talk) => Hotel({  //asdf
            talk:talk[0],
            guide:talk[1],//"ホテルアズドフへようこそ。\n一泊5スパイスですが、泊まりますか?",
            room:"では手前の部屋をお使いください。",
            spice:5, loc:[51,42],
        })
        },
        {loc:[113,30], onspoken: (talk) => Hotel({ // jkl;
            talk: talk[0],
            guide:talk[1],//"一泊5スパイスです。",
            short:"ちょっと料金が足りません。",
            room:talk[2],//"では手前の部屋をお使いください。",
            spice:5, loc:[116,30],
        })
        },
        {loc:[35,66], onspoken: (talk) => Hotel({ // rtyu
            talk: talk[0],
            guide:talk[1],//"ルチュホテルです。一泊10スパイスです。" 
            room:talk[2],//"では手前から2番目の部屋をお使いください。"
            spice:10, loc:[31,61],
        })
        },
        {loc:[36,66], sym:0xde, onspoken: (talk) => Hotel({ // rtyu
            talk: talk[0],
            guide:talk[1], //("ルチュホテルです。一泊10スパイスです。")
            room:talk[2], //"では手前から2番目の部屋をお使いください。"
            spice:10, loc:[31,61],
        })
        },
        {loc:[51,115], onspoken: (talk) => Hotel({ // gh
            talk: talk[0],
            guide: talk[0],//"グーホテルヘヨウコソ。一泊10スパイス。"
            short: talk[2],//"オ金ホシイ。",
            room: talk[1],//"ゴユックリ。",
            spice:10, loc:[54,114], })
        },
        {loc:[73,71], onspoken: (talk) => Hotel({  //qwe
            talk: talk[0],
            guide:talk[1],
            short:"生憎スパイスが足りないようです。",
            room:"北東の部屋へどうぞ。",
            loc:[83,66], spice:10, }),
        },
        // 拾得イベント
        {loc:[35,61], onspoken: () => {
            ch.pickup("何か", "鯨のスリッパ", 0x10, () => ch.setdone("slipper"));
        }},

        // その他イベント
        // ASDF払い戻し
        {loc:[12,15], branch: (talk) => {
            if (ch.isdone("payback")) return talk[3]; // ToDo: Capsチェック
            ch.spice += 150;
            ch.setdone("payback");
            return talk.slice(0,3).concat(Draw.status);
        }},
        // ASDF EXPチェック屋外
        {loc:[22,12], branch: (talk) => (ch.expr < 900) ? talk.slice(0,2).join("\n") :
         [talk[0], talk[2]].join("\n")
        },
        // ASDF EXPチェック屋内
        {loc:[90,43], branch: (talk) => (ch.expr < 900) ? talk[0] : talk[1]},
        // ASDF loopチェック
        {loc:[84,31], branch: (talk) => ch.isdone("loop") ? talk[0]+talk[2] : talk[0]+talk[1]},
        // ASDF 美人
        {loc:[79,45], branch: GetRand(2) ? (talk) => talk[0] : (talk) => talk[1]},
        // ASDF 村長
        {loc:[48,6], branch: (talk) => ch.isdone("loop") ? talk.slice(3) : talk.slice(0,3)},
        // RTYU マーケット社長
        {loc:[64,68], branch: (talk) => {
            if (ch.isdone("tamao") && !ch.isdone("tamaorin")) return talk[6];
            if (ch.isdone("slipper")) return talk[5];
            return ch.isdone("grandma") ? talk.slice(1,5) : talk[0];
        }},
        // RTYU ダイビングスクール
        {loc:[36,102], branch: (talk) => ch.isdone("lang") ? talk[0] : talk[1]},
        {loc:[33,104], branch: (talk) => ch.isdone("lang") ? talk[0] : talk[1]},
        {loc:[29,105], branch: (talk) => ch.isdone("lang") && !ch.isdone("depth") ? talk[1] : talk[0]},
        
        // QWEキーショップ店員
        {loc:[79,103], branch: ch.isdone("qwekey") ? (talk) => talk[1] : (talk) => talk[0]},

        // QWE ダイバー
        {loc:[81,54], onspoken: ch.isdone("qwediver") ? (talk) => {
            if (ch.isdone("lang")) return Dialog(talk[5]);
            ch.purchase({
                query:talk[2],
                spice:100, short:talk[3],
                agree:() => {
                    Dialog(talk[4]);
                    ch.setdone("lang");
                }
            });
        } : (talk) => {
            Draw.sequence(talk.slice(0,2));
            ch.setdone("qwediver");
        },
         talk:["ダイビングに行くんだ。","マジュー? 食べちゃえばいい。",
               "やばかった。//100スパイスでアクアラング売るよ。",
               "お金持ってないじゃないか。",
               "はいよ。",
               "アクアラングの使い方なら、//ルチュ村のダイビングスクールで教えてるよ。"]
        },
        // RTYU チャトフィッシュ売り
        {loc:[31,115], onspoken: (talks) => {
            if (!ch.isdone("tamao") || Items.has("tsukuda")) {
                return Dialog(talks[0]);
            }
            ch.purchase({
                query:talks.slice(0,3).join("\n"),
                spice:200, short:talks[4],
                agree:() => {
                    if (!Shojihin.add(["tsukuda"])) return "full";
                    Draw.sequence(talks[3]);
                },
            });
        }, talk:[
            "可愛らしい魚よね。",
            "チャトフィッシュの佃煮がほしい?","200スパイスで売ってくれ?", 
            "どうぞ。",
            "お金持ってないようだけど。",
        ]},
        // 湖底村ロボット
        {loc:[115,79], onspoken: () => {
            ch.purchase({
                query:"星チーズ 1個 15スパイス。ブクブク//イカガ デショウ。ブク ブク ブク...", 
                spice:15, short:"オカネ ホシイ。", full:"モテナイ。",
                agree:() => {
                    if(!Shojihin.add(["cheese"])) return "full";
                    TextBar("星チーズを買った。");
                },
            });
        }},
    ].concat(common_town_speakevents());

    // マップ差し替え
    if (ch.isdone("grandma")) Map.replace(0x20, [36,66]);  // rtyu hotelman
    if (!ch.isdone("slipper")) Map.replace(0x90, [35,61]); // slipper
    // adsf穴補修(Todo:talkイベント削除)
    if (ch.isdone("loop")) {
        [...Array(5)].map((none,y)=> {
            [...Array(5)].map((none,x)=> Map.replace(0x10, [x+17, y+11]));
        });
        Map.replace(0x10, [19,10]);
        Map.replace(0x93, [19,13]);
        Map.replace(0x92, [20,14]);
    }

    return ret;
};


///////////////////////////////////
const event_town3map = () => {
    let ret = {};
    ret.jumper = [0x01, 0x0c, 0x1c, 0x37, 0x29, 0x2a, 0x3f]; // 緑扉扉扉㊦㊤ワ
    ret.across = [0x25 + 0x80, 0x32 + 0x80];
    ret.enemy = false;
    ret.make_bed = () => {
        if (Map.symbol(ch.towhere()) !== 0xab) return false;
        Map.replace(0x2b);
        return true;
    };

    let footlist = [
        //扉
        //IOP
        {"sym":12,"loc":[8,9],   jump: {sym:1, stepin:1, loc:[35,13]}}, // hotel
        {"sym":12,"loc":[19,10], jump: {sym:1, stepin:1, loc:[35,43]}}, // 22house
        {"sym":12,"loc":[9,17],  jump: {sym:1, stepin:1, loc:[58,13]}}, // 3house
        {"sym":12,"loc":[12,17], jump: {sym:1, stepin:1, loc:[35,25]}}, // keyshop
        {"sym":12,"loc":[18,17], jump: {sym:1, stepin:1, loc:[52,25]}}, // market
        // ZXC
        {"sym":12,"loc":[8,27],  jump: {sym:1, stepin:1, loc:[52,37]}},
        // VBNM
        {"sym":55,"loc":[9,45],  jump: {sym:1, stepin:1, loc:[35,55]}}, // hotel
        {"sym":55,"loc":[18,46], jump: {sym:1, stepin:1, loc:[47,121]}}, // school+bighand
        {"sym":55,"loc":[13,47], jump: {sym:1, stepin:1, loc:[35,92]}}, // hinanjo
        {"sym":55,"loc":[10,50], jump: {sym:1, stepin:1, loc:[41,68]}}, // market
        {"sym":55,"loc":[14,50], jump: {sym:1, stepin:1, loc:[58,55]}}, // 2house+3bed
        {"sym":55,"loc":[18,50], jump: {sym:1, stepin:1, loc:[52,92]}}, // keyshop
        // 4567
        {"sym":55,"loc":[9,62],  jump: {sym:1, stepin:1, loc:[58,68]}}, // market+none
        {"sym":55,"loc":[17,64], jump: {sym:1, stepin:1, loc:[86,92]}}, // hotel+none
        {"sym":55,"loc":[9,66],  jump: {sym:1, stepin:1, loc:[69,92]}}, // hospital
        {"sym":55,"loc":[13,66], jump: {sym:1, stepin:1, loc:[104,121]}}, // tower+2bed
        {"sym":55,"loc":[10,69], jump: {sym:1, stepin:1, loc:[87,103]}}, // 2house+none
        {"sym":55,"loc":[13,69], jump: {sym:1, stepin:1, loc:[87,114]}}, // save
        {"sym":55,"loc":[17,69], jump: {sym:1, stepin:1, loc:[70,115]}, // bighand
         onstep: () => BigHand.gate(10) },
        // airport
        {"sym":28,"loc":[10,82], jump: {sym:1, stepin:1, loc:[82,56]}},
        
        //階段 
        {"sym":16, loc:[73,23], jump:{sym:41, "loc":[98,11]},}, // airport2-3
        {"sym":41,"loc":[87,32]},{"sym":41,"loc":[56,76]},{"sym":41,"loc":[67,76]},{"sym":41,"loc":[94,76]},
        {"sym":41,"loc":[105,73]},{"sym":41,"loc":[106,83]},{"sym":41,"loc":[105,95]},{"sym":41,"loc":[106,105]},
        {"sym":41,"loc":[45,108]},
        {"sym":42,"loc":[87,54]},{"sym":42,"loc":[56,87]},{"sym":42,"loc":[67,87]},{"sym":42,"loc":[94,87]},
        {"sym":42,"loc":[105,84]},{"sym":42,"loc":[106,94]},{"sym":42,"loc":[105,106]},{"sym":42,"loc":[106,116]},
        {"sym":42,"loc":[45,119]},
        
        {sym:0x2e, loc:[14, 12], onstep: () => { BigHand.lecture("IOP"); }},
        {sym:0x2e, loc:[9,  33], onstep: () => { BigHand.lecture("ZXC"); }},
        {sym:0x2e, loc:[13, 32], onstep: () => { BigHand.lecture(",./"); }},
        {sym:0x2e, loc:[34,111], onstep: () => { BigHand.lecture("VBMN"); }},
        {sym:0x2e, loc:[75,110], onstep: () => { BigHand.lecture("\x0d"); }},
        {sym:0x2e, loc:[72,107], onstep: () => { BigHand.lecture("$%&'"); }},
        {sym:0x2e, loc:[68,107], onstep: () => { BigHand.lecture("4567"); }},
        {sym:0x2f, loc:[14, 10], onstep: () => { BigHand.practice(6); }},
        {sym:0x2f, loc:[ 9, 31], onstep: () => { BigHand.practice(7); }},
        {sym:0x2f, loc:[13, 28], onstep: () => { BigHand.practice(8); }},
        {sym:0x2f, loc:[36, 99], onstep: () => { BigHand.practice(9); }},
        {sym:0x2f, loc:[70,103], onstep: () => { BigHand.practice(10); }},
        {sym:0x17, loc:[11, 12], onstep: () => { BigHand.gate(6); }},
        {sym:0x26, loc:[12,30],  onstep: () => { BigHand.gate(8); }},
        {sym:0x26, loc:[14,30],  onstep: () => { BigHand.gate(8); }},
        {sym:0x24, loc:[35,114], onstep: () => { BigHand.gate(9); }},

        {sym:0x2b, onstep: () => { ch.sleep(); }},
        {sym:0x28, onstep: () => { ch.savezone(); }},
        {sym:0x0b, onstep: () => { ch.savezone(); }},
        {loc: [42,66], onstep: () => { Kago.wrongway(); }},  // vbnm
        {loc: [42,63], onstep: () => { Kago.casher(); }},
        {loc: [41,63], onstep: () => { Kago.off(); }},
        {loc: [55,23], onstep: () => { Kago.wrongway(); }}, //iopa
        {loc: [55,20], onstep: () => { Kago.casher(); }}, 
        {loc: [54,20], onstep: () => { Kago.off(); }},
        
        // 塔の屋上
        {sym:1, range:{x:[100,108],y:[70,78]}, onstep: () => {
            Draw.sequence([
                {t:("飛び降りた。")},
                {func:() => { Map.jump({map:1,loc:[11,44],stepin:2}); }}
            ]);
        }},
    ];

    ret.FootEvents = interact_footevents(footlist, ret.jumper);
    
    ret.speakEvents = [
        // キーショップ
        {loc:[33,20], onspoken: function() { // IOP@
            KeyShop({level:6});
        }},
        {loc:[38,20], onspoken: function() { // ZXC
            KeyShop({level:7});
        }},
        {loc:[42,20], onspoken: function() { // ,./
            KeyShop({level:8});
        }},
        {loc:[50,77], onspoken: function() { // VBNM
            KeyShop({level:9});
        }},
        {loc:[60,78], branch: (talk) => ch.lostkey.indexOf("+enter") < 0 ? // 4567
         [() => KeyShop({level:10}), {wait:true}] : talk[0],
         // "Enterキーはないですね。//4,5,6,7ならありますが。"
        },
        // ホテル
        {loc:[34,8], onspoken: (talk) => { // iopa
            Hotel({ talk:talk[0], guide: talk[1], room: talk[2],
                    spice:15, loc:[39,8]}); }},
        {loc:[34,51], onspoken: (talk) => { //vbnm
            Hotel({ talk: talk[0], guide: talk[1], room: talk[2],
                    spice: 20, loc: [39,50]}); }},
        // マーケット
        {loc: [35,63], onspoken: () => { Shojihin.sell(); }},
        {loc: [51,20], onspoken: () => { Shojihin.sell(); }},
        // 拾得イベント
        {loc:[107,14], sym:0x98, onspoken: () => {
            ch.pickup("何か", "風見タヌキ", 0x18, () => ch.setdone("weather"));
        }},
        // その他イベント
        // VBMN おにぎり
        {loc:[37,86], branch: (talks) => [
            {d: talks[0], confirm:true},
            () => {
                if (4 <= Map.record_talk("onigiri")) return Draw.sequence(talks[2]);
                if (!Items.add(["onigiri"])) return Draw.sequence(talks[3]);
                Map.record_talk("onigiri", 1);
                return Draw.sequence(talks[1]);
            }, {wait:true},
        ]
        },
        // VBMN ホテル誘導
        {loc:[57,89], branch: (talks) =>
         (ch.isdone("grandma") && !ch.isdone("slipper")) ? talks[1] : talks[0]
        },
        // VBNM 調査員
        {loc:[48,50], branch: (talks) => {
            if (!ch.isdone("grandma") || !ch.isdone("mission")) {
                ch.setdone("mission")
                return talks.slice(0,2);
            }
            if (!ch.isdone("slipper")) return talks.slice(2,4);
            return talks.slice(4,6);
        },
         talk:[
             "王室から派遣された調査員ですが...えっ、//あなたがあの有名なキーボード使いですか。//クムドールへいらしてたんですね。",
             "しかし困りました...//何とかあの溶岩を渡る方法を見つけないと。",
             "鯨のスリッパというのが//あるかは存じませんが、",
             "ルチュ村のマーケット経営者が珍しい\nスリッパを集めている噂があるそうです。",
             "鯨のスリッパなんて、まさか//本当にあったんですね。",
             "お願いします、//あなたのお力を一刻も早く宮殿に。",
         ].join("|"),
        },
        // 4567 ミド祖母
        {loc:[75,76], branch: (talks) => {
            if(!ch.isdone("slipper") || !ch.warp.find(v=> v.join(",")==="4,35,83")) {
                ch.setdone("grandma");
                return talks.slice(0,3);
            }
            if (!ch.isdone("grandsleep")) {
                ch.setdone("grandsleep");
                return talks.slice(3,6);
            }
            return ch.isdone("mido") ? talks.slice(7) : talks[6];
        },
         talk:[
             "みんなミドは死んじゃったなんていうんです。//えっ、あなたがあの有名な?//ミドがここにいればねえ。",
             "ミドはあなたに憧れて、//自分も銀河一のキーボード使いに//なるんだと言っておりました。",
             "ああ、私が元気なら鯨のスリッパをはいて//溶岩を渡って行けるのに。",
             "えっ。ミドが見つかった?//ドリームポイント??//どんな場所なのかしら。",
             "夢の中からミドに言い聞かせるのね。//何とかやってみるわ。",
             "\f一生懸命眠っている。",
         ],
        },
        // 4567 看護ロボット
        {loc:[74,76], branch: (talks) => {
            if(!ch.isdone("slipper")) return talks[0];
            if(!ch.isdone("grandsleep")) return talks[1];
            return talks[2];
        },
        },

    ].concat(common_town_speakevents());

    // マップ差し替え
    if (ch.isdone("weather")) Map.replace(0x18, [107,14]);
    if (ch.isdone("mido")) Map.replace(0xed, [76,77]);
    return ret;
};

///////////////////////////////////
const event_town4map = () => {
    let ret = {};
    ret.jumper = [0x01, 0x15, 0x16, 0x17, 0x29, 0x2a, 0x0a, 0x3a, 0x08];  // 緑扉扉扉㊦㊤㊤㊤ワ
    ret.across = [0x25 + 0x80, 0x4e + 0x80, 0x4f + 0x80];
    ret.enemy = false;
    ret.make_bed = () => {
        if (Map.symbol(ch.towhere()) !== 0xab) return false;
        Map.replace(0x2b);
        return true;
    };

    let footlist = [
        // 扉
        {sym:0x15, loc:[9,23],  jump:{sym:1,stepin:1,loc:[150/2,53]}},      // tax
        {sym:0x16, loc:[16,24], jump:{sym:1,stepin:1,loc:[58,123]}},  // market
        {sym:0x16, loc:[14,20], jump:{sym:1,stepin:1,loc:[114,100]}}, // home
        {loc: [114,100], jump:{loc:[14,21]}, onstep: () => ch.isdone("myhome") ? true : ch.remand() },
        {sym:0x17, loc:[31,24], jump:{sym:1,stepin:1,loc:[114,71]}},  // labo
        {"sym":21,"loc":[14,13],jump:{sym:1,stepin:1,loc:[69,97]},},  //124bil
        {"sym":23,"loc":[25,23],jump:{sym:1,stepin:1,loc:[52,94]},},  //hotel
        {"sym":22,"loc":[32,13],jump:{sym:1,stepin:1,loc:[108,123]}}, //gym
        {"sym":22,"loc":[24,10],jump:{sym:1,stepin:1,loc:[114,89]}},  //bar
        {"sym":22,"loc":[10,13],jump:{sym:1,stepin:1,loc:[92,53],}}, //22house+semi
        {"sym":23,"loc":[17,13],jump:{sym:1,stepin:1,loc:[92,36],}}, //222apartment
        {"sym":21,"loc":[28,24],jump:{sym:1,stepin:1,loc:[86,86],}}, //113house
        {"sym":23,"loc":[8,13], jump:{sym:1,stepin:1,loc:[86,97]}},  //11+Urecep
        {"sym":23,"loc":[34,24],jump:{sym:1,stepin:1,loc:[91,119]}}, //11+Lrecep
        {"sym":23,"loc":[34,20],jump:{sym:1,stepin:1,loc:[91,108]}}, //11+tv
        {"sym":22,"loc":[10,9], jump:{sym:1,stepin:1,loc:[97,75]},}, //2house+6table
        {"sym":22,"loc":[24,13],jump:{sym:1,stepin:1,loc:[97,64]},}, //2house+2room
        {"sym":22,"loc":[27,9], jump:{sym:1,stepin:1,loc:[97,86]},}, //2house+none
        {"sym":22,"loc":[27,13],jump:{sym:1,stepin:1,loc:[97,97]},}, //2house+shelf
        {"sym":22,"loc":[17,20],jump:{sym:1,stepin:1,loc:[46,105]}}, //2house+tvbed
        {"sym":22,"loc":[10,47],jump:{sym:1,stepin:1,loc:[9,69]},},  //park

        // 階段
        {sym:0x2a, loc:[83,51], jump:{sym:0x29, loc:[83,34]}}, // tax
        {sym:0x2a, loc:[82,33], jump:{sym:0x29, loc:[82,16]}}, // tax
        {sym:0x29, loc:[122,95],   jump:{sym:0x0a, loc:[66/2,70]}}, // home:下階
        {sym:0x3a, loc:[242/2,48], jump:{sym:0x29, loc:[242/2,31]}}, // labo
        {sym:0x2a, loc:[244/2,31], jump:{sym:0x29, loc:[244/2,14]}}, // labo
        {"sym":41,"loc":[51,16]},{"sym":41,"loc":[51,37]},{"sym":41,"loc":[51,62]},
        {"sym":41,"loc":[67,59]},{"sym":41,"loc":[68,71]},{"sym":41,"loc":[67,81]},
        {"sym":41,"loc":[88,62]},{"sym":41,"loc":[88,72]},
        {"sym":41,"loc":[100,17]},{"sym":41,"loc":[13,89]},
        {"sym":42,"loc":[51,39]},{"sym":42,"loc":[51,60]},{"sym":42,"loc":[51,85]},
        {"sym":42,"loc":[67,70]},{"sym":42,"loc":[67,92]},{"sym":42,"loc":[68,82]},
        {"sym":42,"loc":[88,73]},{"sym":42,"loc":[88,83]},
        {"sym":42,"loc":[100,34]},{"sym":42,"loc":[13,108]},

        {sym:0x2e, loc:[81, 26], onstep: () => { BigHand.lecture("123"); }},
        {sym:0x2e, loc:[114,49], onstep: () => { BigHand.lecture("890"); }},
        {sym:0x2e, loc:[27,117], onstep: () => { BigHand.lecture("-^="); }},
        {sym:0x2e, loc:[15,117], onstep: () => { BigHand.lecture("[]:"); }},
        {sym:0x2f, loc:[69, 26], onstep: () => { BigHand.practice(11); }},
        {sym:0x2f, loc:[114,43], onstep: () => { BigHand.practice(12); }},
        {sym:0x2f, loc:[27,115], onstep: () => { BigHand.practice(13); }},
        {sym:0x2f, loc:[15,115], onstep: () => { BigHand.practice(14); }},
        {sym:0x24, loc:[75, 29], onstep: () => BigHand.gate(11) },
        {sym:0x2a, loc:[122,66], onstep: () => BigHand.gate(12), jump:{sym:0x29, loc:[122,48]}},
        {sym:0x38, loc:[25,119], onstep: () => BigHand.gate(13) },
        {sym:0x38, loc:[17,119], onstep: () => BigHand.gate(14) },

        {sym:0x2b, onstep: () => { ch.sleep(); }},
        {sym:0x28, onstep: () => { ch.savezone(); }},
        {sym:0x39, onstep: () => { ch.savezone(); }},
        {loc: [55,120], onstep: () => { Kago.off(); }},
        {loc: [54,120], onstep: () => { Kago.casher(); }},
    ];

    ret.FootEvents = interact_footevents(footlist, ret.jumper);
    
    ret.speakEvents = [
        //キーショップ
        {loc:[64,121], onspoken: function() { KeyShop({level:11}); }},
        {loc:[72,120], onspoken: function() { KeyShop({level:12}); }},
        {loc:[70,112], onspoken: function() { KeyShop({level:13}); }},
        {loc:[64,112], onspoken: function() { KeyShop({level:14}); }},
        //マーケット
        {loc: [59,112], onspoken: () => { Shojihin.sell(); }},
        // ホテル
        {loc:[52,89], onspoken: (talk) => {
            let rooms = [201,204,205,206,301,302,303,304,305,306,401,402,403,404,405,406];
            let room = rooms[GetRand(rooms.length)];
            let a = parseInt(room / 100) - 2; // 階数
            let b = (room % 10 - 1) % 3; // 東西
            let c = parseInt((room % 10 - 1) / 3);   // 南北
            let loc = [44 + 6*b + 4*c, 54 - a*23 + 15*c];
            Hotel({
                spice: 40, loc: loc,
                talk: talk[0],
                guide: talk[1],
                room: "では" + room + "号室のお部屋をお使いください。",
            }); }
        },
        //イベント類
        // 不動産
        {loc:[77,60], onspoken: function(talk) {
            if (ch.isdone("myhome")) {
                return Dialog(talk[3]);//"いい買い物をしましたよ。"
            }
            ch.purchase({
                spice:2000,
                query:talk[0],//"2000スパイスで家買いません?"
                cancel:talk[2], // "気が変わったらまたどうぞ"
                agree: () => {
                    Map.replace(0x16, [14,20]);
                    ch.setdone("myhome");
                    Dialog(talk[1]); // "マーケットの裏です。"
                }
            });
        }},
        // 研究所長
        {loc:[115,9], branch: ch.isdone("handmade") ? (t) => {
            ch.setdone("masspro");
            return t.slice(8);//"大量生産したいという話があって、\n2-3日後には安く買えるみたいですよ。"
        }: (talks) => {
            if (ch.isdone("handmade")) {
                return talks[5];//"今 材料集め中です。"
            }
            if (ch.isdone("tamaorin")) {
                return [
                    {d:talks[6], confirm:true}, //"500スパイスかかりますが、作りますか?"
                    () => ch.setdone("handmade"),
                    talks[7], //"では、2-3日お待ちください。"
                ];
            }
            if (!ch.isdone("tamao") || !Items.has("memo")) {
                return talks[0];//"タマオ博士どこいったんだ。"
            }
            ch.setdone("tamaorin");
            Items.remove("memo");
            Items.add(["t"]);
            return talks.slice(1,5);
            `
            [
                {d:"へー。タマオ博士がそんなことを。", thru:true},
                {t:"(メモを渡した)"},
                {d:"このメモの調合で試作できましたよ。//この薬、「タマオリン」と呼びましょうか。"},
                {d:"今回は試作なので提供しますが、//次からは500スパイスかかります。"},
                {t:"(タマオリンを受け取った)"},
            ];
`
        }},
        {sym:0xca, talk:"エレベータは故障中です。"},
        // 研究所員
        {loc:[114,31], branch: (t) => ch.isdone("tamamo") ? t[1] : t[0]},
        {loc:[119,16], branch: (t) => ch.isdone("masspro") ? t[1] : t[0]},
        {loc:[118,13], branch: (t) => ch.isdone("masspro") ? t[1] : t[0]},
        // チリー通商職員
        {loc:[75,72], branch: ch.isdone("masspro") ? (t) => t[1] : (t) => t[0]},
        {loc:[72,70], branch: ch.isdone("masspro") ? (t) => t[1] : (t) => t[0]},
        
        // 正面門番
        {loc:[19,114], branch: (t) => ch.isdone("kingopen") ? t[3] : t.slice(0,3)},
        // 詐称
        {loc:[22,114], branch: (t) => ch.isdone("kingopen") ? t[2] : t[GetRand(2)]},
        // 裏口門番
        {loc:[15,105], branch: (t) => {
            if (ch.isdone("uraguchi")) return t[2];
            ch.setdone("uraguchi");
            Map.replace(0x49, [14,106]);
            return t.slice(0,2);
        }},
        // 2階女王付き人
        {loc:[25,84], branch: (t) => ch.isdone("queenmeet") ? t[1] : t[0] },
        // 国王
        {loc:[20,104], branch: (talks) => {
            if (ch.isdone("kingopen")) return talks[3];
            ch.setdone("kingopen");
            Map.replace(0x49, [23,106]);
            Map.replace(0x49, [21,112]);
            return talks.slice(0,3);
        },
         talk: [
             "国王だけどあんた誰?",
             "ええええっ。そりゃ大変。",
             "今 隣で会議中なんだが、\nぜひ顔出ししてやってください。\nおーい開けてやんなさい。",
             "うーむこの本は面白い。",
         ]},
        // 国王異変明け
        {loc:[20,108], onspoken: (t) => {
            if (ch.targetspeed == 3) return Draw.sequence(t.slice(0,3));
            let seq = t.filter(t => true);
            seq[8] = {confirm: true, cancel:() => { Dialog(t[8]); }},
            seq.splice(1,2);
            seq.splice(1,0, () => {
                Map.replace(0xec, [19,108]); // 女王ec/e0/ed
                Map.replace(0xe1, [20,108]); // 国王e1/eb
                Draw.map();
            });
            seq.splice(4,0, () => {
                Map.replace(0xeb, [20,108]); // 国王
                Map.replace(0x20, [19,108]); // 女王
                Map.replace(0xed, [15,108]); // 女王
                Draw.map();
            });
            seq.splice(10,0, () => {
                Map.replace(0xe0, [19,108]); // 女王
                Map.replace(0x20, [15,108]); // 女王
                Draw.map();
            });
            Draw.sequence(seq);
        }},
        // 会議室門番
        {loc:[22,107], branch: ch.isdone("queenmeet") ? (talks => talks[2]) :
         (talks) => ((ch.isdone("kingopen")) ? talks[1] : talks[0])
        },
        // 会議中女王
        {loc:[30,103], branch: (talks) => {
            if (ch.isdone("queenmeet")) return talks[2];
            ch.setdone("queenmeet");
            return talks.slice(0,2);
        }},
        // 会議後女王
        {sym:0xe0, loc:[23,84], branch: (talk) => {
            ch.setdone("queenopen");
            Map.replace(0x2b, [8,84]);
            return talk;
        },
         talk:("何も手助けできなくてすみません。//そうだわ、もしよければ//隣室を使ってください。"),
        },
        // 王女
        {loc:[30,91], branch: (talk) => {
            if (ch.isdone("mido")) return talk.slice(5);
            if (ch.isdone("princess")) return talk[4]; // "早く助けに行ってあげて。//私これから、眠らなきゃ。"
            if (ch.warp.find(v=> v.join(",")==="4,35,83")) {
                ch.setdone("princess");
                return talk.slice(1,4); //["ミドがさらわれちゃったのね?","わからないけどわかったわ。","眠らなきゃ。"]
            }
            return talk[0]; // "ミドったらどこいったのかしら。"
        }},
        // 王女取巻き左
        {loc:[29,91], branch: (talk) => {
            if (ch.warp.find(v=> v.join(",")==="4,35,83")) return talk[1];
            return talk[0];
        }},
        // 王女取巻き右
        {loc:[31,92], branch: (talk) => {
            if (ch.warp.find(v=> v.join(",")==="4,35,83")) return talk[1];
            return talk[0];
        }},
        // 博士
        {loc:[9,60], branch: (talks) => {
            if (!ch.isdone("memo")) {
                if (!Items.has("tsukuda")) {
                        ch.setdone("tamao");
                    return talks.slice(0,6); // Todo:着水フラグ
                }
                ch.setdone("memo");
                Items.remove("tsukuda");
                Items.add(["memo"]);
                return talks.slice(6,12);
            }
            if (!ch.isdone("tamaorin")) {
                if (Items.has("memo")) return talks[13];
                return (Items.add(["memo"])) ? talks[12] : talks[15];
            }
            return talks[14];
        }},
        // 博士助手
        {loc:[15,66], branch: (talk) => ch.warp.length ? talk[1] : talk[0]},

    ].concat(common_town_speakevents());

    // マップ差し替え
    if (!ch.isdone("myhome")) Map.replace(0x96, [14,20]);  // my home door
    if (ch.isdone("masspro")) [[46,112],[47,112],[48,112]].map(p=>Map.replace(0xc7, p)); // market tamaorin
    Map.warps.filter(v => v.jump && v.jump.map != 1).map((v,i) => Map.replace(0x08, v.jump.loc));
    ch.warp.filter(v => v[0] == ch.map).forEach(v => Map.replace(0x09, v[1]));

    if (ch.warp.length) { // Todo: 池底・屋外ワープなどを避ける
        Map.replace(0x29, [122,95]);  // stairs under TV
        Map.replace(0xcc, [122,96]);
    }
    if (ch.isdone("kingopen")) {
        Map.replace(0x49, [23,106]);
        Map.replace(0x49, [21,112]);
        Map.replace(0x49, [14,106]);
    }
    if (ch.isdone("queenopen")) {
        Map.replace(0x2b, [8,84]);
    }
    if (ch.isdone("queenmeet")) { // Todo:talkイベント削除
        Map.replace(0xe0, [23,84]);
        [[31,103],[32,103],[30,103],[33,106],[33,108],[29,110],[31,110],
         [27,106],[27,107]].map(p=> Map.replace(0x2d, p));
    }
    if (ch.isdone("mido")) {
        Map.replace(0xeb, [20,108]); // 国王
        Map.replace(0xe0, [19,108]); // 女王
        Map.replace(0xea, [19,109]); // ミド
        Map.replace(0xe9, [29,90]); // ミド
    }
    return ret;
};

///////////////////////////////////
const event_dreampoint = (map) => {

    let ret = {};
    ret.jumper = [1, 0x21, 0x29, 0x2a] // ワ㊦㊤
    ret.across = [];
    ret.enemy = true;
    ret.base = 0;
    ret.make_bed = () => {
        let sym = Map.symbol(ch.towhere());
        if (sym < 0xe8 || 0xec <= sym) return false;
        Map.replace(0x67);
        return true;
    };

    let footlist =  [
        {sym:0xb6, onstep: () => { GameOver("アブクに取り込まれてしまった。"); }},
        {sym:0x24, onstep: () => { GameOver("底なし穴に落ちた。"); }},
        {sym:0x23, onstep: () => {
            if (ch.muki != 0) return true;
            let y = ch.y - 24;
            if (y < 0) return true;
            if (!ch.isdone("princess") && !ch.isdone("grandsleep")) {
                if (y < 4) {
                    GameOver("\n\n突然、宇宙全部が消えてしまった。");
                    Draw.textbox(false);
                    return false;
                }
                if (y == 4) return Dialog("私はドリームポイント。\nどうしても侵入しようとするなら−\t\n阻止しなければならない。");
            }
            const talks = `
#\f\v静寂。
#\f\v雑多な思念…。
#\f\v市民たちの声…\t\nいや、人々の潜在意識が−\n風のように頭の中を吹き抜けていく。
#\f\v遠くから赤ん坊の泣き声が\n聞こえてくる。
#私は… \t僕はミド。\nああ…\nこっちに来ないで!!
# お願いです、帰ってください。\nドリームポイントに立ち向かうのは\n不可能です。
#今 クムドールは−\n楽園に生まれ変わろうとしている。\t\nクムドールを愛す者なら立ち去れ。
#%s!! 助けに来てくれたんですね。\t\nでも… ダメだ。\nもう 手遅れなんだ。
#待て!\t\nここはクムドールのドリームポイント−\nこれより先に、足を踏み入れてはならない。`
                  .split("#").map(v => v.trim()).filter(v => v);
            Dialog(talks[y % talks.length]);
        }},
        {sym:0x29, loc:[44,86], jump:{sym:0x2a, loc:[87,119]}},
        {sym:0x22, onstep: () => { ch.fog.enter(); }},
        {sym:0x2a, onstep:() => { // 上階
            let y = ch.y - 40;
            let jumpto = {sym:0x29, loc:[ch.x - (y < 0 ? 40 : 0), (120 + y) % 120]};
            Draw.stair(jumpto, false);
        }},
        {sym:0x29, onstep:() => { // 下階
            let y = ch.y + 40;
            let jumpto = {sym:0x2a, loc:[ch.x + (y < 120 ? 0 : 40), y % 120]};
            Draw.stair(jumpto, true);
        }},
        {sym:0x67, onstep: () => { // ベッド
            Draw.sequence([
                {t:"ベッドに入りますか?", confirm:true},
                () => { ch.sleep(); Map.replace(0x20, [ch.x,ch.y]); },
                {wait: true},
            ]);
        }},
        {sym:0x40, onstep: () => { // 踏める泡
            Map.replace(0x20, [ch.x, ch.y]);
            return true;
        }},
    ].concat(Map.warps);

    ret.FootEvents = interact_footevents(footlist, ret.jumper);

    ret.speakEvents = [
        {loc:[115,20], onspoken: () => { DreamPoint(); }},
        {sym:0xad, onspoken: () => OpenWall({replacer:0x2b, level:15,}) },
        {sym:0xac, talk:"鍵がかかっている。"},
        {sym:0xa8, onspoken: () => { Map.itembox(0x20); }},
    ].concat(
        [...Array(0x4)].map((v,i) => {
            let texts = ["よくこんなところまできたね。", "私が誰だって?//私にもわからないよ。",
                         "ミドって少年? 見かけないなあ。", "(眠っているようだ。)"];
            let text = texts[GetRand(texts.length)];
            return {sym: (i+0x80+0x68), talk:text };
        })
    );
    Map.replace(0xeb, [59,117]); 
    ret.is_front_of_doors = () => {
        if (Map.symbol(ch.towhere()) != 0xac) return;
        Map.replace(0x2b);
        ch.record_wall(5, ch.towhere(), 0x2b);
        return true;
    };

    //ch.wall.filter(v => v[0] == 5).map(v => Map.replace(0x2b, [v[1].x, v[1].y]));

    //x:[44-75]y:[88-97]の範囲にある呪文壁をch.walldpの値で差し替える(0x2b->0x2d)
    [...Array(10)].map((v,row) => {
        [...Array(32)].map((v,col) => {
            let bit = col % 4;
            let dig = row * 8 + parseInt(col / 4);
            let p = {x:(col + 44), y:(row + 88)};
            let clear = (parseInt((ch.walldp || "")[dig], 16) >> bit) & 1;
            if (Map.symbol(p) == 0x2b && !clear) Map.replace(0xad, [p.x, p.y]);
        });
    }); 
    return ret;
};

