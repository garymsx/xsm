# Z80用 クロスアセンブラ XSM マニュアル

こちらの開発は終了しました。  
現在はvscodeの拡張機能として開発を継続しています。[xsm-vscode-extension](https://github.com/garymsx/xsm-vscode-extension)  

## 更新情報
- ver 0.26
    - let文でレジスタを構造体でキャスト出来るようにした。
- ver 0.25
    - キャラクタコードのマッピングを変更するcharmap関数追加
    - その他バグ修正
- ver 0.24
    - from関数のオプションにdicrleを追加
    - let文で8bit -> 16bitキャストされないケースがあるのを修正
- ver 0.23
    - let文のバグ修正
    - rle2のデータ格納形式をブロック単位に変更
    - from関数のエラー表示が機能していなかったのを修正(1ライン2色オーバーチェックなど)
- ver 0.22
    - let文のバグ修正とエラーチェックの強化
    - from関数のオプションにrle2を追加
- ver 0.21
    - lddr命令の定義がなかったので追加
- ver 0.20
    - [let文](quickreference.md#let)の追加
    - 未定義命令のニーモニックと動作が一致していなかったバグを修正
    - インデックスレジスタの命令が一部アセンブルできなかったバグを修正
    - 割り算ライブラリのバグを修正

- [履歴](history.md)

## はじめに
XSMはまだ生まれたばかりの言語でこちらも手探りで作っている状態です。  
不具合がいっぱいあるかもしれませんしご期待の機能がないかもしれません。  
ご利用になる場合はそれらを踏まえてお使いください。

## XSMとは
eXtended aSseMbly languageでXSMです。  
Z80を採用したレトロPCでよりよいパフォーマンスを出すプログラムを作るにはアセンブリ言語は必須と言えるでしょう。
ところがアセンブリ言語はそれ以降生まれた高級言語とは異なる独特の文法と難しさを持っており、他の言語を学んだあとから習得するのは厳しい言語です。
そこで既存のC言語やJavascriptライクな文法を使えるようにしたアセンブリ言語XSMを開発しました。

## 特徴
XSMは文法を変えただけでなくマクロ的に展開される命令、例えば if文 や for文があり、これらのサポートによりラベルまみれになることを回避しプログラムの可読性をあげることが出来ます。  
また、Z80には存在しない命令を複数の命令の組み合わせにより実現し、プログラムを簡潔に書けるようになっています。  

## こんな文法です
```
org 0x100;

string text1 = "abc";
string text2 = "def";

A = strcmp(text1,text2);
return;

// string compare
function strcmp(BC,DE) return A {
    unsafe {
        using(BC,DE,HL) {
            while() {
                A = *BC;
                A -= *DE;
                if($NZ || *DE == '\0') return A;
                BC++;
                DE++;
            }
        }
    }
}
```

## 注意事項
このドキュメントはZ80のアセンブリ言語を理解している人向けのドキュメントです。  
また、その他にもいくつかの予備知識が必要となるところがあります。
- Z80のレジスタの構成、レジスタの制限、アセンブリ言語(ニーモニック)
- コマンドプロンプトやシェルの使い方
- C言語/C++/C#/JavaScript/Javaなどに類似したプログラミング言語の知識

本ドキュメントはWindows環境を前提に記述されていますので、Macやlinux環境の方は適宜内容の読み替えが必要になります。

## インストール
[XSM](xsm/archive/)から最新版を取得し任意のディレクトリに保存しインストール先にパスを通します。
XSMはJavaVMで実行されますのでOSを選ばずに実行できますが、  
その為にJavaVMが必要になりますのでJRE8.0以上のランタイムを用意してください。
[OpenJDK16](https://jdk.java.net/16/) で動作するのを確認しています。
コマンドプロンプトで java -version を実行して以下のように表示される場合はインストール不要です。
```
C:\>java -version
java version "1.8.xxxx"
または
openjdk version "16" 2021-xx-xx など
```
javaを手動でインストールした場合、もしくはjavaにパスが通っていない場合は xsmc.bat をテキストエディタで編集し、
javaのbinディレクトリを環境変数に指定してください。
```
@echo off
setlocal
rem Javaのパスを設定してください
rem set PATH=C:\pleiades\java\jdk-16\bin;%PATH%
set CURRENT=%~dp0
java -jar "%CURRENT%xsm.jar" -library %CURRENT% %*
endlocal
```

## ビルド方法
コマンドプロンプトで
```
> xsmc.bat hoge.xsm
```
を実行することで hoge.com が出来上がります。
その他オプションは別途解説します。

## ビルドしたファイルの実行方法
MSX-DOSやCP/Mエミュレータ上でcomファイルを実行します。
```
MSXの場合
> hoge.com
CP/Mエミュレータの場合
> cpm hoge.com
```
CP/Mエミュレータは[CP/M-80 program EXEcutor](https://www.vector.co.jp/soft/win95/util/se378130.html) で実行を確認しました。

## XSM 言語仕様
[XSM クイックリファレンス](quickreference.md)

## ビルドオプション
[ビルドオプション](options.md)

## ビルドしたプログラムのメモリ構成
[メモリ構成](memorymap.md)

## VSCode用 シンタックスハイライト
[VSCode拡張](vscode-extension/archive/)からファイルを取得し以下のディレクトリに解凍すると、XSM拡張機能が使用できるようになります。

```
C:\Users\ユーザー名\.vscode\extensions
```

拡張機能一覧
- シンタックスハイライト
- オートコンプリート
- 定義参照(F12キー)

### 

## ライセンス
本ソフトウェアの使用について特に制限はもうけませんが、
本ソフトウェア使用によって生じる一切の請求、損害、その他の義務について何らの責任も負わないものとします。
