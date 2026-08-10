/**
 * Museum Data — Sảnh trung tâm + 3 phòng nhánh (Trái / Giữa / Phải)
 *
 * Layout (top-down, z- is "forward/north"):
 *
 *                    ┌──────────────┐
 *                    │  PHÒNG GIỮA  │  z = -14 to -24
 *                    │  (center)    │
 *                    └──────┬───────┘
 *                           │
 *   ┌────────────┐   ┌──────┴───────┐   ┌────────────┐
 *   │ PHÒNG TRÁI │───│    SẢNH      │───│ PHÒNG PHẢI │
 *   │ x = -16    │   │  (lobby)     │   │  x = +16   │
 *   └────────────┘   └──────────────┘   └────────────┘
 *                     Camera starts here
 */

// Room dimensions
export const LOBBY_SIZE = { w: 20, d: 14, h: 6 };
export const ROOM_SIZE = { w: 12, d: 10, h: 6 };
export const HALLWAY_W = 4; // corridor width connecting rooms

// Room center positions
export const LOBBY_POS = [0, 0, 0];
export const ROOM_LEFT_POS = [-16, 0, 0];
export const ROOM_CENTER_POS = [0, 0, -19];
export const ROOM_RIGHT_POS = [16, 0, 0];

const rawRooms = [
  {
    id: "constitutional-legal",
    title: "Nhà nước hợp hiến, hợp pháp",
    shortTitle: "Hợp hiến, hợp pháp",
    accent: "#C5272D",
    position: ROOM_LEFT_POS,
    direction: "left",
    walls: [
      {
        id: "room1-left",
        type: "theory",
        wall: "left",
        title: "Cơ sở lý thuyết",
        heading: "Vận hành theo pháp luật",
        // visitor-left wall when entering from the lobby (south wall, facing -z)
        position: [-16, 3, 4.9],
        rotation: [0, Math.PI, 0],
        images: [
          "/museum/nhanuochophienhopphap/tuong_trai_1.png",
          "/museum/nhanuochophienhopphap/tuong_trai_2.png"
        ]
      },
      {
        id: "room1-center",
        type: "practice",
        wall: "center",
        title: "Liên hệ thực tiễn",
        heading: "Tính Hợp Hiến & Uy Tín",
        // back wall of left room (west wall, facing +x)
        position: [-21.9, 3, 0],
        rotation: [0, Math.PI / 2, 0],
        images: [
          "/museum/nhanuochophienhopphap/tuong_giua_1.png",
          "/museum/nhanuochophienhopphap/tuong_giua_2.png"
        ]
      },
      {
        id: "room1-right",
        type: "application",
        wall: "right",
        title: "Giá trị vận dụng",
        heading: "Nền tảng chính danh",
        // visitor-right wall when entering from the lobby (north wall, facing +z)
        position: [-16, 3, -4.9],
        rotation: [0, 0, 0],
        images: [
          "/museum/nhanuochophienhopphap/tuong_phai_1.png",
          "/museum/nhanuochophienhopphap/tuong_phai_2.png"
        ]
      }
    ]
  },
  {
    id: "law-supremacy",
    title: "Nhà nước thượng tôn pháp luật",
    shortTitle: "Thượng tôn pháp luật",
    accent: "#C5A028",
    position: ROOM_CENTER_POS,
    direction: "center",
    walls: [
      {
        id: "room2-left",
        type: "theory",
        wall: "left",
        title: "Cơ sở lý thuyết",
        heading: "Quản lý bằng pháp luật",
        // left wall of center room (facing +x)
        position: [-5.9, 3, -19],
        rotation: [0, Math.PI / 2, 0],
        images: [
          "/museum/nhanuocthuongtonphapluat/tuong_trai_1.png",
          "/museum/nhanuocthuongtonphapluat/tuong_trai_2.png"
        ]
      },
      {
        id: "room2-center",
        type: "practice",
        wall: "center",
        title: "Liên hệ thực tiễn",
        heading: "Đại án Vạn Thịnh Phát",
        // back wall of center room (facing +z)
        position: [0, 3, -23.9],
        rotation: [0, 0, 0],
        images: [
          "/museum/nhanuocthuongtonphapluat/tuong_giua_1.png",
          "/museum/nhanuocthuongtonphapluat/tuong_giua_2.png"
        ]
      },
      {
        id: "room2-right",
        type: "application",
        wall: "right",
        title: "Giá trị vận dụng",
        heading: "Công bằng, bình đẳng",
        // right wall of center room (facing -x)
        position: [5.9, 3, -19],
        rotation: [0, -Math.PI / 2, 0],
        images: [
          "/museum/nhanuocthuongtonphapluat/tuong_phai_1.png",
          "/museum/nhanuocthuongtonphapluat/tuong_phai_2.png"
        ]
      }
    ]
  },
  {
    id: "humanistic-rule",
    title: "Pháp quyền nhân nghĩa",
    shortTitle: "Pháp quyền nhân nghĩa",
    accent: "#6F8F4E",
    position: ROOM_RIGHT_POS,
    direction: "right",
    walls: [
      {
        id: "room3-left",
        type: "theory",
        wall: "left",
        title: "Cơ sở lý thuyết",
        heading: "Pháp luật vì con người",
        // visitor-left wall when entering from the lobby (north wall, facing +z)
        position: [16, 3, -4.9],
        rotation: [0, 0, 0],
        images: [
          "/museum/phapquyennhannghia/tuong_trai_1.png",
          "/museum/phapquyennhannghia/tuong_trai_2.png",
          "/museum/phapquyennhannghia/tuong_trai_3.png"
        ]
      },
      {
        id: "room3-center",
        type: "practice",
        wall: "center",
        title: "Liên hệ thực tiễn",
        heading: "Đặc xá & Khoan hồng",
        // back wall of right room (east wall, facing -x)
        position: [21.9, 3, 0],
        rotation: [0, -Math.PI / 2, 0],
        images: [
          "/museum/phapquyennhannghia/tuong_giua_1.png",
          "/museum/phapquyennhannghia/tuong_giua_2.png"
        ]
      },
      {
        id: "room3-right",
        type: "application",
        wall: "right",
        title: "Giá trị vận dụng",
        heading: "Kết hợp nghiêm minh & nhân đạo",
        // visitor-right wall when entering from the lobby (south wall, facing -z)
        position: [16, 3, 4.9],
        rotation: [0, Math.PI, 0],
        images: [
          "/museum/phapquyennhannghia/tuong_phai_1.png",
          "/museum/phapquyennhannghia/tuong_phai_2.png"
        ]
      }
    ]
  }
];

