# 学習の系統

スタドリのアプリでコースを作るときの根拠として、学習指導要領を基に、学ぶ順序と前提のつながりを整理する。

## 目次

- [位置付け](#位置付け)
- [一覧](#一覧)
- [書き方](#書き方)
- [根拠の資料](#根拠の資料)

## 位置付け

- **目的**：アプリのコースを、学年と学ぶ順序に合った単位に分ける
- **置き場所**：アプリ本体の `apps/` とは分け、`curriculum/` に置く
- **性質**：学習指導要領そのものではなく、それを基にこのリポジトリで整理したもの
  - 原典：[courses-of-study](https://github.com/goataka/courses-of-study) に学習指導要領、解説、評価規準を転記している
- **方針**：根拠の資料に書かれている内容だけを目標にする
  - 根拠が見つからないコース：その旨を書いて残す

## 一覧

- **小学校**
  - **[国語](elementary/japanese/README.md)**
  - **[社会](elementary/social-studies/README.md)**
  - **[算数](elementary/math/README.md)**
  - **[理科](elementary/science/README.md)**
  - **[外国語（英語）](elementary/foreign-language/README.md)**
- **中学校**
  - **[国語](lower-secondary/japanese/README.md)**
  - **[社会](lower-secondary/social-studies/README.md)**
  - **[数学](lower-secondary/math/README.md)**
  - **[理科](lower-secondary/science/README.md)**
  - **[外国語（英語）](lower-secondary/foreign-language/README.md)**
- **アプリの準備**
  - **[目標とコースの対応表](plan/README.md)**：アプリで練習できるかの区分と、作る順番

## 書き方

- **ファイル**：教科ごとのフォルダに、系統ごとに1ファイル
  - 学校段階ごとに、小学校は `elementary/`、中学校は `lower-secondary/` の下に教科ごとのフォルダを置く
  - 例：`math/division.md` はわり算の系統
- **目標**：1つの目標を1つの見出しにし、その下に「項目：値」の箇条書きで書く
- **ID**：`系統-学年-内容` の形の英小文字とハイフン
  - 例：`div-g3-meaning` はわり算、第3学年、意味。2学年まとまりの国語は `jp-read-g34-summary` のように書く
  - 中学校：学年を `j1` のように書く。例：`eq-j1-solve`
  - 見出し：`### ID：目標の名前`
- **項目**
  - 学年：その目標を学ぶ学年
  - 目標：根拠の資料の言葉に沿った、できるようになること
  - 子ども向け：その学年の子どもが読める言葉にしたもの。式や数の例は、ここで考えたもの
  - 前提：先に身に付けておく目標の ID。ほかの系統の目標もある
  - 根拠：学習指導要領の項目のコード、解説、評価規準の場所
  - コース：対応するアプリのコースの ID。ないときは書かない
- **順序**：ファイルの中は、学年、学ぶ順に並べる

## 根拠の資料

- **学習指導要領**：小学校学習指導要領、中学校学習指導要領 平成29年告示
  - リンク：各項目の学習指導要領コード `https://w3id.org/jp-cos/<コード>`
- **解説**：小学校学習指導要領、中学校学習指導要領 平成29年告示 解説（各教科編）
  - リンク：courses-of-study の `commentary/` の転記
- **評価規準**：国立教育政策研究所「『指導と評価の一体化』のための学習評価に関する参考資料」令和2年3月
  - リンク：courses-of-study の `assessment/` の転記
