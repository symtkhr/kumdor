// 呪文返しオブジェクト
const Jumongaeshi = function(target) {
    const TYPE = {
        enemy: 0,
        egg: 1,
        bighand: 2,
        wall: 3,
        tree: 4,
        dream: 5,
    };
    CLOG(target);
    const type = TYPE[target.type];
    const perline = (type == TYPE.enemy || type == TYPE.egg) ? 14 : 44;
    const jumonline = parseInt(target.jumon.length / perline);
    const dom = (type == TYPE.enemy || type == TYPE.egg) ? "#enemy" : "#longscript";
    if (type == TYPE.bighand) {
        $("#longscript .kbclose, #speedmeter").show();
        $("#speed").text(0);
        $("#speedbar").css("width", 0);
    }
    else $("#longscript .kbclose, #speedmeter").hide();
    
    // 入力開始
    const start = function() {
        let eggrap = 0;
        let given = target.jumon.slice(0, perline * jumonline);
        let typed = "";

        $("#jtext").hide();
        $(".enemyscript, .rescript, .eggscript").text("");
        $(dom + " .enemyscript").each(function(row) {
            let n = $(dom + " .enemyscript").size();
            let i = jumonline + row - n;
            if (i < 0) return;
            $(this).text(given.slice(i * perline, (i + 1) * perline));
        });
        dump_rescript(given, typed);

        // タイマイベント
        let timer = {sec: 0};
        timer.handler = (() => {
            if (type == TYPE.bighand) return setInterval(() => {
                timer.sec++;
                if (timer.sec % 10 != 0) return;
                let speed = Math.round(typed.length * 600 / 5 / timer.sec);
                $("#speed").text(speed);
                $("#speedbar").css("width", (speed * 4) + "px");
            }, 100);

            // 1秒ずつ呪文を進めていく卵
            if (type == TYPE.egg) {
                return setInterval(() => {
                    eggrap++;
                    $(".eggscript").each(function(row) {
                        let n = $(dom + " .eggscript").size();
                        let i = jumonline + row - n;
                        if (i < 0) return;
                        $(this).text(given.slice(i * perline, eggrap).slice(0, perline));
                    });
                    //時間切れ
                    if (eggrap >= perline * jumonline) {
                        clearInterval(timer.handler);
                        return target.uchiowari(1);
                    }
                }, 3000 / (ch.targetspeed || 2));
            }

            // 1秒にライフ1減 (30w/mで100msに0.1減)
            return setInterval(() => {
                timer.sec++;
                if (timer.sec % 20 == 0) CLOG(
                    Math.round(typed.length * 600 / 5 / timer.sec), "w/m"
                );
                if (ch.damage(1)) return;
                clearInterval(timer.handler);
                GameOver();
            }, 300 / (ch.targetspeed || 2));
        })(target);

        keytype([{c:"any", ontype:(c) => {
            if (c.length == 1) {
                typed += c;
            }
            let mistype = dump_rescript(given, typed);

	    if (type == TYPE.bighand) {
		// 大きな手にミスタイプffff入力で中断
		let t0 = typed.slice(-4);
		let g0 = given.slice(typed.length - 4, typed.length);
		if (t0.toLowerCase() == "ffff" && g0.split("").every((c,i) => c != t0[i])) {
		    clearInterval(timer.handler);
		    return target.escape();
                }
	    }
	    
            if (c !== given[typed.length - 1]) {
                //敵かクムの木ならダメージ
                if (((type == TYPE.enemy) || (type >= TYPE.tree))
		    && !ch.damage(20, true)) {
		    clearInterval(timer.handler);
		    return GameOver();
		}
                //卵か壁なら即終了
                if ((type == TYPE.egg) || (type == TYPE.wall)) {
                    clearInterval(timer.handler);
                    return target.uchiowari(1);
                }
            }

            // 打ち終わり
            if (given.length <= typed.length) {
                clearInterval(timer.handler);
                return target.uchiowari(mistype, timer.sec);
            }
        }}, {k:"Backspace", ontype: () => {
            if (typed.length == 0) return;
	    if (ch.lostkey.indexOf("+bs") != -1) return;
            typed = typed.slice(0, typed.length - 1);
            dump_rescript(given, typed);
        }}, {k: "Escape", ontype: () => {
	    if (ch.lostkey.indexOf("+esc") != -1) return;
	    if (type != TYPE.tree) return;
	    clearInterval(timer.handler);
	    target.escape();
	}}]);
    };

    const dump_rescript = function(given, typed) {
        let mistype = 0;
        let $dump = typed.split("").map((c, i) => {
	    let $ref = {"<":"&lt;", ">":"&gt;", "&":"&amp;"}[c] || c;
            if (c == given[i]) return $ref;
            mistype++;
            if (c == " ") {
                return '<span style="background-color:#0f0">_</span>';
            }
            return '<span style="color:#0f0">' + $ref + '</span>';
        });

        // cursor
        $dump.push('<span style="background-color:#fe0">.</span>');

        $(dom + " .rescript").each(function(row) {
            let n = $(dom + " .rescript").size();
            let i = jumonline + row - n;
            if (i < 0) return;
            $(this).html($dump.slice(perline * i, perline * (i + 1)).join(""));
        });
        return mistype;
    }
    start();
}


