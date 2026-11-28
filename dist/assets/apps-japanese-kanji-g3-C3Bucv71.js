(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`音読みかな、くん読みかな。おくりがなはあるかな。`;function t(t){let{otherWord:n}=t;return[{text:e},{text:`同じ字をつかった ことば：${n.text}（${n.reading}）`}]}function n(e,t,n){let{otherWord:r,word:i}=e,a=r.targetReading===i.targetReading?`「${r.reading}」という ことばにも つかう字だよ。`:`「${r.reading}」の「${r.targetReading}」とも読む字だよ。`,o=e.choices.filter(t=>t!==e.answer&&!n.includes(t)),s=o[Math.floor(t()*o.length)],c=e.choices.filter(t=>t===e.answer||t===s);return[{text:a},{text:`答えは、この2つのどちらかだよ。`,choices:c}]}function r(e,r,i=[]){return e.type===`reading`?t(e):n(e,r,i)}var i=10;function a(e){let t=[];for(let n=0;n<e.length;n+=i){let r=e.slice(n,n+i),a=t.length+1,o=`コース${a} ${r[0].kanji}～${r[r.length-1].kanji}`;t.push({id:`course-${String(a).padStart(2,`0`)}`,number:a,name:o,entries:r})}return t}function o(e,t){let n=[...e];for(let e=n.length-1;e>0;--e){let r=Math.floor(t()*(e+1));[n[e],n[r]]=[n[r],n[e]]}return n}function s(e,t){let[n,r]=e.words;return t()<.5?[n,r]:[r,n]}function c(e,t){return e.segments.map(e=>e.isTarget?t:e.reading).join(``)}function ee(e,t,n,r){let i=new Set([t.targetReading]);n.entries.forEach(e=>e.words.forEach(e=>i.add(e.targetReading)));let a=o([...i],r).map(t=>c(e,t)).filter((t,n,r)=>t!==e.reading&&r.indexOf(t)===n);return o([e.reading,...a.slice(0,3)],r)}function te(e,t,n,r){let i=e=>e.words.some(e=>e.targetReading===t.targetReading),a=o(n.entries.filter(t=>t!==e&&!i(t)),r).slice(0,3).map(e=>e.kanji);return o([e.kanji,...a],r)}function ne(e,t,n,r){let[i,a]=s(e,r);return t===`reading`?{type:t,entry:e,word:i,otherWord:a,choices:ee(i,a,n,r),answer:i.reading}:{type:t,entry:e,word:i,otherWord:a,choices:te(e,i,n,r),answer:e.kanji}}function l(e,t,n=10){let r=o(e.entries,t).slice(0,n),i=o(r.map((e,t)=>t%2==0?`reading`:`writing`),t);return r.map((n,r)=>ne(n,i[r],e,t))}var re=9,ie=2,ae=4,oe=[3,7,14,30],se=6,ce=2;function u(){return{passDates:[],attempts:0,best:0,masteredOn:null,reviewStage:0,reviewing:!1,lowStreak:0}}function le(e,t){let n=new Date(`${e}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()+t),n.toISOString().slice(0,10)}function d(e){if(!e.masteredOn||e.reviewing)return null;let t=oe[e.reviewStage];return t===void 0?null:le(e.masteredOn,t)}function f(e,t){return{...e,masteredOn:t,reviewStage:0,reviewing:!1}}function ue(e,t,n){let r=t>=re&&t<=10,i=r&&!e.passDates.includes(n)?[...e.passDates,n]:e.passDates,a={...e,passDates:i,attempts:e.attempts+1,best:Math.max(e.best,t),lowStreak:t<=se?e.lowStreak+1:0};return r&&e.reviewing&&(a=f(a,n)),!a.masteredOn&&i.length>=ie&&(a=f(a,n)),a}function de(e,t){return t>5||t<ae?{...e,reviewing:!0}:{...e,reviewStage:e.reviewStage+1}}function fe(e){return e.lowStreak>=ce}function p(e,t){if(e.reviewing)return`reviewing`;if(e.masteredOn){let n=d(e);return n===null?`completed`:n<=t?`review-due`:`mastered`}return e.attempts===0?`new`:`practicing`}function pe(){return(typeof document>`u`?void 0:document.documentElement.dataset.env)||`develop`}function m(e,t=pe()){return`${t}:${e}`}var h=m(`studri.sound`);function g(e){try{return e.getItem(h)!==`off`}catch{return!0}}function _(e,t){try{e.setItem(h,t?`on`:`off`)}catch{}}function v(e){try{let t=new AudioContext,n=t.createOscillator(),r=t.createGain();n.frequency.value=e===`correct`?880:220,r.gain.setValueAtTime(.08,t.currentTime),r.gain.exponentialRampToValueAtTime(.001,t.currentTime+.25),n.connect(r).connect(t.destination),n.start(),n.stop(t.currentTime+.25)}catch{}}var y=m(`studri.japanese.kanji-g3`),me=50;function b(){return{version:1,courses:{},mistakes:[]}}function he(e){if(typeof e!=`object`||!e)return b();let t=e;return t.version===1?{version:1,courses:Object.fromEntries(Object.entries(t.courses??{}).map(([e,t])=>[e,{...u(),...t}])),mistakes:Array.isArray(t.mistakes)?t.mistakes:[]}:b()}function x(e){try{return he(JSON.parse(e.getItem(y)??`null`))}catch{return b()}}function ge(e,t){try{e.setItem(y,JSON.stringify(t))}catch{}}function _e(e,t){return{...e,mistakes:[t,...e.mistakes].slice(0,me)}}function ve(e){try{e.removeItem(y)}catch{}}var ye=new Map(Object.entries({1:`一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六`,2:`引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪船線前組走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読内南肉馬売買麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話`,3:`悪安暗医委意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和`,4:`愛案以衣位茨印英栄媛塩岡億加果貨課芽賀改械害街各覚潟完官管関観願岐希季旗器機議求泣給挙漁共協鏡競極熊訓軍郡群径景芸欠結建健験固功好香候康佐差菜最埼材崎昨札刷察参産散残氏司試児治滋辞鹿失借種周祝順初松笑唱焼照城縄臣信井成省清静席積折節説浅戦選然争倉巣束側続卒孫帯隊達単置仲沖兆低底的典伝徒努灯働特徳栃奈梨熱念敗梅博阪飯飛必票標不夫付府阜富副兵別辺変便包法望牧末満未民無約勇要養浴利陸良料量輪類令冷例連老労録`,5:`圧囲移因永営衛易益液演応往桜可仮価河過快解格確額刊幹慣眼紀基寄規喜技義逆久旧救居許境均禁句型経潔件険検限現減故個護効厚耕航鉱構興講告混査再災妻採際在財罪殺雑酸賛士支史志枝師資飼示似識質舎謝授修述術準序招証象賞条状常情織職制性政勢精製税責績接設絶祖素総造像増則測属率損貸態団断築貯張停提程適統堂銅導得毒独任燃能破犯判版比肥非費備評貧布婦武復複仏粉編弁保墓報豊防貿暴脈務夢迷綿輸余容略留領歴`,6:`胃異遺域宇映延沿恩我灰拡革閣割株干巻看簡危机揮貴疑吸供胸郷勤筋系敬警劇激穴券絹権憲源厳己呼誤后孝皇紅降鋼刻穀骨困砂座済裁策冊蚕至私姿視詞誌磁射捨尺若樹収宗就衆従縦縮熟純処署諸除承将傷障蒸針仁垂推寸盛聖誠舌宣専泉洗染銭善奏窓創装層操蔵臓存尊退宅担探誕段暖値宙忠著庁頂腸潮賃痛敵展討党糖届難乳認納脳派拝背肺俳班晩否批秘俵腹奮並陛閉片補暮宝訪亡忘棒枚幕密盟模訳郵優預幼欲翌乱卵覧裏律臨朗論`}).flatMap(([e,t])=>[...t].map(t=>[t,Number(e)])));function be(e){return/\p{Script=Han}/u.test(e)}function xe(e){return ye.get(e)}function Se(e,t){if(!be(e))return!1;let n=xe(e);return n===void 0||n>=t}function S(e){return e.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`)}function C(e,t){return e.segments.map(e=>{let n=S(e.text);return e.isTarget?t===`hide-target`?`<span class="blank" role="img" aria-label="空いているところ"></span>`:`<span class="target">${n}</span>`:Se(e.text,3)?`<ruby>${n}<rt>${S(e.reading)}</rt></ruby>`:n}).join(``)}var w={new:`はじめよう`,practicing:`れんしゅう中`,"review-due":`ふくしゅうの日だよ`,reviewing:`もう一どれんしゅうしよう`,mastered:`ごうかく！`,completed:`かんぺき！`};function T(e){let[,t,n]=e.split(`-`);return`${Number(t)}月${Number(n)}日`}function E(e,t){let n=p(e,t);if(n===`practicing`)return`ごうかくの回 ${e.passDates.length}/2`;let r=d(e);return n===`mastered`&&r?`つぎの ふくしゅう ${T(r)}`:``}function D(e,t,n){let r=p(t,n),i=r===`review-due`?`<button type="button" class="button accent" data-action="review" data-course="${e.id}">ふくしゅう</button>`:``;return`
    <li class="course status-${r}" data-course-id="${e.id}">
      <span class="course-number" aria-hidden="true">${e.number}</span>
      <div class="course-body">
        <h3 class="course-name">${S(e.name)}</h3>
        <p class="course-kanji">${e.entries.map(e=>e.kanji).join(` `)}</p>
        <p class="course-status"><strong>${w[r]}</strong> ${E(t,n)}</p>
        <p class="course-record">ちょうせん ${t.attempts}回・いちばん ${t.best}/10</p>
      </div>
      <div class="course-actions">
        <button type="button" class="button" data-action="practice" data-course="${e.id}">れんしゅう</button>
        ${i}
      </div>
    </li>`}function O(e,t,n){let r=e.filter(e=>p(t(e.id),n)===`review-due`);return`
    <section class="hero">
      <img class="mascot" src="../../../studri.jpeg" alt="スタドリのキャラクター">
      <div>
        <h1>3年生の<ruby>漢<rt>かん</rt></ruby>字</h1>
        <p>10字ずつの コースで、読みと書きを れんしゅうしよう。</p>
      </div>
    </section>
    ${r.length?`<p class="notice">ふくしゅうの日の コースが ${r.length}こ あるよ。先に ふくしゅうしよう。</p>`:``}
    <ol class="course-map" aria-label="コース">${e.map(e=>D(e,t(e.id),n)).join(``)}</ol>
    <div class="home-actions">
      <button type="button" class="button" data-action="mistakes">まちがえた もんだい</button>
      <button type="button" class="button danger" data-action="reset">きろくを けす</button>
    </div>`}function k(e,t,n,r,i){let a=e.type===`reading`,o=a?`<p class="prompt-label">色の字の 読みは どれかな？</p><p class="word" data-word="${S(e.word.text)}">${C(e.word,`mark-target`)}</p>`:`<p class="prompt-label">空いている ところに 入る字は どれかな？</p><p class="reading">${S(e.word.reading)}</p><p class="word" data-word="${S(e.word.text)}">${C(e.word,`hide-target`)}</p>`,s=i.map((e,t)=>`<button type="button" class="choice${r.includes(e)?` tried`:``}" data-choice="${S(e)}" ${r.includes(e)?`disabled`:``}><span class="key" aria-hidden="true">${t+1}</span>${S(e)}</button>`).join(``);return`
    <section class="quiz" aria-label="もんだい">
      <div class="quiz-head">
        <button type="button" class="button small" data-action="back">もどる</button>
        <p class="progress">${t+1} / ${n}</p>
        <p class="type-label">${a?`読み`:`書き`}</p>
      </div>
      <div class="question">${o}</div>
      <div class="choices">${s}</div>
    </section>`}function A(e,t,n,r){let i=e.filter(e=>e.firstTry).length,a=i>=t?`よくできたね！`:`まちがえた字を、もう一ど たしかめよう。`,o=e.map(({question:e,firstTry:t})=>`<li class="${t?`ok`:`ng`}"><span>${t?`○`:`△`}</span> ${S(e.word.text)}（${S(e.word.reading)}）</li>`).join(``);return`
    <section class="result" aria-label="けっか">
      <h2>${n?`ふくしゅう`:`れんしゅう`}の けっか</h2>
      <p class="score">${i} / ${e.length}</p>
      <p class="comment">${a}</p>
      ${r?`<p class="notice">${r}</p>`:``}
      <ol class="answers">${o}</ol>
      <div class="home-actions">
        <button type="button" class="button accent" data-action="again">もう一ど</button>
        <button type="button" class="button" data-action="home">コースの一らんへ</button>
      </div>
    </section>`}function j(e){return`
    <section class="mistakes" aria-label="まちがえた もんだい">
      <h2>まちがえた もんだい</h2>
      <ol>${e.length?e.map(e=>`<li><strong>${S(e.word)}</strong>（${e.type===`reading`?`読み`:`書き`}）えらんだ答え：${S(e.chosen)}・正しい答え：${S(e.answer)}</li>`).join(``):`<li>まだ ないよ。</li>`}</ol>
      <button type="button" class="button" data-action="home">コースの一らんへ</button>
    </section>`}var Ce=`# 3年生の漢字の言葉 1

3年生の漢字の練習で出題する言葉。学年別漢字配当表の第3学年の1字目から100字目まで。

- **上位ページ**：[3年生の漢字](README.md)
- **読み**：言葉の字ごとの読みを「・」で区切る。\`[]\` の中が、問う字の読み

## 言葉

| 漢字 | 言葉1 | 読み1 | 言葉2 | 読み2 |
| --- | --- | --- | --- | --- |
| 悪 | 悪い | [わる]・い | 悪人 | [あく]・にん |
| 安 | 安い | [やす]・い | 安心 | [あん]・しん |
| 暗 | 暗い | [くら]・い | 暗記 | [あん]・き |
| 医 | 医者 | [い]・しゃ | 医学 | [い]・がく |
| 委 | 委員 | [い]・いん | 学級委員 | がっ・きゅう・[い]・いん |
| 意 | 意味 | [い]・み | 用意 | よう・[い] |
| 育 | 育つ | [そだ]・つ | 体育 | たい・[いく] |
| 員 | 店員 | てん・[いん] | 会員 | かい・[いん] |
| 院 | 病院 | びょう・[いん] | 入院 | にゅう・[いん] |
| 飲 | 飲む | [の]・む | 飲食 | [いん]・しょく |
| 運 | 運ぶ | [はこ]・ぶ | 運動 | [うん]・どう |
| 泳 | 泳ぐ | [およ]・ぐ | 水泳 | すい・[えい] |
| 駅 | 駅前 | [えき]・まえ | 駅長 | [えき]・ちょう |
| 央 | 中央 | ちゅう・[おう] | 中央口 | ちゅう・[おう]・ぐち |
| 横 | 横顔 | [よこ]・がお | 横転 | [おう]・てん |
| 屋 | 屋上 | [おく]・じょう | 本屋 | ほん・[や] |
| 温 | 温かい | [あたた]・か・い | 気温 | き・[おん] |
| 化 | 化ける | [ば]・け・る | 化石 | [か]・せき |
| 荷 | 荷物 | [に]・もつ | 荷台 | [に]・だい |
| 界 | 世界 | せ・[かい] | 世界中 | せ・[かい]・じゅう |
| 開 | 開く | [ひら]・く | 開店 | [かい]・てん |
| 階 | 一階 | いっ・[かい] | 二階 | に・[かい] |
| 寒 | 寒い | [さむ]・い | 寒中 | [かん]・ちゅう |
| 感 | 感心 | [かん]・しん | 感想 | [かん]・そう |
| 漢 | 漢字 | [かん]・じ | 漢文 | [かん]・ぶん |
| 館 | 図書館 | と・しょ・[かん] | 館長 | [かん]・ちょう |
| 岸 | 岸 | [きし] | 海岸 | かい・[がん] |
| 起 | 起きる | [お]・き・る | 起立 | [き]・りつ |
| 期 | 学期 | がっ・[き] | 期間 | [き]・かん |
| 客 | 客 | [きゃく] | 来客 | らい・[きゃく] |
| 究 | 研究 | けん・[きゅう] | 研究者 | けん・[きゅう]・しゃ |
| 急 | 急ぐ | [いそ]・ぐ | 急行 | [きゅう]・こう |
| 級 | 学級 | がっ・[きゅう] | 上級生 | じょう・[きゅう]・せい |
| 宮 | お宮 | お・[みや] | 王宮 | おう・[きゅう] |
| 球 | 野球 | や・[きゅう] | 電球 | でん・[きゅう] |
| 去 | 去年 | [きょ]・ねん | 去る | [さ]・る |
| 橋 | 橋 | [はし] | 鉄橋 | てっ・[きょう] |
| 業 | 作業 | さ・[ぎょう] | 工業 | こう・[ぎょう] |
| 曲 | 曲がる | [ま]・が・る | 名曲 | めい・[きょく] |
| 局 | 薬局 | やっ・[きょく] | 放送局 | ほう・そう・[きょく] |
| 銀 | 銀行 | [ぎん]・こう | 銀色 | [ぎん]・いろ |
| 区 | 区切る | [く]・ぎ・る | 地区 | ち・[く] |
| 苦 | 苦しい | [くる]・し・い | 苦い | [にが]・い |
| 具 | 道具 | どう・[ぐ] | 家具 | か・[ぐ] |
| 君 | 君 | [きみ] | 田中君 | た・なか・[くん] |
| 係 | 係 | [かかり] | 係員 | [かかり]・いん |
| 軽 | 軽い | [かる]・い | 軽食 | [けい]・しょく |
| 血 | 血 | [ち] | 出血 | しゅっ・[けつ] |
| 決 | 決める | [き]・め・る | 決心 | [けっ]・しん |
| 研 | 研究 | [けん]・きゅう | 研究所 | [けん]・きゅう・じょ |
| 県 | 県 | [けん] | 県道 | [けん]・どう |
| 庫 | 車庫 | しゃ・[こ] | 金庫 | きん・[こ] |
| 湖 | 湖 | [みずうみ] | 湖水 | [こ]・すい |
| 向 | 向く | [む]・く | 方向 | ほう・[こう] |
| 幸 | 幸せ | [しあわ]・せ | 幸運 | [こう]・うん |
| 港 | 港 | [みなと] | 空港 | くう・[こう] |
| 号 | 番号 | ばん・[ごう] | 記号 | き・[ごう] |
| 根 | 根 | [ね] | 大根 | だい・[こん] |
| 祭 | 祭り | [まつ]・り | 文化祭 | ぶん・か・[さい] |
| 皿 | 皿 | [さら] | 小皿 | こ・[ざら] |
| 仕 | 仕事 | [し]・ごと | 仕方 | [し]・かた |
| 死 | 死ぬ | [し]・ぬ | 死角 | [し]・かく |
| 使 | 使う | [つか]・う | 大使 | たい・[し] |
| 始 | 始める | [はじ]・め・る | 開始 | かい・[し] |
| 指 | 指 | [ゆび] | 指す | [さ]・す |
| 歯 | 歯 | [は] | 歯科 | [し]・か |
| 詩 | 詩 | [し] | 詩人 | [し]・じん |
| 次 | 次 | [つぎ] | 目次 | もく・[じ] |
| 事 | 火事 | か・[じ] | 大事 | だい・[じ] |
| 持 | 持つ | [も]・つ | 所持 | しょ・[じ] |
| 式 | 式 | [しき] | 入学式 | にゅう・がく・[しき] |
| 実 | 実 | [み] | 実行 | [じっ]・こう |
| 写 | 写す | [うつ]・す | 写真 | [しゃ]・しん |
| 者 | 学者 | がく・[しゃ] | 作者 | さく・[しゃ] |
| 主 | 主人 | [しゅ]・じん | 主な | [おも]・な |
| 守 | 守る | [まも]・る | 見守る | み・[まも]・る |
| 取 | 取る | [と]・る | 受け取る | う・け・[と]・る |
| 酒 | 酒 | [さけ] | 日本酒 | に・ほん・[しゅ] |
| 受 | 受ける | [う]・け・る | 受け身 | [う]・け・み |
| 州 | 九州 | きゅう・[しゅう] | 本州 | ほん・[しゅう] |
| 拾 | 拾う | [ひろ]・う | 拾い物 | [ひろ]・い・もの |
| 終 | 終わる | [お]・わ・る | 終点 | [しゅう]・てん |
| 習 | 習う | [なら]・う | 学習 | がく・[しゅう] |
| 集 | 集める | [あつ]・め・る | 集合 | [しゅう]・ごう |
| 住 | 住む | [す]・む | 住所 | [じゅう]・しょ |
| 重 | 重い | [おも]・い | 体重 | たい・[じゅう] |
| 宿 | 宿 | [やど] | 宿題 | [しゅく]・だい |
| 所 | 所 | [ところ] | 場所 | ば・[しょ] |
| 暑 | 暑い | [あつ]・い | 暑中 | [しょ]・ちゅう |
| 助 | 助ける | [たす]・け・る | 助手 | [じょ]・しゅ |
| 昭 | 昭和 | [しょう]・わ | 昭和時代 | [しょう]・わ・じ・だい |
| 消 | 消す | [け]・す | 消火 | [しょう]・か |
| 商 | 商店 | [しょう]・てん | 商売 | [しょう]・ばい |
| 章 | 文章 | ぶん・[しょう] | 第一章 | だい・いっ・[しょう] |
| 勝 | 勝つ | [か]・つ | 勝負 | [しょう]・ぶ |
| 乗 | 乗る | [の]・る | 乗客 | [じょう]・きゃく |
| 植 | 植える | [う]・え・る | 植物 | [しょく]・ぶつ |
| 申 | 申す | [もう]・す | 申し出る | [もう]・し・で・る |
| 身 | 中身 | なか・[み] | 全身 | ぜん・[しん] |
| 神 | 神社 | [じん]・じゃ | 神様 | [かみ]・さま |
`,we=`# 3年生の漢字の言葉 2

3年生の漢字の練習で出題する言葉。学年別漢字配当表の第3学年の101字目から200字目まで。

- **上位ページ**：[3年生の漢字](README.md)
- **読み**：言葉の字ごとの読みを「・」で区切る。\`[]\` の中が、問う字の読み

## 言葉

| 漢字 | 言葉1 | 読み1 | 言葉2 | 読み2 |
| --- | --- | --- | --- | --- |
| 真 | 真ん中 | [ま]・ん・なか | 写真 | しゃ・[しん] |
| 深 | 深い | [ふか]・い | 深海 | [しん]・かい |
| 進 | 進む | [すす]・む | 前進 | ぜん・[しん] |
| 世 | 世界 | [せ]・かい | 世の中 | [よ]・の・なか |
| 整 | 整える | [ととの]・え・る | 整理 | [せい]・り |
| 昔 | 昔 | [むかし] | 昔話 | [むかし]・ばなし |
| 全 | 全部 | [ぜん]・ぶ | 全く | [まった]・く |
| 相 | 相手 | [あい]・て | 相談 | [そう]・だん |
| 送 | 送る | [おく]・る | 放送 | ほう・[そう] |
| 想 | 感想 | かん・[そう] | 予想 | よ・[そう] |
| 息 | 息 | [いき] | 休息 | きゅう・[そく] |
| 速 | 速い | [はや]・い | 速度 | [そく]・ど |
| 族 | 家族 | か・[ぞく] | 水族館 | すい・[ぞく]・かん |
| 他 | 他 | [ほか] | 他人 | [た]・にん |
| 打 | 打つ | [う]・つ | 打者 | [だ]・しゃ |
| 対 | 反対 | はん・[たい] | 対話 | [たい]・わ |
| 待 | 待つ | [ま]・つ | 期待 | き・[たい] |
| 代 | 代わる | [か]・わ・る | 時代 | じ・[だい] |
| 第 | 第一 | [だい]・いち | 第三 | [だい]・さん |
| 題 | 問題 | もん・[だい] | 宿題 | しゅく・[だい] |
| 炭 | 炭 | [すみ] | 木炭 | もく・[たん] |
| 短 | 短い | [みじか]・い | 短文 | [たん]・ぶん |
| 談 | 相談 | そう・[だん] | 会談 | かい・[だん] |
| 着 | 着る | [き]・る | 着地 | [ちゃく]・ち |
| 注 | 注ぐ | [そそ]・ぐ | 注意 | [ちゅう]・い |
| 柱 | 柱 | [はしら] | 電柱 | でん・[ちゅう] |
| 丁 | 一丁目 | いっ・[ちょう]・め | 二丁目 | に・[ちょう]・め |
| 帳 | 手帳 | て・[ちょう] | 帳面 | [ちょう]・めん |
| 調 | 調べる | [しら]・べ・る | 体調 | たい・[ちょう] |
| 追 | 追う | [お]・う | 追い風 | [お]・い・かぜ |
| 定 | 定める | [さだ]・め・る | 予定 | よ・[てい] |
| 庭 | 庭 | [にわ] | 校庭 | こう・[てい] |
| 笛 | 笛 | [ふえ] | 汽笛 | き・[てき] |
| 鉄 | 鉄 | [てつ] | 地下鉄 | ち・か・[てつ] |
| 転 | 転ぶ | [ころ]・ぶ | 運転 | うん・[てん] |
| 都 | 都 | [みやこ] | 東京都 | とう・きょう・[と] |
| 度 | 今度 | こん・[ど] | 温度 | おん・[ど] |
| 投 | 投げる | [な]・げ・る | 投手 | [とう]・しゅ |
| 豆 | 豆 | [まめ] | 大豆 | だい・[ず] |
| 島 | 島 | [しま] | 半島 | はん・[とう] |
| 湯 | お湯 | お・[ゆ] | 湯気 | [ゆ]・げ |
| 登 | 登る | [のぼ]・る | 登山 | [と]・ざん |
| 等 | 等しい | [ひと]・し・い | 一等 | いっ・[とう] |
| 動 | 動く | [うご]・く | 運動 | うん・[どう] |
| 童 | 童話 | [どう]・わ | 学童 | がく・[どう] |
| 農 | 農家 | [のう]・か | 農業 | [のう]・ぎょう |
| 波 | 波 | [なみ] | 電波 | でん・[ぱ] |
| 配 | 配る | [くば]・る | 心配 | しん・[ぱい] |
| 倍 | 二倍 | に・[ばい] | 倍数 | [ばい]・すう |
| 箱 | 箱 | [はこ] | 本箱 | ほん・[ばこ] |
| 畑 | 畑 | [はたけ] | 田畑 | た・[はた] |
| 発 | 発見 | [はっ]・けん | 出発 | しゅっ・[ぱつ] |
| 反 | 反対 | [はん]・たい | 反る | [そ]・る |
| 坂 | 坂 | [さか] | 坂道 | [さか]・みち |
| 板 | 板 | [いた] | 黒板 | こく・[ばん] |
| 皮 | 皮 | [かわ] | 毛皮 | け・[がわ] |
| 悲 | 悲しい | [かな]・し・い | 悲鳴 | [ひ]・めい |
| 美 | 美しい | [うつく]・し・い | 美人 | [び]・じん |
| 鼻 | 鼻 | [はな] | 鼻水 | [はな]・みず |
| 筆 | 筆 | [ふで] | 筆者 | [ひっ]・しゃ |
| 氷 | 氷 | [こおり] | 氷山 | [ひょう]・ざん |
| 表 | 表 | [おもて] | 発表 | はっ・[ぴょう] |
| 秒 | 一秒 | いち・[びょう] | 秒速 | [びょう]・そく |
| 病 | 病気 | [びょう]・き | 病院 | [びょう]・いん |
| 品 | 品物 | [しな]・もの | 作品 | さく・[ひん] |
| 負 | 負ける | [ま]・け・る | 勝負 | しょう・[ぶ] |
| 部 | 全部 | ぜん・[ぶ] | 部分 | [ぶ]・ぶん |
| 服 | 服 | [ふく] | 洋服 | よう・[ふく] |
| 福 | 幸福 | こう・[ふく] | 福の神 | [ふく]・の・かみ |
| 物 | 動物 | どう・[ぶつ] | 食べ物 | た・べ・[もの] |
| 平 | 平ら | [たい]・ら | 平和 | [へい]・わ |
| 返 | 返す | [かえ]・す | 返事 | [へん]・じ |
| 勉 | 勉強 | [べん]・きょう | 勉学 | [べん]・がく |
| 放 | 放す | [はな]・す | 放送 | [ほう]・そう |
| 味 | 味 | [あじ] | 意味 | い・[み] |
| 命 | 命 | [いのち] | 生命 | せい・[めい] |
| 面 | 面 | [めん] | 画面 | が・[めん] |
| 問 | 問題 | [もん]・だい | 問い | [と]・い |
| 役 | 役 | [やく] | 役所 | [やく]・しょ |
| 薬 | 薬 | [くすり] | 薬局 | [やっ]・きょく |
| 由 | 自由 | じ・[ゆう] | 理由 | り・[ゆう] |
| 油 | 油 | [あぶら] | 石油 | せき・[ゆ] |
| 有 | 有名 | [ゆう]・めい | 所有 | しょ・[ゆう] |
| 遊 | 遊ぶ | [あそ]・ぶ | 遊園地 | [ゆう]・えん・ち |
| 予 | 予定 | [よ]・てい | 予想 | [よ]・そう |
| 羊 | 羊 | [ひつじ] | 羊毛 | [よう]・もう |
| 洋 | 洋服 | [よう]・ふく | 太平洋 | たい・へい・[よう] |
| 葉 | 葉 | [は] | 言葉 | こと・[ば] |
| 陽 | 太陽 | たい・[よう] | 陽気 | [よう]・き |
| 様 | 様子 | [よう]・す | 王様 | おう・[さま] |
| 落 | 落ちる | [お]・ち・る | 落語 | [らく]・ご |
| 流 | 流れる | [なが]・れ・る | 流行 | [りゅう]・こう |
| 旅 | 旅 | [たび] | 旅行 | [りょ]・こう |
| 両 | 両手 | [りょう]・て | 両方 | [りょう]・ほう |
| 緑 | 緑 | [みどり] | 緑茶 | [りょく]・ちゃ |
| 礼 | お礼 | お・[れい] | 礼 | [れい] |
| 列 | 列 | [れつ] | 行列 | ぎょう・[れつ] |
| 練 | 練習 | [れん]・しゅう | 練る | [ね]・る |
| 路 | 道路 | どう・[ろ] | 線路 | せん・[ろ] |
| 和 | 平和 | へい・[わ] | 和室 | [わ]・しつ |
`,Te=/^\| (\S) \| (\S+) \| (\S+) \| (\S+) \| (\S+) \|$/;function M(e,t){let n=t.split(`・`),r=[...e];if(n.length!==r.length)throw Error(`読みの区切りが字の数と合わない：${e}`);let i=r.map((e,t)=>{let r=n[t].startsWith(`[`);return{text:e,reading:n[t].replace(/[[\]]/g,``),isTarget:r}}),a=i.find(e=>e.isTarget);if(!a)throw Error(`問う字の読みがない：${e}`);return{text:e,segments:i,reading:i.map(e=>e.reading).join(``),targetReading:a.reading}}function N(e){return e.split(`
`).map(e=>Te.exec(e)).filter(e=>e!==null).map(([,e,t,n,r,i])=>({kanji:e,words:[M(t,n),M(r,i)]}))}var Ee=[...N(Ce),...N(we)],De=9,Oe=4,ke=3e3,Ae=3,P=a(Ee),F=document.getElementById(`app`),I=document.getElementById(`feedback`),L=document.getElementById(`confirmReset`),R=document.getElementById(`soundToggle`),z=x(localStorage),B=null,V,H=()=>new Date(Date.now()+324e5).toISOString().slice(0,10),U=e=>z.courses[e]??u();function W(e){z=e,ge(localStorage,z)}function G(){B=null,F.innerHTML=O(P,U,H())}function K(e,t){let n=l(e,Math.random,t?5:void 0);B={course:e,review:t,questions:n,index:0,wrong:0,tried:[],visible:n[0].choices,rows:[]},q()}function q(){if(!B)return;let e=B.questions[B.index];F.innerHTML=k(e,B.index,B.questions.length,B.tried,B.visible),F.querySelector(`.choice:not([disabled])`)?.focus()}function J(e,t,n){document.getElementById(`feedbackTitle`).textContent=e,document.getElementById(`feedbackBody`).innerHTML=t,document.getElementById(`feedbackActions`).innerHTML=n,I.showModal(),I.querySelector(`button`)?.focus()}function Y(){window.clearTimeout(V),I.open&&I.close()}function X(e){if(!B||I.open)return;let t=B.questions[B.index];if(e===t.answer)return je();Me(t,e)}function je(){B&&(B.rows.push({question:B.questions[B.index],firstTry:B.wrong===0}),g(localStorage)&&v(`correct`),J(`せいかい！`,``,`<button type="button" class="button accent" data-action="next">つぎへ</button>`),V=window.setTimeout(Z,ke))}function Me(e,t){if(!B)return;if(B.wrong+=1,B.tried.push(t),B.wrong===1){let n={word:e.word.text,type:e.type,chosen:t,answer:e.answer,date:H()};W(_e(z,n))}if(g(localStorage)&&v(`wrong`),B.wrong>=Ae)return Ne(e);let n=r(e,Math.random,B.tried)[B.wrong-1];n.choices&&(B.visible=n.choices),J(`ちがうよ`,`<p class="hint">ヒント：${S(n.text)}</p>`,`<button type="button" class="button accent" data-action="retry">もう一ど</button>`)}function Ne(e){B&&(B.rows.push({question:e,firstTry:!1}),J(`答えを たしかめよう`,`<p class="hint">正しい答え：<strong>${S(e.answer)}</strong></p><p>${S(e.word.text)}（${S(e.word.reading)}）</p>`,`<button type="button" class="button accent" data-action="next">つぎへ</button>`))}function Z(){if(Y(),B){if(B.index+=1,B.wrong=0,B.tried=[],B.index>=B.questions.length)return Pe();B.visible=B.questions[B.index].choices,q()}}function Pe(){if(!B)return;let{course:e,review:t,rows:n}=B,r=n.filter(e=>e.firstTry).length,i=U(e.id),a=t?de(i,r):ue(i,r,H());W({...z,courses:{...z.courses,[e.id]:a}});let o=!t&&fe(a)?`同じ コースを、ゆっくり もう一ど れんしゅうしよう。`:``;F.innerHTML=A(n,t?Oe:De,t,o)}function Fe(e){return P.find(t=>t.id===e)}function Q(e,t){let n=Fe(t.dataset.course);({practice:()=>n&&K(n,!1),review:()=>n&&K(n,!0),again:()=>B&&K(B.course,B.review),home:G,back:G,mistakes:()=>F.innerHTML=j(z.mistakes),next:Z,retry:()=>(Y(),q()),reset:()=>L.showModal(),"reset-confirm":()=>(ve(localStorage),z=x(localStorage),L.close(),G()),"reset-cancel":()=>L.close()})[e]?.()}document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action], [data-choice]`);if(t){if(t.dataset.choice!==void 0)return X(t.dataset.choice);Q(t.dataset.action??``,t)}}),document.addEventListener(`keydown`,e=>{if(I.open||!B)return;let t=Number(e.key)-1,n=B.visible[t];n!==void 0&&!B.tried.includes(n)&&X(n)});function $(){let e=g(localStorage);R.setAttribute(`aria-pressed`,String(e)),R.textContent=e?`🔊 おと`:`🔇 おと`}I.addEventListener(`cancel`,e=>e.preventDefault()),R.addEventListener(`click`,()=>{_(localStorage,!g(localStorage)),$()}),document.getElementById(`version`).textContent=`Ver. 20261128.223811.519`,$(),G();