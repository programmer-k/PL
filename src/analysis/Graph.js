var Average = (function () {
    //g�� ��Ʈ�� �׷����� category�� �����ϴ� ����׷����� �ڽ� ��
    //filter�� �����ϴ� ��� ����� f�� ����� ����
    function average_per_occurrence(g, f, filter, category) {
        return sum(g, f, filter, category) / sum(g, function () { return 1; }, filter, category);
    }
    /*
    function average_time_inrange(g, filter, category, timerange) {
        return sum(g, function (x) { return TimeRange.intersection(TimeRange.fromGraph(x)).length(); }, function (x) { return filter(x) && timerange.contains(x.value); }, category) / timerange.length();
    }
    //*/
    function average_per_time(g, f, filter, category, timeranges) {
        return timeranges.reduce((p, t) => p + sum(g, f, (n) => /*Test.i(true, (n.children_list.map((n) => n.attribute))) &&*/ TimeRange.intersect(t, TimeRange.fromGraph(n)) && filter(n), category), 0) / TimeRange.sumlength(timeranges);
    }
    function average_time(g, filter, category, timeranges) {
        return timeranges.reduce((p, t) => p + sum(g, (x) => TimeRange.intersection(TimeRange.fromGraph(x), t).length(), (x) => t.contains(new Date(x.value)) && filter(x), category), 0) / TimeRange.sumlength(timeranges);
    }
    function sum(g, f, filter, category) {
        return g.children_list.reduce((p, n) => category(n) ? p + sum_sg(n, f, filter) : p, 0);
    }
    function sum_sg(g, f, filter) {
        return g.children_list.reduce((p, n) => filter(n) ? p + f(n) : p, 0);
    }

    function average_time_in_day(a, split_time, end) {
        if (end)
            a.pop();
        else
            a.shift();
        return Test.i((a.reduce((p, v) => p + (TimeSchedule.timeInDay(end ? v.to : v.from) + split_time) % TimeSchedule.day, 0) / a.length + split_time) % TimeSchedule.day);
    }

    return {
        average_per_occurrence: average_per_occurrence,
        average_per_time: average_per_time,
        average_time: average_time,
        average_time_in_day: average_time_in_day,
        sum: sum,
        sum_sg: sum_sg,
    };
})();

var SearchGraph = (function () {
    function listValue(g, f, filter, category) {
        return fold(g, f, filter, category, [], (s, v) => s.push(v));
    }

    function values(g, f, filter, category) {
        var S, ret = [];
        S = fold(g, f, filter, category, {}, function (s, v) { s[v] = true; });
        for (var i in S)
            ret.push(i);
        return ret;
    }

    function intValues(g, f, filter, category) {
        var S, ret = [];
        S = fold(g, f, filter, category, {}, function (s, v) { s[v] = true; });
        for (var i in S)
            ret.push(parseInt(Test.i(i)));
        return ret;
    }

    function mode(g, f, filter, category) {
        var S, ret = [];
        S = fold(g, f, filter, category, {}, function (s, v) { if (s[v]) s[v]++; else s[v] = 1; });
        for (var i in S)
            ret.push([i, S[i]]);
        ret.sort(cmp((a, b) => a[1] > b[1]));
        return ret[0][0];
    }

    function fold(g, f, filter, category, out, ff) {
        g.children_list.forEach((n) => category(n) && fold_sg(n, f, filter, out, ff));
        return out;
    }

    function fold_sg(g, f, filter, out, ff) {
        g.children_list.forEach((n) => filter(n) && ff(out, f(n)), 0);
    }

    function timeRanges(g, filter, category, epsilon, min) {
        var a = listValue(g, TimeRange.fromGraph, filter, category).sort(cmp((a, b) => a.from < b.from)).reduce((p, v) => id(p, p == 0 ? p.push(v) : TimeRange.intersect(p[p.length - 1], v, epsilon) ? p[p.length - 1] = TimeRange.union(p[p.length - 1], v) : p.push(v)), []);
        if (min)
            return a.reduce((p, v) => id(p, v.length() >= min ? p.push(v) : void (0)), []);
        return a;
    }

    function getSleep(g) {
        return SearchGraph.timeRanges(g, () => true, GraphFunctions.valeq("sleep"), TimeSchedule.timeFromhms(4), TimeSchedule.timeFromhms(2));
    }

    return {
        listValue: listValue,
        values: values,
        intValues: intValues,
        fold: fold,
        fold_sg: fold_sg,
        mode: mode,
        timeRanges: timeRanges,
        getSleep: getSleep,
    };
})();

var GraphFunctions = (function () {
    function getTimeRange(g) {
        var S = SearchGraph.intValues(g, function (n) { var d = new Date(n.value); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }, () => true, () => true);
        S.sort();
        function oneday(x) {
            var d = new Date(x);
            var end = new Date(x + 86400000);
            return new TimeRange(d, end);
        }
        var ret = [oneday(S[0])];
        for (var i = 1; i < S.length; i++) {
            var t = oneday(S[i]);
            //if (t != t)
            //alert(S[i]);
            var p = ret[ret.length - 1];
            if (TimeRange.intersect(p, t))
                ret[ret.length - 1] = TimeRange.union(p, t);
            else
                ret.push(t);
        }
        return ret;
    }

    function duration(n, timerange) {
        var x = TimeRange.fromGraph(n);
        if (timerange)
            x = TimeRange.intersection(x, timerange);
        return x.length();
    }
    function duration_min(n, timerange) {
        return duration(n, timerange) / 60000;
    }
    function attr(a, v) {
        return (n) => {
            var c = n.getChildByAttr(a);
            return c && c.value.split("|").indexOf(v) != -1
        };
    }
    function valeq(v) {
        return (n) => n.value == v;
    }
    return {
        duration: duration,
        duration_min: duration_min,
        getTimeRange: getTimeRange,
        attr: attr,
        valeq: valeq,
    };
})();

var Test = (function () {
    function log(x) {
        alert(x);
        return x;
    }

    function i(x) {
        return x;
    }

    return {
        log: log,
        i: i,
    }
})();

function cmp(lt) {//less than �Լ��� -1 0 1�Լ��� �ٲ�, Array.sort(cmp((a, b) => a < b));
    return (a, b) => lt(a, b) ? -1 : lt(b, a) ? 1 : 0;
}

function id(x) {
    return x;
}