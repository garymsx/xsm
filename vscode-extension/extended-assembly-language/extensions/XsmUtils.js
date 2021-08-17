const vscode = require('vscode');

/**
 * 指定uriのワークスペースを切り出す
 * @param uri 
 * @returns 
 */
function getWorkspaceFolderPath(uri) {
    return vscode.workspace.getWorkspaceFolder(uri).uri.path;
}
module.exports.getWorkspaceFolderPath = getWorkspaceFolderPath;

/**
 * 指定uriのワークスペースパス以降のパスを返す
 * @param {*} uri 
 * @returns 
 */
function getPath(uri) {
    return uri.path.substring(getWorkspaceFolderPath(uri).length);
}
module.exports.getPath = getPath;

/**
 * 指定uriの親のパスを返す、ワークスペースは除く
 * @param uri 
 * @returns 
 */
function getParentPath(uri) {
    return getPath(uri).replace(/(^.*)\/.*?$/, "$1");
}
module.exports.getParentPath = getParentPath;

/**
 * 相対パスを解決する
 * @param uri   基準となるファイル
 * @param path  基準からの相対パス
 * @returns 
 */
function getAbsolutePath(uri, path) {
    const parentUri = vscode.Uri.file(getWorkspaceFolderPath(uri)); //  + getParentPath(uri)
    const absoluteUri = vscode.Uri.joinPath(parentUri, path);
    return getPath(absoluteUri);
}
module.exports.getAbsolutePath = getAbsolutePath;
