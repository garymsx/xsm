# Z80用 クロスアセンブラ XSM リファレンスマニュアル

## はじめに
### XSMとは
eXtended aSseMbly languageでXSMです。  
Z80を採用したレトロPCでよりよいパフォーマンスを出すプログラムを作るにはアセンブリ言語は必須と言えるでしょう。
ところがアセンブリ言語はそれ以降生まれた高級言語とは異なる独特の文法と複雑さを持っており、他の言語を学んだあとから習得するのは難しい言語です。
そこで既存のC言語やJavascriptライクな文法を使えるようにしたアセンブリ言語XSMを開発しました。

### 特徴
XSMは文法を変えただけでなくマクロ的に展開される命令、例えば if文 や for文があり、これらのサポートによりラベル地獄を回避しプログラムの可読性をあげることが出来ます。  
また、Z80には存在しない命令を複数の命令の組み合わせにより実現し、回りくどいレジスタの代入や退避を自動で行い簡潔に書けるようになっています。  

### こんな文法です
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

### 注意事項
XSMを扱うにあたりある程度の予備知識が必要になります。
- Z80のレジスタの構成、レジスタの制限、アセンブリ言語(ニーモニック)
- コマンドプロンプトやシェルの使い方

本ドキュメントはWindows環境を前提に記述されていますので、Macやlinux環境の方は適宜内容の読み替えが必要になります。

### インストール
XSM一式を任意のディレクトリに保存しインストール先にパスを通します。
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
rem set JAVAPATH=C:\pleiades\java\jdk-16\bin  ← remを削除し、javaのインストール先に変更します。
rem set PATH=%JAVAPATH%;%PATH%                ← remを削除します。
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

## XSM言語仕様
[XSM言語仕様](contents.md) 

## ビルドしたプログラムのメモリマップ
[メモリマップ](memorymap.md)