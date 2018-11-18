var Format = (function () {
    function truncate(x, n) {
        var p = x.indexOf(".");
        var on = x.length - (p + 1);
        if (p == -1)
            return x + "." + "0".repeat(n);
        if (on <= n)
            return x + "0".repeat(n - on);
        return x.substring(0, p + 1 + n);
    }
    function floor(x, n) {
        return truncate(x.toString(), n);
    }
    function round(x, n) {
        return truncate((Math.round(x * Math.pow(10, n)) * Math.pow(0.1, n)).toString(), n);
    }
    function ceil(x, n) {
        return truncate((Math.ceil(x * Math.pow(10, n)) * Math.pow(0.1, n)).toString(), n);
    }
    function formatint(x, n, s) {
        x = x.toString();
        //alert([n - x.length, s.repeat(n - x.length)]);
        return s.repeat(n - x.length) + x;
    }

    function mstos(x) {
        if (x == null) return "cannot be found";
        var d, h, m, s, ms, ret, sps = false;
        x = Math.round(x);
        if (x == 0)
            return "0";
        ms = x % 1000;
        x -= ms;
        x /= 1000;
        s = x % 60;
        x -= s;
        x /= 60;
        m = x % 60;
        x -= m;
        x /= 60;
        h = x % 24;
        x -= h;
        x /= 24;
        d = x;
        ret = "";
        if (d > 0) {
            ret += d + " days";
            sps = true;
        }
        if (h > 0 || m > 0 || s > 0 || ms > 0) {
            if (h > 0 || m > 0) {
                if (sps)
                    ret += " ";
                ret += h + ":" + formatint(m, 2, "0");
                if (s > 0 || ms > 0) {
                    ret += ":" + formatint(s, 2, "0");
                    if (ms > 0)
                        ret += "." + formatint(ms, 3, "0");
                }
            }
            else if (s > 0 || ms > 0) {
                if (sps)
                    ret += " ";
                ret += s + "." + formatint(ms, 3, "0") + "s";
            }
        }
        return ret;
    }

    return {
        truncate: truncate,
        floor: floor,
        round: round,
        ceil: ceil,
        mstos: mstos,
    };
})();