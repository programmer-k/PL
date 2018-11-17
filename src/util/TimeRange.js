//new TimeRange(Date from, Date to)
//from에서 to까지 시간 구간, 양 끝 포함
function TimeRange(from, to) {//closed range
    this.from = from;
    this.to = to;
}

//.length() => number
//TimeRange의 길이
TimeRange.prototype.length = function () { return Test.i(Math.max(0, Test.i(Test.i(this.to) - Test.i(this.from)))); };

//.contains(Date x) => boolean
//시각 x를 포함하는지 여부
TimeRange.prototype.contains = function (x) { return this.to - x >= 0 && x - this.from >= 0; };

//.isEmpty() => boolean
//TimeRange에 포함되는 원소가 없는 경우, for every x, contains(x) = false
TimeRange.prototype.isEmpty = function () { return this.to - this.from < 0; };

//TimeRange.intersection(TimeRange a, TimeRange b) => TimeRange
//a와 b의 교집합
TimeRange.intersection = (a, b) => new TimeRange((a.from - b.from > 0 ? a : b).from, (a.to - b.to < 0 ? a : b).to);//if a, b intersect

//TimeRange.union(TimeRange a, TimeRange b) => TimeRange
//a와 b의 합집합, a와 b가 intersect할 때만 사용
TimeRange.union = (a, b) => new TimeRange((a.from - b.from < 0 ? a : b).from, (a.to - b.to > 0 ? a : b).to);//if a, b intersect

//TimeRange.intersect(TimeRange a, TimeRange b) => boolean
//a와 b에 공통원소가 있는지 판단, e정도의 간격 허용
TimeRange.intersect = (a, b, e) => a.to - b.from >= -(e ? e : 0) && b.to - a.from >= -(e ? e : 0);

//TimeRange.intersection(Node g) => TimeRange
//서브그래프의 start_time, end_time을 통해 TimeRange를 생성
TimeRange.fromGraph = (g) => new TimeRange(new Date(Test.i(g).value), new Date(Test.i(g.getChildByAttr("end_time")).value));

//TimeRange.sumlength(TimeRange[] s) => number
//s의 각 원소의 길이를 합
TimeRange.sumlength = (s) => s.reduce((p, v) => p + v.length(), 0);

