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

        return this.analyzer.analyze(document.uri).then(() => {
            try {
                const nearStatement = this.analyzer.searchStatement(path, position.character, position.line);
                // 一番近いやつ
                if(nearStatement != null) {
                    const functionName = nearStatement.getFunctionName();
                    if(functionName != null) {
                        const func = this.analyzer.searchFunction(path, functionName);
                            const signatureHelp = new vscode.SignatureHelp();
                            signatureHelp.activeParameter = 0;
                            signatureHelp.activeSignature = 0;
                            let doc = [];
                            if(func.description != null) doc.push(func.description);
                            if(func.documentation != null) doc.push(func.documentation);

                            signatureHelp.signatures = [
                                new vscode.SignatureInformation(func.detail, doc.join("  \n"))
                            ];
                            return Promise.resolve(signatureHelp);
                    }
                }
            } catch(e) {
                console.log(e);
            }
            return vscode.reject('no open parenthesis before cursor')

        });

    }
}
