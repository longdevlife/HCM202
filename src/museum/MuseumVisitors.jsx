const SKIN = ["#e0b896", "#d4a574", "#c89b6e", "#dbb591"];
const HAIR = ["#17100b", "#24160d", "#0f0b08", "#2f2118"];
const SHIRTS = ["#efe8dc", "#d7e0d2", "#d8dfeb", "#e9d8c8", "#d9cbb6"];
const JACKETS = ["#20242b", "#2e352d", "#332d3b", "#3b3028", "#1f2d36"];
const ACCENTS = ["#b83232", "#2f5f95", "#346b45", "#9b6a24", "#6a4b8a"];
const PANTS = ["#151515", "#202028", "#2c241f", "#1b2324"];
const STANDING_SCALE = 1.75;
const SEATED_SCALE = 1.75;

function seeded(seed) {
  const value = Math.sin(seed * 9301 + 49297) * 49311;
  return value - Math.floor(value);
}

function pick(list, seed) {
  return list[Math.floor(seeded(seed) * list.length)];
}

function VisitorShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
      <circleGeometry args={[0.34, 20]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </mesh>
  );
}

function VisitorHead({ skin, hair }) {
  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.075, -0.02]} scale={[1.04, 0.54, 0.92]}>
        <sphereGeometry args={[0.13, 14, 8]} />
        <meshStandardMaterial color={hair} roughness={0.88} />
      </mesh>
      <mesh position={[-0.045, 0, 0.13]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial color="#1a120d" roughness={0.35} />
      </mesh>
      <mesh position={[0.045, 0, 0.13]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial color="#1a120d" roughness={0.35} />
      </mesh>
    </group>
  );
}

function Backpack({ color = "#223554" }) {
  return (
    <group position={[0, 0.86, -0.16]}>
      <mesh>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.76} />
      </mesh>
      <mesh position={[0, -0.05, 0.055]}>
        <boxGeometry args={[0.15, 0.12, 0.018]} />
        <meshStandardMaterial color="#18253d" roughness={0.8} />
      </mesh>
    </group>
  );
}

function VisitorStanding({
  position,
  rotation = [0, 0, 0],
  seed = 0,
  jacket = false,
  backpack = false,
}) {
  const skin = pick(SKIN, seed);
  const hair = pick(HAIR, seed + 1);
  const shirt = pick(SHIRTS, seed + 2);
  const jacketColor = pick(JACKETS, seed + 3);
  const accent = pick(ACCENTS, seed + 4);
  const pants = pick(PANTS, seed + 5);

  return (
    <group position={position} rotation={rotation} scale={STANDING_SCALE}>
      <VisitorShadow />

      <mesh position={[-0.075, 0.04, 0.04]}>
        <boxGeometry args={[0.1, 0.065, 0.17]} />
        <meshStandardMaterial color="#101010" roughness={0.85} />
      </mesh>
      <mesh position={[0.075, 0.04, 0.04]}>
        <boxGeometry args={[0.1, 0.065, 0.17]} />
        <meshStandardMaterial color="#101010" roughness={0.85} />
      </mesh>

      <mesh position={[-0.065, 0.36, 0]}>
        <capsuleGeometry args={[0.058, 0.5, 4, 8]} />
        <meshStandardMaterial color={pants} roughness={0.74} />
      </mesh>
      <mesh position={[0.065, 0.36, 0]}>
        <capsuleGeometry args={[0.058, 0.5, 4, 8]} />
        <meshStandardMaterial color={pants} roughness={0.74} />
      </mesh>

      <mesh position={[0, 0.86, 0]}>
        <capsuleGeometry args={[0.15, 0.36, 4, 10]} />
        <meshStandardMaterial
          color={jacket ? jacketColor : shirt}
          roughness={0.68}
        />
      </mesh>
      {jacket && (
        <mesh position={[0, 0.86, 0.13]}>
          <boxGeometry args={[0.07, 0.34, 0.018]} />
          <meshStandardMaterial color={shirt} roughness={0.68} />
        </mesh>
      )}
      <mesh position={[0, 0.84, 0.145]}>
        <boxGeometry args={[0.035, 0.24, 0.016]} />
        <meshStandardMaterial color={accent} roughness={0.64} />
      </mesh>

      <mesh position={[-0.17, 0.84, 0.02]} rotation={[0.05, 0, 0.06]}>
        <capsuleGeometry args={[0.042, 0.34, 4, 8]} />
        <meshStandardMaterial
          color={jacket ? jacketColor : shirt}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0.17, 0.84, 0.02]} rotation={[0.05, 0, -0.06]}>
        <capsuleGeometry args={[0.042, 0.34, 4, 8]} />
        <meshStandardMaterial
          color={jacket ? jacketColor : shirt}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[-0.185, 0.62, 0.03]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <mesh position={[0.185, 0.62, 0.03]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>

      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.045, 0.052, 0.07, 8]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <group position={[0, 1.27, 0]}>
        <VisitorHead skin={skin} hair={hair} />
      </group>

      {backpack && <Backpack />}
    </group>
  );
}

