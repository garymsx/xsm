const vscode = require('vscode');
const XsmParser = require('./XsmParser');
const XsmMember = require('./XsmMember');
const XsmConsts = require('./XsmConsts');
const XsmImport = require('./XsmImport');
const XsmUtils  = require('./XsmUtils');

module.exports = class XsmAnalyzer {
    constructor() {
        this.imports = [];
        this.members = [];
        this.parsers = [];
        this.files = [];
        this.busy = false;
    }

    analyze(uri) {
        return this.analyzePass1(uri).then(() => {
            this.analyzePass2(uri);
        });
    }

    analyzePass1(uri) {
        const path = XsmUtils.getPath(uri);

        if(path == "/debug.xsm") {
            console.log("stop");
        }

        // 対象ファイル初期化
        this.clearMembers(path);

        if(this.files.indexOf(path) == -1) {
            this.files.push(path);
            //console.log("workspace:" + XsmUtils.getWorkspaceFolderPath(uri));
            console.log("path     :" + path);
            //console.log("parent   :" + XsmUtils.getParentPath(uri));
        } else {
            console.log("update   :" + path);
        }

        const parser = new XsmParser();
        this.parsers[path] = parser;
        return parser.parse(uri).then(() => {
            this.pass1(uri, parser);
        });
    }

    analyzePass2(uri) {
        const path = XsmUtils.getPath(uri);
        const parser = this.parsers[path];
        this.pass2(uri, parser);
    }

    /**
     * 構造体定義を解析
     * @param parser 
     */
    pass1(uri, parser) {
        parser.reset();

        const path = XsmUtils.getPath(parser.uri);
        let nest = 0;            // { } のネスト状況
        let namespace = null;
        let func = null;         // 現在のスコープの関数
        let struct = null;       // 現在のスコープの構造体
        let commentBlock = null;
        while(parser.current() != null) {
            const statement = parser.next();
            const topToken = statement.value();

            // コメントブロック記憶
            if(topToken.match(XsmConsts.MATCH_COMMENT_BLOCK)) {
                commentBlock = statement;
            }

            // ネスト
            if(topToken == "{") nest++;
            if(topToken == "}" && nest > 0) {
                nest--;
            }

            // 関数の外にいる、外に出た
            if(nest == 0) {
                namespace = null;
                struct = null;
            }

            // import/include
            if(topToken.match("^(import|include)$")) {
                // 次の単語
                statement.next();

                if(statement.current() != null) {
                    let imp = new XsmImport();
                    imp.uri = parser.uri;
                    imp.path = path;
                    imp.import = XsmUtils.getAbsolutePath(parser.uri, statement.getString());
                    this.imports.push(imp);
                    //console.log("import:" + imp.import);
                }
            }

            // 構造体定義
            if(topToken.match(XsmConsts.MATCH_STRUCT)) {
                const member = this.parseStruct(parser, statement, path, commentBlock);
                if(member != null) {
                    // カレント名前空間
                    namespace = member.label;
                    // メンバー定義が行われていないのであとで処理
                    struct = member;
                    member.uri = uri;
                    this.members.push(member);
                    commentBlock = null;
                }
            }
           
            // 関数定義抽出
            if(topToken.match("^(function|inline)$")) {
                const member = this.parseFunction(parser, statement, path, commentBlock);
                if(member != null) {
                    // カレント名前空間
                    namespace = member.label;
                    func = member;
                    commentBlock = null;
                }
            }

            // 構造体メンバー定義
            if(struct != null && (
               topToken.match(XsmConsts.MATCH_VARLIABLE) ||
               this.searchStruct(path, topToken) != null) ) {
                const member = this.parseMember(parser, statement, path);
                if(member != null) {
                    // 名前空間あり
                    member.namespace = namespace;
                    member.uri = uri;
                    // 構造体メンバー追加
                    struct.members.push(member);
                }
            }
        }
    }

    /**
     * 関数、変数を解析
     * @param parser 
     */
    pass2(uri, parser) {
        parser.reset();

        const path = XsmUtils.getPath(parser.uri);
        let nest = 0;  // { } のネスト状況
        let namespace = null;
        let func = null;         // 現在のスコープの関数
        let struct = null;       // 現在のスコープの構造体
        let commentBlock = null;
        while(parser.current() != null) {
            const statement = parser.next();
            const topToken = statement.value();

            // コメントブロック記憶
            if(topToken.match(XsmConsts.MATCH_COMMENT_BLOCK)) {
                commentBlock = statement;
            }

            // ネスト
            if(topToken == "{") nest++;
            if(topToken == "}" && nest > 0) {
                nest--;
            }

            // 関数の外にいる、外に出た
            if(nest == 0) {
                namespace = null;
                if(func != null) {
                    func.endLineNo = statement.current().lineNo;
                    func = null;
                }
                if(struct != null) {
                    struct.endLineNo = statement.current().lineNo;
                    struct = null;
                }
            }

            // 構造体定義
            if(topToken.match(XsmConsts.MATCH_STRUCT)) {
                const member = this.parseStruct(parser, statement, path, commentBlock);
                if(member != null) {
                    // カレント名前空間
                    namespace = member.label;
                    // メンバー定義が行われていないのであとで処理
                    struct = member;
                    commentBlock = null;
                }
            }

            // 関数定義抽出
            if(topToken.match("^(function|inline)$")) {
                const member = this.parseFunction(parser, statement, path, commentBlock);
                if(member != null) {
                    // カレント名前空間
                    namespace = member.label;
                    func = member;
                    member.uri = uri;
                    this.members.push(member);
                    commentBlock = null;
                }
            }

            // 変数、定数
            if(struct == null && (
                topToken.match(XsmConsts.MATCH_CONST) ||
                topToken.match(XsmConsts.MATCH_SHADOW) ||
                topToken.match(XsmConsts.MATCH_VARLIABLE) ||
               this.searchStruct(path, topToken) != null)) {
               const member = this.parseMember(parser, statement, path);
                if(member != null) {
                    // 名前空間あり
                    member.namespace = namespace;
                    member.uri = uri;
                    this.members.push(member);
                }
            }
        }
    }

    /**
     * 構造体解析
     * @param parser 
     * @param statement 
     * @param path
     * @param commentBlock
     * @returns member
     */
     parseStruct(parser, statement, path, commentBlock) {
        statement.next(); // structを空読み

        let member = new XsmMember();
        member.kind = XsmConsts.MEMBER_KIND_STRUCT;
        member.path = path;
        member.startLineNo = statement.first().lineNo;

        // コメント解析
        if(commentBlock != null) {
            this.parseCommentBlock(member, commentBlock);
        }

        if(statement.current() != null) {
            // 型名
            member.label = statement.next().value;
            member.detail = statement.toString();
            return member;
        } else {
            return null;
        }
    }

    /**
     * 関数解析
     * @param parser 
     * @param statement 
     * @param path
     * @param commentBlock
     * @returns member
     */
    parseFunction(parser, statement, path, commentBlock) {
        let member = new XsmMember();
        member.path = path;
        member.startLineNo = statement.first().lineNo;
        member.kind = XsmConsts.MEMBER_KIND_FUNCTION;

        // 次の単語
        statement.next();
        // コメント解析
        if(commentBlock != null) {
            this.parseCommentBlock(member, commentBlock);
        }
        // 関数名
        if(statement.current() != null) {
            member.label = statement.value();
            // 定義
            member.detail = statement.toString();

            // 先頭と最後の余分な改行を除去
            if(member.description != null)   member.description = member.description.replace(/^\n+|\n+$/mg,"","");
            if(member.documentation != null) member.documentation = member.documentation.replace(/^\n+|\n+$/mg,"","");

            return member;
        } else {
            return null;
        }
    }

    /**
     * 変数解析
     * @param parser 
     * @param statement 
     * @param path
     * @returns member
     */
    parseMember(parser, statement, path) {
        // constを空読み
        if(statement.value().match(XsmConsts.MATCH_CONST)) statement.next();

        // shadowを空読み
        if(statement.value().match(XsmConsts.MATCH_SHADOW)) {
            statement.next();
            statement.skipBlock();
        }

        let member = new XsmMember();
        member.kind = XsmConsts.MEMBER_KIND_VARIABLE;
        member.path = path;
        member.startLineNo = statement.current().lineNo;

        if(statement.current() != null) {
            // 型
            const type = statement.next();
            if(statement.current() != null) {
                member.type = type.value;
                // 配列定義を読み飛ばす
                statement.skipArray();
                // 変数名
                member.label = statement.next().value;
            }
            member.detail = statement.toString();
            if(parser.getComment(statement.last().lineNo) != null) {
                member.detail += " " + parser.getComment(statement.last().lineNo);
            }

            return member;
        } else {
            return null;
        }
    }

    /**
     * コメントブロックを処理してmemberに設定
     * @param member 
     * @param commentBlock 
     */
    parseCommentBlock(member, commentBlock) {
        // コメント解析
        const buf = [];
        let comment = commentBlock.toString();

        // コメント記号を削除
        comment = comment.replace(/^(\/\*\*+|^\s*\*+\/|^\s*\*+)/mg, "")   // コメント開始、終了文字を削除
        comment = comment.trim("\n");
        // コメントをparse
        comment.split(/\n/mg).forEach(value => {
            // 最初の@～が出てきたら説明文終了と見なす
            if(value.match(/^\s*@\w+.*/)) {
                if(member.description == null) {
                    member.description = buf.join("  \n");
                    buf.splice(0);
                }
            }
            // 説明が見やすいように編集
            if(value.match(/\s*@(param)/)) {
                value = value.replace(/\s*(@\w+)\s+(\w+)/," $1  $2  - ");
            }
            if(value.match(/\s*@(type|return|using)/)) {
                value = value.replace(/\s*(@\w+)\s+/, " $1  ");
            }
            //value = value.replace(/\s/g,"&nbsp;");
            buf.push(value);
        });
        if(member.description == null) {
            // 関数概要
            member.description = buf.join("  \n").trim("\n");
        } else {
            // パラメータ説明
            member.documentation = buf.join("  \n");
        }
    }

    /**
     * 指定URIの解析情報を破棄する
     * @param path 
     */
    clearMembers(path) {
        this.members = this.members.filter(it => it.path != path);
        this.imports = this.imports.filter(it => it.path != path);
        delete this.parsers[path];
        this.files   = this.files.filter(it => it != path);
    }

    /**
     * 指定、桁行位置に近いstatementを返す
     * @param path
     * @param colNo 
     * @param lineNo 
     * @returns 
     */
    searchStatement(path, colNo, lineNo) {
        let nearStatement = null;
        for(let statement of this.parsers[path].statements) {
            for(let token of statement.tokens) {
                if(token.lineNo == lineNo && (token.start <= colNo && colNo <= token.end + 1)) {
                    nearStatement = statement;
                    break;
                }
            }
            if(nearStatement != null) break;
        }
        return nearStatement;
    }

    /**
     * 構造体定義を探す
     * @param label 
     * @returns 
     */
    searchStruct(path, label) {
        for(let member of this.members) {
            if(this.inScope(path, null, member)) {
                if(member.kind == XsmConsts.MEMBER_KIND_STRUCT && member.label == label) {
                    return member;
                }
            }
        }
        return null;
    }
    
    /**
     * 関数定義を探す
     * @param label 
     * @returns 
     */
    searchFunction(path, label) {
        for(let member of this.members) {
            if(this.inScope(path, null, member)) {
                if(member.kind == XsmConsts.MEMBER_KIND_FUNCTION && member.label == label) {
                    return member;
                }
            }
        }
        return null;
    }

    /**
     * 関数または構造体の定義を探す
     * @param label 
     * @returns 
     */
     searchMember(path, namespace, label) {
        for(let member of this.members) {
            if(this.inScope(path, namespace, member)) {
                //if((member.kind == XsmConsts.MEMBER_KIND_FUNCTION || member.kind == XsmConsts.MEMBER_KIND_STRUCT) && member.label == label) {
                if(member.label == label) {
                    return member;
                }
            }
        }
        return null;
    }

    /**
     * pathがmemberを参照可能かチェック
     * @param path
     * @param namespace
     * @param member
     * @returns
     */
    inScope(path, namespace, member) {
        // 自分のパスでない場合、importsされているかチェック
        if(path != member.path) {
            let find = false;
            for(let imp of this.imports) {
                if(imp.path == path && imp.import == member.path) {
                    find = true;
                    break;
                }
            }
            // 参照不可
            if(!find) return false;
        }

        // 関数は構造体は無条件で参照可能
        if(member.kind == XsmConsts.MEMBER_KIND_FUNCTION ||
           member.kind == XsmConsts.MEMBER_KIND_STRUCT) return true;

        // 変数は名前空間が参照可能範囲なら追加
        if(member.kind == XsmConsts.MEMBER_KIND_VARIABLE) {
            if(member.namespace == null) {
                return true;
            } else {
                // 関数内の変数は名前空間が一致するかチェック
                if(member.namespace == namespace) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 現在の行がどの名前空間にいるか調べる
     * @param path 
     * @param lineNo 
     * @returns 
     */
    getNamespace(path, lineNo) {
        let namespace = null;
        this.members.forEach(member => {
            if(member.path == path) {
                if(member.kind == XsmConsts.MEMBER_KIND_FUNCTION) {
                    if(member.startLineNo <= lineNo && lineNo <= member.endLineNo) {
                        namespace = member.label;
                    }
                }
            }
        });

        return namespace;
    }

    /**
     * 指定位置のメンバー情報を取得
     * @param path
     * @param namespace
     * @param treeMembers
     */
     getPositionMember(path, colNo, lineNo) {
        const statement = this.searchStatement(path, colNo, lineNo);
        const namespace = this.getNamespace(path, lineNo);
        const chainList = statement.chainList(colNo, lineNo);
        let member = null;

        // 1番上の階層
        if(chainList.length > 0) {
            member = this.getPositionMember_searchMember(path, namespace, chainList[0]);

            // 階層がある場合は配下検索
            if(chainList.length > 1) {
                chainList.shift();
                member = this.getPositionMember_chain(path, namespace, member, chainList);
            }
        }

        return member;
    }

    /**
     * chainListを解析しながら最後のメンバーの情報を取得
     * @param path 
     * @param namespace
     * @param parentMember
     * @param chainList
     */
     getPositionMember_chain(path, namespace, parentMember, chainList) {
        const label = chainList.shift();

        // 構造体でないなら、構造体の定義を探す
        if(parentMember.kind != XsmConsts.MEMBER_KIND_STRUCT) {
            // parentMemberを構造体定義に差し替える
            parentMember = this.searchStruct(parentMember.path, parentMember.type)
            // 見つからなかった
            if(parentMember == null) return null;
        }

        // 構造体からメンバーを探す
        for(let member of parentMember.members) {
            // 見つかった
            if(label == member.label) {
                // chainの最後なら終了
                if(chainList.length == 0) {
                    return member;
                } else {
                    // 次のchainを検索
                    return this.getPositionMember_chain(path, namespace, member, chainList);
                }
            }
        }
        return null;
    }

    /**
     * 名前からメンバーを探す
     * @param path 
     * @param namespace 
     * @param label 
     * @returns 
     */
    getPositionMember_searchMember(path, namespace, label) {
        // まず構造体定義名を参照しているか、変数として構造体を参照しているか
        for(let member of this.members) {
            // 名前が一致
            if(label == member.label) {
                // 参照可能な位置にあるか
                if(this.inScope(path, namespace, member)) {
                    return member;
                }
            }
        }
        return null;
    }

}
