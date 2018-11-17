
var GraphAnalysis = (function () {
    function extract_leaf(g) {
        var s = {}, ret = {};
        g.children_list.forEach((x) => x.children_list.forEach((y) => y.children_list.forEach((n) =>
            (s[n.attribute] ? s[n.attribute] : s[n.attribute] = {})[n.value] = n
            )));
        for (const i in s) {
            const ri = ret[i] = {};
            const si = s[i];
            for (const j in si) {
                for (const v of j.split("|")) {
                    (ri[v] ? ri[v] : (ri[v] = [])).push(si[j]);
                }
            }
        }
        return ret;
    }
    function intersection(a, b) {
        return a.parents_list.filter((x) => x.children_list.some((y) => y == b));
    }
    function implies(a, b) {
        return intersection(a, b).length / a.parents_list.length;
    }
    function test(g) {
        var l = extract_leaf(g);
        return implies(l.activity.find((x) => x.value == "식사"), l.emotion.find((x) => x.value == "긍정"));
    }
    return {
        extract_leaf: extract_leaf,
        intersection: intersection,
        implies: implies,
        test: test,
    };
})();