const panelCopyLabels = ["Tư liệu I", "Tư liệu II", "Tư liệu III", "Tư liệu IV"];

// Map images to walls
export const museumRooms = rawRooms.map(room => {
  const expandedWalls = [];
  room.walls.forEach(wall => {
    const images = wall.images || [];
    const count = images.length;
    
    // Calculate offsets based on count to center them on the wall
    const spacing = 3.4; // Distance between frames
    const startOffset = -((count - 1) * spacing) / 2;

    for (let i = 0; i < count; i++) {
      let newPos = [...wall.position];
      const isFacingX = Math.abs(Math.cos(wall.rotation[1])) < 0.01;
      
      const offset = startOffset + i * spacing;

      if (isFacingX) {
        newPos[2] -= offset * Math.sin(wall.rotation[1]); 
      } else {
        newPos[0] += offset * Math.cos(wall.rotation[1]); 
      }

      expandedWalls.push({
        ...wall,
        id: `${wall.id}-${i + 1}`,
        title: count > 1 ? `${wall.title} - ${panelCopyLabels[i]}` : wall.title,
        sequenceLabel: panelCopyLabels[i],
        position: newPos,
        imageSrc: images[i]
      });
    }
  });
  return { ...room, walls: expandedWalls };
});

export const museumPanels = museumRooms.flatMap((room) =>
  room.walls.map((wall) => ({ ...wall, roomAccent: room.accent, roomTitle: room.title, roomId: room.id }))
);

export const defaultPanel = null;

/**
 * Collision zones — array of AABB boxes {minX, maxX, minZ, maxZ}
 * Player can move freely inside these zones.
 */
export const WALKABLE_ZONES = [
  // Lobby, inset from wall edges so side rooms only connect through door zones.
  { minX: -9.2, maxX: 9.2, minZ: -6.6, maxZ: 6.6 },
  // Left doorway.
  { minX: -10.8, maxX: -9.2, minZ: -1.8, maxZ: 1.8 },
  // Left room.
  { minX: -21.2, maxX: -10.8, minZ: -4.6, maxZ: 4.6 },
  // Center hallway.
  { minX: -1.8, maxX: 1.8, minZ: -14.4, maxZ: -6.4 },
  // Center room (12 wide × 10 deep, centered at 0, -19)
  { minX: -5.6, maxX: 5.6, minZ: -23.6, maxZ: -14.4 },
  // Right doorway.
  { minX: 9.2, maxX: 10.8, minZ: -1.8, maxZ: 1.8 },
  // Right room.
  { minX: 10.8, maxX: 21.2, minZ: -4.6, maxZ: 4.6 },
];
