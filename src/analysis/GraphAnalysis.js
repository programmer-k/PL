function Leaf(attribute, value, parents) {
    this.attribute = attribute;
    this.value = value;
    this.parents = parents;
}

var GraphAnalysis = (function () {
    function extract_leaf(g) {
        var ret = g.children_list.reduce((p, v) => id(p, v.children_list.forEach((x) => ((q) => x.value.split("|").forEach((y) => (q[y] ? q[y] : q[y] = []).push(v)))(p[x.attribute] ? p[x.attribute] : p[x.attribute] = {}))), {});
        for (const i in ret) {
            const ri = ret[i];
            for (const j in ri) {
                ri[j] = new Leaf(i, j, ri[j]);
            }
        }
        ret._len_ = g.children_list.length;
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

function Subgraphs(g) {
    const l = {};
    g.children_list.forEach((x) => l[x.value] = GraphAnalysis.extract_leaf(x));
    this.l = Test.i(l);
}

Subgraphs.prototype.getProb = function (c, pa, pv, qa, qv) {
    const lc = this.l && this.l[c];
    if (lc && lc[pa] && lc[pa][pv] && lc[qa] && lc[qa][qv])
        return GraphAnalysis.implies(lc[pa][pv], lc[qa][qv]);
    if (lc && lc[pa] && lc[pa][pv])
        return lc[pa][pv].parents.length / lc._len_;
    return NaN;
};

Subgraphs.prototype.printCorrelation = function (c, pa, pv, qa, qv) {
    let s = "";
    s += "P(q|p): " + this.getProb(c, pa, pv, qa, qv) + "\n";
    s += "P(q): " + this.getProb(c, qa, qv) + "\n";
    return s;
};

Subgraphs.prototype.view = function (c, pa, pv, qa, qv) {

};
