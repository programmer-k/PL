//new TimeRange(Date from, Date to)
//from���� to���� �ð� ����, �� �� ����
function TimeRange(from, to) {//closed range
    this.from = from;
    this.to = to;
}

//.length() => number
//TimeRange�� ����
TimeRange.prototype.length = function () { return Test.i(Math.max(0, Test.i(Test.i(this.to) - Test.i(this.from)))); };

//.contains(Date x) => boolean
//�ð� x�� �����ϴ��� ����
TimeRange.prototype.contains = function (x) { return this.to - x >= 0 && x - this.from >= 0; };

//.isEmpty() => boolean
//TimeRange�� ���ԵǴ� ���Ұ� ���� ���, for every x, contains(x) = false
TimeRange.prototype.isEmpty = function () { return this.to - this.from < 0; };

//TimeRange.intersection(TimeRange a, TimeRange b) => TimeRange
//a�� b�� ������
TimeRange.intersection = (a, b) => new TimeRange((a.from - b.from > 0 ? a : b).from, (a.to - b.to < 0 ? a : b).to);//if a, b intersect

//TimeRange.union(TimeRange a, TimeRange b) => TimeRange
//a�� b�� ������, a�� b�� intersect�� ���� ���
TimeRange.union = (a, b) => new TimeRange((a.from - b.from < 0 ? a : b).from, (a.to - b.to > 0 ? a : b).to);//if a, b intersect

//TimeRange.intersect(TimeRange a, TimeRange b) => boolean
//a�� b�� ������Ұ� �ִ��� �Ǵ�, e������ ���� ���
TimeRange.intersect = (a, b, e) => a.to - b.from >= -(e ? e : 0) && b.to - a.from >= -(e ? e : 0);

//TimeRange.intersection(Node g) => TimeRange
//����׷����� start_time, end_time�� ���� TimeRange�� ����
TimeRange.fromGraph = (g) => new TimeRange(new Date(Test.i(g).value), new Date(Test.i(g.getChildByAttr("end_time")).value));

//TimeRange.sumlength(TimeRange[] s) => number
//s�� �� ������ ���̸� ��
TimeRange.sumlength = (s) => s.reduce((p, v) => p + v.length(), 0);

