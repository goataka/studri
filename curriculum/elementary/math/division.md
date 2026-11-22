# わり算の系統

第3学年のわり算の意味から、第6学年の分数のわり算までの目標と前提のつながり。

- **上位ページ**：[算数](README.md)
- **アプリ**：[わり算](../../../apps/math/division/index.html)

## 目次

- [第3学年](#第3学年)
- [第4学年](#第4学年)
- [第5学年](#第5学年)
- [第6学年](#第6学年)

## 第3学年

### div-g3-meaning：わり算の意味

- **学年**：第3学年
- **目標**：包含除や等分除など、除法の意味を理解し、それが用いられる場合を知る
- **子ども向け**：「同じ数ずつ分けると何人に分けられるか」「同じ数ずつ分けると1人分はいくつか」を、わり算で表せることが分かる
- **前提**：mul-g2-kuku
- **根拠**
  - 学習指導要領：[第3学年 A(4) ア(ア)](https://w3id.org/jp-cos/8250233141100000)
  - 解説：[第3学年 A(4) ア 除法が用いられる場合とその意味](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)知識・技能
- **コース**：`g3-meaning-story`

### div-g3-expression：わり算の式

- **学年**：第3学年
- **目標**：除法が用いられる場面を式に表したり、式を読み取ったりする
- **子ども向け**：お話を読んで「12÷3」のような式を書いたり、式からお話を考えたりできる
- **前提**：div-g3-meaning
- **根拠**
  - 学習指導要領：[第3学年 A(4) ア(イ)](https://w3id.org/jp-cos/8250233141200000)
  - 解説：[第3学年 A(4) イ 除法の式](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)知識・技能
- **コース**：`g3-exact-story`

### div-g3-relation：かけ算やひき算とのつながり

- **学年**：第3学年
- **目標**：除法と乗法や減法との関係を理解し、除法を乗法の逆算と捉える
- **子ども向け**：「3×□＝12」の□を見つけることが「12÷3」と同じだと分かる
- **前提**：div-g3-meaning、mul-g2-kuku
- **根拠**
  - 学習指導要領：[第3学年 A(4) ア(ウ)](https://w3id.org/jp-cos/8250233141300000)
  - 解説：[第3学年 A(4) ウ 除法と乗法，減法との関係](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)思考・判断・表現

### div-g3-basic：九九1回で答えが出るわり算

- **学年**：第3学年
- **目標**：除数と商が共に1位数である除法の計算が確実にできる
- **子ども向け**：「48÷6」のように、九九を1回使って答えが出るわり算ができる
- **前提**：div-g3-relation
- **根拠**
  - 学習指導要領：[第3学年 A(4) ア(エ)](https://w3id.org/jp-cos/8250233141400000)
  - 解説：[第3学年 A(4) エ 除数と商が１位数の場合の除法の計算](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)知識・技能
- **コース**：`g3-one-digit-exact`、`g3-two-digit-exact`、`g3-zero-one`
  - `g3-zero-one`（0 や 1 のわり算）：「0÷4」や「4÷1」は、0 の場合や 1 の段の九九を1回使って答えが出るので、この目標に含める
  - 0 の場合の九九は、第3学年の乗法の[内容の取扱い(3)](https://w3id.org/jp-cos/8250235300000000)で扱う

### div-g3-remainder：あまりのあるわり算

- **学年**：第3学年
- **目標**：割り切れない場合に余りを出すことや、余りは除数より小さいことを知る
- **子ども向け**：「13÷4＝3あまり1」のように、分けきれないときはあまりを出せる。あまりは、わる数より小さい
- **前提**：div-g3-basic
- **根拠**
  - 学習指導要領：[第3学年 A(4) ア(ア)](https://w3id.org/jp-cos/8250233141100000)
  - 解説：[第3学年 A(4) ア](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)知識・技能
- **コース**：`g3-one-digit-remainder`、`g3-two-digit-remainder`

### div-g3-remainder-life：あまりの考え方

- **学年**：第3学年
- **目標**：余りのある除法の余りについて、日常生活の場面に応じて考える
- **子ども向け**：あまった人も車に乗るなら、もう1台いる、のように、お話に合わせて答えを決められる
- **前提**：div-g3-remainder
- **根拠**
  - 学習指導要領：[第3学年 A(4) イ(イ)](https://w3id.org/jp-cos/8250233142200000)
  - 解説：[第3学年 A(4) イ 数量の関係に着目し，計算を日常生活に生かすこと](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)思考・判断・表現
- **コース**：`g3-remainder-story`

### div-g3-two-digit-quotient：答えが2けたになる簡単なわり算

- **学年**：第3学年
- **目標**：簡単な場合について、除数が1位数で商が2位数の除法の計算の仕方を知る
  - 範囲：80÷4 のような何十のわり算と、69÷3 のように十の位と一の位がそれぞれ割り切れるわり算
- **子ども向け**：「80÷4」は10が8こを4つに分けると考えて、答えが2けたのわり算ができる
- **前提**：div-g3-basic
- **根拠**
  - 学習指導要領：[第3学年 A(4) ア(オ)](https://w3id.org/jp-cos/8250233141500000)
  - 解説：[第3学年 A(4) オ 簡単な場合の除数が１位数で商が２位数の除法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-01-04.md)
  - 評価規準：[第3学年 (4)「除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-3.md)知識・技能
- **コース**：`g3-two-digit-mental`

## 第4学年

### div-g4-written-1：1けたでわる筆算

- **学年**：第4学年
- **目標**：除数が1位数で被除数が2位数や3位数の除法の計算の仕方と筆算の仕方を理解し、確実に計算できる
- **子ども向け**：「72÷3」や「962÷4」を、筆算でできる
- **前提**：div-g3-two-digit-quotient、div-g3-remainder
- **根拠**
  - 学習指導要領：[第4学年 A(3) ア(ア)](https://w3id.org/jp-cos/8250243131100000)、[ア(イ)](https://w3id.org/jp-cos/8250243131200000)
  - 解説：[第4学年 A(3) ア](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-03.md)
  - 評価規準：[第4学年 (3)「整数の除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能

### div-g4-written-2：2けたでわる筆算

- **学年**：第4学年
- **目標**：除数が2位数で被除数が2位数や3位数の除法の筆算ができる。商の見当を付けて計算する
- **子ども向け**：「171÷21」を、およその答えを考えてから筆算でできる
- **前提**：div-g4-written-1
- **根拠**
  - 学習指導要領：[第4学年 A(3) ア(ア)](https://w3id.org/jp-cos/8250243131100000)、[ア(イ)](https://w3id.org/jp-cos/8250243131200000)
  - 解説：[第4学年 A(3) ア](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-03.md)
  - 評価規準：[第4学年 (3)「整数の除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能

### div-g4-mental：わり算の暗算

- **学年**：第4学年
- **目標**：48÷2 のような、2位数と1位数の乗法の逆の除法を暗算でする
- **子ども向け**：「48÷2」のような計算を、筆算を使わずに頭の中でできる
- **前提**：div-g3-two-digit-quotient
- **根拠**
  - 学習指導要領：[第4学年 内容の取扱い(2)](https://w3id.org/jp-cos/8250245200000000)
  - 解説：[第4学年 A(3) ア](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-03.md)
  - 評価規準：[第4学年 (3)「整数の除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能

### div-g4-check：わられる数、わる数、商、あまりの関係

- **学年**：第4学年
- **目標**：用語「商」を知り、（被除数）＝（除数）×（商）＋（余り）の関係を理解し、計算の確かめに用いる
- **子ども向け**：「わられる数＝わる数×商＋あまり」で、わり算の答えをたしかめられる
- **前提**：div-g4-written-1
- **根拠**
  - 学習指導要領：[第4学年 A(3) ア(ウ)](https://w3id.org/jp-cos/8250243131300000)
  - 解説：[第4学年 A(3) ウ 被除数，除数，商及び余りの間の関係](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-03.md)
  - 評価規準：[第4学年 (3)「整数の除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能

### div-g4-property：わり算のきまり

- **学年**：第4学年
- **目標**：除数と被除数に同じ数をかけても、同じ数で割っても、商は変わらないという性質を理解し、計算を工夫する
- **子ども向け**：「600÷200」は「6÷2」と同じ答えになる、のように、わり算のきまりを使って計算をかんたんにできる
- **前提**：div-g4-written-2
- **根拠**
  - 学習指導要領：[第4学年 A(3) ア(エ)](https://w3id.org/jp-cos/8250243131400000)、[内容の取扱い(4)](https://w3id.org/jp-cos/8250245400000000)
  - 解説：[第4学年 A(3) エ 除法に関して成り立つ性質](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-03.md)
  - 評価規準：[第4学年 (3)「整数の除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能、思考・判断・表現

### div-g4-decimal-by-integer：小数÷整数

- **学年**：第4学年
- **目標**：除数が整数である場合の小数の除法の意味を理解し、計算ができる
- **子ども向け**：「7.2÷3」のように、小数を整数でわる計算ができる
- **前提**：div-g4-written-1
- **根拠**
  - 学習指導要領：[第4学年 A(4) ア(エ)](https://w3id.org/jp-cos/8250243141400000)
  - 解説：[第4学年 A(4) 小数とその計算](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-04.md)
  - 評価規準：[第4学年 (4)「小数の仕組みとその計算」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能

### div-g4-decimal-quotient：商が小数になる整数のわり算

- **学年**：第4学年
- **目標**：整数を整数で割って商が小数になる除法について、商の意味を理解する
- **子ども向け**：「6÷4＝1.5」のように、わりきれるまでわり進められる
- **前提**：div-g4-decimal-by-integer
- **根拠**
  - 学習指導要領：[第4学年 内容の取扱い(5)](https://w3id.org/jp-cos/8250245500000000)
  - 解説：[第4学年 A(4) 小数とその計算](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-01-04.md)
  - 評価規準：[第4学年 (4)「小数の仕組みとその計算」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-4.md)知識・技能

## 第5学年

### div-g5-decimal-meaning：小数でわるわり算の意味

- **学年**：第5学年
- **目標**：除数が小数である場合の除法の意味を、除数が整数である場合の考え方を基にして理解する
- **子ども向け**：「2.5mで300円のリボンの1mのねだん」を「300÷2.5」と表せる
- **前提**：div-g4-decimal-by-integer、div-g4-property
- **根拠**
  - 学習指導要領：[第5学年 A(3) ア(ア)](https://w3id.org/jp-cos/8250253131100000)
  - 解説：[第5学年 A(3) 小数の乗法及び除法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-01-03.md)
  - 評価規準：[第5学年 (3)「小数の乗法，除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-5.md)知識・技能

### div-g5-decimal-calc：小数÷小数

- **学年**：第5学年
- **目標**：1/100 の位までの小数の除法の計算ができる。小数の除法の余りの大きさを理解する
- **子ども向け**：「7.56÷2.7」を計算できる。あまりの小数点の位置をまちがえない
- **前提**：div-g5-decimal-meaning、div-g4-check
- **根拠**
  - 学習指導要領：[第5学年 A(3) ア(イ)](https://w3id.org/jp-cos/8250253131200000)
  - 解説：[第5学年 A(3) 小数の乗法及び除法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-01-03.md)
  - 評価規準：[第5学年 (3)「小数の乗法，除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-5.md)知識・技能

### div-g5-quotient-fraction：わり算の答えを分数で表す

- **学年**：第5学年
- **目標**：整数の除法の結果は、分数を用いると常に一つの数として表せることを理解する
- **子ども向け**：「2÷3」の答えを「2/3」と表せる
- **前提**：div-g4-decimal-quotient
- **根拠**
  - 学習指導要領：[第5学年 A(4) ア(イ)](https://w3id.org/jp-cos/8250253141200000)
  - 解説：[第5学年 A(4) 分数](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-01-04.md)
  - 評価規準：[第5学年 (4)「分数の意味と表し方」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-5.md)知識・技能

## 第6学年

### div-g6-fraction-meaning：分数のわり算の意味

- **学年**：第6学年
- **目標**：除数が整数や分数である場合も含めて、分数の除法の意味を、小数の除法の考え方を基にして理解する
- **子ども向け**：「2/3mで3/4kgのぼう1mの重さ」を「3/4÷2/3」と表せる
- **前提**：div-g5-decimal-meaning、div-g5-quotient-fraction
- **根拠**
  - 学習指導要領：[第6学年 A(1) ア(ア)](https://w3id.org/jp-cos/8250263111100000)
  - 解説：[第6学年 A(1) 分数の乗法及び除法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-01-01.md)
  - 評価規準：[第6学年 (1)「分数の乗法，除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-6.md)知識・技能

### div-g6-fraction-calc：分数のわり算の計算

- **学年**：第6学年
- **目標**：分数の除法の計算ができる。逆数を用いて除法を乗法の計算としてみる
- **子ども向け**：わる数の分母と分子を入れかえてかけると、分数のわり算ができる
- **前提**：div-g6-fraction-meaning
- **根拠**
  - 学習指導要領：[第6学年 A(1) ア(イ)](https://w3id.org/jp-cos/8250263111200000)、[内容の取扱い(1)](https://w3id.org/jp-cos/8250265100000000)
  - 解説：[第6学年 A(1) 分数の乗法及び除法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-01-01.md)
  - 評価規準：[第6学年 (1)「分数の乗法，除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-6.md)知識・技能、思考・判断・表現

### div-g6-unify：整数や小数のわり算を分数にまとめる

- **学年**：第6学年
- **目標**：整数や小数の乗法や除法を、分数の場合の計算にまとめる
- **子ども向け**：「0.6÷1.5」を分数になおして計算できる
- **前提**：div-g6-fraction-calc、div-g5-decimal-calc
- **根拠**
  - 学習指導要領：[第6学年 内容の取扱い(1)](https://w3id.org/jp-cos/8250265100000000)
  - 解説：[第6学年 A(1) 分数の乗法及び除法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-01-01.md)
  - 評価規準：[第6学年 (1)「分数の乗法，除法」](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/assessment/grade-6.md)思考・判断・表現
