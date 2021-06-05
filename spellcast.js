const jum = [
    `
Irowa nioedo chirinuruwo wagayo tarezo tsunenaramu? ui no okuyama kyo koete asaki yumemiji eimosezu. 
Tori naku koesu yume samase, miyo akewataru hingashiwo, sorairo haete okitsubeni hofune mureinu moyano uchi. 
The quick brown fox jumped over the lazy dogs! 
(Deutsch: Sylvia wagt quick den Jux bei Pforzheim). 
`.trim().split("\n").join(""),
    `
#1. Akino tano karihono iono tomawo arami, waga koromodewa tsuyuni nuretsutsu. 
#2. Haru sugite natsu kinikerashi, shirotaeno koromo hosucho amano kaguyama! 
#3. Ashibikino yamadorino ono shidariono, naganagashi yowo hitori kamo nemu. 
#4. Tagonourani uchiidete mireba, shirotaeno fujino takaneni yukiwa furitsutsu. 
#5. Okuyamani momiji fumiwake naku shikano koe kikutokizo akiwa kanashiki. 
#6. Kasasagino wataseru hashini oku shimono shirokiwo mireba yozo fukenikeru. 
#7. Amanohara furisake mireba kasuganaru mikasano yamani ideshi tsukikamo. 
#8. Waga ioriwa miyakono tatsumi shikazo sumu yowo ujiyamato hitowa iunari. 
#9. Hanano irowa utsurinikerina itazurani wagami yoni furu nagameseshimani. 
#10. Koreya kono ikumo kaerumo wakaretewa shirumo shiranumo o-sakano seki. 
#11. Watano hara yasoshima kakete kogiidenuto hitoniwa tsugeyo amano tsuribune. 
#12. Amatsukaze kumono kayoiji fukitojiyo, otomeno sugata shibashi todomemu. 
#13. Tsukibaneno mineyori otsuru minano-gawa, koizo tsumorite fuchito narinuru. 
#14. Michinokuno shinobu mojizuri tare yueni midaresomenishi warenara nakuni. 
#15. Kimiga tame haruno noni idete wakame tsumu, waga koromodeni yukiwa furitsutsu. 
#16. Tachiwakare inabano yamano mineni ouru matsutoshi kikaba ima kaerikomu. 
#17. Chihayaburu kamiyomo kikazu tatsutagawa, karakurenaini mizu kukurutowa. 
#18. Suminoeno kishini yoru nami yorusaeya yumeno kayoiji hitomeyo kuramu. 
#19. Naniwa-gata mijikaki ashino fushinomamo awade konoyowo sugushiteyotoya. 
#20. Wabinureba imahata onaji naniwanaru, miwo tsukushitemo awamutozo omou. 
`.trim().split("\n").join(""),
`
#1. Shi iwaku, "Manabite tokini korewo narau, mata yorokobashikarazuya. 
Tomo ari, enpou yori kitaru, mata tanoshikarazuya. 
Hito shirazushite ikidoorazu, mata kunshi narazuya," to. 
#2. Yu-shi iwaku, "Sono hitotonariya, ko-te-ni shite kamiwo okasuwo konomu monowa sukunashi. 
Kamiwo okasu kotowo konomazu shite ranwo nasuwo konomu monowa, imada kore arazarunari. 
Kunshiwa motowo tsutomu. Moto tachite michi sho-zu. Ko-te-naru monowa sore jinno moto taruka." 
#3. Shi iwaku, "Kougen-reishoku sukunashi jin," to. 
#4. So-shi iwaku, "Ware hini 3-tabi wagamiwo kaerimiru. Hitono tameni hakarite chunarazaruka. 
Ho-yu-to majiwarite shin narazaruka. Narawazaruwo tsutauruka." 
#5. Shi iwaku, "Senjo-no kuniwo osamuruniwa, kotowo keishite shin ari, 
youwo sesshite hitowo aishi, tamiwo tsukauni tokiwo mottesu." 
#6. Shi iwaku, "Teishi iritewa sunawachi kou, idetewa sunawachi tei, tsutsushimite shin ari, 
hiroku shu-wo aishite jin'ni shitashimi okonaite yoryoku areba sunawachi motte bunwo manabe." 
#7. Shika iwaku, "Kenwo kentoshite ironi kae, fuboni tsukaetewa yoku sono chikarawo tsukushi, 
kimini tsukaete yoku sono miwo itashi, ho-yu- to majiwari, iite shin araba, 
imada manabazuto iuto iedomo, warewa kanarazu korewo manabitarito iwan." 
#8. Shi iwaku, "Kunshi omokarazareba sunawachi i arazu. Manabeba sunawachi ko narazu. 
Chushinwo shutoshi onoreni shikazaru monowo tomotosuru nakare. 
Ayamachiwa sunawachi aratamuruni habakarukoto nakare," to. 
#9. So-shi iwaku, "Owariwo tsutsumi tookiwo oeba, tamino toku otsukini kisen." 
`.trim().split("\n").join(""),
];

