# XSM クイックリファレンス

## リテラル

- 数値
  ```
  0b1111  // 2進数
  0q123   // 4進数
  077     // 8進数
  127     // 10進数、0で始まってはいけません。
  0xff    // 16進数
  ```

- 文字
  ```
  'A'
  '\n'   // \nはエスケープシーケンスで改行コード(LF)を表す。
  ```  

- 文字列
  ```
  "ABC"  // 文字の最後はNULL文字(\0)が設定されます。
  ```

- 逐語的文字列
  ```
  `Hello World\n`  // 書いたまま出力されます。\n が改行に置き換わりません。
                   // 文字の最後はNULL文字(\0)が設定されます。
  ```
- 非NULL終端文字列
  ```
  @"ABC" // 文字の最後はNULL文字で終わりません。ただし文字列系の関数は使えなくなります。
  @`ABC`
  ```

- エスケープシーケンス
  ```
  \"  - "を入力します
  \a  - ベル
  \b  - バックスペース
  \t  - タブ
  \n  - 改行
  \v  - 垂直タブ
  \f  - 改ページ
  \r  - 復帰
  \0  - NULL文字(0)
  \x  - \xに続く16進数の00～ffで文字コードを直接指定した入力ができます。 
  \e  - \eに続く文字で画面の制御コードを送ることが出来ます。
  \\  - \ 記号
  ```
  ※ エスケープシーケンスはMSX-DOSのシステムコールなどの利用時に限ります。

### コメント

- 行コメント
  ```
  A = 10; // コメント
  ```

- コメントブロック
  ```
  /*
      コメント
  */
  ```

### データ
- レジスタ
  表記は大文字、小文字はどちらでも可。
  通常は符号はなしとして扱っている。

  |レジスタの種類| 表記方法 |
  |---|---|
  |8bitレジスタ| ```A B C D E H L IXH IXL IYH IYL IT※1 RF※1``` |
  |16bitレジスタ| ```AF BC DE HL IX IY SP``` |
  |フラグの表現|```$C $NC $Z $NZ $PE $PO $P $M```|
  |メモリの参照の表記方法| ``` *HL IX[n]```|
  |符号あり表現| ```(+)A (+)HL (singed)A (singed)HL```|

  ※1 IT - Iレジスタ、RF - Rレジスタ。


- 変数

  |型名|内容|
  |---|---|
  |byte|符号なし1バイト数値型|
  |sbyte|符号あり1バイト数値型|
  |int|符号なし2バイト数値型|
  |sint|符号あり2バイト数値型|
  |char|文字型(1バイト)|
  |string|文字列参照型(2バイト)|
    - 配列
    ```
    byte[2] foo;
    byte[2][4] foo;
    ```

    - 初期化
  
    初期化はプログラムロード時に1回だけ行われます。
    ```
    char foo;
    byte foo = 1;
    int[2] foo = {1,2};
    byte[2][4] foo = {{1,2,3,4},{5,6,7,8}};
    byte[] foo = {1,2};
    char[] foo = "ABCDEFG";            // 7文字+NULL文字で8バイト 
    char[][] foo = {"ABCDEFG", "ABC"}; // 2 x 8 = 16バイト 一番長い文字列の長さに合わせます
    string foo = "ABCDEFG";            // stringは参照型なので2バイトです。以下のような構造を持ちます。
                                        // foo       : DW foo_string
                                        // foo_string: DC "ABCDEFG"
    ```

- 定数
  
    ```
    const int foo = 0x0001;    // 数値はプログラム中で置換される
    const string foo  = "ABC"; // "ABC"はメモリに配置されます。
    const string foo2 = "ABC"; // fooと同じなのでfooが再利用されます。間違って書き換えると参照個所全部書き換わります。
    ```
    定数は配列が使えません。