// 魔獣との遭遇
const Encounter = function()
{
    const enemy = Enemy.make();
    if (!enemy) return;
    let total_mistype = 0;
    let eggturn = false;
    let enemylife = enemy.life;
    
    const action = function() {
        $("#inventory").hide();
        submenu(["戦う","所持品使用","呪文","逃げる" ],
                [ go_into_battle,
                  () => { Shojihin.battle({
                      cancel: () => { action(); },
                      done: () => { jwait(go_into_battle); },
                  }); },
                  () => { Jumonsho({
		      mode: "battle",
                      cancel: () => { action(); },
                      done: () => { jwait(go_into_battle); },
		      runaway: () => { runaway(true); },
		      attack: () => { uchiowari(0); },
                  }); },
                  runaway ]);
    };

    const go_into_battle = function() {
        $("#inventory, #scriptbook").hide();
        let battle = {};
        let spellcast = {};
        battle.type = eggturn ? "egg" : "enemy";

        if (!ch.isdone("loop") && ch.lostkey.split("+").shift().split("")
            .some(key => Keyboard.clevel([0,2]).indexOf(key) != -1)) {
            spellcast.level = 1;
        }
        spellcast.enemy = enemy.id;
        spellcast.len = 14 * ((27 < enemy.id) ? 2 : 1);

        battle.jumon = Spellcast.make(spellcast);
        battle.uchiowari = uchiowari;

        Jumongaeshi(battle);
    };

    const uchiowari = function(mistype) {
        total_mistype += mistype;

        if (!eggturn) {
            // Todo: 攻撃力仮算出
            let base = [10,20,40,96,160,260,360,490,650].findIndex(v => ch.expr < v);
            if (base < 0) base = parseInt(13/2 + Math.sqrt(ch.expr - 512) / 4.7);
            let keylen = 48 - ch.lostkey.split("+").shift().length;
            CLOG("base/keylen=",base,keylen);
            let attack = 3 + base + keylen;
            damage = attack - GetRand(attack < 12 ? 4 : (attack / 4));

            enemy.life -= damage;
            TextBar(enemy.name + "は" + damage + "pt.のダメージを受けた。");
            $("#enemylife").css("width", (100 * enemy.life / enemylife) + "%");
            if (enemy.life > 0) {
                jwait(action);
                return;
            }
            if (total_mistype == 0) {
		TextBar(enemy.name + "は卵になった。");
		$("#enemy .fig img").hide();
		$("#enemy .fig .egg").show();
		eggturn = true;
                Bgm.run("egg");
		jwait(go_into_battle);
		return;
	    }
            $("#enemy .fig img").fadeOut();
            TextBar(enemy.name + "は消滅してしまった。");
        }

        let getexpr = ch.getexp(total_mistype ? 1 : enemy.exp);
        ch.spice += enemy.spc;

	let seq = [
            {func: () => mistype ? $("#enemy .fig .egg").fadeOut() : $("#enemy .fig .egg").hide() },
            {t: mistype ? (enemy.name + "は消滅してしまった。"):("卵を潰した。")},
            getexpr ? {t: (getexpr + "の経験値を獲得。")} : null,
            {t: enemy.spc + "スパイス獲得。"},
            {func: () => {
                $("#enemy").hide();
                Draw.status();
            }},
        ];
        if (total_mistype == 0 && enemy.drop.length && Items.add(enemy.drop)) 
            seq.push(... enemy.drop.map(v => {
                return {t : (16 <= v ? "呪文書" : Items.spec(v).name)
                        + "を拾った。"}}));
        seq.push(() => Bgm.run());
        Draw.sequence(seq);
    };

    const runaway = function(safe) {
        let bitten = (pena) => {
            let dmg = parseInt(enemy.bite + (ch.map == 1 ? (ch.lifebox - 1) : 0));
            pena.message = pena.message.split("%d").join(dmg);
            ch.damage(dmg * 10);
            return pena;
        };
        let abnormalize = (jt) => {
            return () => {
                if (ch.jt.some(v => v == jt)) return false;
                ch.jt.push(jt);
                return true;
            };
        };
        const PENALTY = [
            {message: "しかし、かみつかれて//%dpt.のダメージを受けた。",
             event: bitten },
            {message: "しかし、毒を受けてしまった。",
             event: abnormalize("p") },
            {message: "しかし、トランスパの呪文をかけられ//体が透明になってしまった。",
             event: abnormalize("t") },
            {message: "しかし、マドマドの呪文をかけられて//発狂してしまった。",
             event: abnormalize("m") },
            {message: "しかし、暗闇の暗示をかけられた。",
             event: () => {
                 if (ch.dark) return false;
                 ch.dark = true;
                 return true;
             }},
            {message: "しかし、キーを一個盗まれた。",
             event: () => { return Keyboard.stolen(); }},
        ];
        let penalty = function() {
            if (safe || enemy.penalty == 0) return;
            let pena = PENALTY[enemy.penalty - 1];
            if (!pena.event(pena)) return;
            TextBar(pena.message);
            Draw.status();
        };

        TextBar("魔獣から逃れた。");
        jwait(function() {
            penalty();
	    if (ch.life <= 0) return GameOver();
            Bgm.run();
            wandering();
            $("#enemy").hide();
        });
    }

    TextBar("魔獣出現!");

    // 敵の描画wn
    let fname = "*5      A       4     71 0 9  3B 682 "[enemy.id];
    if (fname == " ") fname = "alphabet_character_"
             + ("*NadfjklWtryugqiAxcsvmSIoHpEhbSKzMOIe"[enemy.id]);
    else fname = "monster" + (parseInt("0x"+fname)+1).toString(10).padStart(2,"0");
    
    $("#enemy .fig img").show().prop("src","fig/" + fname + ".png")
        .css({width:"100px", height:"100px"});
    $("#enemyname").text(enemy.name);
    $("#enemy .fig .egg").hide();
    $("#enemylife").css("width", "100%");
    $(".enemyscript, .rescript, .eggscript").text("");
    $("#enemy").show();
    Bgm.run("enemy");
    jwait(action);
};