function VisitorSeated({
  position,
  rotation = [0, 0, 0],
  seed = 0,
  jacket = false,
}) {
  const skin = pick(SKIN, seed);
  const hair = pick(HAIR, seed + 1);
  const shirt = pick(SHIRTS, seed + 2);
  const jacketColor = pick(JACKETS, seed + 3);
  const accent = pick(ACCENTS, seed + 4);
  const pants = pick(PANTS, seed + 5);

  return (
    <group position={position} rotation={rotation} scale={SEATED_SCALE}>
      <VisitorShadow />

      <mesh position={[-0.065, 0.08, 0.18]} rotation={[1.42, 0, 0]}>
        <capsuleGeometry args={[0.056, 0.28, 4, 8]} />
        <meshStandardMaterial color={pants} roughness={0.76} />
      </mesh>
      <mesh position={[0.065, 0.08, 0.18]} rotation={[1.42, 0, 0]}>
        <capsuleGeometry args={[0.056, 0.28, 4, 8]} />
        <meshStandardMaterial color={pants} roughness={0.76} />
      </mesh>
      <mesh position={[-0.065, -0.16, 0.34]}>
        <capsuleGeometry args={[0.048, 0.28, 4, 8]} />
        <meshStandardMaterial color={pants} roughness={0.76} />
      </mesh>
      <mesh position={[0.065, -0.16, 0.34]}>
        <capsuleGeometry args={[0.048, 0.28, 4, 8]} />
        <meshStandardMaterial color={pants} roughness={0.76} />
      </mesh>
      <mesh position={[-0.065, -0.34, 0.37]}>
        <boxGeometry args={[0.095, 0.055, 0.145]} />
        <meshStandardMaterial color="#101010" roughness={0.85} />
      </mesh>
      <mesh position={[0.065, -0.34, 0.37]}>
        <boxGeometry args={[0.095, 0.055, 0.145]} />
        <meshStandardMaterial color="#101010" roughness={0.85} />
      </mesh>

      <mesh position={[0, 0.34, 0.02]}>
        <capsuleGeometry args={[0.15, 0.3, 4, 10]} />
        <meshStandardMaterial
          color={jacket ? jacketColor : shirt}
          roughness={0.68}
        />
      </mesh>
      <mesh position={[0, 0.32, 0.15]}>
        <boxGeometry args={[0.038, 0.2, 0.016]} />
        <meshStandardMaterial color={accent} roughness={0.64} />
      </mesh>
      <mesh position={[-0.17, 0.30, 0.02]} rotation={[0.1, 0, 0.05]}>
        <capsuleGeometry args={[0.04, 0.24, 4, 8]} />
        <meshStandardMaterial
          color={jacket ? jacketColor : shirt}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0.17, 0.30, 0.02]} rotation={[0.1, 0, -0.05]}>
        <capsuleGeometry args={[0.04, 0.24, 4, 8]} />
        <meshStandardMaterial
          color={jacket ? jacketColor : shirt}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[-0.18, 0.14, 0.04]}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 0.14, 0.04]}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>

      <mesh position={[0, 0.56, 0.01]}>
        <cylinderGeometry args={[0.045, 0.052, 0.06, 8]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <group position={[0, 0.72, 0.01]}>
        <VisitorHead skin={skin} hair={hair} />
      </group>
    </group>
  );
}

export function MuseumVisitors() {
  return (
    <group>
      <VisitorSeated
        position={[-16.45, 0.52, -0.35]}
        rotation={[0, -Math.PI / 2, 0]}
        seed={11}
        jacket
      />
      <VisitorStanding
        position={[-15.0, 0, 3.25]}
        rotation={[0, 0, 0]}
        seed={13}
        backpack
      />

      <VisitorSeated
        position={[-0.55, 0.52, -18.85]}
        rotation={[0, Math.PI, 0]}
        seed={21}
      />
      <VisitorStanding
        position={[-4.25, 0, -18.5]}
        rotation={[0, -Math.PI / 2, 0]}
        seed={23}
        jacket
      />
      <VisitorStanding
        position={[4.15, 0, -19.65]}
        rotation={[0, Math.PI / 2, 0]}
        seed={24}
      />

      <VisitorSeated
        position={[16.45, 0.52, 0.25]}
        rotation={[0, Math.PI / 2, 0]}
        seed={31}
        jacket
      />
      <VisitorStanding
        position={[15.45, 0, 3.15]}
        rotation={[0, 0, 0]}
        seed={33}
        backpack
      />
    </group>
  );
}
