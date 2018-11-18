function Leaf(attribute, value, parents) {
    this.leafs = [this];
    this.attribute = attribute;
    this.value = value;
    this.parents = parents;
    this.pmap = parents.reduce((p, v) => id(p, p[G.nodeid(v)] = v), {});
}
Leaf.getPMap = function (a) {
    const s = {};
    a.forEach((x) => x.parents.forEach((y) => s[G.nodeid(y)] = y));
    return s;
}
Leaf.getParents = function (a) {
    return Leaf.getParentsFromMap(Leaf.getPMap(a));
}
Leaf.getParentsFromMap = function (s) {
    const ret = [];
    for (const i in s) {
        ret.push(s[i]);
    }
    return ret;
}

function LeafGroup(l, a, v) {
    const vs = v.split("|");
    let leafs = [];
    this.attribute = a;
    this.values = vs;
    if (l && l[a]) {
        leafs = vs.map((x) => l[a][x]).filter(id);
    }
    this.leafs = leafs;
    this.pmap = Leaf.getPMap(leafs);
    this.parents = Leaf.getParentsFromMap(this.pmap);
}

var GraphAnalysis = (function () {
    function extract_leaf(g) {
        var ret = g.children_list.reduce((p, v) => id(p, v.children_list.forEach((x) =>
            x.attribute == "end_time"
                ? ((t) => {
                    const q = p.time || (p.time = new Array(24));
                    const from = Math.ceil(t.from / 3600000 - 0.5), to = Math.round(t.to / 3600000);
                    let rev = t.from > t.to;
                    for (let i = from; rev || i < to; i++) {
                        if (i == 24) {
                            rev = false;
                            i %= 24;
                        }
                        (q[i] || (q[i] = [])).push(v);
                    }
                })(TimeSchedule.fromDate(new Date(v.value), new Date(x.value)))
                : ((q) => x.value.split("|").forEach((y) => (q[y] ? q[y] : q[y] = []).push(v)))(p[x.attribute] ? p[x.attribute] : p[x.attribute] = {})
            ))
            , {});
        for (const i in ret) {
            const ri = ret[i];
            for (const j in ri) {
                ri[j] = new Leaf(i, j, ri[j]);
            }
        }
        ret._len_ = g.children_list.length;
        ret._root_ = g;
        return ret;
    }
    function intersection(a, b) {
        return a.parents.filter((x) => b.pmap[G.nodeid(x)]);
    }
    function implies(a, b) {
        return intersection(a, b).length / a.parents.length;
    }
    return {
        extract_leaf: extract_leaf,
        intersection: intersection,
        implies: implies,
    };
})();

function Subgraphs(g) {
    const l = {};
    g.children_list.forEach((x) => l[x.value] = GraphAnalysis.extract_leaf(x));
    this.l = l;
}

Subgraphs.prototype.getProb = function (c, pa, pv, qa, qv) {
    const lc = this.l && this.l[c];
    if (lc) {
        const p = pa && new LeafGroup(lc, pa, pv);
        const q = qa && new LeafGroup(lc, qa, qv);
        if (p && q)
            return GraphAnalysis.implies(p, q);
        if (p || q)
            return (p || q).parents.length / lc._len_;
    }
    return NaN;
};

Subgraphs.prototype.printCorrelation = function (c, pa, pv, qa, qv) {
    let s = "";
    s += "P(q|p): " + this.getProb(c, pa, pv, qa, qv) + "\n";
    s += "P(q): " + this.getProb(c, qa, qv) + "\n";
    return s;
};

Subgraphs.prototype.graph = function (c, pa, pv, qa, qv) {
    const V = [], E = [];
    const lc = this.l && this.l[c];
    if (lc) {
        const r = lc._root_;
        const p = new LeafGroup(lc, pa, pv);
        const q = new LeafGroup(lc, qa, qv);
        V.push(r);
        p.leafs.forEach((x) => V.push(x));
        q.leafs.forEach((x) => V.push(x));
        GraphAnalysis.intersection(p, q).forEach((x) => {
            V.push(x);
            E.push(new Edge(r, x));
            p.leafs.forEach((y) => y.pmap[G.nodeid(x)] && E.push(new Edge(x, y)));
            q.leafs.forEach((y) => y.pmap[G.nodeid(x)] && E.push(new Edge(x, y)));
        });
    }
    else {
        V.push(new Node("_", "ERROR"));
    }
    return { v: V, e: E };
};