- 投影

    ビルドしたファイル内にデータを持たないための仕組みです。
    例えばプログラムが200バイトでワーク領域に変数を1000バイト定義してしまったりすると
    ビルドしたファイルは1200バイトになってしまいます。
    投影型(shadow)を使うとプログラムの外に変数を作成します。
    また、投影先のアドレスを直接指定することも可能です。

    ```
    shadow int foo;         // shadowは初期値を設定することが出来ません  
    shadow char[256] foo;
    shadow(0xd000) char[256] foo; // 直接メモリにマッピングすることも可能です
    ```

    以下の記述でshadowデータを一括で初期化できます。アドレス指定された投影型は対象外です。
    ```
    clear _shadow, 0, _shadowSize;
    ```

### 構造体

- 定義
    ```
    struct foo {
        byte bar1;
        int  bar2;
    } 
    ```
- 宣言と初期化  
    ```
    foo foo = {1,2};
    foo[] foo = {
          {1,2}
        , {3,4}
    };
    ```

### 式

- 代入式(=)

  ニーモニックのLD命令に置き換えられますので、複雑な式は書けません。  
  XSMの代入式では、Z80がサポートする組み合わせ以外の多くの代入式のパターンを疑似的にサポートしています。詳細は命令表を確認してください。
  ```
  A = 1;          // レジスタへの代入
  A = 5 + 2 * 8;  // アセンブル時に値が確定するのであれば計算式を書くことが可能です
  *HL = 1;        // HLの差すメモリへの代入
  foo = A;        // メモリへ直接代入
  A = foo.bar1;   // 構造体の参照
  A = foo[2];     // アセンブル時にアドレスが確定している場合は配列が書けます
  HL = &foo;      // fooのアドレスを取得します
  A = 00;         // A = 0でなくA = 00とすると、XOR Aを実行する。
  ```

- 演算代入式(+= -= *= /= %=)

  計算を行う場合はこれらの組み合わせで行います。
  ```
  A += 2;
  A += 2 + $C; // キャリー付き(ADC) 
  A -= 3;
  A -= 3 + $C; // キャリー付き(SBC)
  HL -= BC;    // OR A;SBC HL,BC;が実行される
  HL *= A;     // 乗算、除算、余剰算はサブルーチンによりサポートされる
  HL /= BC;
  HL %= D;
  ```
  乗算、除算、余剰算は以下のファイルをimportしている場合に使用できます(自動化予定)
  ```
  import "library/lang/mulb.xsm"; //  8 *  8 bit
  import "library/lang/mul.xsm";  // 16 *  8 bit
  import "library/lang/mulw.xsm"; // 16 * 16 bit
  import "library/lang/divb.xsm"; //  8 *  8 bit
  import "library/lang/div.xsm";  // 16 *  8 bit
  import "library/lang/divw.xsm"; // 16 * 16 bit
  ```

- インクリメント、デクリメント(++ --)
  ```
  A++;
  HL--;
  foo++;
  ```  

- シフト、ローテーション(>> << >>> <<<)
  ```
  A<<4;     // 4回繰り返し     SLA
  (+)A>>;   // 符号付きシフト   SRA
  A>>>;     // ローテーション   RRC
  HL+$C>>>; // キャリー付き     RR
  ```

- 論理演算式(&= ^= |=)
  ```
  a &= 0b00001111;  // AND
  a ^= 0b00001111;  // XOR
  a |= 0b00001111;  // OR
  ```  

- 関数呼び出し
  ```
  A = foo(B,2);
  A = bar("Hello World\n");
  // または
  A = foo(B, C = 2); // 明示的に代入を表記することで壊れるレジスタが分かるだけ。
  A = bar(HL = "Hello World\n");
  ```

### 関数定義

