let l2 = "akasaka dakala alaska da; dad falls sad as a salad jaff daff kalada jadak; jass das klak dask fask lask jaff DJ jak sakas dal ads ajal aka alk als alaff all ask asks jasks akal ja la sal asal assa jassa kassa lassa fall kall jakal skall ad adj aja ajak ajalak ajass ala alls alda akda asa dak dakka dadja daja dajak dajal dajalak dajass kalls adal adak adass adja".split(" ");

l2 = " dsjkf".split("").map(ini => l2.filter(v => v[0] == "a").map(v => ini + v).join(" ")).join(" ").split(" ").sort().join(" ");
l2 += l2.split(" ").filter(v => v[0] == "k").map(v => "s"+v).join(" ");

console.log(l2);
