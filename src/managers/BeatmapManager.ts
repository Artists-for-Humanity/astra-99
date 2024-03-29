const _notes: string[] = [];
const _metadata: string[] = [];
let section = '';

function getColumn(column: number) {
  switch (column) {
    case 64:
      return 0;
    case 192:
      return 1;
    case 320:
      return 2;
    case 448:
      return 3;
    default:
      return -1;
  }
}

export default function Beatmap(data: string) {
  data.split('\n').forEach((d) => {
    d = d.toString().trim();
    if (!d) return;

    if (d.includes('[')) {
      // probably not the most efficient thing in the world, but whatever
      section = d.replace('[', '').replace(']', '').toLowerCase();
    }

    switch (section) {
      case 'hitobjects':
        _notes.push(d);
        break;
      case 'metadata':
        _metadata.push(d);
    }
  });

  _notes.shift();

  return _notes.map((note) => {
    // gets each comma separated integer in the raw beatmap
    const a = note
      .split(':')[0]
      .split(',')
      .map((b) => parseInt(b));

    return {
      type: a[5] === 0 ? 'circle' : 'slider',
      startTime: a[2],
      column: getColumn(a[0]),
      endTime: a[5] === 0 ? a[2] : a[5],
    };
  });
}
