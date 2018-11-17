
var GraphAnalysis = (function () {
    function extract_leaf(g) {
        var ret = {};
        g.children_list.forEach((x) => x.children_list.forEach((y) => y.children_list.forEach((n) =>
            (ret[n.attribute] ? ret[n.attribute] : ret[n.attribute] = {})[n.value] = n
            )));
        for (const i in ret) {
            ret[i] = [ret[i]];
        }
        //G.listValue(g, id, () => true, () => true).forEach((n) => ret[n.attribute] ? ret[n.attribute].push(n) : ret[n.attribute] = [n]);
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
