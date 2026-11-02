"use strict";

const STORAGE_KEY = "studri-phonics-v1";
const SOUND_KEY = `${STORAGE_KEY}-sound`;
const QUIZ_LENGTH = 10;
const PASS_STREAK = 3;
const MAX_WRONG_ENTRIES = 50;
const MAX_HISTORY_ENTRIES = 50;
const FEEDBACK_AUTO_ADVANCE_MS = 3000;

const phonicsSounds = {
  "/s/": "ス",
  "/m/": "ム",
  "/f/": "フ",
  "/d/": "ドゥ",
  "/b/": "ブ",
  "/n/": "ヌ",
  "/p/": "プ",
  "/g/": "グ",
  "/k/": "ク",
  "/h/": "ハ",
  "/v/": "ヴ",
  "/z/": "ズ",
  "/kw/": "クゥ",
  "/ks/": "クス",
  "/t/": "トゥ",
  "/dʒ/": "ジュ",
  "/j/": "ユ",
  "/w/": "ウ",
  "/ŋg/": "ング",
  "/ŋ/": "ング",
  "/ʃ/": "シュ",
  "/ʒ/": "ジュ",
  "/tʃ/": "チ",
  "/θ/": "ス（舌先を歯の間に）",
  "/ð/": "ズ（舌先を歯の間に）",
  "/æ/": "ア",
  "/e/": "エ",
  "/ɪ/": "イ",
  "/i/": "イ",
  "/ɒ/": "オ",
  "/ʌ/": "ア",
  "/ɑː/": "アー",
  "/ɔː/": "オー",
  "/ʊ/": "ウ",
  "/uː/": "ウー",
  "/iː/": "イー",
  "/eɪ/": "エイ",
  "/aɪ/": "アイ",
  "/oʊ/": "オウ",
  "/əʊ/": "オウ",
  "/juː/": "ユー",
  "/ɔɪ/": "オイ",
  "/aʊ/": "アウ",
  "/ə/": "ア（弱く）",
};
const phonicsLetterSounds = {
  a: "ア", b: "ブ", c: "ク", d: "ドゥ", e: "エ", f: "フ", g: "グ", h: "ハ", i: "イ",
  j: "ジュ", k: "ク", l: "ル", m: "ム", n: "ヌ", o: "オ", p: "プ", qu: "クゥ", r: "ル",
  s: "ス", t: "トゥ", u: "ア", v: "ヴ", w: "ウ", x: "クス", y: "ユ", z: "ズ",
};
const phonicsSoundPattern = new RegExp(
  Object.keys(phonicsSounds)
    .sort((left, right) => right.length - left.length)
    .map((symbol) => symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "g",
);

const alphabetLetterCourses = [
  { id: "alphabet-1", title: "アルファベットの音①", icon: "🔤", summary: "b・c・d・f・g・h の音", letters: ["b", "c", "d", "f", "g", "h"] },
  { id: "alphabet-2", title: "アルファベットの音②", icon: "🔤", summary: "j・k・l・m・n・p の音", letters: ["j", "k", "l", "m", "n", "p"] },
  { id: "alphabet-3", title: "アルファベットの音③", icon: "🔤", summary: "r・s・t・v・w・y・z の音", letters: ["r", "s", "t", "v", "w", "y", "z"] },
  { id: "alphabet-4", title: "アルファベットの母音", icon: "🔤", summary: "a・e・i・o・u の音", letters: ["a", "e", "i", "o", "u"] },
];

// 既存の alphabet の問題を、その単語の文字が属するコースへ振り分ける
const legacyAlphabetCourse = {
  fish: "alphabet-1", dog: "alphabet-1", bag: "alphabet-1",
  map: "alphabet-2", kite: "alphabet-2", jam: "alphabet-2",
  sun: "alphabet-3", van: "alphabet-3", zip: "alphabet-3", queen: "alphabet-3",
  box: "alphabet-3", red: "alphabet-3", top: "alphabet-3", yes: "alphabet-3",
};

// 文字ごとの例単語（一覧表の例の単語・単語カナに基づく）
const letterExampleWords = {
  a: { word: "apple", split: "ア・ッ・プ・ル", joined: "アップル", meaning: "りんご" },
  b: { word: "bus", split: "バ・ス", joined: "バス", meaning: "乗り物" },
  c: { word: "cat", split: "キャ・ット", joined: "キャット", meaning: "猫" },
  d: { word: "dog", split: "ド・オ・グ", joined: "ドッグ", meaning: "犬" },
  e: { word: "egg", split: "エ・ッ・グ", joined: "エッグ", meaning: "たまご" },
  f: { word: "fish", split: "フ・ィッ・シュ", joined: "フィッシュ", meaning: "魚" },
  g: { word: "gorilla", split: "ゴ・リ・ラ", joined: "ゴリラ", meaning: "動物" },
  h: { word: "hat", split: "ハ・ット", joined: "ハット", meaning: "帽子" },
  i: { word: "ink", split: "イ・ン・ク", joined: "インク", meaning: "インク" },
  j: { word: "juice", split: "ジュ・ース", joined: "ジュース", meaning: "飲み物" },
  k: { word: "king", split: "キ・ン・グ", joined: "キング", meaning: "王様" },
  l: { word: "lemon", split: "レ・モ・ン", joined: "レモン", meaning: "果物" },
  m: { word: "milk", split: "ミ・ル・ク", joined: "ミルク", meaning: "牛乳" },
  n: { word: "nut", split: "ナ・ッ・ツ", joined: "ナッツ", meaning: "木の実" },
  o: { word: "orange", split: "オ・レ・ン・ジ", joined: "オレンジ", meaning: "果物" },
  p: { word: "pen", split: "ペ・ン", joined: "ペン", meaning: "書くもの" },
  r: { word: "robot", split: "ロ・ボ・ッ・ト", joined: "ロボット", meaning: "機械人形" },
  s: { word: "sun", split: "ス・ア・ン", joined: "サン", meaning: "太陽" },
  t: { word: "tomato", split: "ト・マ・ト", joined: "トマト", meaning: "野菜" },
  u: { word: "umbrella", split: "ア・ン・ブ・レ・ラ", joined: "アンブレラ", meaning: "傘" },
  v: { word: "violin", split: "バ・イ・オ・リ・ン", joined: "バイオリン", meaning: "楽器" },
  w: { word: "watch", split: "ウォ・ッ・チ", joined: "ウォッチ", meaning: "腕時計" },
  y: { word: "yo-yo", split: "ヨ・ー・ヨ・ー", joined: "ヨーヨー", meaning: "おもちゃ" },
  z: { word: "zoo", split: "ズ・ー", joined: "ズー", meaning: "動物園" },
};
const courses = [
  ...alphabetLetterCourses,
  { id: "short-vowels", title: "短母音とCVC", icon: "🍎", summary: "短い母音の音と、子音・母音・子音の単語" },
  { id: "consonant-teams", title: "子音の組み合わせ", icon: "🐚", summary: "sh・ch・th・ph・wh などのつづり" },
  { id: "silent-e", title: "サイレントe", icon: "✨", summary: "語尾のeで母音の音が変わる単語" },
  { id: "vowel-teams", title: "母音チーム", icon: "🌈", summary: "ai・ee・oa・oo などの母音の組み合わせ" },
];

const questionBank = {
  alphabet: [
    { level: 0, prompt: "sun の最初の音はどれ？", word: "sun", display: "？・ア・ン", answer: "/s/", choices: ["/s/", "/m/", "/t/", "/f/"], explanation: "sun は /s/ の音で始まるよ。S の音を思い出そう。" },
    { level: 0, prompt: "map の最初の音はどれ？", word: "map", display: "？・ア・プ", answer: "/m/", choices: ["/m/", "/n/", "/b/", "/p/"], explanation: "map は /m/ の音で始まるよ。唇を閉じて出す音だよ。" },
    { level: 0, prompt: "fish の最初の音はどれ？", word: "fish", display: "？・ィッ・シュ", answer: "/f/", choices: ["/f/", "/v/", "/s/", "/h/"], explanation: "fish は /f/ の音で始まるよ。" },
    { level: 0, prompt: "dog の最初の音はどれ？", word: "dog", display: "？・オ・グ", answer: "/d/", choices: ["/d/", "/b/", "/g/", "/t/"], explanation: "dog は /d/ の音で始まるよ。" },
    { level: 1, prompt: "bag の最初の音を表す文字は？", word: "bag", display: "？・ア・グ", answer: "b", choices: ["b", "d", "p", "g"], explanation: "bag は b の音で始まる単語。文字 b が /b/ を表すよ。" },
    { level: 1, prompt: "kite の最初の音を表す文字は？", word: "kite", display: "？・アイ・ト", answer: "k", choices: ["k", "h", "t", "g"], explanation: "kite は /k/ の音で始まるよ。ここでは k がその音を表すよ。" },
    { level: 2, prompt: "van の最初の音はどれ？", word: "van", display: "？・ア・ン", answer: "/v/", choices: ["/v/", "/f/", "/w/", "/b/"], explanation: "van は /v/ の音で始まるよ。f の音と区別してみよう。" },
    { level: 2, prompt: "zip の最初の音を表す文字は？", word: "zip", display: "？・イ・プ", answer: "z", choices: ["z", "s", "j", "x"], explanation: "zip は /z/ の音で始まるよ。文字 z の音だね。" },
    { level: 3, prompt: "queen の最初の音の組み合わせは？", word: "queen", display: "？・イー・ン", answer: "qu", choices: ["qu", "kw", "q", "ch"], explanation: "queen の最初の音は /kw/。つづりでは qu がその音を表すよ。" },
    { level: 3, prompt: "box の最後の音はどれ？", word: "box", display: "ブ・オ・？", answer: "/ks/", choices: ["/ks/", "/s/", "/z/", "/k/"], explanation: "box の x は語尾で /ks/ の音を表すよ。" },
    { level: 0, prompt: "red の最初の音を表す文字は？", word: "red", display: "？・エ・ド", answer: "r", choices: ["r", "h", "w", "d"], explanation: "red は r の音で始まる単語だよ。" },
    { level: 1, prompt: "top の最初の音はどれ？", word: "top", display: "？・オ・プ", answer: "/t/", choices: ["/t/", "/d/", "/p/", "/k/"], explanation: "top は /t/ の音で始まるよ。" },
    { level: 2, prompt: "jam の最初の音を表す文字は？", word: "jam", display: "？・ア・ム", answer: "j", choices: ["j", "g", "y", "c"], explanation: "jam は /dʒ/ の音で始まるよ。文字 j が使われるね。" },
    { level: 3, prompt: "yes の最初の音はどれ？", word: "yes", display: "？・エ・ス", answer: "/j/", choices: ["/j/", "/dʒ/", "/i/", "/w/"], explanation: "yes の y はヤ行の音 /j/ だよ。" },
  ],
  "short-vowels": [
    { level: 0, prompt: "cat の母音 a の音はどれ？", word: "cat", display: "ク・？・ト", answer: "/æ/", choices: ["/æ/", "/e/", "/ɪ/", "/ʊ/"], explanation: "cat の a は短い /æ/ の音だよ。" },
    { level: 0, prompt: "bed の母音 e の音はどれ？", word: "bed", display: "ブ・？・ド", answer: "/e/", choices: ["/e/", "/æ/", "/iː/", "/ɒ/"], explanation: "bed の e は短い /e/ の音だよ。" },
    { level: 0, prompt: "pig の母音 i の音はどれ？", word: "pig", display: "プ・？・グ", answer: "/ɪ/", choices: ["/ɪ/", "/aɪ/", "/e/", "/uː/"], explanation: "pig の i は短い /ɪ/ の音だよ。" },
    { level: 1, prompt: "hot の母音 o の音はどれ？", word: "hot", display: "ハ・？・ト", answer: "/ɒ/", choices: ["/ɒ/", "/oʊ/", "/ʌ/", "/ɔɪ/"], explanation: "hot の o は短い /ɒ/ の音だよ。" },
    { level: 1, prompt: "sun の母音 u の音はどれ？", word: "sun", display: "ス・？・ン", answer: "/ʌ/", choices: ["/ʌ/", "/uː/", "/ʊ/", "/ɒ/"], explanation: "sun の u は短い /ʌ/ の音だよ。" },
    { level: 1, prompt: "map のまんなかの音に合う文字は？", word: "m_p", display: "ム・？・プ", answer: "a", choices: ["a", "e", "i", "o"], explanation: "map は m-a-p。まんなかの a が短い /æ/ の音を表すよ。" },
    { level: 2, prompt: "hen のまんなかの音に合う文字は？", word: "h_n", display: "ハ・？・ン", answer: "e", choices: ["e", "a", "o", "i"], explanation: "hen は h-e-n。e が短い /e/ の音を表すよ。" },
    { level: 2, prompt: "cup のまんなかの音はどれ？", word: "cup", display: "ク・？・プ", answer: "/ʌ/", choices: ["/ʌ/", "/ɪ/", "/e/", "/iː/"], explanation: "cup の u は短い /ʌ/ の音だよ。" },
    { level: 3, prompt: "fox のまんなかの音に合う文字は？", word: "f_x", display: "フ・？・クス", answer: "o", choices: ["o", "a", "i", "e"], explanation: "fox は f-o-x。o が短い /ɒ/ の音を表すよ。" },
    { level: 3, prompt: "web のまんなかの音はどれ？", word: "web", display: "ウ・？・ブ", answer: "/e/", choices: ["/e/", "/æ/", "/ɒ/", "/ʊ/"], explanation: "web の e は短い /e/ の音だよ。" },
    { level: 0, prompt: "fin の母音 i の音はどれ？", word: "fin", display: "フ・？・ン", answer: "/ɪ/", choices: ["/ɪ/", "/iː/", "/e/", "/ʌ/"], explanation: "fin の i は短い /ɪ/ の音だよ。" },
    { level: 2, prompt: "bag の母音 a の音はどれ？", word: "bag", display: "ブ・？・グ", answer: "/æ/", choices: ["/æ/", "/e/", "/ɑː/", "/ɒ/"], explanation: "bag の a は短い /æ/ の音だよ。" },
  ],
  "consonant-teams": [
    { level: 0, prompt: "ship の sh が表す最初の音は？", word: "ship", display: "？・イ・プ", answer: "/ʃ/", choices: ["/ʃ/", "/s/", "/tʃ/", "/h/"], explanation: "sh は2文字で /ʃ/ の音を表すよ。" },
    { level: 0, prompt: "chin の ch が表す最初の音は？", word: "chin", display: "？・イ・ン", answer: "/tʃ/", choices: ["/tʃ/", "/ʃ/", "/k/", "/dʒ/"], explanation: "ch は2文字で /tʃ/ の音を表すよ。" },
    { level: 0, prompt: "thin の th が表す最初の音は？", word: "thin", display: "？・イ・ン", answer: "/θ/", choices: ["/θ/", "/ð/", "/f/", "/t/"], explanation: "thin の th は /θ/ の音。舌先を歯の間に軽く出すよ。" },
    { level: 1, prompt: "this の th が表す最初の音は？", word: "this", display: "？・イ・ス", answer: "/ð/", choices: ["/ð/", "/θ/", "/d/", "/z/"], explanation: "this の th は声を出す /ð/ の音だよ。" },
    { level: 1, prompt: "phone の ph が表す最初の音は？", word: "phone", display: "？・オ・ン", answer: "/f/", choices: ["/f/", "/p/", "/h/", "/v/"], explanation: "ph は /f/ の音を表すつづりだよ。" },
    { level: 1, prompt: "whale の wh が表す最初の音は？", word: "whale", display: "？・エイ・ル", answer: "/w/", choices: ["/w/", "/h/", "/v/", "/f/"], explanation: "whale の wh は /w/ の音で始まるよ。" },
    { level: 2, prompt: "ring の ng が表す最後の音は？", word: "ring", display: "ラ・イ・？", answer: "/ŋ/", choices: ["/ŋ/", "/n/", "/g/", "/k/"], explanation: "ng は語尾で /ŋ/ の音を表すことがあるよ。" },
    { level: 2, prompt: "duck の ck が表す最後の音は？", word: "duck", display: "ド・ア・？", answer: "/k/", choices: ["/k/", "/s/", "/tʃ/", "/g/"], explanation: "ck は2文字で /k/ の音を表すよ。" },
    { level: 3, prompt: "shop の sh が表す最初の音は？", word: "shop", display: "？・オ・プ", answer: "/ʃ/", choices: ["/ʃ/", "/tʃ/", "/ʒ/", "/s/"], explanation: "shop の sh は /ʃ/ の音だよ。" },
    { level: 3, prompt: "chat の ch が表す最初の音は？", word: "chat", display: "？・ア・ト", answer: "/tʃ/", choices: ["/tʃ/", "/ʃ/", "/k/", "/h/"], explanation: "chat の ch は /tʃ/ の音だよ。" },
    { level: 1, prompt: "bath の th が表す最後の音は？", word: "bath", display: "ブ・ア・？", answer: "/θ/", choices: ["/θ/", "/ð/", "/t/", "/f/"], explanation: "bath の th は声を出さない /θ/ の音だよ。" },
    { level: 2, prompt: "sing の ng が表す最後の音は？", word: "sing", display: "ス・イ・？", answer: "/ŋ/", choices: ["/ŋ/", "/n/", "/g/", "/dʒ/"], explanation: "sing の ng は /ŋ/ の音だよ。" },
  ],
  "silent-e": [
    { level: 0, prompt: "cap に e をつけた cape の a はどの音？", word: "cape", display: "ク・？・プ", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/e/", "/ɑː/"], explanation: "語尾の e は発音しないけれど、a をアルファベットの名前に近い /eɪ/ にするよ。" },
    { level: 0, prompt: "kit に e をつけた kite の i はどの音？", word: "kite", display: "ク・？・ト", answer: "/aɪ/", choices: ["/aɪ/", "/ɪ/", "/iː/", "/eɪ/"], explanation: "語尾の e で i が /aɪ/ の音になるよ。" },
    { level: 0, prompt: "hop に e をつけた hope の o はどの音？", word: "hope", display: "ハ・？・プ", answer: "/oʊ/", choices: ["/oʊ/", "/ɒ/", "/ɔː/", "/ʌ/"], explanation: "語尾の e で o が /oʊ/ の音になるよ。" },
    { level: 1, prompt: "cub に e をつけた cube の u はどの音？", word: "cube", display: "ク・？・ブ", answer: "/juː/", choices: ["/juː/", "/ʌ/", "/ʊ/", "/uː/"], explanation: "語尾の e で u が /juː/ の音になる単語があるよ。" },
    { level: 1, prompt: "mad と made。語尾で発音しない文字は？", word: "made", display: "マ・ド・？", answer: "e", choices: ["e", "a", "d", "m"], explanation: "made の最後の e は発音しないサイレントeだよ。" },
    { level: 1, prompt: "not と note。語尾で発音しない文字は？", word: "note", display: "ノ・ト・？", answer: "e", choices: ["e", "o", "t", "n"], explanation: "note の最後の e は発音しないよ。o の音が変わる合図だね。" },
    { level: 2, prompt: "fin と fine。母音 i が変わる理由は？", word: "fine", display: "フ・イ・ン・？", answer: "最後のe", choices: ["最後のe", "最初のf", "語尾のn", "母音がない"], explanation: "語尾の e が i の音を /aɪ/ に変えるよ。" },
    { level: 2, prompt: "pet と Pete。母音 e の音が変わる合図は？", word: "Pete", display: "ペ・ト・？", answer: "最後のe", choices: ["最後のe", "最初のP", "語尾のt", "文字が2つ"], explanation: "語尾の e によって、母音がアルファベットの名前の音になるよ。" },
    { level: 3, prompt: "tap と tape。語尾の e の音は？", word: "tape", display: "ト・エイ・プ・？", answer: "発音しない", choices: ["発音しない", "/e/", "/iː/", "/ə/"], explanation: "サイレントeは語尾で発音せず、前の母音の音に影響するよ。" },
    { level: 3, prompt: "cut と cute。cute の u はどの音？", word: "cute", display: "ク・？・ト", answer: "/juː/", choices: ["/juː/", "/ʌ/", "/ʊ/", "/aɪ/"], explanation: "cute の u は /juː/ の音。最後の e は発音しないよ。" },
    { level: 2, prompt: "hop と hope。hope の o はどの音？", word: "hope", display: "ハ・？・プ", answer: "/oʊ/", choices: ["/oʊ/", "/ɒ/", "/ʌ/", "/ɔɪ/"], explanation: "hope の o は /oʊ/。語尾の e が合図だよ。" },
    { level: 3, prompt: "rid と ride。ride の i はどの音？", word: "ride", display: "ラ・？・ド", answer: "/aɪ/", choices: ["/aɪ/", "/ɪ/", "/iː/", "/eɪ/"], explanation: "ride の i は /aɪ/ の音だよ。" },
  ],
  "vowel-teams": [
    { level: 0, prompt: "rain の ai が表す母音の音は？", word: "rain", display: "ラ・？・ン", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/iː/", "/aɪ/"], explanation: "rain の ai は /eɪ/ の音を表すよ。" },
    { level: 0, prompt: "seed の ee が表す母音の音は？", word: "seed", display: "ス・？・ド", answer: "/iː/", choices: ["/iː/", "/ɪ/", "/eɪ/", "/uː/"], explanation: "seed の ee は /iː/ の音を表すよ。" },
    { level: 0, prompt: "boat の oa が表す母音の音は？", word: "boat", display: "ブ・？・ト", answer: "/oʊ/", choices: ["/oʊ/", "/ɒ/", "/ɔɪ/", "/aʊ/"], explanation: "boat の oa は /oʊ/ の音を表すよ。" },
    { level: 1, prompt: "moon の oo が表す母音の音は？", word: "moon", display: "ム・？・ン", answer: "/uː/", choices: ["/uː/", "/ʊ/", "/ʌ/", "/ɔː/"], explanation: "moon の oo は /uː/ の音だよ。" },
    { level: 1, prompt: "book の oo が表す母音の音は？", word: "book", display: "ブ・？・ク", answer: "/ʊ/", choices: ["/ʊ/", "/uː/", "/oʊ/", "/ɒ/"], explanation: "book の oo は moon と違って、短い /ʊ/ の音だよ。" },
    { level: 1, prompt: "seed のまんなかの音に合うつづりは？", word: "s__d", display: "ス・？・ド", answer: "ee", choices: ["ee", "ea", "ai", "oa"], explanation: "seed は ee が /iː/ の音を表すよ。" },
    { level: 2, prompt: "play の ay が表す母音の音は？", word: "play", display: "プ・ル・？", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/aɪ/", "/ɔɪ/"], explanation: "play の ay は /eɪ/ の音を表すよ。" },
    { level: 2, prompt: "coin の oi が表す母音の音は？", word: "coin", display: "ク・？・ン", answer: "/ɔɪ/", choices: ["/ɔɪ/", "/oʊ/", "/aɪ/", "/aʊ/"], explanation: "coin の oi は /ɔɪ/ の音だよ。" },
    { level: 3, prompt: "cloud の ou が表す母音の音は？", word: "cloud", display: "ク・ル・？・ド", answer: "/aʊ/", choices: ["/aʊ/", "/oʊ/", "/uː/", "/ɔɪ/"], explanation: "cloud の ou は /aʊ/ の音を表すよ。" },
    { level: 3, prompt: "train の ai が表す母音の音は？", word: "train", display: "ト・ラ・？・ン", answer: "/eɪ/", choices: ["/eɪ/", "/aɪ/", "/æ/", "/e/"], explanation: "train の ai は /eɪ/ の音だよ。" },
    { level: 2, prompt: "day の ay が表す母音の音は？", word: "day", display: "ド・？", answer: "/eɪ/", choices: ["/eɪ/", "/æ/", "/aɪ/", "/iː/"], explanation: "day の ay は /eɪ/ の音を表すよ。" },
    { level: 3, prompt: "book の oo が表す母音の音は？", word: "book", display: "ブ・？・ク", answer: "/ʊ/", choices: ["/ʊ/", "/uː/", "/əʊ/", "/ɪ/"], explanation: "book の oo は短い /ʊ/ の音だよ。" },
  ],
};

const wordInfo = {
  "sun": { split: "ス・ア・ン", joined: "サン", meaning: "太陽" },
  "map": { split: "ム・ア・ップ", joined: "マップ", meaning: "地図" },
  "fish": { split: "フ・ィッ・シュ", joined: "フィッシュ", meaning: "魚" },
  "dog": { split: "ド・オ・グ", joined: "ドッグ", meaning: "犬" },
  "bag": { split: "バ・ア・グ", joined: "バッグ", meaning: "かばん" },
  "kite": { split: "ク・アイ・ト", joined: "カイト", meaning: "凧" },
  "van": { split: "ヴ・ア・ン", joined: "ヴァン", meaning: "小型のバン" },
  "zip": { split: "ズ・イ・プ", joined: "ジップ", meaning: "ファスナー" },
  "queen": { split: "ク・イー・ン", joined: "クイーン", meaning: "女王" },
  "box": { split: "ブ・オ・クス", joined: "ボックス", meaning: "箱" },
  "red": { split: "ラ・エ・ド", joined: "レッド", meaning: "赤" },
  "top": { split: "ト・オ・プ", joined: "トップ", meaning: "てっぺん" },
  "jam": { split: "ジ・ア・ム", joined: "ジャム", meaning: "ジャム" },
  "yes": { split: "イ・エ・ス", joined: "イエス", meaning: "はい" },
  "cat": { split: "ク・ア・ト", joined: "キャット", meaning: "猫" },
  "bed": { split: "ブ・エ・ド", joined: "ベッド", meaning: "ベッド" },
  "pig": { split: "プ・イ・グ", joined: "ピッグ", meaning: "豚" },
  "hot": { split: "ハ・オ・ト", joined: "ホット", meaning: "熱い" },
  "hen": { split: "ハ・エ・ン", joined: "ヘン", meaning: "雌のニワトリ" },
  "cup": { split: "ク・ア・プ", joined: "カップ", meaning: "カップ" },
  "fox": { split: "フ・オ・クス", joined: "フォックス", meaning: "キツネ" },
  "web": { split: "ウ・エ・ブ", joined: "ウェブ", meaning: "クモの巣" },
  "fin": { split: "フ・イ・ン", joined: "フィン", meaning: "ひれ" },
  "ship": { split: "シ・イ・プ", joined: "シップ", meaning: "船" },
  "chin": { split: "チ・イ・ン", joined: "チン", meaning: "あご" },
  "thin": { split: "ス・イ・ン", joined: "シン", meaning: "薄い、細い" },
  "this": { split: "ズ・イ・ス", joined: "ディス", meaning: "これ" },
  "phone": { split: "フ・オ・ン", joined: "フォン", meaning: "電話" },
  "whale": { split: "ウ・エイ・ル", joined: "ウェイル", meaning: "クジラ" },
  "ring": { split: "ラ・イ・ング", joined: "リング", meaning: "指輪" },
  "duck": { split: "ダ・ア・ク", joined: "ダック", meaning: "アヒル" },
  "shop": { split: "シ・オ・プ", joined: "ショップ", meaning: "店" },
  "chat": { split: "チ・ア・ト", joined: "チャット", meaning: "おしゃべり" },
  "bath": { split: "バ・ア・ス", joined: "バス", meaning: "風呂" },
  "sing": { split: "ス・イ・ング", joined: "シング", meaning: "歌う" },
  "cape": { split: "ク・エイ・プ", joined: "ケイプ", meaning: "マント" },
  "hope": { split: "ハ・オウ・プ", joined: "ホープ", meaning: "希望" },
  "cube": { split: "ク・ユー・ブ", joined: "キューブ", meaning: "立方体" },
  "made": { split: "メ・エイ・ド", joined: "メイド", meaning: "作られた" },
  "note": { split: "ノ・オウ・ト", joined: "ノート", meaning: "メモ" },
  "fine": { split: "フ・アイ・ン", joined: "ファイン", meaning: "元気な、すばらしい" },
  "Pete": { split: "プ・イー・ト", joined: "ピート", meaning: "人名" },
  "tape": { split: "テ・エイ・プ", joined: "テープ", meaning: "テープ" },
  "cute": { split: "ク・ユー・ト", joined: "キュート", meaning: "かわいい" },
  "ride": { split: "ラ・アイ・ド", joined: "ライド", meaning: "乗る" },
  "rain": { split: "ラ・エイ・ン", joined: "レイン", meaning: "雨" },
  "seed": { split: "ス・イー・ド", joined: "シード", meaning: "種" },
  "boat": { split: "ブ・オウ・ト", joined: "ボート", meaning: "ボート" },
  "moon": { split: "ム・ウー・ン", joined: "ムーン", meaning: "月" },
  "book": { split: "ブ・ウ・ク", joined: "ブック", meaning: "本" },
  "play": { split: "プ・レ・イ", joined: "プレイ", meaning: "遊ぶ" },
  "coin": { split: "ク・オイ・ン", joined: "コイン", meaning: "硬貨" },
  "cloud": { split: "ク・ラ・アウ・ド", joined: "クラウド", meaning: "雲" },
  "train": { split: "ト・レ・イ・ン", joined: "トレイン", meaning: "電車" },
  "day": { split: "ド・エイ", joined: "デイ", meaning: "日" },
  "m_p": { split: "ム・ア・ップ", joined: "マップ", meaning: "地図" },
  "h_n": { split: "ハ・エ・ン", joined: "ヘン", meaning: "雌のニワトリ" },
  "f_x": { split: "フ・オ・クス", joined: "フォックス", meaning: "キツネ" },
  "s__d": { split: "ス・イー・ド", joined: "シード", meaning: "種" },
};

for (const example of Object.values(letterExampleWords)) {
  if (!wordInfo[example.word]) {
    wordInfo[example.word] = { split: example.split, joined: example.joined, meaning: example.meaning };
  }
}

function pickDistinct(candidates, count, keyOf) {
  const picked = [];
  const keys = new Set();
  for (const candidate of candidates) {
    const key = keyOf(candidate);
    if (keys.has(key)) continue;
    keys.add(key);
    picked.push(candidate);
    if (picked.length === count) break;
  }
  return picked;
}

function buildLetterQuestions(course) {
  const questions = [];
  course.letters.forEach((letter) => {
    const example = letterExampleWords[letter];
    const kana = phonicsLetterSounds[letter];
    const display = ["？", ...example.split.split("・").slice(1)].join("・");
    const candidates = Object.keys(phonicsLetterSounds)
      .filter((other) => other !== letter && phonicsLetterSounds[other] !== kana)
      .sort((left, right) => Number(course.letters.includes(right)) - Number(course.letters.includes(left)));
    const distractors = pickDistinct(candidates, 3, (other) => phonicsLetterSounds[other]);
    questions.push({
      level: 0,
      prompt: `${example.word} の最初の音を表す文字は？`,
      word: example.word,
      display,
      answer: letter,
      choices: [letter, ...distractors],
      explanation: `${example.word} は ${letter} の音で始まる単語だよ。`,
    });
    questions.push({
      level: 1,
      prompt: `文字 ${letter} の音はどれ？`,
      word: example.word,
      display,
      answer: kana,
      choices: [kana, ...distractors.map((other) => phonicsLetterSounds[other])],
      explanation: `${letter} の音は ${kana} だよ。例：${example.word}。`,
    });
  });
  return questions;
}

for (const course of alphabetLetterCourses) {
  questionBank[course.id] = [
    ...questionBank.alphabet.filter((question) => legacyAlphabetCourse[question.word] === course.id),
    ...buildLetterQuestions(course),
  ];
}
delete questionBank.alphabet;

// ヒント：読みごとに、日本で身近なカタカナ英語の例と音節を示す
const soundExampleWords = {
  "ア": "アップル", "エ": "エッグタルト", "イ": "インターネット", "オ": "オレンジ",
  "ウ": "ウィンナー", "アイ": "アイス", "エイ": "ケーキ", "オウ": "ホーム",
  "オイ": "コイン", "アウ": "カウンター", "イー": "ティー", "ウー": "スープ",
  "ユー": "ユーモア", "ア（弱く）": "アップル",
  "ブ": "ブログ", "ク": "クッキー", "グ": "グッズ", "ドゥ": "ドリンク",
  "ヌ": "ヌードル", "プ": "プレゼント", "ス": "スマホ", "ズ": "ズーム",
  "フ": "フィレオフィッシュ", "ハ": "ハンバーガー", "ム": "ムービー", "ル": "ルール",
  "ヴ": "ヴァイオリン", "ジュ": "ジュース", "シュ": "シュークリーム", "チ": "チキン",
  "ユ": "ユニフォーム", "トゥ": "トゥモロー", "ング": "リング", "クゥ": "クイズ",
  "クス": "ボックス", "ス（舌先を歯の間に）": "サンクス", "ズ（舌先を歯の間に）": "ブラザー",
};
const exampleSyllables = {
  "アップル": "ア・ッ・プ・ル", "エッグタルト": "エッ・グ・タ・ル・ト",
  "インターネット": "イン・ター・ネ・ッ・ト", "オレンジ": "オ・レ・ン・ジ",
  "ウィンナー": "ウィ・ン・ナ・ー", "アイス": "ア・イ・ス", "ケーキ": "ケ・ー・キ",
  "ホーム": "ホ・ー・ム", "コイン": "コ・イ・ン", "カウンター": "カ・ウ・ン・タ・ー",
  "ティー": "ティ・ー", "スープ": "ス・ー・プ", "ユーモア": "ユ・ー・モ・ア",
  "ブログ": "ブ・ロ・グ", "クッキー": "ク・ッ・キ・ー", "グッズ": "グ・ッ・ズ",
  "ドリンク": "ド・リ・ン・ク", "ヌードル": "ヌ・ー・ド・ル", "プレゼント": "プ・レ・ゼ・ン・ト",
  "スマホ": "ス・マ・ホ", "ズーム": "ズ・ー・ム", "フィレオフィッシュ": "フィ・レ・オ・フィッ・シュ",
  "ハンバーガー": "ハ・ン・バ・ー・ガ・ー", "ムービー": "ム・ー・ビ・ー", "ルール": "ル・ー・ル",
  "ヴァイオリン": "ヴァ・イ・オ・リ・ン", "ジュース": "ジュ・ー・ス", "シュークリーム": "シュー・ク・リ・ー・ム",
  "チキン": "チ・キ・ン", "ユニフォーム": "ユ・ニ・フォ・ー・ム", "トゥモロー": "ト・ゥ・モ・ロ・ー",
  "リング": "リ・ン・グ", "クイズ": "ク・イ・ズ", "ボックス": "ボ・ッ・ク・ス",
  "サンクス": "サ・ン・クス", "ブラザー": "ブ・ラ・ザ・ー",
};
const kanaOfAnswer = (answer) => phonicsLetterSounds[answer] || phonicsSounds[answer] || answer;
for (const pool of Object.values(questionBank)) {
  for (const question of pool) {
    const example = soundExampleWords[kanaOfAnswer(question.answer)];
    question.explanation = example
      ? `${example}（${exampleSyllables[example]}）`
      : question.explanation.replace(/の音/g, "");
  }
}

const defaultData = () => ({ stats: {}, wrong: [], history: [] });
const getElement = (id) => document.getElementById(id);
let learningData = loadLearningData();
let selectedCourse = courses[0].id;
let quiz = null;
let locked = false;
let advanceTimer = null;
let modeTimer = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let audioContext = null;

function loadLearningData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaultData();
    const courseIds = new Set(courses.map((course) => course.id));
    const stats = Object.fromEntries(
      Object.entries(saved.stats || {}).filter(([courseId]) => courseIds.has(courseId)),
    );
    const recentWrong = Array.isArray(saved.wrong) ? saved.wrong : [];
    const recentHistory = Array.isArray(saved.history) ? saved.history : [];
    return {
      stats,
      wrong: recentWrong.filter((entry) => entry && courseIds.has(entry.courseId)).slice(-MAX_WRONG_ENTRIES),
      history: recentHistory.slice(-MAX_HISTORY_ENTRIES),
    };
  } catch {
    return defaultData();
  }
}

function getPhonicsText(text) {
  return text.replace(phonicsSoundPattern, (symbol) => `${phonicsSounds[symbol]}（${symbol}）`);
}

function appendPhonicsText(element, text) {
  let lastIndex = 0;
  for (const match of text.matchAll(phonicsSoundPattern)) {
    const symbol = match[0];
    const index = match.index;
    if (index > lastIndex) element.append(text.slice(lastIndex, index));
    const pronunciation = document.createElement("span");
    pronunciation.className = "phonics-pronunciation";
    const kana = document.createElement("span");
    kana.className = "phonics-kana";
    kana.textContent = phonicsSounds[symbol];
    const ipa = document.createElement("small");
    ipa.className = "phonics-ipa";
    ipa.textContent = `（${symbol}）`;
    pronunciation.append(kana, ipa);
    element.append(pronunciation);
    lastIndex = index + symbol.length;
  }
  if (lastIndex < text.length) element.append(text.slice(lastIndex));
}

function appendAnswerText(element, value) {
  if (phonicsLetterSounds[value]) {
    appendLetterChoice(element, value);
  } else {
    appendPhonicsText(element, value);
  }
}

function appendLetterChoice(element, letter) {
  const pronunciation = document.createElement("span");
  pronunciation.className = "phonics-pronunciation";
  const kana = document.createElement("span");
  kana.className = "phonics-kana";
  kana.textContent = phonicsLetterSounds[letter];
  const symbol = document.createElement("small");
  symbol.className = "phonics-ipa";
  symbol.textContent = `（${letter}）`;
  pronunciation.append(kana, symbol);
  element.append(pronunciation);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learningData));
}

