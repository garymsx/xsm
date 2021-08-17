const XsmConsts = require('./XsmConsts');

module.exports = class XmlTokens {
    constructor() {
        this.tokens = [];
        this.index = 0;
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

    // 配列表記を読み飛ばす
    skipArray() {
        // 配列定義が続く限りループ
        let nest = 0;
        while(this.value() != null && this.value() == "[") {
            while(this.value() != null) {
                if(this.value() == "[") nest++;
                if(this.value() == "]") nest--;
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

}
