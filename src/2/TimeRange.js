function TimeRange(from, to) {//closed range
    this.from = from;
    this.to = to;
    this.length = function () { return Math.max(0, this.to - this.from); };
    this.contains = function (x) { return this.to - x >= 0 && x - this.from >= 0; };
    this.isEmpty = function () { return this.to - this.from < 0; };
    this.count = function () { return 1; }
}
TimeRange.intersection = function (a, b) {//if a, b intersect
    if (a.isEmpty() || b.isEmpty())
        return TimeRangeEmpty;
    return new TimeRange(a.from - b.from > 0 ? a : b, a.to - b.to < 0 ? a : b);
};
TimeRange.union = function (a, b) {//if a, b intersect
    if (a.isEmpty()) return b;
    if (b.isEmpty()) return a;
    return new TimeRange(a.from - b.from < 0 ? a : b, a.to - b.to > 0 ? a : b);
};
TimeRange.intersect = function (a, b) {
    if (a.isEmpty() || b.isEmpty())
        return false;
    return a.from <= b.to && b.from <= a.to;
};

function TimeRangeList(x, xs) {
    this.x = x;
    this.xs = xs;
    this.n = xs.count() + 1;
    this.length = function () {
        var ret = 0;
        for (var p = this; !p.isEmpty(); p = p.xs) {
            ret += x.length();
        }
        return ret;
    };
    this.lengthIntersects = function (a) {
        var ret = 0;
        for (var p = this; !p.isEmpty(); p = p.xs) {
            ret += TimeRange.intersection(p.x, a).length();
        }
        return ret;
    };
    this.count = function () { return this.n; }
}

var TimeRangeEmpty = {
    isEmpty: function () { return true; },
    contains: function () { return false; },
    length: function () { return 0; },
    count: function () { return 0; },
};
