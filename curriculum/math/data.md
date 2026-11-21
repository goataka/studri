# データの活用の系統

第1学年の絵や図から、第6学年の代表値と起こり得る場合までの目標と前提のつながり。

- **上位ページ**：[算数](README.md)

## 目次

- [第1学年](#第1学年)
- [第2学年](#第2学年)
- [第3学年](#第3学年)
- [第4学年](#第4学年)
- [第5学年](#第5学年)
- [第6学年](#第6学年)

## 第1学年

### data-g1-picture：絵や図に表す

- **学年**：第1学年
- **目標**：ものの個数を簡単な絵や図に表し、それらを読み取る
- **子ども向け**：ものの数を、絵や図にならべて表したり読んだりできる
- **前提**：num-g1-count
- **根拠**
  - 学習指導要領：第1学年 D(1) 数量の整理 [ア(ア)](https://w3id.org/jp-cos/8250213411100000)
  - 解説：[第1学年 D(1) 数量の整理](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-01-02-04-01.md)
  - 評価規準：第1学年 (1)「絵や図を用いた数量の表現」

## 第2学年

### data-g2-table：かんたんな表とグラフ

- **学年**：第2学年
- **目標**：身の回りにある数量を分類整理し、簡単な表やグラフを用いて表したり読み取ったりする
- **子ども向け**：仲間に分けて数を調べ、かんたんな表や○のグラフに表したり読んだりできる
- **前提**：data-g1-picture、num-g2-sort
- **根拠**
  - 学習指導要領：第2学年 D(1) データの分析 [ア(ア)](https://w3id.org/jp-cos/8250223411100000)
  - 解説：[第2学年 D(1) データの分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-02-02-04-01.md)
  - 評価規準：第2学年 (1)「簡単な表やグラフ」

## 第3学年

### data-g3-table：表に整理する

- **学年**：第3学年
- **目標**：日時の観点や場所の観点などからデータを分類整理し、表に表したり読んだりする
- **子ども向け**：曜日や場所ごとなどに分けて、表にまとめたり読んだりできる
- **前提**：data-g2-table
- **根拠**
  - 学習指導要領：第3学年 D(1) データの分析 [ア(ア)](https://w3id.org/jp-cos/8250233411100000)
  - 解説：[第3学年 D(1) データの分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-04-01.md)
  - 評価規準：第3学年 (1)「表と棒グラフ」

### data-g3-bar-graph：棒グラフ

- **学年**：第3学年
- **目標**：棒グラフの特徴と用い方を理解する
- **子ども向け**：棒グラフをかいたり読んだりでき、1目もりの大きさに気をつけられる
- **前提**：data-g3-table
- **根拠**
  - 学習指導要領：第3学年 D(1) データの分析 [ア(イ)](https://w3id.org/jp-cos/8250233411200000)
  - 解説：[第3学年 D(1) データの分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-03-02-04-01.md)
  - 評価規準：第3学年 (1)「表と棒グラフ」

## 第4学年

### data-g4-two-way：二つの観点で分ける表

- **学年**：第4学年
- **目標**：データを二つの観点から分類整理する方法を知る
- **子ども向け**：2つの観点で分けて、表にまとめられる
- **前提**：data-g3-table
- **根拠**
  - 学習指導要領：第4学年 D(1) データの収集とその分析 [ア(ア)](https://w3id.org/jp-cos/8250243411100000)
  - 解説：[第4学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-04-01.md)
  - 評価規準：第4学年 (1)「データの分類整理」

### data-g4-line-graph：折れ線グラフ

- **学年**：第4学年
- **目標**：折れ線グラフの特徴と用い方を理解する
- **子ども向け**：変わり方を折れ線グラフに表したり読んだりできる
- **前提**：data-g3-bar-graph
- **根拠**
  - 学習指導要領：第4学年 D(1) データの収集とその分析 [ア(イ)](https://w3id.org/jp-cos/8250243411200000)
  - 解説：[第4学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-04-01.md)
  - 評価規準：第4学年 (1)「データの分類整理」

## 第5学年

### data-g5-pie-band：円グラフと帯グラフ

- **学年**：第5学年
- **目標**：円グラフや帯グラフの特徴と用い方を理解する
- **子ども向け**：割合を円グラフや帯グラフに表したり読んだりできる
- **前提**：rel-g5-percent、data-g4-line-graph
- **根拠**
  - 学習指導要領：第5学年 D(1) データの収集とその分析 [ア(ア)](https://w3id.org/jp-cos/8250253411100000)
  - 解説：[第5学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-04-01.md)
  - 評価規準：第5学年 (1)「円グラフと帯グラフ」

### data-g5-process：統計的な問題解決

- **学年**：第5学年
- **目標**：データの収集や適切な手法の選択など、統計的な問題解決の方法を知る
- **子ども向け**：調べたいことを決めて、データを集め、合ったグラフを選んで調べられる
- **前提**：data-g5-pie-band
- **根拠**
  - 学習指導要領：第5学年 D(1) データの収集とその分析 [ア(イ)](https://w3id.org/jp-cos/8250253411200000)
  - 解説：[第5学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-04-01.md)
  - 評価規準：第5学年 (1)「円グラフと帯グラフ」

### data-g5-average：平均

- **学年**：第5学年
- **目標**：平均の意味を理解する
- **子ども向け**：いくつかの数をならした平均を求められる
- **前提**：div-g4-written-2、dec-g4-add-sub
- **根拠**
  - 学習指導要領：第5学年 D(2) 測定した結果を平均する方法 [ア(ア)](https://w3id.org/jp-cos/8250253421100000)
  - 解説：[第5学年 D(2) 測定した結果を平均する方法](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-04-02.md)
  - 評価規準：第5学年 (2)「測定値の平均」

## 第6学年

### data-g6-representative：代表値

- **学年**：第6学年
- **目標**：代表値の意味や求め方を理解する
- **子ども向け**：データの特ちょうを、平均値・中央値・最頻値で表せる
- **前提**：data-g5-average
- **根拠**
  - 学習指導要領：第6学年 D(1) データの収集とその分析 [ア(ア)](https://w3id.org/jp-cos/8250263411100000)
  - 解説：[第6学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-04-01.md)
  - 評価規準：第6学年 (1)「データの考察」

### data-g6-frequency：ドットプロットと度数分布

- **学年**：第6学年
- **目標**：度数分布を表す表やグラフの特徴と用い方を理解する
- **子ども向け**：データをドットプロットや度数分布の表・柱状グラフに表したり読んだりできる
- **前提**：data-g5-process
- **根拠**
  - 学習指導要領：第6学年 D(1) データの収集とその分析 [ア(イ)](https://w3id.org/jp-cos/8250263411200000)
  - 解説：[第6学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-04-01.md)
  - 評価規準：第6学年 (1)「データの考察」

### data-g6-process：目的に合わせて調べる

- **学年**：第6学年
- **目標**：目的に応じてデータを収集したり適切な手法を選択したりするなど、統計的な問題解決の方法を知る
- **子ども向け**：目的に合わせてデータを集め、方法を選んで、結論を考えられる
- **前提**：data-g6-frequency、data-g6-representative
- **根拠**
  - 学習指導要領：第6学年 D(1) データの収集とその分析 [ア(ウ)](https://w3id.org/jp-cos/8250263411300000)
  - 解説：[第6学年 D(1) データの収集とその分析](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-04-01.md)
  - 評価規準：第6学年 (1)「データの考察」

### data-g6-cases：起こり得る場合

- **学年**：第6学年
- **目標**：起こり得る場合を順序よく整理するための図や表などの用い方を知る
- **子ども向け**：並べ方や組み合わせを、図や表を使って落ちや重なりなく調べられる
- **前提**：data-g3-table
- **根拠**
  - 学習指導要領：第6学年 D(2) 起こり得る場合 [ア(ア)](https://w3id.org/jp-cos/8250263421100000)
  - 解説：[第6学年 D(2) 起こり得る場合](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-04-02.md)
  - 評価規準：第6学年 (2)「起こり得る場合」
