// Tile map of the U.S.: one square per state, the lending states in gold.
const TILES: [string, number, number][] = [
  ['AK', 0, 0], ['ME', 11, 0],
  ['VT', 10, 1], ['NH', 11, 1],
  ['WA', 1, 2], ['ID', 2, 2], ['MT', 3, 2], ['ND', 4, 2], ['MN', 5, 2], ['IL', 6, 2], ['WI', 7, 2], ['MI', 8, 2], ['NY', 9, 2], ['RI', 10, 2], ['MA', 11, 2],
  ['OR', 1, 3], ['NV', 2, 3], ['WY', 3, 3], ['SD', 4, 3], ['IA', 5, 3], ['IN', 6, 3], ['OH', 7, 3], ['PA', 8, 3], ['NJ', 9, 3], ['CT', 10, 3],
  ['CA', 1, 4], ['UT', 2, 4], ['CO', 3, 4], ['NE', 4, 4], ['MO', 5, 4], ['KY', 6, 4], ['WV', 7, 4], ['VA', 8, 4], ['MD', 9, 4], ['DE', 10, 4],
  ['AZ', 2, 5], ['NM', 3, 5], ['KS', 4, 5], ['AR', 5, 5], ['TN', 6, 5], ['NC', 7, 5], ['SC', 8, 5], ['DC', 9, 5],
  ['OK', 4, 6], ['LA', 5, 6], ['MS', 6, 6], ['AL', 7, 6], ['GA', 8, 6],
  ['HI', 0, 7], ['TX', 4, 7], ['FL', 9, 7],
];

export default function StateMap({ states, label }: { states: string[]; label: string }) {
  const on = new Set(states.map((s) => s.toUpperCase()));
  const S = 44;
  const G = 4;
  return (
    <svg className="statemap" viewBox={`0 0 ${12 * (S + G)} ${8 * (S + G)}`} role="img" aria-label={`${label}: ${[...on].join(', ')}`}>
      {TILES.map(([st, x, y]) => {
        const lit = on.has(st);
        return (
          <g key={st} transform={`translate(${x * (S + G)} ${y * (S + G)})`}>
            <rect width={S} height={S} rx="6" className={lit ? 'tile tile-on' : 'tile'} />
            <text x={S / 2} y={S / 2 + 5} textAnchor="middle" className={lit ? 'tile-t tile-t-on' : 'tile-t'}>
              {st}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