- 書式

  ```
  // パラメータがレジスタ、もしくはメモリ渡しの場合
  // returnは応答に使用するレジスタ、usingは呼び出しによって壊れるレジスタを定義します
  // ここのusingは未初期化のレジスタを使用時に警告を出すことが目的なので無くてもかまいません。
  function foo(BC, string bar1, string bar2) return A using B,C {
    ...
  }
  
  // パラメータがスタック渡しの場合
  function foo(string bar,...) { // "..."でスタックに展開されます
    loop(B) {    // Bはパラメータ数が設定されます
        pop hl;  // パラメータを全て取り出さないと暴走します
    }
  }
  
  // デフォルト値
  function foo(C = 0x05); // パラメータ省略時の値を指定

  // BIOSや常駐処理を呼ぶ際は以下のように定義できます。
  function foo(C) = 0xe000; // アドレスを指定
  ```

### ラベルとジャンプ

- ラベル
  ```
  foo:
  ```
- goto
  ```
  goto foo;
  ```

- call
  ```
  call foo;
  ```

- return

  ```
  // 戻り値なし、または省略時
  return;
  // 関数に戻り値が設定されている場合は引数を持ちます。
  return 1;
  // function foo() return A; と定義されていれば return 1 は以下のように展開されます。
  LD A,1
  RET
  // return A; のようになった場合、LD A,Aは省略されます
  ```

- returni / returnn  
  ```
  // 割り込み復帰用のreturnです。こちらは引数を持ちません。
  returni;
  returnn;
  ```

### 制御文

- unsafe   

  A / HLレジスタの暗黙的使用を許可します。  
  unsafeブロック内では代入式、演算代入式、条件式などが大幅に拡張されます。  
  A / HL レジスタを経由することで可能になる式はその代入を省略できます。
  当然ですが A / HLレジスタは壊れます。
  ```
  unsafe {
    *DE = B;
  }
  // これは以下のように展開されます、Aレジスタの元の値は壊れます。
  LD A,B
  LD (DE),A
  
  unsafe {
    BC += DE;
  }
  // これは以下のように展開されます、HLレジレスタの元の値は壊れます。
  LD H,B
  LD L,C
  ADD HL,DE
  LD B,H
  LD C,L

  // さらにunsafeにパラメータBC(またはDE)を与えるとBCレジスタまで暗黙的に使用するようになります。 
  unsaf(BC) {
    HL += 123;
  }
  //通常この処理は以下のように展開しますが、
  PUSH BC
  LD BC,123
  ADD HL,BC
  POP BC
  //unsafe(BC)中だとBCの退避を省略します。
  LD BC,123
  ADD HL,BC
  ```

- if  

  条件分岐処理
  ```
  if(A == 0) {...}
  if(A != 0) {...} else {...}
  if(C >= 10 && C <= 20) ...         // unsafe内なら可能
  if((+)A >= -10 && (+)A <= 10) ...  // 符号付きで判定するときは(+)を付ける
  if(HL >= 10 && HL <= 20) ...       // PUSH/SBCなどを駆使してCP HL,xxを実現していますのでオーバーヘッドがあります。
  if($C) ...    // キャリーフラグ
  if($NZ) ...   // ゼロフラグの否定
  ```  

  ```
  // また、const値と併用して条件付きコンパイルのようなことが可能です。
  const byte foo = 1;
  if(foo == 1) {        // ビルド時に結果が決まっているのでif文は生成されない
    // このブロックはビルドされる
  } else {
    // このブロックのコードはビルドされない
  }
  ```  

- for  

  ループ処理
  ```
  for(A = 0; A < 100; A++) {
    …
  }
  ```

- while  

  ループ処理
  ```
  while(A < 10) {
    A++;
  }
  
  // 式を省略すると無限ループになります。
  while() {
  }
  ```

- do

  ループ処理(判定をループ最後に行う)
  ```
  do {
    A++;
  } while(A < 10) {
  ```

- loop  

  DJNZによるループ処理。制限はありますがループ処理では一番コンパクトになります。
  ```
  loop(10) { // Bレジスタが暗黙的に使用されます。
    ...      // ループ内の処理は126バイトに納めないとアセンブル時にエラーになります。
  }
  // Bレジスタにすでに値が入っている場合でもこのように書いてください。LD B,Bは省略されます。
  loop(B)
  ```