function getStats(courseId) {
  return learningData.stats[courseId] || {
    streak: 0, attempts: 0, best: null, timeBest: null, chainBest: 0,
  };
}

function renderCourses() {
  const list = getElement("courses");
  list.replaceChildren();
  courses.forEach((course) => list.append(createCourseCard(course)));
}

function createCourseCard(course) {
  const stats = getStats(course.id);
  const card = document.createElement("article");
  card.className = `course${stats.streak >= PASS_STREAK ? " is-complete" : ""}`;
  card.dataset.course = course.id;

  const copy = document.createElement("div");
  copy.className = "course-copy";
  const title = document.createElement("strong");
  title.textContent = `${course.icon} ${course.title}`;
  const summary = document.createElement("small");
  summary.textContent = course.summary;
  copy.append(title, summary, createCourseStats(stats));

  const actions = document.createElement("div");
  actions.className = "course-actions";
  actions.append(createCourseButton("学習する", "start-course", () => startQuiz(course.id)));
  actions.append(createCourseButton("誤答ログ", "outline", () => showCourseLog(course)));

  const challenges = createChallenges(course, stats);
  card.append(copy, actions, challenges);
  return card;
}

function createCourseStats(stats) {
  const meta = document.createElement("span");
  meta.className = "course-meta";
  meta.textContent = `合格ステップ ${Math.min(stats.streak, PASS_STREAK)}/${PASS_STREAK}　挑戦 ${stats.attempts}回　ベスト ${stats.best ? `${stats.best}秒` : "--"}`;
  return meta;
}