// 石化クム
const ChatTree = function(opt)
{
    //var sec = 0;
    CLOG(opt);

    let escape = function() {
	TextBar("ESCAPE!");
        //clearInterval(timer);
        $("#longscript").hide();
	wandering();
    };
    let uchiowari = function(mistype, sec) {
	let misrate = Math.round(100 * mistype / (44 * 3));
	let speed = (misrate > 20) ? 0 : Math.round(44 * 3 * 600 / 5 / sec / 3 * ch.targetspeed);
        let increase = (misrate > 20) ? 0: parseInt(speed / 10 * (mistype == 0 ? 2 : 1) + 15);
        ch.tree.push([ch.map, ch.towhere()]);
	Map.replace(opt && opt.replacer || "T");
	//clearInterval(timer);

	Draw.sequence([
	    {func: () => Draw.map() },
            {t: ("クムの木は復活した。") },
            {func: () => $("#longscript").hide() },
	    {t: (increase ? ("スピード: " + speed + "ワード/m") : "(ミスタイプが多すぎる)")
	     + ("\nミスタイプ: " + mistype + "字(" + misrate + "%)") },
            {func: () => {
		if (!increase) return;
                ch.exprc += increase;
                ch.score.push([speed, misrate, 15]);
                ch.score = ch.score.slice(-20);
                Draw.status();
	    }},
	    increase ? {t: ("経験値許容度が " + increase + "pt.増えた。")} : null,
	    {d: "ああ、ありがとう。", thru:true},
	    ...(opt.onrevive || ["おやすみ..."]).map(s=> {return {d:s}}),
            {t: ("(クムの木は眠ってしまった。)")},
            {t: ("チャト効果がなくなった。")},
            {func: () => { ch.chattable = false }},
	]);
    };

    let battle = {};
    battle.jumon = Spellcast.make({len: 44 * 3});
    battle.uchiowari = uchiowari;
    battle.escape = escape;
    battle.type = "tree";
    //var timer = setInterval(() => { sec++; }, 100);
    $("#longscript").show();
    Jumongaeshi(battle);
}

