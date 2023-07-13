
const inDebug = () => 0 == location.hash.indexOf("#debugging");
const CLOG = (...arg) => inDebug() ? console.log(...arg) : {};

let loadDebug = function()
{
    if (!inDebug()) return;
    let key = location.hash.split("-").pop();
    CLOG(key);
    (Savelist[key] || Savelist.def)();
    return true;
};

let Savelist = {};
Savelist.speedchanger = () => {
    Savelist.def();
    ch.map = 1;
    ch.x = 57;
    ch.y = 70;
    ch.invent = [1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 20, 20, 20, 20, 16, 16, 16, 23, 23, 23, 17];
    ch.targetspeed = 2;
    ch.lostkey = `\\[]':@=-^_+esc`;
    ch.layout = 101;
};

Savelist.jkln = () => {
    Savelist.tamaorin();
    let ret = {
        map:2,x:105,y:6,"lifebox":2,"lostkey":"RTYUGHQWEIOP@ZXC,./VBNM1234567890\\[]:-^_+enter+esc",
        "pick":[[1,{x:54,y:92},17]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,1);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,2);
};

Savelist.rtyu = () => {
    Savelist.tamaorin();
    let ret = {
        map:2,x:42,y:67,"lifebox":2,"lostkey":"RTYUGHQWEIOP@ZXC,./VBNM1234567890\\[]:-^_+enter+esc",
        "pick":[[1,{x:54,y:92},17],[1,{x:102,y:87},43]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,1);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,3);
};

Savelist.qwe = () => {
    Savelist.tamaorin();
    let ret = {
        map:2,x:74,y:104,"lifebox":2,"lostkey":"IOP@ZXC,./VBNM1234567890\\[]:-^_+enter+esc",
        "pick":[[1,{x:54,y:92},17],[1,{x:102,y:87},43]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,4);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,5);
};

Savelist.iopa = () => {
    Savelist.tamaorin();
    let ret = {
        map:3,x:10,y:13,"lifebox":2,"lostkey":"VBNM1234567890\\[]:-^_+enter+esc",
        "pick":[
            [1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],[1,{x:94,y:91},43]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,5);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,6);
};

