import { ZODIAC_DATA } from '../../utils/helpers';

/**
 * North Indian Style Kundli Chart (Diamond/Square format)
 * SVG-based birth chart visualization
 */
export default function BirthChart({ dateOfBirth, timeOfBirth, zodiacSign }) {
  // Get zodiac index (0-11) and determine house placements
  const zodiacOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascendantIndex = zodiacOrder.indexOf(zodiacSign) || 0;

  // Simplified planetary positions based on date of birth
  const getPlanets = () => {
    if (!dateOfBirth) return [];
    const date = new Date(dateOfBirth);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    // Approximate planetary positions (simplified for demo)
    return [
      { name: 'Su', fullName: 'Sun', house: (Math.floor(dayOfYear / 30.44)) % 12 },
      { name: 'Mo', fullName: 'Moon', house: (Math.floor(dayOfYear / 2.2) + 3) % 12 },
      { name: 'Ma', fullName: 'Mars', house: (Math.floor(dayOfYear / 58) + 7) % 12 },
      { name: 'Me', fullName: 'Mercury', house: (Math.floor(dayOfYear / 28) + 1) % 12 },
      { name: 'Ju', fullName: 'Jupiter', house: (Math.floor(dayOfYear / 361) + 5) % 12 },
      { name: 'Ve', fullName: 'Venus', house: (Math.floor(dayOfYear / 225) + 2) % 12 },
      { name: 'Sa', fullName: 'Saturn', house: (Math.floor(dayOfYear / 370) + 9) % 12 },
      { name: 'Ra', fullName: 'Rahu', house: (Math.floor(dayOfYear / 230) + 10) % 12 },
      { name: 'Ke', fullName: 'Ketu', house: (Math.floor(dayOfYear / 230) + 4) % 12 },
    ];
  };

  const planets = getPlanets();

  // North Indian chart layout — diamond positions
  // House layout (North Indian style):
  //        [12]  [1]   [2]
  //   [11]              [3]
  //   [10]              [4]
  //        [9]   [8]   [5]
  //              [7]
  //              [6]

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const outerSize = 130;

  // Define the 12 house positions in North Indian diamond chart
  // Each house is a triangle/quadrilateral region
  const housePositions = [
    // House 1 (Ascendant) - Top center
    { labelX: cx, labelY: cy - 75, planetX: cx, planetY: cy - 55 },
    // House 2 - Top right
    { labelX: cx + 65, labelY: cy - 75, planetX: cx + 65, planetY: cy - 55 },
    // House 3 - Right top
    { labelX: cx + 95, labelY: cy - 25, planetX: cx + 95, planetY: cy - 10 },
    // House 4 - Right center
    { labelX: cx + 95, labelY: cy + 25, planetX: cx + 95, planetY: cy + 40 },
    // House 5 - Right bottom
    { labelX: cx + 65, labelY: cy + 75, planetX: cx + 65, planetY: cy + 55 },
    // House 6 - Bottom center right
    { labelX: cx + 15, labelY: cy + 90, planetX: cx + 15, planetY: cy + 75 },
    // House 7 - Bottom center
    { labelX: cx, labelY: cy + 75, planetX: cx - 15, planetY: cy + 90 },
    // House 8 - Bottom left
    { labelX: cx - 65, labelY: cy + 75, planetX: cx - 65, planetY: cy + 55 },
    // House 9 - Left bottom
    { labelX: cx - 95, labelY: cy + 25, planetX: cx - 95, planetY: cy + 40 },
    // House 10 - Left center
    { labelX: cx - 95, labelY: cy - 25, planetX: cx - 95, planetY: cy - 10 },
    // House 11 - Left top
    { labelX: cx - 65, labelY: cy - 75, planetX: cx - 65, planetY: cy - 55 },
    // House 12 - Top left
    { labelX: cx - 15, labelY: cy - 90, planetX: cx - 15, planetY: cy - 75 },
  ];

  // Get planets in each house (adjusted from ascendant)
  const getHousePlanets = (houseNum) => {
    const adjustedHouse = (houseNum + ascendantIndex) % 12;
    return planets.filter(p => p.house === adjustedHouse);
  };

  // Get zodiac sign for house
  const getHouseSign = (houseNum) => {
    const signIndex = (houseNum + ascendantIndex) % 12;
    return zodiacOrder[signIndex];
  };

  return (
    <div className="birth-chart-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background glow */}
        <defs>
          <radialGradient id="chartGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(108,99,255,0.1)" />
            <stop offset="100%" stopColor="rgba(108,99,255,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={outerSize} fill="url(#chartGlow)" />

        {/* Outer diamond */}
        <polygon
          points={`${cx},${cy - outerSize} ${cx + outerSize},${cy} ${cx},${cy + outerSize} ${cx - outerSize},${cy}`}
          fill="none"
          stroke="rgba(108,99,255,0.4)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* Inner diamond */}
        <polygon
          points={`${cx},${cy - outerSize/2.2} ${cx + outerSize/2.2},${cy} ${cx},${cy + outerSize/2.2} ${cx - outerSize/2.2},${cy}`}
          fill="none"
          stroke="rgba(108,99,255,0.25)"
          strokeWidth="1"
        />

        {/* Cross lines */}
        <line x1={cx} y1={cy - outerSize} x2={cx - outerSize} y2={cy} stroke="rgba(108,99,255,0.2)" strokeWidth="0.5" />
        <line x1={cx} y1={cy - outerSize} x2={cx + outerSize} y2={cy} stroke="rgba(108,99,255,0.2)" strokeWidth="0.5" />
        <line x1={cx} y1={cy + outerSize} x2={cx - outerSize} y2={cy} stroke="rgba(108,99,255,0.2)" strokeWidth="0.5" />
        <line x1={cx} y1={cy + outerSize} x2={cx + outerSize} y2={cy} stroke="rgba(108,99,255,0.2)" strokeWidth="0.5" />

        {/* Diagonal cross */}
        <line x1={cx - outerSize} y1={cy} x2={cx + outerSize} y2={cy} stroke="rgba(108,99,255,0.2)" strokeWidth="0.5" />
        <line x1={cx} y1={cy - outerSize} x2={cx} y2={cy + outerSize} stroke="rgba(108,99,255,0.2)" strokeWidth="0.5" />

        {/* House labels and planets */}
        {housePositions.map((pos, i) => {
          const housePlanets = getHousePlanets(i);
          const sign = getHouseSign(i);
          const signData = ZODIAC_DATA[sign];

          return (
            <g key={i}>
              {/* Zodiac symbol */}
              <text
                x={pos.labelX}
                y={pos.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={i === 0 ? '#ffd700' : 'rgba(108,99,255,0.6)'}
                fontSize={i === 0 ? 14 : 11}
                fontWeight={i === 0 ? 'bold' : 'normal'}
              >
                {signData?.symbol || ''}
              </text>

              {/* Planets */}
              {housePlanets.map((planet, pi) => (
                <text
                  key={planet.name}
                  x={pos.planetX + (pi % 3) * 18 - 12}
                  y={pos.planetY + Math.floor(pi / 3) * 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#e8e6f0"
                  fontSize={9}
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {planet.name}
                </text>
              ))}
            </g>
          );
        })}

        {/* Ascendant marker */}
        <text
          x={cx}
          y={cy - outerSize - 10}
          textAnchor="middle"
          fill="#ffd700"
          fontSize={10}
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          Asc
        </text>

        {/* Center label */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(108,99,255,0.5)"
          fontSize={10}
          fontFamily="Outfit, sans-serif"
          fontWeight="600"
        >
          KUNDLI
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,215,0,0.6)"
          fontSize={9}
          fontFamily="Inter, sans-serif"
        >
          {zodiacSign}
        </text>
      </svg>
    </div>
  );
}
