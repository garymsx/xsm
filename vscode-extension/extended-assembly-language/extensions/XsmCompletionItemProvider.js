const vscode = require('vscode');
const XsmConsts = require('./XsmConsts');
const XsmUtils = require('./XsmUtils');

module.exports = class XsmCompletionItemProvider {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }

    provideCompletionItems(document, position) {
        return this.analyzer.analyze(document.uri).then(() => {
        try {
            // 入力行
            const line = document.lineAt(position.line);
            // 最後に入力された文字
            const inputCh = line.text.substr(position.character - 1, 1);
            //console.log("(" + position.character + "," + position.line + "):" + inputCh);

            const path = XsmUtils.getPath(document.uri);
            const namespace = this.analyzer.getNamespace(path, position.line);

            let members = [];

            // ドットが入力された場合、構造体の定義を調べる
            if(inputCh == ".") {
                // 直前は構造体のはず
                let member = this.analyzer.getPositionMember(path, position.character - 1, position.line);
                if(member != null) {
                    // 構造体定義でないのなら、定義を取得
                    if(member.kind != XsmConsts.MEMBER_KIND_STRUCT) {
                        member = this.analyzer.searchStruct(member.path, member.type);
                    }
                    members = member.members;
                }
            } else {
                this.analyzer.members.forEach(member => {
                    // 現在の名前空間から参照可能なメンバーか
                    if(this.analyzer.inScope(path, namespace, member)) {
                        members.push(member);
                    }
                });
            }

            const completionList = this.createCompletionListFromMember(members);

            // importサポート
            this.analyzer.files.forEach(it => {
                let item =  {
                    label: "import \"" + it + "\"",
                    detail: it,
                    documentation: "",
                    kind: vscode.CompletionItemKind.Value
                };
                completionList.push(item);
            });
    
            return Promise.resolve(new vscode.CompletionList(completionList, false));

        } catch(e) {
            console.log(e);
        }

        });
    }

    /**
     * membersからCompletionListを作る
     * @param members 
     * @returns 
     */
     createCompletionListFromMember(members) {
        const completionList = [];

        if(members != null) {
            members.forEach(member => {
                let label = member.label;
                let detail = (member.detail || "");
                let description = (member.description || "");
                let documentation = (member.documentation || "")
        
                let item =  {
                    label: label,
                    detail: detail,
                    documentation: new vscode.MarkdownString(
                        description +
                        (documentation != "" ? "  \n\n---  \n" + documentation : "")
                    ),
                    kind: ""
                };
                if(member.kind == XsmConsts.MEMBER_KIND_FUNCTION) {
                    item.kind = vscode.CompletionItemKind.Method;
                } else if(member.kind == XsmConsts.MEMBER_KIND_VARIABLE) {
                    item.kind = vscode.CompletionItemKind.Variable;
                } else if(member.kind == XsmConsts.MEMBER_KIND_STRUCT) {
                    item.kind = vscode.CompletionItemKind.Struct;
                }
                completionList.push(item);
            });
        }

        return completionList;
    }

}