Savelist.vbnm = () => {
    Savelist.tamaorin();
    let ret = {
        map:3,x:37,y:116,"lifebox":3,"lostkey":"1234567890\\[]:-^_+enter+esc",
        "pick":[
            [1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],[1,{x:94,y:91},43],
            [1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,6);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,8);
};

Savelist["4567"] = () => {
    Savelist.tamaorin();
    let ret = {
        map:3,x:87,y:110,"lifebox":3,"lostkey":"123890\\[]:-^_+esc",
        "pick":[
            [1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],
            [1,{x:96,y:106},43],[1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],
            [1,{x:115,y:58},45],[1,{x:33,y:53},47]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,9);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,9);
};

Savelist.capital = () => {
    Savelist.tamaorin();
    let ret = {
        "lifebox":4,"lostkey":"123890\\[]:-^_+esc",
        "pick":[[1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],
                [1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45],[1,{x:33,y:53},47],
                [1,{x:21,y:46},17],[1,{x:27,y:40},46]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,9);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,-3);
};

Savelist.weather = () => {
    Savelist.tamaorin();
    let ret = {
        "pick":[
            [1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],
            [1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45],[1,{x:33,y:53},47],
            [1,{x:21,y:46},17],[1,{x:27,y:40},46],[1,{x:44,y:32},47],
            [1,{x:39,y:36},17],[1,{x:38,y:38},17],[3,{x:107,y:14},24]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,10);
    ch.visited = ch.visited.slice(0,-2);
};

Savelist.palace = () => {
    Savelist.tamaorin();
    let ret = {map:4,x:13,y:120};
    Object.keys(ret).map(key => ch[key] = ret[key]);

    ch.pick = [
        [1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],
        [1,{x:96,y:106},43],[1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45],[1,{x:33,y:53},47],
        [1,{x:21,y:46},17],[1,{x:27,y:40},46],[1,{x:44,y:32},47],[1,{x:39,y:36},17],[1,{x:38,y:38},17],[3,{x:107,y:14},24],
        [1,{x:53,y:22},47],[1,{x:57,y:33},47],
    ],
    ch.done = ch.done.slice(0,14);
    ch.visited = ch.visited.slice(0,-1);
};

Savelist.tamaorin = () => {
    Savelist.def();
    let ret = {map:4,x:122,y:69,"lifebox":5,"targetspeed":2,"lostkey":"+esc"};
    Object.keys(ret).map(key => ch[key] = ret[key]);

    ch.pick = [[1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],[1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45],[1,{x:33,y:53},47],[1,{x:21,y:46},17],[1,{x:27,y:40},46],[1,{x:44,y:32},47],[1,{x:39,y:36},17],[1,{x:38,y:38},17],[3,{x:107,y:14},24],[1,{x:53,y:22},47],[1,{x:57,y:33},47]];
    ch.tree = [];
    ch.warp = [];
    ch.chattable = false;
    ch.done = ch.done.slice(0,18);
    ch.life = ch.lifebox * LIFEBOX;
    ch.visited = ch.visited.slice(0,-1);
};

Savelist.laketown = () => {
    Savelist.def();
    let ret = {
        map:2,x:113,y:80,"z":2,"lifebox":5,
        "tree":[[1,{x:41,y:101}],[1,{x:55,y:92}],[1,{x:59,y:71}],[1,{x:46,y:75}]],"warp":[],
        "pick":[[1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],[1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45],[1,{x:33,y:53},47],[1,{x:21,y:46},17],[1,{x:27,y:40},46],[1,{x:44,y:32},47],[1,{x:39,y:36},17],[1,{x:38,y:38},17],[3,{x:107,y:14},24],[1,{x:53,y:22},47],[1,{x:57,y:33},47],[1,{x:90,y:59},5]],
    };
    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,-1);
    ch.life = ch.lifebox * LIFEBOX;
};


Savelist.dp0 = () => {
    Savelist.def();
    let ret = {
        map:4,x:13,y:120,"lifebox":6,
        "tree":[[1,{x:41,y:101}],[1,{x:55,y:92}],[1,{x:59,y:71}],[1,{x:46,y:75}],[1,{x:28,y:91}],[1,{x:19,y:79}]],
        "warp":[[4,[30,62]]],
        "pick":[[1,{x:54,y:92},17],[1,{x:102,y:87},43],[1,{x:120,y:10},49],[1,{x:115,y:37},44],[1,{x:96,y:106},43],[1,{x:94,y:91},43],[1,{x:94,y:87},162],[1,{x:8,y:66},17],[1,{x:115,y:58},45],[1,{x:33,y:53},47],[1,{x:21,y:46},17],[1,{x:27,y:40},46],[1,{x:44,y:32},47],[1,{x:39,y:36},17],[1,{x:38,y:38},17],[3,{x:107,y:14},24],[1,{x:53,y:22},47],[1,{x:57,y:33},47],[1,{x:90,y:59},5],[5,{x:8,y:11},43],[1,{x:41,y:69},17]],
    };

    Object.keys(ret).map(key => ch[key] = ret[key]);
    ch.done = ch.done.slice(0,-1);
    ch.life = ch.lifebox * LIFEBOX;
    //ch.walldp = "";
};

Savelist.dp1 = () => {
    Savelist.dp0();
    ch.x = 113;
    ch.y = 97;
    ch.warp.push([4,[27,71]]);
    ch.pick.push([5,{x:34,y:21},43],[5,{x:17,y:49},43]);
};

Savelist.dp2 = () => {
    Savelist.dp1();
    ch.warp.push([4,[27,73]]);
    ch.pick.push([5,{x:16,y:59},43],[5,{x:14,y:64},43],[5,{x:7,y:106},43],[5,{x:26,y:112},43],[5,{x:27,y:100},43],[5,{x:29,y:65},43]);
};

Savelist.dp3 = () => {
    Savelist.dp2();
    ch.warp.push([4,[28,70]]);
    ch.pick.push([5,{x:5,y:69},43],[5,{x:7,y:59},43],[5,{x:5,y:88},43],[5,{x:6,y:95},43]);
};

Savelist.dp4 = () => {
    Savelist.dp3();
    ch.warp.push([4,[29,71]]);
    ch.pick.push([5,{x:4,y:105},43],[5,{x:31,y:107},43],[5,{x:29,y:89},43],[5,{x:63,y:22},43],[5,{x:56,y:21},43]);
};

Savelist.dp5 = () => {
    Savelist.dp4();
    ch.warp.push([4,[30,72]]);
    ch.pick.push(
        [5,{x:45,y:30},43],[5,{x:46,y:30},43],[5,{x:47,y:30},43],[5,{x:48,y:30},43],[5,{x:49,y:30},43],
        [5,{x:62,y:13},43],[5,{x:63,y:13},43],[5,{x:64,y:13},43],[5,{x:65,y:13},43],[5,{x:66,y:13},43],
        [5,{x:60,y:18},43],[5,{x:47,y:70},43]);
};

Savelist.dp6 = () => {
    Savelist.dp5();
    ch.warp.push([4,[31,71]]);
    ch.pick.push([5,{x:59,y:112},43],[5,{x:69,y:112},43],[5,{x:69,y:103},43]);
};

//last-dp
Savelist.def = () => {
    let ret = {
        map:4,x:13,y:120,"muki":3,"life":500,"lifebox":8,"spice":2500,"expr":2000,"exprc":5000,
        "invent":[1,1,1,1,2,3,3,3,3,3,4,4,5,7,8,9,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24],
        "score":[[52,0,9],[50,0,10],[49,0,10],[47,0,11],[53,0,11],[43,2,11],[41,0,12],[53,0,12],[55,2,12],
                 [41,3,13],[44,2,13],[41,0,14],[53,0,14],[40,2,14],[49,0,15],[49,0,15],[49,0,15],[55,0,15],[47,2,15],[46,1,15]],
        "targetspeed":3,"chattable":true,"lostkey":"",
        "tree":[[1,{x:41,y:101}],[1,{x:55,y:92}],[1,{x:59,y:71}],[1,{x:46,y:75}],[1,{x:28,y:91}],[1,{x:19,y:79}],
                [1,{x:11,y:80}],[1,{x:11,y:79}],[1,{x:10,y:83}],[1,{x:10,y:84}],
                [1,{x:24,y:19}],[1,{x:24,y:20}],[1,{x:24,y:21}],[1,{x:24,y:22}]],
        "done":["payback","qwediver","qwekey","lang","depth","compass","mission","slipper","grandma","weather",
                "uraguchi","kingopen","queenmeet","queenopen","tamao","memo","tamaorin","handmade","masspro","loop","myhome","princess"],
        "pick":[
            //箱
            [1,{x:54,y:92},17],[1,{x:8,y:66},17],[1,{x:21,y:46},17],[1,{x:39,y:36},17],
            [1,{x:41,y:69},17],[1,{x:5,y:93},17],[1,{x:26,y:17},17],
            //壁
            [1,{x:102,y:87},43],[1,{x:115,y:37},44],[1,{x:96,y:106},43],[1,{x:94,y:91},43],[1,{x:115,y:58},45],
            [1,{x: 33,y:53},47],[1,{x: 27,y:40},46],[1,{x:44,y: 32},47],[1,{x:53,y:22},47],[1,{x: 57,y:33},47],
            //アイテム
            [1,{x:120,y:10},49],[1,{x:94,y:87},162],[3,{x:107,y:14},24],[1,{x:38,y:38},17],[1,{x:90,y:59},5],
            //壁
            [5,{x:8,y:11},43],[5,{x:34,y:21},43],[5,{x:17,y:49},43],[5,{x:16,y:59},43],[5,{x:14,y:64},43],
            [5,{x:7,y:106},43],[5,{x:26,y:112},43],[5,{x:27,y:100},43],[5,{x:29,y:65},43],[5,{x:5,y:69},43],
            [5,{x:7,y:59},43],[5,{x:5,y:88},43],[5,{x:6,y:95},43],[5,{x:4,y:105},43],[5,{x:31,y:107},43],[5,{x:29,y:89},43],
            [5,{x:63,y:22},43],[5,{x:56,y:21},43],[5,{x:45,y:30},43],[5,{x:46,y:30},43],[5,{x:47,y:30},43],[5,{x:48,y:30},43],
            [5,{x:49,y:30},43],[5,{x:47,y:70},43],[5,{x:59,y:112},43],[5,{x:69,y:112},43],[5,{x:69,y:103},43],[5,{x:65,y:72},43],
            [5,{x:62,y:13},43],[5,{x:63,y:13},43],[5,{x:64,y:13},43],[5,{x:65,y:13},43],[5,{x:66,y:13},43],
            [5,{x:60,y:18},43],
        ],
        "visited":["ASDF","JKL;","RTYU","GH","QWE","IOP@","製材所","VBNM","4567","首都","空港","宮殿","記念館","湖底村"],
        "warp":[[4,[30,62]],[4,[27,71]],[4,[27,73]],[4,[28,70]],[4,[29,71]],[4,[30,72]],[4,[31,71]],[4,[31,71]],[4,[31,71]],[4,[35,83]],
                [1,[11,82]],[1,[22,23]]],
        "walldp":"00000000000000000000000001000000010000000100000001000000000000000010000000100000",
    }
    Object.keys(ret).map(key => ch[key] = ret[key]);
};

