const vscode = require('vscode');
//const path = require('path');
const XsmCompletionItemProvider = require('./XsmCompletionItemProvider');
const XsmSignatureHelpProvider = require('./XsmSignatureHelpProvider');
const XsmHoverProvider = require('./XsmHoverProvider');
const XsmDefinitionProvider = require('./XsmDefinitionProvider');

const XsmAnalyzer = require('./XsmAnalyzer');

const mode = { scheme: 'file', language: 'xsm' };

const analyzer = new XsmAnalyzer();
let fileWatcher = null;

function commandTest() { 
    //vscode.window.showInformationMessage('Hello, XSM!')
}

function activate(context) {
    // context.subscriptions.push(vscode.commands.registerCommand('xsm.commandTest', commandTest));
    context.subscriptions.push(vscode.languages.registerHoverProvider(mode, new XsmHoverProvider(analyzer)));    
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(mode, new XsmCompletionItemProvider(analyzer), '.'));
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(mode, new XsmSignatureHelpProvider(analyzer), '(', ','));    
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(mode, new XsmDefinitionProvider(analyzer)));

    fileWatcher = vscode.workspace.createFileSystemWatcher("**/*.xsm");
    fileWatcher.onDidChange(uri => {
        console.log("onDidChange");
        analyzeUpdate(uri);
    });
    fileWatcher.onDidCreate(uri => {
        console.log("onDidCreate");
        analyzeUpdate(uri);
    });
    fileWatcher.onDidDelete(() => {
        console.log("onDidDelete");
    });

    analyzeUpdate();
}

function analyzeUpdate(uri) {
    (async() => {
        if(uri != undefined) {
            // 単ファイル
            await analyzePass1([uri]);
            analyzePass2([uri]);
        } else {
            // ワークスペース全体更新
            const uriList = await vscode.workspace.findFiles("**/*.xsm");
            await analyzePass1(uriList);
            analyzePass2(uriList);
        }
    })();
}

/**
 * 解析処理(構造体定義)呼び出し
 * @param uriList 
 * @returns 
 */
async function analyzePass1(uriList) {
    for(let uri of uriList) {
        await analyzer.analyzePass1(uri);
    }
}

/**
 * 解析処理(変数、関数)呼び出し
 * @param uriList 
 * @returns 
 */
 function analyzePass2(uriList) {
    for(let uri of uriList) {
        analyzer.analyzePass2(uri);
    }
}

function deactivate() {
    return undefined;
}

module.exports = { activate, deactivate };