function createCourseButton(label, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function createChallenges(course, stats) {
  const group = document.createElement("div");
  group.className = "course-challenges";
  const label = document.createElement("span");
  label.textContent = "チャレンジ";
  const unlocked = stats.streak >= PASS_STREAK;
  const hint = document.createElement("small");
  hint.textContent = unlocked ? "解放中" : `ミスなし合格 あと${PASS_STREAK - stats.streak}回で解放`;
  group.append(label, hint);

  const timeButton = createCourseButton("⏱ タイムアタック", "outline", () => startQuiz(course.id, "time"));
  const chainButton = createCourseButton("🔥 連続正解", "outline", () => startQuiz(course.id, "chain"));
  timeButton.disabled = !unlocked;
  chainButton.disabled = !unlocked;
  group.append(timeButton, chainButton);
  return group;
}

function showCourseLog(course) {
  hidePanels();
  getElement("courses").classList.add("hidden");
  const panel = getElement("reviewPanel");
  panel.classList.remove("hidden");
  getElement("reviewTitle").textContent = `まちがいノート：${course.title}`;
  const list = getElement("reviewList");
  list.replaceChildren();
  const entries = learningData.wrong.filter((entry) => entry.courseId === course.id);
  if (!entries.length) {
    list.append(createEmptyMessage("まだまちがいはありません。挑戦してみよう！"));
    return;
  }
  entries.slice(-12).reverse().forEach((entry) => list.append(createReviewItem(entry)));
}

function createEmptyMessage(text) {
  const message = document.createElement("p");
  message.textContent = text;
  return message;
}

function createReviewItem(entry) {
  const item = document.createElement("article");
  item.className = "review-item";
  const question = document.createElement("strong");
  appendPhonicsText(question, entry.prompt);
  const word = document.createElement("p");
  word.textContent = entry.word;
  const mistake = document.createElement("p");
  mistake.className = "mistake";
  mistake.append("正解：");
  appendAnswerText(mistake, entry.correct);
  mistake.append(" / あなたの答え：");
  appendAnswerText(mistake, entry.answer);
  const explanation = document.createElement("p");
  appendPhonicsText(explanation, entry.explanation);
  item.append(question, word, mistake, explanation);
  if (entry.reviewed) {
    const reviewed = document.createElement("small");
    reviewed.textContent = "✅ 解き直し済み";
    item.append(reviewed);
  }
  item.append(createCourseButton("この問題を解き直す", "outline", () => startReview(entry)));
  return item;
}

function hidePanels() {
  getElement("reviewPanel").classList.add("hidden");
  getElement("courses").classList.remove("hidden");
}

function startQuiz(courseId, mode = "basic") {
  clearInterval(modeTimer);
  selectedCourse = courseId;
  const stats = getStats(courseId);
  if (mode !== "basic" && stats.streak < PASS_STREAK) return;
  stats.attempts += 1;
  learningData.stats[courseId] = stats;
  quiz = {
    mode, index: 0, correct: 0, missed: false, started: Date.now(),
    previousAnswer: "", chainRun: 0, bestChain: 0, questions: [], submitted: [],
  };
  if (mode === "time") modeTimer = setInterval(updateModeStatus, 1000);
  learningData.history.push({
    courseId, mode, startedAt: quiz.started, completed: false,
  });
  learningData.history = learningData.history.slice(-MAX_HISTORY_ENTRIES);
  saveData();
  showScreen("quiz");
  getElement("modeTitle").textContent = mode === "time"
    ? "⏱ タイムアタック" : mode === "chain" ? "🔥 連続正解" : "";
  getElement("modeTitle").classList.toggle("hidden", mode === "basic");
  renderProblem();
}

function startReview(entry) {
  const bankQuestion = questionBank[entry.courseId]
    .find((question) => question.prompt === entry.prompt);
  const choices = Array.isArray(entry.choices) ? entry.choices : bankQuestion?.choices;
  if (!choices?.length) throw new Error("復習問題の選択肢を読み込めません");
  quiz = {
    mode: "review", index: 0, correct: 0, missed: false,
    started: Date.now(), previousAnswer: "",
    questions: [{ ...bankQuestion, ...entry, choices, answer: entry.correct }],
    reviewEntry: entry,
    submitted: [],
  };
  selectedCourse = entry.courseId;
  showScreen("quiz");
  getElement("modeTitle").textContent = "📖 まちがい直し";
  getElement("modeTitle").classList.remove("hidden");
  renderProblem();
}

function showScreen(screen) {
  ["home", "quiz", "result"].forEach((id) => getElement(id).classList.toggle("hidden", id !== screen));
}

function selectQuestion(index) {
  const pool = questionBank[selectedCourse];
  const level = Math.min(3, Math.floor(index / 3));
  const available = pool.filter((question) => question.level <= level);
  const prior = new Set(quiz.questions.map((question) => question.prompt));
  const fresh = available.filter((question) => !prior.has(question.prompt));
  const choices = fresh.length ? fresh : available;
  return choices[Math.floor(Math.random() * choices.length)];
}

function renderProblem() {
  clearTimeout(advanceTimer);
  locked = false;
  const question = quiz.questions[quiz.index] || selectQuestion(quiz.index);
  quiz.questions[quiz.index] = question;
  getElement("questionNo").textContent = quiz.mode === "review"
    ? "解き直し" : `${quiz.index + 1} / ${QUIZ_LENGTH}`;
  getElement("progress").style.width = quiz.mode === "review"
    ? "100%" : `${quiz.index / QUIZ_LENGTH * 100}%`;
  getElement("questionCategory").textContent = `STEP ${Math.min(4, Math.floor(quiz.index / 3) + 1)} · ${courses.find((course) => course.id === selectedCourse).title}`;
  const problem = getElement("problem");
  problem.replaceChildren();
  appendPhonicsText(problem, question.prompt);
  const wordCard = getElement("wordCard");
  wordCard.textContent = question.display || question.word;
  wordCard.dataset.word = question.word;
  const meaningHint = getElement("meaningHint");
  const info = wordInfo[question.word];
  meaningHint.textContent = info ? `意味：${info.meaning}` : "";
  meaningHint.classList.toggle("hidden", !info);
  const previousAnswer = getElement("previousAnswer");
  previousAnswer.replaceChildren();
  if (quiz.previousAnswer) {
    previousAnswer.append("前回の答え：");
    appendAnswerText(previousAnswer, quiz.previousAnswer);
  }
  previousAnswer.classList.toggle("hidden", !quiz.previousAnswer);
  renderChoices(question);
  updateModeStatus();
}

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function renderChoices(question) {
  const answers = getElement("answers");
  answers.replaceChildren();
  shuffled(question.choices).forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-choice";
    if (phonicsLetterSounds[choice]) {
      appendLetterChoice(button, choice);
      button.setAttribute("aria-label", `${phonicsLetterSounds[choice]}（${choice}）`);
    } else if (phonicsSounds[choice]) {
      button.textContent = phonicsSounds[choice];
    } else {
      appendPhonicsText(button, choice);
    }
    button.addEventListener("click", () => judgeAnswer(choice));
    answers.append(button);
  });
}