// 呪文壁
const OpenWall = function(opt)
{
    opt = opt || {
        replacer: "Q",
        level: 8,
    };
    const uchiowari = function(mistype) {
        if (mistype > 0) {
	    Draw.sequence([
		{t:"大きな力で壁から引き離された。"},
                {func:() => {
		    $("#longscript").hide();
                    let to = ch.towhere(-1);
                    if (Map.kabe(to)) return;
		    ch.x = to.x;
		    ch.y = to.y;
		    Draw.map();
		}},
	    ]);
            return;
        }
        Map.replace(opt.replacer);
        ch.record_wall(ch.map, ch.towhere(), opt.replacer);
	
	let get = {
            exp: (opt.level < 15) ? (4 * opt.level + 6) : 25,
            spc: (opt.level < 15) ? (4 * opt.level + 6) : 25,
	};
	get.exp += GetRand(get.exp);
	get.spc += GetRand(get.spc);
	
	ch.spice += get.spc;
	get.exp = ch.getexp(get.exp);
        Draw.sequence([
	    {t:("呪文は消え去った。")},
	    {func:() => { $("#longscript").hide(); Draw.status(); }},
	    {t:("経験値" + get.exp + "pt.と" + get.spc + "spc.を獲得。")},
	]);
    };
    const seq = [
	{t:("文字が書いてある。読みますか?"), confirm:true},
	{t:("それを読んだ。")},
	{t:("足が竦み、命が吸い取られてゆく。"), thru:true},
	{func:() => {
	    $("#longscript").show();
            Jumongaeshi({
		jumon: Spellcast.make({
                    level: opt.level,
                    len: 44 * ((opt.level < 15) ? 2 : 3),
                }),
		uchiowari: uchiowari,
		type: "wall",
            });
	}},
	{wait:true},
    ];
    Draw.sequence(seq);
};


// 最地下
const DreamPoint = function()
{
    let uchiowari = function(mistype, speed) {
        $("#longscript").hide();
	ch.dream++;
	if (ch.dream < 3) return wandering();
	return Ending();
    };
    let battle = {};
    battle.jumon = Spellcast.make({len: 6 * 44});
    battle.uchiowari = uchiowari;
    battle.type = "dream";
    $("#longscript").show();
    Jumongaeshi(battle);
};


