const vscode = require('vscode');
const XmlLexer = require('./XsmLexer');
const XsmStatement = require('./XsmStatement');
const XsmConsts = require('./XsmConsts');

module.exports = class XsmParser {
    constructor() {
        this.uri = null;
        this.lexer = new XmlLexer();
        this.statements = [];
        this.index = 0;
    }

    parse(uri) {
        this.uri = uri;
        return this.lexer.load(uri).then(() => {
            while(this.lexer.current() != null) {
                let statement = this.getStatement(this.lexer);
                if(statement.tokens.length > 0) {
                    this.statements.push(statement);
                }
            }
        });
    }

    getStatement(lexer) {
        let   token = null;
        let   nest = 0;
        let   assign = false;  // 代入式の場合、ブロックもステートメントに含める
        let   controlStatement = false; // 制御命令かどうか
        const tokens = new XsmStatement();
        while((token = lexer.next()) != null) {
            // ステートメントの終わり
            if(nest == 0 && token.value == ";") break;

            // 予約語を見つけたとき
            if(token.value.match(XsmConsts.MATCH_RESERVED_WORD)) {
                // 最初の1語の判定
                if(tokens.length() == 0) {
                    // 制御命令である
                    controlStatement = true;
                } else if(!controlStatement) {
                    // 先頭にないといけない単語なのでここで切る
                    // ※制御命令内だと複数出現するのでそこは無視
                    lexer.back();
                    break;
                }
            }

            // 代入式チェック
            if(nest == 0 && token.value.match(XsmConsts.MATCH_ASSIGN)) {
                assign = true;
            }

            // 括弧でネストしているときは";"でも終わらないようにする
            if(token.value == "(" || token.value == "[") nest++;
            if(token.value == ")" || token.value == "]") nest--;

            // 終了判定
            if(!assign && (token.value == "{" || token.value == "}" || token.value.match(/^\/\*.*/))) {
                // 単独終了
                if(tokens.length() == 0) {
                    tokens.push(token);
                } else {
                    // ステートメントの終わりなので1つ戻す
                    lexer.back();
                }
                break;
            }
            tokens.push(token);
        }
        // 空
        return tokens;
    }

    getComment(lineNo) {
        return this.lexer.comments[lineNo] != undefined ? this.lexer.comments[lineNo] : null;
    }

    length() {
        return this.statements.length;
    }

    next() {
        if(this.statements.length <= this.index) return null;
        const statement = this.statements[this.index++];
        statement.reset();
        return statement;
    };

    current() {
        if(this.statements.length <= this.index) return null;
        const statement = this.statements[this.index];
        statement.reset();
        return statement;
    };

    reset() {
        this.index = 0;
    }

    back() {
        if(this.index > 0) this.index--;
    }

}
