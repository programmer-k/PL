function Leaf(attribute, value, parents) {
    this.attribute = attribute;
    this.value = value;
    /*
    this.nodes = nodes.map(id);
    const m = nodes.reduce((p, x) => id(p, x.parents_list.forEach((y) => p[G.nodeid(y)] = y)), {});
    const l = [];
    for (const i in m) l.push(m[i]);
    this.parents = l;
    */
    this.parents = parents;
}

var GraphAnalysis = (function () {
    function extract_leaf(g) {
        var ret = g.children_list.reduce((p, v) => id(p, v.children_list.forEach((x) => ((q) => x.value.split("|").forEach((y) => (q[y] ? q[y] : q[y] = []).push(v)))(p[x.attribute] ? p[x.attribute] : p[x.attribute] = {}))), {});

        /*
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
        for (const i in ret) {
            const ri = ret[i];
            for (const j in ri) {
                ri[j] = new Leaf(j, ri[j]);
            }
        }*/
        for (const i in ret) {
            const ri = ret[i];
            for (const j in ri) {
                ri[j] = new Leaf(i, j, ri[j]);
            }
        }
        return ret;
    }
    function intersection(a, b) {
        return a.parents.filter(G.attr(b.attribute, b.value));
    }
    function implies(a, b) {
        return Test.i(intersection(a, b).length) / Test.i(a.parents.length);
    }
    function test(g) {
        var l = extract_leaf(g.children_list.find(G.valeq("food")));
        return [implies(l.activity.식사, l.emotion.긍정) * 100 + "%", implies(l.emotion.긍정, l.activity.식사) * 100 + "%"];
    }
    return {
        extract_leaf: extract_leaf,
        intersection: intersection,
        implies: implies,
        test: test,
    };
})();