function updateModeStatus() {
  if (!quiz) return;
  if (quiz.mode === "time") {
    const seconds = Math.floor((Date.now() - quiz.started) / 1000);
    getElement("modeStatus").textContent = `⏱ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    return;
  }
  getElement("modeStatus").textContent = quiz.mode === "chain"
    ? `🔥 ${quiz.bestChain}問連続` : "";
}

function judgeAnswer(answer) {
  if (locked || !quiz) return;
  locked = true;
  const question = quiz.questions[quiz.index];
  const isCorrect = answer === question.answer;
  quiz.previousAnswer = answer;
  quiz.submitted[quiz.index] = answer;
  if (!isCorrect) recordMistake(question, answer);
  if (isCorrect) {
    if (quiz.mode === "review") quiz.reviewSolved = true;
    quiz.correct += 1;
    quiz.chainRun += 1;
    quiz.bestChain = Math.max(quiz.bestChain, quiz.chainRun);
  } else {
    quiz.missed = true;
    quiz.chainRun = 0;
  }
  playFeedbackTone(isCorrect);
  showFeedback(isCorrect, question, answer);
}

function recordMistake(question, answer) {
  const entry = {
    courseId: selectedCourse,
    prompt: question.prompt,
    word: question.word,
    answer,
    correct: question.answer,
    choices: question.choices,
    explanation: question.explanation,
    createdAt: Date.now(),
  };
  learningData.wrong.push(entry);
  learningData.wrong = learningData.wrong.slice(-MAX_WRONG_ENTRIES);
  saveData();
}

function showFeedback(isCorrect, question, answer) {
  const dialog = getElement("feedback");
  const content = getElement("feedbackContent");
  const actions = getElement("feedbackActions");
  content.replaceChildren();
  actions.replaceChildren();
  dialog.className = `feedback-dialog ${isCorrect ? "ok" : "no"}`;
  const title = document.createElement("h2");
  title.id = "feedbackTitle";
  title.textContent = isCorrect ? "せいかい！ 🎉" : "もう一度考えてみよう";
  const message = document.createElement("p");
  if (isCorrect) {
    message.textContent = "いい調子！音と文字のつながりが見えてきたね。";
  } else {
    message.append("ヒント：");
    appendPhonicsText(message, question.explanation);
  }
  const primary = createFeedbackButton(
    isCorrect ? "つぎへ ↵" : "再回答",
    isCorrect ? advanceQuiz : retryQuestion,
  );
  actions.append(primary);
  if (isCorrect) {
    content.append(title, createWordInfo(question.word), message);
  } else {
    const answer = document.createElement("p");
    answer.className = "feedback-answer";
    answer.append("正解：「");
    appendAnswerText(answer, question.answer);
    answer.append("」");
    content.append(title, answer, createWordInfo(question.word), message);
    actions.append(createFeedbackButton("次へ", advanceQuiz, "secondary"));
  }
  dialog.showModal();
  primary.focus();
  if (isCorrect) advanceTimer = setTimeout(advanceQuiz, FEEDBACK_AUTO_ADVANCE_MS);
}

function createWordInfo(word) {
  const info = wordInfo[word];
  const box = document.createElement("p");
  box.className = "word-info";
  if (!info) return box;
  box.textContent = `音節：${info.split} ／ 1語：${info.joined}`;
  return box;
}

function createFeedbackButton(label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function retryQuestion() {
  closeFeedback();
  locked = false;
  renderChoices(quiz.questions[quiz.index]);
  getElement("answers").querySelector("button")?.focus();
  getElement("previousAnswer").classList.remove("hidden");
}

function closeFeedback() {
  clearTimeout(advanceTimer);
  if (getElement("feedback").open) getElement("feedback").close();
}

function advanceQuiz() {
  closeFeedback();
  if (quiz.mode === "review") {
    finishReview();
    return;
  }
  quiz.previousAnswer = "";
  quiz.index += 1;
  if (quiz.index >= QUIZ_LENGTH) {
    finishQuiz();
    return;
  }
  renderProblem();
}

function finishReview() {
  if (quiz.reviewSolved) quiz.reviewEntry.reviewed = true;
  saveData();
  showScreen("home");
  renderCourses();
}

function finishQuiz() {
  clearInterval(modeTimer);
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - quiz.started) / 1000));
  const stats = getStats(selectedCourse);
  if (quiz.mode === "basic") {
    stats.streak = quiz.correct === QUIZ_LENGTH && !quiz.missed ? stats.streak + 1 : 0;
    if (quiz.correct === QUIZ_LENGTH && !quiz.missed) {
      stats.best = stats.best ? Math.min(stats.best, elapsedSeconds) : elapsedSeconds;
    }
  }
  if (quiz.mode === "time" && !quiz.missed) {
    stats.timeBest = stats.timeBest ? Math.min(stats.timeBest, elapsedSeconds) : elapsedSeconds;
  }
  if (quiz.mode === "chain") stats.chainBest = Math.max(stats.chainBest, quiz.bestChain);
  learningData.stats[selectedCourse] = stats;
  completeHistory();
  saveData();
  renderResult(stats, elapsedSeconds);
}

function completeHistory() {
  const attempt = learningData.history.at(-1);
  if (!attempt || attempt.completed) return;
  Object.assign(attempt, {
    completed: true,
    score: quiz.correct,
    missed: quiz.missed,
    finishedAt: Date.now(),
  });
}

function renderResult(stats, elapsedSeconds) {
  showScreen("result");
  const isPerfect = quiz.correct === QUIZ_LENGTH && !quiz.missed;
  const titles = { basic: isPerfect ? "ミスなし！" : "よくがんばったね！", time: "⏱ タイムアタック", chain: "🔥 連続正解チャレンジ" };
  getElement("resultTitle").textContent = titles[quiz.mode];
  getElement("score").textContent = `${quiz.correct} / ${QUIZ_LENGTH} 問 正解`;
  getElement("resultMessage").textContent = quiz.mode === "basic"
    ? `ミスなし合格 ${stats.streak}/${PASS_STREAK}回。${quiz.missed ? "まちがいノートで復習してみよう。" : "その調子で進もう！"}`
    : quiz.mode === "time"
      ? `${elapsedSeconds}秒。ベスト記録：${stats.timeBest ?? "--"}秒`
      : `今回の最高連続正解：${quiz.bestChain}問。ベスト記録：${stats.chainBest}問`;
  renderAnswerSummary();
  getElement("timeBest").textContent = stats.timeBest ? `${stats.timeBest}秒` : "--";
  getElement("chainBest").textContent = `${stats.chainBest}問`;
  const unlocked = stats.streak >= PASS_STREAK;
  getElement("timeAttack").disabled = !unlocked;
  getElement("chainAttack").disabled = !unlocked;
  renderCourses();
}

function renderAnswerSummary() {
  const summary = getElement("answerSummary");
  summary.replaceChildren();
  quiz.questions.forEach((question, index) => {
    const item = document.createElement("article");
    const prompt = document.createElement("strong");
    appendPhonicsText(prompt, `${index + 1}. ${question.prompt} (${question.word})`);
    const answer = document.createElement("small");
    answer.append("正解：");
    appendAnswerText(answer, question.answer);
    answer.append(" / あなたの答え：");
    appendAnswerText(answer, quiz.submitted[index] || "未回答");
    const explanation = document.createElement("small");
    appendPhonicsText(explanation, question.explanation);
    item.append(prompt, answer, explanation);
    summary.append(item);
  });
}

function returnToCourses() {
  clearInterval(modeTimer);
  if (quiz && quiz.mode !== "review" && quiz.index < QUIZ_LENGTH) {
    const attempt = learningData.history.at(-1);
    if (attempt && !attempt.completed) {
      attempt.abandonedAt = Date.now();
      attempt.progress = quiz.index;
      saveData();
    }
  }
  clearTimeout(advanceTimer);
  closeFeedback();
  quiz = null;
  showScreen("home");
  hidePanels();
  renderCourses();
}

function playFeedbackTone(isCorrect) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(isCorrect ? 660 : 330, now);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  } catch {
    return;
  }
}

function registerEvents() {
  getElement("quit").addEventListener("click", () => {
    if (window.confirm("この挑戦を中断してコース選択に戻りますか？")) returnToCourses();
  });
  getElement("reviewBack").addEventListener("click", () => {
    getElement("reviewPanel").classList.add("hidden");
    getElement("courses").classList.remove("hidden");
  });
  getElement("resetData").addEventListener("click", resetLearningData);
  getElement("sound").addEventListener("click", toggleSound);
  getElement("again").addEventListener("click", () => startQuiz(selectedCourse));
  getElement("homeButton").addEventListener("click", returnToCourses);
  getElement("timeAttack").addEventListener("click", () => startQuiz(selectedCourse, "time"));
  getElement("chainAttack").addEventListener("click", () => startQuiz(selectedCourse, "chain"));
  document.addEventListener("keydown", handleFeedbackKey);
}

function handleFeedbackKey(event) {
  if (event.key !== "Enter" || !getElement("feedback").open) return;
  event.preventDefault();
  getElement("feedbackActions").querySelector("button")?.click();
}

function resetLearningData() {
  if (!window.confirm("学習記録と手書き記録をすべて削除しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  learningData = defaultData();
  quiz = null;
  returnToCourses();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  getElement("sound").setAttribute("aria-pressed", String(soundEnabled));
  getElement("sound").setAttribute("aria-label", soundEnabled ? "音あり" : "音なし");
  getElement("sound").textContent = soundEnabled ? "🔊" : "🔇";
}

function initializeApplication() {
  registerEvents();
  toggleSoundState();
  renderCourses();
}

function toggleSoundState() {
  getElement("sound").setAttribute("aria-pressed", String(soundEnabled));
  getElement("sound").setAttribute("aria-label", soundEnabled ? "音あり" : "音なし");
  getElement("sound").textContent = soundEnabled ? "🔊" : "🔇";
}

initializeApplication();
