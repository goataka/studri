# 面積と体積の系統

第4学年の長方形の面積から、第6学年の円の面積と角柱・円柱の体積までの目標と前提のつながり。

- **上位ページ**：[算数](README.md)

## 目次

- [第4学年](#第4学年)
- [第5学年](#第5学年)
- [第6学年](#第6学年)

## 第4学年

### area-g4-unit：面積の単位

- **学年**：第4学年
- **目標**：面積の単位の平方センチメートル cm²、平方メートル m²、平方キロメートル km² を知る
- **子ども向け**：広さを cm²、m²、km² などの単位で表せる
- **前提**：meas-g2-length
- **根拠**
  - 学習指導要領：第4学年 B(4) 平面図形の面積 [ア(ア)](https://w3id.org/jp-cos/8250243241100000)
  - 解説：[第4学年 B(4) 平面図形の面積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-02-04.md)
  - 評価規準：第4学年 (4)「平面図形の面積」

### area-g4-rectangle：長方形と正方形の面積

- **学年**：第4学年
- **目標**：正方形と長方形の面積の、計算による求め方を理解する
- **子ども向け**：「たて×横」で、長方形や正方形の面積を計算できる
- **前提**：area-g4-unit、mul-g3-written
- **根拠**
  - 学習指導要領：第4学年 B(4) 平面図形の面積 [ア(イ)](https://w3id.org/jp-cos/8250243241200000)
  - 解説：[第4学年 B(4) 平面図形の面積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-04-02-02-04.md)
  - 評価規準：第4学年 (4)「平面図形の面積」

## 第5学年

### area-g5-polygons：三角形・平行四辺形・ひし形・台形の面積

- **学年**：第5学年
- **目標**：三角形、平行四辺形、ひし形、台形の面積の、計算による求め方を理解する
- **子ども向け**：公式を使って、三角形、平行四辺形、ひし形、台形の面積を求められる
- **前提**：area-g4-rectangle、plane-g4-quadrilaterals、expr-g4-formula
- **根拠**
  - 学習指導要領：第5学年 B(3) 平面図形の面積 [ア(ア)](https://w3id.org/jp-cos/8250253231100000)
  - 解説：[第5学年 B(3) 平面図形の面積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-02-03.md)
  - 評価規準：第5学年 (3)「平面図形の面積」

### area-g5-volume-unit：体積の単位

- **学年**：第5学年
- **目標**：体積の単位の立方センチメートル cm³、立方メートル m³ を知る
- **子ども向け**：かさを cm³、m³ などの単位で表せる
- **前提**：area-g4-unit
- **根拠**
  - 学習指導要領：第5学年 B(4) 立体図形の体積 [ア(ア)](https://w3id.org/jp-cos/8250253241100000)
  - 解説：[第5学年 B(4) 立体図形の体積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-02-04.md)
  - 評価規準：第5学年 (4)「立体図形の体積」

### area-g5-cuboid-volume：直方体と立方体の体積

- **学年**：第5学年
- **目標**：立方体と直方体の体積の、計算による求め方を理解する
- **子ども向け**：「たて×横×高さ」で、直方体や立方体の体積を計算できる
- **前提**：area-g5-volume-unit、solid-g4-cuboid
- **根拠**
  - 学習指導要領：第5学年 B(4) 立体図形の体積 [ア(イ)](https://w3id.org/jp-cos/8250253241200000)
  - 解説：[第5学年 B(4) 立体図形の体積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-05-02-02-04.md)
  - 評価規準：第5学年 (4)「立体図形の体積」

## 第6学年

### area-g6-approx：およその面積

- **学年**：第6学年
- **目標**：身の回りにある形について、その概形を捉え、およその面積などを求める
- **子ども向け**：身の回りの形をかんたんな図形と見て、およその面積を求められる
- **前提**：area-g5-polygons
- **根拠**
  - 学習指導要領：第6学年 B(2) 身の回りにある形の概形やおよその面積など [ア(ア)](https://w3id.org/jp-cos/8250263221100000)
  - 解説：[第6学年 B(2) 身の回りにある形の概形やおよその面積など](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-02-02.md)
  - 評価規準：第6学年 (2)「概形とおよその面積」

### area-g6-circle：円の面積

- **学年**：第6学年
- **目標**：円の面積の、計算による求め方を理解する
- **子ども向け**：「半径×半径×3.14」で、円の面積を計算できる
- **前提**：area-g5-polygons、plane-g5-pi
- **根拠**
  - 学習指導要領：第6学年 B(3) 平面図形の面積 [ア(ア)](https://w3id.org/jp-cos/8250263231100000)
  - 解説：[第6学年 B(3) 平面図形の面積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-02-03.md)
  - 評価規準：第6学年 (3)「円の面積」

### area-g6-prism-volume：角柱と円柱の体積

- **学年**：第6学年
- **目標**：基本的な角柱と円柱の体積の、計算による求め方を理解する
- **子ども向け**：「底面積×高さ」で、角柱や円柱の体積を計算できる
- **前提**：area-g5-cuboid-volume、area-g6-circle、solid-g5-prism
- **根拠**
  - 学習指導要領：第6学年 B(4) 立体図形の体積 [ア(ア)](https://w3id.org/jp-cos/8250263241100000)
  - 解説：[第6学年 B(4) 立体図形の体積](https://github.com/goataka/courses-of-study/blob/main/docs/elementary/math/commentary/03-06-02-02-04.md)
  - 評価規準：第6学年 (4)「角柱及び円柱の体積」
