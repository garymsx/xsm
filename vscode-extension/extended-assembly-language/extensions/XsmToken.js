module.exports = class XmsToken {
    constructor(value, lineNo, start, end) {
        this.value = value;
        this.lineNo = lineNo;
        this.start = start;
        this.end = end;
    }
}
