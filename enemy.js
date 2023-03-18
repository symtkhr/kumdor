const enemylist =
[
{"name":"普通のスライム",
 "life":12,"exp":2,"spc":4,"pena":[1,null,3,1,null,1],"drop":[{"rate":24,"item":2},{"rate":24,"item":2},{"rate":24,"item":2},{"rate":24,"item":2}]},
{"name":"エイ",
 "life":14,"exp":2,"spc":4,"pena":[1,null,4,1,1,1],"drop":[{"rate":24,"item":2},{"rate":24,"item":2}]},
{"name":"デー",
 "life":16,"exp":2,"spc":6,"pena":[1,null,3,1,null,1],"drop":[{"rate":16,"item":3}]},
{"name":"えふ",
 "life":19,"exp":3,"spc":7,"pena":[1,null,3,1,1,1],"drop":[{"rate":24,"item":2},{"rate":24,"item":2},{"rate":32,"item":3}]},
{"name":"ジェイ",
 "life":18,"exp":3,"spc":7,"pena":[1,null,4,1,1,1],"drop":[{"rate":24,"item":3},{"rate":24,"item":3},{"rate":24,"item":3}]},
{"name":"ケー",
 "life":21,"exp":4,"spc":8,"pena":[1,null,3,1,1,2],"drop":[{"rate":24,"item":3},{"rate":24,"item":1},{"rate":24,"item":1},{"rate":24,"item":1}]},
{"name":"エル",
 "life":24,"exp":4,"spc":9,"pena":[2,null,3,1,null,null],"drop":[{"rate":24,"item":3},{"rate":24,"item":3}]},
{"name":"セミコロン",
 "life":26,"exp":5,"spc":10,"pena":[1,null,3,1,1,1],"drop":[{"rate":24,"item":3},{"rate":24,"item":3},{"rate":32,"item":8}]},
{"name":"プラス",
 "life":28,"exp":5,"spc":8,"pena":[1,null,3,1,1,1],"drop":[{"rate":24,"item":1},{"rate":24,"item":1},{"rate":32,"item":9}]},
{"name":"アール",
 "life":29,"exp":5,"spc":11,"pena":[1,null,3,1,1,2],"drop":[{"rate":16,"item":2},{"rate":24,"item":3},{"rate":32,"item":9}]},
{"name":"ワイ",
 "life":32,"exp":6,"spc":11,"pena":[2,null,3,1,null,null],"drop":[{"rate":24,"item":3},{"rate":24,"item":1},{"rate":24,"item":9},{"rate":48,"item":16}]},
{"name":"ユウ",
 "life":34,"exp":6,"spc":10,"pena":[2,null,3,1,null,null],"drop":[{"rate":24,"item":3},{"rate":24,"item":3},{"rate":24,"item":9},{"rate":48,"item":10}]},
{"name":"ジー",
 "life":37,"exp":7,"spc":10,"pena":[1,null,3,1,3,2],"drop":[{"rate":24,"item":16},{"rate":24,"item":3},{"rate":24,"item":16}]},
{"name":"キュー",
 "life":40,"exp":7,"spc":9,"pena":[1,null,2,1,1,1],"drop":[{"rate":24,"item":16},{"rate":24,"item":3},{"rate":24,"item":16}]},
{"name":"アイ",
 "life":43,"exp":7,"spc":12,"pena":[2,null,2,1,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":3}]},
{"name":"アット",
 "life":47,"exp":8,"spc":13,"pena":[3,null,2,1,null,null],"drop":[{"rate":24,"item":3},{"rate":24,"item":10},{"rate":24,"item":2},{"rate":24,"item":3}]},
{"name":"イクス",
 "life":51,"exp":8,"spc":15,"pena":[3,null,3,1,null,null],"drop":[{"rate":24,"item":8},{"rate":24,"item":9},{"rate":24,"item":16}]},
{"name":"シー",
 "life":53,"exp":8,"spc":18,"pena":[1,null,2,1,4,1],"drop":[{"rate":24,"item":16},{"rate":24,"item":11},{"rate":24,"item":3}]},
{"name":"すらっしゅ",
 "life":56,"exp":9,"spc":18,"pena":[3,null,2,1,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16}]},
{"name":"ぶい",
 "life":58,"exp":9,"spc":18,"pena":[4,null,2,1,null,null],"drop":[{"rate":24,"item":10},{"rate":24,"item":16},{"rate":32,"item":16}]},
{"name":"エム",
 "life":63,"exp":10,"spc":18,"pena":[2,null,2,1,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":3},{"rate":24,"item":16}]},
{"name":"ナナ",
 "life":68,"exp":11,"spc":21,"pena":[4,null,2,1,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":10},{"rate":32,"item":11}]},
{"name":"ワン",
 "life":71,"exp":12,"spc":22,"pena":[4,null,2,1,null,null],"drop":[{"rate":24,"item":10},{"rate":24,"item":11},{"rate":8,"item":2},{"rate":32,"item":16}]},
{"name":"ぜろ",
 "life":74,"exp":13,"spc":24,"pena":[3,null,2,1,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16}]},
{"name":"ハイフン",
 "life":79,"exp":14,"spc":19,"pena":[1,null,3,2,3,1],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":9}]},
{"name":"ぱーれん",
 "life":83,"exp":15,"spc":20,"pena":[1,null,4,1,4,4],"drop":[{"rate":8,"item":2},{"rate":8,"item":3},{"rate":24,"item":16}]},
{"name":"アスタリスク",
 "life":95,"exp":17,"spc":22,"pena":[2,null,3,1,null,null],"drop":[{"rate":16,"item":10},{"rate":16,"item":11},{"rate":16,"item":16}]},
{"name":"ひだま",
 "life":79,"exp":15,"spc":26,"pena":[1,null,3,1,8,8],"drop":[{"rate":24,"item":8},{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":11}]},
{"name":"ぼう",
 "life":82,"exp":16,"spc":19,"pena":[1,null,3,1,8,8],"drop":[{"rate":24,"item":9},{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":12}]},
{"name":"せんじゅ",
 "life":84,"exp":18,"spc":23,"pena":[2,null,3,1,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16}]},
{"name":"かすみ",
 "life":86,"exp":19,"spc":24,"pena":[3,null,3,1,null,null],"drop":[{"rate":24,"item":10},{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16}]},
{"name":"うずまねき",
 "life":88,"exp":21,"spc":24,"pena":[5,null,3,2,null,null],"drop":[{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":16},{"rate":24,"item":10}]},
{"name":"もどき",
 "life":90,"exp":24,"spc":16,"pena":[5,null,3,1,null,null],"drop":[{"rate":18,"item":16},{"rate":18,"item":16},{"rate":18,"item":16},{"rate":18,"item":16}]},
{"name":"おおねつ",
 "life":95,"exp":25,"spc":16,"pena":[6,null,3,2,null,null],"drop":[{"rate":18,"item":16},{"rate":18,"item":16},{"rate":18,"item":16},{"rate":18,"item":16}]},
{"name":"いしめ",
 "life":99,"exp":26,"spc":15,"pena":[6,null,3,2,null,null],"drop":[{"rate":18,"item":16},{"rate":18,"item":16},{"rate":18,"item":16},{"rate":18,"item":8}]},
{"name":"りゅう",
 "life":112,"exp":32,"spc":4,"pena":[5,null,3,2,null,null],"drop":[{"rate":14,"item":16},{"rate":14,"item":16},{"rate":14,"item":16},{"rate":14,"item":16}]}
];



const inhabitation = `

:123456789abcdef0123456789abcdef
444444444444444444444**222111111:0
444444444444444444455**422111111:1
444444444444445555555*3422111111:2
444444444444445555555*4522111111:3
4444444333455555555****111111111:4
3333333333355555555****111111111:5
3333333333355555555***1111111111:6
33333333333355555555511111111111:7
33333344444455555555511111111111:8
22222224444445555555511111111111:9
22222224444445555555511111111111:a
22222222344445555555511111111111:b
22222222344445555555511111111111:c
22222222222222222222211111222222:d
22222222222222222222211111222222:e
22221222222222222222211111222222:f
22221222222222222222211111222222:0
11111121122222222222211111222222:1
11111111111111111222211111222222:2
11111110000111111000011111222222:3
00000000000000000222222220000000:4
00000000000000000222222220000000:5
00000000000000000222222220000000:6
00000000000000000222222220000000:7
00000000000000000222222220000000:8
00000000000000000222222220000000:9
00000000000000000222222220000000:a
00000000000000000222222220000000:b
00000000000000000222222220000000:c
00000000000000000222222220000000:d
00000000000000000000000000000000:e
00000000000000000000000000000000:f
`.split("\n").map(row=>row.split(":").shift()).filter(v=>v);

const enemy_habitat = () => {
    if (ch.map == 1) {
        let stager = inhabitation[parseInt(ch.y/4)][parseInt(ch.x/4)];
        if (stager == "*") return;
        //(0)nADF(4)JKL(7);+(9)RYU(12)GQ(14)I@X(17)C/(19)VM7(22)10(24)-[*
        return [[0,9], [7,14], [12,17], [14,21], [17,24], [19,27]][stager % 6];
    }
    let floor = 3 * parseInt(ch.x / 40) + parseInt(ch.y / 40);
    if (floor < 6)
        //(27)ひぼせかう(32)もおいり
        return [[27,31], [27,32], [27,33], [29,34], [29,35], [29,36]][floor % 6];
    return [0,0];
};

let Enemy = {};
Enemy.make = (opt) => {
    if (!opt || !opt.inhabit) opt = {inhabit: enemy_habitat() };
    if (!opt.inhabit) return;

    const from = opt.inhabit[0];
    CLOG("enemy.id.range=", opt.inhabit);
    const subset = enemylist.slice(from, opt.inhabit[1]);
    const id = GetRand(subset.length) + from;

    let enemy = {};
    Object.assign(enemy, enemylist[id] || enemylist[0]);
    enemy.id = id + 1;
    enemy.exp += GetRand(enemy.exp / 2);
    enemy.spc += GetRand(enemy.spc / 2);
    enemy.penalty = GetRand(enemy.pena[2]) < enemy.pena[3] ? enemy.pena[0] : 0;
    if (enemy.penalty == 1) enemy.bite = GetRand(enemy.pena[4] || 0) + enemy.pena[5];

    enemy.drop = enemy.drop.map(v => {
        if (GetRand(v.rate)) return;
        if (0x10 == v.item) return 16 + GetRand(9);
        return v.item;
    }).filter(v => v);

    return enemy;
};