- switch  

  Aレジスタの値別に分岐を行います。
  ```
  // caseの判定にはAレジスタが使われます。例えばswitch(B)とすると、LD A,Bが事前に実行されます。
  switch(A) { 
    case(0) {
      ...        // C言語のswitchのようなbreakは不要です。次のcaseは判定しません。
    }
    case(1,2) {  // 複数条件を書けます
      ...
    }
    default {
      ...
    }
  }
  ```

- continue / break  

  ループ継続または、ループ処理から脱出します。
  ```
  while(A < 10) {
    if( xxxx ) continue; // ループ最初から
    if( xxxx ) break;    // ループ脱出
  }
  ```

- on ～ goto / call / return  

  フラグの内容が成立している場合、ジャンプ命令を実行します。
  ```
  on $Z  goto foolabel;  // ジャンプ命令
  on $C  call foolabel;  // サブルーチンコール
  on $NZ return;          // 復帰
  ```

- using

  レジスタの安全なPUSHとPOPを提供します。
  usingを抜ける際に自動的にPOPを実行します。
  ```
  using(HL) {         // PUSH HL
    ...
    using(BC,DE) {    // PUSH BC,DE
      ...
      if(...) return; // 条件成立時 POP DE,BC,HL
    }                 // POP DE,BC
    ...
  }                   // POP HL
  ```

- try

  例外処理です。ただし関数を超えて例外を飛ばすことは出来ません。
  ```
  try {
    if(...) throw 1;  // A = 1が実行される
    return;
  } catch(A) {
    ...               // throw時に実行される処理
  } finally {
    ...               // tryを抜けるときに必ず実行される処理
  }
  ```

- @ ブロック

  インスタントブロック。ブロック内で continue と break が使えるようになります。
  ```
  @ {
      if(xxx) break;    // 終了条件
      continue;         // ループ
  }
  ```

### let

  let文を使うと計算式を実行し結果を得ることが出来ます。  
  この命令はB/C/IX以外のレジスタを使用して計算式を実行し、使用するレジスタの退避は行いませんので注意してください。  
  ```
  // 普通の式
  B = 1;
  C = 5;
  byte x = 10;
  let A = B + C * x;   // A = 51;

  // アドレスの取得
  B = 1;
  byte[2][2] data = {{0,1},{2,3}};
  let HL = &data[B][0]; // 配列のサイズが256バイト以内におさまる場合、添え字に16bit値は使えません。
  A = *HL;              // A = 2;

  // 関節参照
  byte data2 = 123;
  int ptr = &data2;
  let A = *ptr;         // A = 123;

  // 16bitの場合の関節参照
  int data3 = 1234;
  int ptr = &data3;
  let HL = *ptr;        // HL = 1234;
  ```

  let文は代入先が8bitの場合は8bit式、16bitの場合は16bit式として判断し使用されるレジスタが変わります。  
  最適化により使用されない場合がありますが、破壊されるレジスタの目安にしてください。  
  | 式  | 計算結果 | 途中結果 | 変数参照 | 添え字      |
  |-----|---------|---------|---------|-------------|
  |8bit | A       | D       | HL      |E            |
  |16bit| HL      | DE      | IY      |DE           |

### 内部関数

- データ定義関数(bin/qtr/hex)
  ```
  byte[] foo  = bin("00000000"         // 2進数表記
                   + "11,11,11,11");    // 数字以外は無視されます
  byte[] foo = qtr("0123,0123");       // 4進数
  byte[] foo = hex("FF,FF");           // 16進数
  ```

- ファイル取り込み関数(from)
  様々な形式のファイルを読み込み、プログラムから扱いやすい形に変換します。  
  詳しくは[from関数について](from)を参照してください。
  ```
  byte[] foo = from("data.bin");         // ファイルをそのままfooに格納
  byte[] foo = from("tile.bmp", sc1);    // BMP(Indexed Color)形式の画像をSCREEN1のVRAM形式に変換
  byte[] foo = from("map.tmx", tmxmap);  // Tiled Map Editorの出力するマップデータを読み込む
  ```

