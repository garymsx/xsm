const vscode = require('vscode');
const XsmToken = require('./XsmToken');
const XsmStatement = require('./XsmStatement');
const XsmConsts = require('./XsmConsts');

module.exports = class XmlLexer {
    constructor() {
        this.uri = "";
        this.tokens = new XsmStatement();
        this.comments = [];              // 行コメント
        this.pattern = new RegExp(
                    XsmConsts.PARSE_LABEL
            + "|" + XsmConsts.PARSE_WORD
            + "|" + XsmConsts.PARSE_NUMBER
            + "|" + XsmConsts.PARSE_STRING
            + "|" + XsmConsts.PARSE_CHAR
            + "|" + XsmConsts.PARSE_COMMENT_BLOCK
            + "|" + XsmConsts.PARSE_COMMENT_LINE
            + "|" + XsmConsts.PARSE_OPERATOR
            + "|" + XsmConsts.PARSE_BLOCK
            + "|" + XsmConsts.PARSE_SPACE
            + "|."                                       // その他
            , "msg"                                      // m:複数行の検索 s:.で改行一致 g:グローバル検索
        );
    }

    load(uri) {
        this.uri = uri;
        return vscode.workspace.openTextDocument(uri)
            .then(document => {
                this.loadFromDocument(document);
            }).catch(e => {
                console.log("load error:" + uri.path);
            });
    };

    loadFromDocument(document) {
        const buf = [];
        for(let i = 0;i < document.lineCount; i++ ) {
            buf.push(document.lineAt(i).text);
        }
        const text = buf.join('\n');

        let lineNo = 0;
        let colNo = 0;
        const m = text.match(this.pattern);
        if(m != null) {
            m.forEach(value => {
                if(!value.match(XsmConsts.MATCH_SPACE_OR_COMMENT)) {
                    let token = new XsmToken(value, lineNo, colNo, colNo + value.length - 1);
                    this.tokens.push(token);
                }
                if(value.match(XsmConsts.MATCH_COMMENT_LINE)) {
                    this.comments[lineNo] = value;
                }

                const m2 = value.match(/(^.*?\n|^.*)/msg);
                if(m2 != null) {
                    m2.forEach((line) => {
                        if(line.match(/^.*\n/)) {
                            lineNo++;
                            colNo = 0;
                        } else {
                            colNo += line.length;
                        }
                    });
                }
            });
        }
    };

    next() {
        return this.tokens.next();
    };

    current() {
        return this.tokens.current();
    };

    back() {
        return this.tokens.back();
    }
}
