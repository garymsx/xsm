const vscode = require('vscode');
const XsmConsts = require('./XsmConsts');
const XsmUtils = require('./XsmUtils');

module.exports = class XsmHoverProvider {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }

    provideHover(document, position, token) {
        return this.analyzer.analyze(document.uri).then(() => {
            const path = XsmUtils.getPath(document.uri);
            const namespace = this.analyzer.getNamespace(path, position.line);
            // カーソル位置のメンバー情報を取得
            let member = this.analyzer.getPositionMember(path, position.character, position.line);

            if(member != null) {
                return Promise.resolve(new vscode.Hover((member.description || "") + "\n\n" + (member.detail || "")));
            }
            return Promise.reject("no word here");
        });
    }
}