- 分離関数(high/low)
  ```
  int foo = 0x1234;
  A = high(foo);     // Aには0x12が入る
  A = low(foo);      // Aには0x23が入る
  ```

- サイズ取得関数(sizeof)
  ```
  int[10] foo;
  A = sizeof(foo);  // Aには20が入る
  ```

- 要素数取得関数(length)
  ```
  int[10] foo;
  A = length(foo);  // Aには10が入る
  ```

- オフセット関数(offset)

  構造体メンバーの先頭からのオフセット値を求めます。構造体に配列を使う場合に必須になってくる機能です。

  ```
  // 例 foo[1].foo2のアドレスを求める
  struct foo {
    byte  bar1;
    byte  bar2;
  };
  foo[2] foo;
  HL = foo;                // foo[0]のアドレスを取得
  BC = sizeof(foo);        // fooの構造体サイズを求める
  HL += BC;                 // foo[1]のアドレスが求まる
  BC = offset(foo.bar2);  // BCには2が入る
  HL += BC;                 // foo[1].bar2の先頭アドレス
  ```

- 半角変換関数(half)
  
  ```
  string foo = half("あいうえお"); // MSXのひらがなASCIIコードに変換されます。
  ```

- ビット判定関数(set/res)

  ```
  // if文内で使える関数です。
  if(set0(A)) { ... } // Aレジスタのビット0がONの場合に条件が成立します。
  if(res7(B)) { ... } // Bレジスタのビット7がOFFの場合に条件が成立します。
  ```

- 型名取得
  ```
  // 型名を文字列で取得します。inline関数の判定などで使えます。
  inline foo(param) {
    if(typename(param) == "string") info("文字です"); 
    if(typename(param) == "int")    info("数値です");     // リテラル数値指定は全てintになります。
    if(typename(param) == "A")      info("レジスタです");  // レジスタ
    if(typename(param) == "byte")   info("byte型です");   // 変数
  } 
  ```

- キャラクタコード変更
  ```
  // キャラクタコードのマッピングを変更します。
  charmap('A',0xa1);
  charmap('B',0xa2);
  …
  charmap('Y',0xa6);
  charmap('Z',0xba);

  char[] foo = "AB";  // -> 0xa1,0xa2と出力される。
  ```

- メッセージ関数(error/warn/info)

  ```
  ログを出力する関数です。inline関数のエラーに使ったりします。
  error("message"); 
  warn("message");
  info("message"); 
  ```

#### その他の命令

一般的なニーモニックと同じように使えますが、一部書式が変更されているものがあります。  
変更されているもののみ詳細を記載しています。

- push
  ```
  push hl;
  push bc,de,hl;  // まとめてpush出来ます
  ```

- pop  
  ```
  pop hl;
  pop bc,de,hl;  // 記述した逆順にpopします(hl -> de -> bc)
  ```

- ldi / ldir / ldd / lddr
- cpi / cpir / cpd / cpdr
- nop
- halt
- di
- ei
- im
- ex / exx
  ```
  ex AF,AF;
  ex DE,HL;
  exx;
  ```
  
- daa
- cpl
  ```
  cpl a;
  cpl b;  // unsafe中に使えます
  ```
  
- neg
  ```
  neg a;
  neg b;  // unsafe中に使えます
  ```
  
- ccf
- scf
- rst
- in
- ini / inir / ind / indr
- out
- outi / otir / outd / otdr
- bit
  ```
  bit a,7;
  bit 7,a; // どちらでも同じ意味です。
  ```
  
- set
  ```
  set a,7;
  set 7,a; // どちらでも同じ意味です。
  ```
  
- res
  ```
  res a,7;
  res 7,a; // どちらでも同じ意味です。
  ```

- move
  ```
  byte[5] buf = {0,1,2,3,4};
  byte[5] buf2;
  move buf2, buf;    // buf2へbufをコピー、以下が使用される
                     // de - 転送先
                     // hl - 転送元
                     // bc - サイズ
  move buf2, buf, 5; // サイズ指定も可能
  ```
  内部的にLDIRを実行する命令です。BC/DE/HLレジスタが壊れます。
  