let Spellcast = {};
Spellcast.make = (opt) => {
    console.log(opt);
    if (!opt) opt = {level: 15};
    if (!opt.level && opt.enemy) opt.level = parseInt("*222222222555558889999ccceeefffffffff"[opt.enemy], 16);
    
    let spell =  jumon(opt.level);
    let cs = Keyboard.clevel([0, opt.level || 15]);
    cs += Keyboard.shift(cs) + " ";
    console.log("cs=",cs);

    // level < 8 なら句読点をすべて;とする
    if (opt.level < 8) spell = spell.split(".").join(";").split(",").join(";").split("?").join(";").split("!").join(";");
    // 記号類の付加
    spell = spell.split(" ").map(v => {
        let level = opt.level;
        if (v.split("").some(c=>`,.:;[]<>()!?@{}"`.indexOf(c)!=-1) || GetRand(5)) return v;
        // +系
        if (GetRand(5) < 1) {
            let symbols = "+-=/*&^@".split("").filter(c => cs.indexOf(c) != -1);
            return v + " " + symbols[GetRand(symbols.length)] + " ";
        }
        // 括弧系
        if (GetRand(3) < 1 && (8 <= level)) {
            let symbols = `<>(){}[]""''`.split("").filter(c => cs.indexOf(c) != -1);
            let i = GetRand(symbols.length/2) * 2;
            return symbols[i] + v + symbols[i+1];
        }
        // 語接続
        if (GetRand(3) < 1 && (13 <= level)) {
            let symbols = `-_`.split("").filter(c => cs.indexOf(c) != -1);
            let i = GetRand(symbols.length);
            return v + symbols[i];
        }
        // 句読点
        let symbols = "!?,.;:".split("").filter(c => cs.indexOf(c) != -1);
        return v + symbols[GetRand(symbols.length)];

    }).join(" ").split("- ").join("-").split("_ ").join("_");
    // レベル外の文字を削除する
    spell = spell.split("").filter(c => cs.indexOf(c) != -1).join("").split(" ").filter(v => v && v!=";" && v!=".").join(" ");
    
    return spell;
};

$.ajax({
    url: "wordlist.10000.txt",
    type: 'get',
    success: (data) => {
        Spellcast.words = data.split("\n");
    },
    timeout: 10000,
});


let jumon = (level) => {

    if (9 <= level && GetRand(4) == 0) return jum[GetRand(jum.length)];

    let l5 = "a sad dead all ask dad as see saw seesaw father quest raffle laugh yesterday after yes star ask qatar thursday tuesday saturday weekday week at we seek just talk key sky rude rare tea dash less eat fast duster fear fare request style gus geek least held sell tell used dead hall hell death lease head get stay study stash wash wall wake trust shark shake gate flew afterwards july august three teeth eye sugar wet status sweat sweater sheet start turtle east west slew useful fat full fake take quake earthquake earth date ladar jester dust release last weakest waseda takara yakata rakuda hakusha hakata";
    
    console.log("auto spelling");
    
    let l2 = "a ad adak adal adass adj adja ads aja ajak ajal ajalak ajass aka akal akasaka akda ala alaff alaska alda alk alad all alls als as asa asal ask asks assa da dad dadak dadal dadass dadj dadja dads daja dajak dajal dajalak dajass daka dakal dakasak dakda dala dalaff dalaska dalda dalk dall dalls dals das dasa dasal dask dasks dassa fa fad fadak fadal fadass fadj fadja fads faja fajak fajal fajalak fajass faka fakal fakasak fakda fala falaff falaska falda falk fall falls fals fas fasa fasal fask fasks fassa ja jad jadak jadal jadass jadj jadja jads jaja jajak jajal jajalak jajass jak jaka jakal jakasak jakda jala jalaff jakalaska jalda jalk jall jalls jals jas jasa jasal jask jasks jassa ka kad kadak kadal kadass kadj kadja kads kaja kajak kajal kajalak kajass kaka kakal kakasak kakda kala kalaff kalaska kalda kalk kall kalls kals kas kasa kasal kask kasks kassa sa sad sadak sadal sadass sadj sadja sads saja sajak sajal sajalak sajass sak saka sakal sakasa sakda sal sala salaff salaska salda salk sall salls sals sas sasa sasal sask sasks sassaska skad skadak skadal skadass skadj skadja skads skaja skajak skajal skajalak skajass skaka skakal skaks skakda skala skalaff skalaska skalda skalk skall skalls skals skas skasa skasal skask skasks skassa".split(" ");

    const make_wordcard = () => {
        let cs = Keyboard.clevel([0, level || 15]);
        cs += Keyboard.shift(cs) + " ";
        let words = (2 < level) ? Spellcast.words : l2;
        return words.filter(w => w.split("").every(c=>cs.indexOf(c)!=-1));
    };
    
    let wordcard = make_wordcard();
    let spell = "";
    while(spell.length < 1000) {
        let i = GetRand(wordcard.length);
        spell += wordcard[i] + " ";
        wordcard.splice(i,1);
    }
    console.log(spell);
    
    return spell.split(" ").filter(v => v.length)
        .map(v => (4 <= level) && (GetRand(7) == 0) ? (v[0].toUpperCase() + v.slice(1)) : v)
        //.map(v => GetRand(10) < 1 ? (v + ";") : GetRand(10) < 1 ? (v + " +") : v)
        .join(" ");
};
