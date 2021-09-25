const vscode = require('vscode');
const XsmConsts = require('./XsmConsts');
const XsmUtils = require('./XsmUtils');

module.exports = class XsmDefinitionProvider {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }

    provideDefinition(document, position, token) {
        // ここでの再解析はいらないはず
        //return this.analyzer.analyze(document.uri).then(() => {
            const path = XsmUtils.getPath(document.uri);
            const namespace = this.analyzer.getNamespace(path, position.line);
            // カーソル位置のメンバー情報を取得
            let member = this.analyzer.getPositionMember(path, position.character, position.line);

            if(member != null) {
                const pos = new vscode.Position(member.startLineNo, 0);
                const loc = new vscode.Location(member.uri, pos);
                return Promise.resolve(loc);
            }

            return Promise.reject("no word here");
        //});
    }
}