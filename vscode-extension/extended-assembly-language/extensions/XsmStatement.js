const XsmConsts = require('./XsmConsts');

module.exports = class XsmStatement {
    constructor() {
        this.namespace = null;  // 名前空間
        this.tokens = [];
        this.index = 0;         // 読み取りのポインタ
    }

    push(token) {
        this.tokens.push(token);
    }

    length() {
        return this.tokens.length;
    }

    next() {
        if(this.tokens.length <= this.index) return null;
        return this.tokens[this.index++];
    };

    current() {
        if(this.tokens.length <= this.index) return null;
        return this.tokens[this.index];
    };

    reset() {
        this.index = 0;
    }

    first() {
        if(this.tokens.length == 0) return null;
        return this.tokens[0];
    }

    last() {
        if(this.tokens.length == 0) return null;
        return this.tokens[this.tokens.length - 1];
    }

    // current.valueのalias
    value() {
        return this.current() != null ? this.current().value : null;
    };

    back() {
        if(this.index > 0) this.index--;
    }

    reverse() {
        this.reset();
        this.tokens = this.tokens.reverse();
    }

    /**
     * 指定桁、行付近までのドット区切りのメンバーリストを分割してリストで返す
     */
    chainList(colNo, lineNo) {
        this.reset();
        const tokens = new XsmStatement();
        const members = [];

        // 指定位置までのトークンを読みだす
        while(this.current() != null) {
            const token = this.next();
            // 指定位置を超えないまでの単語
            if(token.lineNo <  lineNo || 
               token.lineNo == lineNo && token.start <= colNo) {
                tokens.push(token);
            } else {
                break;
            }
        }

        // 後ろからさかのぼって変数とみられるところを切り出す
        tokens.reverse();
        while(tokens.current() != null) {
            // ドットなら読み飛ばす
            if(tokens.value() == ".") tokens.next();
            // 配列であれば読み飛ばす
            tokens.skipRevArray();

            let token = tokens.current();
            if(token.value.match(XsmConsts.MATCH_REGISTER) ||
               token.value.match(XsmConsts.MATCH_BLOCK)) {
                // レジスタ、ブロックの場合保留
                tokens.next();
            } else if(token.value.match(XsmConsts.MATCH_WORD)) {
                // 変数、構造体名
                members.push(tokens.next().value);
            } else {
                // ここで切れた
                break;
            }
        }

        members.reverse();

        return members;
    }

    // 配列表記を読み飛ばす
    skipArray() {
        // 配列定義が続く限りループ
        let nest = 0;
        // 多次元配列対応の為、whileが2重になっている
        while(this.value() != null && this.value() == "[") {
            while(this.value() != null) {
                if(this.value() == "[") nest++;
                if(this.value() == "]") nest--;
                this.next();
                if(nest == 0) break;
            }
        }
    }

    // ブロックを読み飛ばす
    skipBlock() {
        let nest = 0;
        let startChar = this.value();
        let endChar = "";

        if(startChar == "(" || startChar == "{" || startChar == "[") {
            if(startChar == "(") endChar =")";
            if(startChar == "{") endChar ="}";
            if(startChar == "[") endChar ="]";

            while(this.value() != null && this.value() == startChar) {
                while(this.value() != null) {
                    if(this.value() == startChar) nest++;
                    if(this.value() == endChar) nest--;
                    this.next();
                    if(nest == 0) break;
                }
            }
        }
    }

    // 配列表記を読み飛ばす(逆版)
    skipRevArray() {
        // 配列定義が続く限りループ
        let nest = 0;
        while(this.value() != null && this.value() == "]") {
            while(this.value() != null) {
                if(this.value() == "]") nest++;
                if(this.value() == "[") nest--;
                this.next();
                if(nest == 0) break;
            }
        }
    }

    // 文字列を取得
    getString() {
        if(this.value() != null && this.value().match(XsmConsts.MATCH_STRING)) {
            return this.value().replace(/^@?["`](.*)["`]$/, "$1");
        }
        return null;
    }

    // トークンを繋げて返す
    toString() {
        const buf = [];
        let beforeWord = false; // 直前の単語が英数字
        let push = (value) => {
            // 長いのでトークン100個まで
            if(buf.length < 100) buf.push(value);
        }
        this.tokens.forEach(token => {
            if(token.value.match(XsmConsts.MATCH_WORD) ||
               token.value.match(XsmConsts.MATCH_NUMBER) ||
               token.value.match(XsmConsts.MATCH_STRING) ||
               token.value.match(XsmConsts.MATCH_CHAR)      ) {
                // 英数字が2回続く場合はスペースで調整
                if(beforeWord) push(" ");
                beforeWord = true;
                push(token.value);
            } else {
                if(token.value == "=") {
                    push(" " + token.value + " ");
                } else {
                    push(token.value);
                }
                beforeWord = false;
            }

            // スペース調整の為単語扱いにする
            if(token.value == "," || token.value == ")" || token.value == "]") {
                beforeWord = true;
            }

        });

        // 長いので省略
        if(buf.length == 100) buf.push("...");

        return buf.join("").trim();
    }

    /**
     * 関数名っぽいところを取り出す
     */
    getFunctionName() {
        // 単語 + "(" という構成を探す
        this.reset();
        while(this.current() != null) {
            this.skipBlock();
            if(this.current() != null) {
                const token = this.next();
                if(token.value.match(XsmConsts.PARSE_WORD)) {
                    if(this.current() != null && this.current().value == "(") {
                        return token.value;
                    }
                }
            }
        }
        return null;
    }
}
