module.exports.PARSE_LABEL            = "[a-zA-Z_][\\w]*:";                           // label
module.exports.PARSE_WORD             = "[a-zA-Z_][\\w]*";                            // alpnum
module.exports.PARSE_NUMBER           = "[0-9][\\w\\.]*";                             // number
module.exports.PARSE_STRING           = "@?\"(\\\"|[^\"])*?\"|@?`(\\`|[^`])*?`";      // string
module.exports.PARSE_CHAR             = "'(\\`|[^'])*?'";                             // char
module.exports.PARSE_COMMENT_BLOCK    = "/\\*.*?\\*/";                                // block comment
module.exports.PARSE_COMMENT_LINE     = "//.*?$";                                     // line comment
module.exports.PARSE_OPERATOR         = "[!#\\$%&=\\-~\\^\\|\\+\\*/<>\?]+|[;:,\\.]";  // operator single or multi
module.exports.PARSE_BLOCK            = "[\\[\\]\\(\\){}]";                           // block
module.exports.PARSE_SPACE            = "\\s+";                                       // space
module.exports.PARSE_CR               = "\n";

module.exports.MATCH_LABEL            = new RegExp("^(" + module.exports.PARSE_LABEL + ")$");
module.exports.MATCH_WORD             = new RegExp("^(" + module.exports.PARSE_WORD + ")$");
module.exports.MATCH_NUMBER           = new RegExp("^(" + module.exports.PARSE_NUMBER + ")$");
module.exports.MATCH_STRING           = new RegExp("^(" + module.exports.PARSE_STRING + ")$");
module.exports.MATCH_CHAR             = new RegExp("^(" + module.exports.PARSE_CHAR + ")$");
module.exports.MATCH_COMMENT_BLOCK    = new RegExp("^(" + module.exports.PARSE_COMMENT_BLOCK + ")$", "ms");
module.exports.MATCH_COMMENT_LINE     = new RegExp("^(" + module.exports.PARSE_COMMENT_LINE + ")$");
module.exports.MATCH_OPERATOR         = new RegExp("^(" + module.exports.PARSE_OPERATOR + ")$");
module.exports.MATCH_BLOCK            = new RegExp("^(" + module.exports.PARSE_BLOCK + ")$");
module.exports.MATCH_SPACE            = new RegExp("^(" + module.exports.PARSE_SPACE + ")$");
module.exports.MATCH_SPACE_OR_COMMENT = new RegExp("^(\\s+|//.*?|/\\*[^\\*].*?\\*/)$", "ms"); // 解析を無視してもいい文字列
module.exports.MATCH_CR               = new RegExp("^\n", "mg");
// ステートメントの最初に来る可能性のある単語
module.exports.MATCH_RESERVED_WORD    = new RegExp("^(function|inline|if|else|while|for|loop|switch|case|default|unsafe|using|try|catch|finally)$");

module.exports.MATCH_CONST            = new RegExp("^(const)$");
module.exports.MATCH_VARLIABLE        = new RegExp("^(byte|sbyte|int|sint|string|char)$");
module.exports.MATCH_STRUCT           = new RegExp("^(struct)$");
module.exports.MATCH_ASSIGN           = new RegExp("^(=)$");

module.exports.MEMBER_KIND_FUNCTION   = 1;
module.exports.MEMBER_KIND_VARIABLE   = 2;
module.exports.MEMBER_KIND_STRUCT     = 3;