- clear
  ```
  byte[5] buf = {0,1,2,3,4};
  clear buf, 0;
  clear buf, 0, 5; // サイズ指定も可能
  ```
  LDIRを応用した初期化命令です。BC/DE/HLレジスタが壊れます。

### マクロ関連

- inline関数定義

  ```
  // パラメータは呼び出し時に使用箇所に埋め込まれます。
  // returnでマクロを終了します。後続のコードは出力されません。
  inline foo(bar) return A {
    if(bar == 1) {a = 10;return a;}
    if(bar == 2) {a = 20;return a;}
    ...
  }
  
  // このマクロは以下のように展開されます
  foo(1); // -> a = 10;
  foo(2); // -> a = 20;
  ```
  
- repeat
  繰り返し処理、ループ系と違い指定された回数同じコードを出力します。
  ```
  // HLにBCを8回足す
  repeat(8) {
    HL += BC;
  }
  ```

- return
  ```
  // マクロから復帰しマクロの実行を停止します。インライン中ではRET命令は発行されません。
  return;
  return a;
  ```

### データ定義文
あまり使い道はないのですがプログラムエリアに直接データを埋め込みます。

- db
  ```
  db 123,0xff;  // バイトデータを埋め込みます
  ```  

- dw
  ```
  dw 1234,0xffff;  // ワードデータを埋め込みます
  ```  

- dc
  ```
  dc "foo bar\n";  // エスケープシーケンスは処理されます
  dc `foo bar\n`;  // エスケープシーケンスは処理されません
  dc @"foo bar\n"; // \0で終了しません
  ```  

### システム定数、システムラベル

- _shadow
  ```
  bc = _shadow; // shadowデータ領域の開始アドレスが取得できます。※importのshadow領域ではありません
  ```

- _shadowSize
  ```
  hl = _shadowSize; // shadow領域のサイズが取得できます。
  clear _shadow, 0, _shadowSize; // shadow型の一括初期化
  ```
  
- _heap
  ```
  hl = _heap;   // プログラムの終わり+1のアドレスを差します。このアドレス以降メモリを自由に使えます。 
  ```

### プリプロセッサ
厳密にはプリプロセッサというわけではないのですが、プログラムではない命令群を便宜上プリプロセッサとします。

- org
  ```
  // それぞれ1ファイルに付き1回だけ有効です。
  org 0x100;          // プログラムを配置するアドレス。デフォルトは0x0100。
  org 0x1000, data;   // データ領域の配置アドレスを決定します。配置先によっては生成されるバイナリが肥大化するので注意してください。
  org 0x2000, shadow; // shadow 型の配置アドレスを決定します。data と違いバイナリサイズに影響はありません。 
  ```
- import
  ```
  import "foo.xsm";                  // 外部ファイルを取り込みます。取り込まれたファイルはその場に展開されずに後部に追加されます。
  import "foo.xsm", 0x2000;          // アドレス指定付きで読み込みます、orgと同じです。
  import "foo.xsm", 0x8000, shadow;  // プログラム全体を指定アドレスにshadowとして読み込みます。これで読み込まれたプログラムはバイナリに含まれることはありません。
                                      // 常駐プログラムを呼ぶ場合に使います。
  ```

- include
  ```
  include "foo.xsm";                 // 外部ファイルを取り込みその場に挿入されます。
                                      // importで足りる場合はimportを使ってください。
  ```

- debug
  ```
  debug on;   // アセンブル中のソースの出力開始
  debug off;  // アセンブル中のソースの出力停止
  ```

- optimize
  ```
  optimize on;   // 最適化ON、unsafe中に効率のよいソースを出力します(アセンブラデフォルト)。
  optimize off;  // 最適化OFF、最適化が原因で想定通りに動作しない可能性があります。その場合はこちらを試してください。
  ```
