module.exports = class XsmMember {
    constructor() {
        this.uri = null;             // uri
        this.path = null;            // ワークスペースからのパス
        this.namespace = null;       // 名前空間
        this.label = null;           // 名称
        this.description = null;     // 説明
        this.documentation = null;   // ドキュメント
        this.detail = null;          // 定義
        this.kind = null;            // 関数/変数/構造体など
        this.type = null;            // 型名
        this.startLineNo = 0;        // 定義開始位置
        this.endLineNo = 0;          // 定義終了位置
        this.members = [];           // 構造体定義の場合の子メンバー
    }
}
