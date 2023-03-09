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

// 指定文字数の呪文を返す
const provide_script = function(entire, len) {
    let from = GetRand(entire.length);
    from = entire.lastIndexOf(" ", from) + 1;
    let ret = entire.slice(from, from + len);
    if (ret.length == len) return ret;
    return (ret + " " + entire).slice(0, len);
};

let Spellcast = {};
Spellcast.make = (opt) => {
    CLOG(opt);

    // 引数調整
    if (!opt) opt = {level: 15};
    if (!opt.level) opt.level = (!opt.enemy) ? 15 : parseInt("*222222222555558889999ccceeefffffffff"[opt.enemy], 16);
    if (!opt.len) opt.len = 44 * 3;

    // 呪文作成
    let spell =  jumon(opt.level);

    //使える文字
    let cs = Keyboard.clevel([0, opt.level || 15]);
    cs += Keyboard.shift(cs) + " ";

    // level < 8 なら句読点をすべて;とする
    if (opt.level < 8) spell = spell.split(".").join(";").split(",").join(";").split("?").join(";").split("!").join(";");

    // 記号類の付加
    const add_symbols = (v, sym) => {
        let level = opt.level;
        const symbols = `+-=/*&^@<({["'%$#\\1234567890-_!?,.;:`.split("").filter(c => cs.indexOf(c) != -1);
        if (!sym) sym = symbols[GetRand(symbols.length)];
        CLOG("symbol", v, sym);

        // +系
        if ("+=/*&^@".indexOf(sym) != -1) return v + " " + sym;

        // 語末
        if (`-_!?,.;:`.indexOf(sym) != -1) return v + sym;

        // 括弧系
        let parlens = `<>(){}[]""''`;
        let i = parlens.indexOf(sym);
        if (i != -1) {
            i = parseInt(i / 2) * 2;
            return parlens[i] + v + parlens[i+1];
        }

        //数字
        let nums = symbols.filter(c => "1234567890".indexOf(c) != -1);
        if (nums.indexOf(sym) != -1) {
            let num = sym;
            if (GetRand(2)) num += nums[GetRand(nums.length)];
            if ((GetRand(8) == 0 || sym == "0") && (1 < num.length)) num = num[0] + "." + num.slice(1);
            return v + " " + num;
        }
        //単位
        if (`%$#\\`.indexOf(sym) != -1) {
            let num = nums[GetRand(nums.length)];
            if (num != "0" && GetRand(2)) num += nums[GetRand(nums.length)];
            return v + " " + (sym == "%" ? (num + "%") : (sym + num));
        }
        
        return v;
    };

    // 記号類の付加
    spell = spell.split(" ").map(w => w.match(/[^A-Za-z]/) || GetRand(5) ? w : add_symbols(w))
        .join(" ").split("- ").join("-").split("_ ").join("_");

    // レベル外の文字を削除する
    spell = spell.split("").filter(c => cs.indexOf(c) != -1).join("").split(" ").filter(v => v && v!=";" && v!=".").join(" ");

    // サイズに切る
    spell = provide_script(spell, opt.len);

    if (spell.length < 40) return spell;
    if (opt.level < 10) return spell;
    
    //入れるべき文字を含める
    Keyboard.clevel((opt.level == 12 || opt.level == 14) ? [(opt.level - 1), opt.level] : opt.level)
        .split("").forEach((c,i) => {
            let c_ = Keyboard.shift(c);
            if ("|~".indexOf(c_) != -1) c_ = c;
            if (spell.indexOf(c) != -1 || spell.indexOf(c_) != -1) return;
            let ws = spell.split(" ");
            let idx = ws.map((w,i) => w.match(/[^A-Za-z]/) ? -1 : i).filter(v => v != -1);
            let x = idx[GetRand(idx.length)];
            CLOG("apppend:", c, ws[x]);
            ws[x] = add_symbols(ws[x], GetRand(2) ? c : c_);
            spell = ws.join(" ").split("- ").join("-").split("_ ").join("_").slice(0, opt.len);
        });

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

    CLOG("auto spelling");
    
    let l2 = "a ad adak adal adass adj adja ads aja ajak ajal ajalak ajass aka akal akasaka akda ala alaff alaska alda alk alad all alls als as asa asal ask asks assa da dad dadak dadal dadass dadj dadja dads daja dajak dajal dajalak dajass daka dakal dakasak dakda dala dalaff dalaska dalda dalk dall dalls dals das dasa dasal dask dasks dassa fa fad fadak fadal fadass fadj fadja fads faja fajak fajal fajalak fajass faka fakal fakasak fakda fala falaff falaska falda falk fall falls fals fas fasa fasal fask fasks fassa ja jad jadak jadal jadass jadj jadja jads jaja jajak jajal jajalak jajass jak jaka jakal jakasak jakda jala jalaff jakalaska jalda jalk jall jalls jals jas jasa jasal jask jasks jassa ka kad kadak kadal kadass kadj kadja kads kaja kajak kajal kajalak kajass kaka kakal kakasak kakda kala kalaff kalaska kalda kalk kall kalls kals kas kasa kasal kask kasks kassa sa sad sadak sadal sadass sadj sadja sads saja sajak sajal sajalak sajass sak saka sakal sakasa sakda sal sala salaff salaska salda salk sall salls sals sas sasa sasal sask sasks sassaska skad skadak skadal skadass skadj skadja skads skaja skajak skajal skajalak skajass skaka skakal skaks skakda skala skalaff skalaska skalda skalk skall skalls skals skas skasa skasal skask skasks skassa".split(" ");

    const make_wordcard = () => {
        let cs = Keyboard.clevel([0, level || 15]);
        cs += Keyboard.shift(cs) + " ";
        let words = (2 < level) ? Spellcast.words : l2;
        return words.filter(w => w.split("").every(c=>cs.indexOf(c)!=-1));
    };
    
    let wordcard = make_wordcard();
    let spell = "";
    while((spell.length < 44 * 6) && wordcard.length) {
        let i = GetRand(wordcard.length);
        spell += wordcard[i] + " ";
        //wordcard.splice(i,1);
    }
    //CLOG(spell);
    
    return spell.split(" ").filter(v => v.length)
        .map(v => (4 <= level) && (GetRand(7) == 0) ? (v[0].toUpperCase() + v.slice(1)) : v)
        //.map(v => GetRand(10) < 1 ? (v + ";") : GetRand(10) < 1 ? (v + " +") : v)
        .join(" ");
};

