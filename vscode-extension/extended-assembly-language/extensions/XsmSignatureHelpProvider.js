const vscode = require('vscode');
const XsmConsts = require('./XsmConsts');
const XsmUtils = require('./XsmUtils');
const XsmParser = require('./XsmParser');
const XsmStatement = require('./XsmStatement');

/**
 * 未完成、ちゃんとパースしないと無理
 */
module.exports = class XsmSignatureHelpProvider {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }

    provideSignatureHelp(document, position, token) {
        const line = document.lineAt(position.line);
        const path = XsmUtils.getPath(document.uri);

        // カーソル位置にある一番近いステートメントを探す
        const parser = new XsmParser();
        let nearStatement = null;
        let nearIndex = 0;

        return parser.parse(document.uri).then(() => {
            let index = 0;
            for(let statement of parser.statements) {
                index = 0;
                for(let token of statement.tokens) {
                    if(token.lineNo == position.line && token.end < position.character) {
                        nearStatement = statement;
                        nearIndex = index;
                    } else if(token.lineNo > position.line) {
                        break;
                    }
                    index++;
                }
            }
            // 一番近いやつ
            if(nearStatement != null) {
                const func = this.analyzer.searchFunction(path, nearStatement.tokens[nearIndex - 1].value);
                const signatureHelp = new vscode.SignatureHelp();
                signatureHelp.activeParameter = 0;
                signatureHelp.activeSignature = 0;
                signatureHelp.signatures = [
                    new vscode.SignatureInformation(
                        func.description || "", 
                        (func.documentation != null ? "  \n" + func.documentation : "")
                    )
                ];
                return Promise.resolve(signatureHelp);
            }
            return vscode.reject('no open parenthesis before cursor')
        });

    }
}
