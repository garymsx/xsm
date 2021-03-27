# Z80用 クロスアセンブラ XSM リファレンスマニュアル

## XSM言語仕様

[特徴](features.md)

[リテラル](literal.md)
- 数値
- 文字
- 文字列
- エスケープシーケンス

[コメント](comment.md)
- 行コメント
- コメントブロック

[データ](data.md)
- レジスタ
  - メモリ参照の表記方法
  - インデックスレジスタの表記方法
- 変数
  - 型
  - 配列
  - 書式
  - 格納アドレスの取得方法
- 定数
- 投影

[構造体](struct.md)
- struct

[式](expression.md)
- 代入式(=)
- 演算代入式(+= -= *= /= %=)
- インクリメント、デクリメント(++ --)
- シフト、ローテーション(>> << >>> <<<)
- 論理演算式(&= ^= |=)
- 関数呼び出し

[内部関数](internal.md)
- データ定義(bin/qtr/oct/hex)
- 分離関数(high/low)
- データサイズ関数(sizeof)
- オフセット関数(offset)

[関数](function.md)
- function
  - return 句
  - using 句

[ラベルとジャンプ](labeljump.md)
- ラベル
- goto
- call
- return
- returni / returnn

[制御文](control.md)
- unsafe
- if
  - else
- for
  - continue
  - break  
- while
- loop
- switch
  - case
  - default  
- on
  - return
  - call
  - goto
- using
- try
  - catch
  - finally
  - throw
- @ ブロック

[疑似命令](virtualcode.md)
- 命令表
- その他の疑似命令
  - move
  - clear

[ニーモニック](mnemonic.md)
- push
- pop
- ldi / ldir / ldd / lddr
- cpi / cpir / cpd / cpdr
- nop
- halt
- di
- ei
- im
- ex / exx
- daa
- cpl
- neg
- ccf
- scf
- rst
- in
- ini / inir / ind / indr
- out
- outi / otir / outd / otdr
- bit
- set
- res

[システム定数、システムラベル](systemconstant.md)
- _heap
- _shadow
_ _shadowSize

[プリプロセッサ](preprocessor.md)
- org
- dataorg
- shadoworg  
- import
- debug
- optimize
