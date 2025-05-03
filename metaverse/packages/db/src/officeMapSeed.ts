import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting office map seeding...');

  try {
    const officeMap = await prisma.map.create({
      data: {
        name: 'Modern Office',
        thumbnail: '/thumbnail_office.png',
        dimensions: '1800x1800',
      }
    });

    console.log(`Created office map with ID: ${officeMap.id}`);

    const elements = await prisma.element.findMany();

    const elementMap = elements.reduce((acc, element) => {
      acc[element.name] = element.id;
      return acc;
    }, {} as Record<string, string>);

    const mapElements = [

      ...generatePerimeterWalls(1800, 1800, elementMap['wall'], elementMap['wall-left']),

      { elementId: elementMap['floor-tile'], x: 0, y: 0 },
      { elementId: elementMap['big-table'], x: 300, y: 300 },
      { elementId: elementMap['chair-front'], x: 280, y: 220 },
      { elementId: elementMap['chair-front'], x: 360, y: 220 },
      { elementId: elementMap['chair-front'], x: 440, y: 220 },
      { elementId: elementMap['chair-left'], x: 220, y: 260 },
      { elementId: elementMap['chair-left'], x: 220, y: 340 },
      { elementId: elementMap['chair-front'], x: 280, y: 380 },
      { elementId: elementMap['chair-front'], x: 360, y: 380 },
      { elementId: elementMap['chair-front'], x: 440, y: 380 },
      { elementId: elementMap['whiteboard'], x: 500, y: 150 },
      { elementId: elementMap['lamp'], x: 500, y: 300 },
      { elementId: elementMap['carpet'], x: 300, y: 300 },

      { elementId: elementMap['coffeemachine'], x: 1500, y: 200 },
      { elementId: elementMap['table'], x: 1500, y: 350 },
      { elementId: elementMap['chair-front'], x: 1470, y: 300 },
      { elementId: elementMap['chair-front'], x: 1530, y: 300 },
      { elementId: elementMap['chair-front'], x: 1470, y: 400 },
      { elementId: elementMap['chair-front'], x: 1530, y: 400 },
      { elementId: elementMap['carpet'], x: 1500, y: 300 },
      { elementId: elementMap['plant'], x: 1650, y: 200 },

      { elementId: elementMap['desk'], x: 300, y: 700 },
      { elementId: elementMap['chair-front'], x: 300, y: 780 },
      { elementId: elementMap['lamp'], x: 250, y: 700 },
      { elementId: elementMap['desk'], x: 500, y: 700 },
      { elementId: elementMap['chair-front'], x: 500, y: 780 },
      { elementId: elementMap['lamp'], x: 450, y: 700 },
      { elementId: elementMap['desk'], x: 300, y: 900 },
      { elementId: elementMap['chair-front'], x: 300, y: 980 },
      { elementId: elementMap['lamp'], x: 250, y: 900 },
      { elementId: elementMap['desk'], x: 500, y: 900 },
      { elementId: elementMap['chair-front'], x: 500, y: 980 },
      { elementId: elementMap['lamp'], x: 450, y: 900 },
      { elementId: elementMap['plant'], x: 400, y: 600 },

      // Cluster 2
      { elementId: elementMap['desk'], x: 900, y: 700 },
      { elementId: elementMap['chair-front'], x: 900, y: 780 },
      { elementId: elementMap['lamp'], x: 850, y: 700 },
      { elementId: elementMap['desk'], x: 1100, y: 700 },
      { elementId: elementMap['chair-front'], x: 1100, y: 780 },
      { elementId: elementMap['lamp'], x: 1050, y: 700 },
      { elementId: elementMap['desk'], x: 900, y: 900 },
      { elementId: elementMap['chair-front'], x: 900, y: 980 },
      { elementId: elementMap['lamp'], x: 850, y: 900 },
      { elementId: elementMap['desk'], x: 1100, y: 900 },
      { elementId: elementMap['chair-front'], x: 1100, y: 980 },
      { elementId: elementMap['lamp'], x: 1050, y: 900 },
      { elementId: elementMap['plant'], x: 1000, y: 600 },

      // Cluster 3
      { elementId: elementMap['desk'], x: 1500, y: 700 },
      { elementId: elementMap['chair-front'], x: 1500, y: 780 },
      { elementId: elementMap['lamp'], x: 1450, y: 700 },
      { elementId: elementMap['desk'], x: 1300, y: 700 },
      { elementId: elementMap['chair-front'], x: 1300, y: 780 },
      { elementId: elementMap['lamp'], x: 1250, y: 700 },
      { elementId: elementMap['desk'], x: 1500, y: 900 },
      { elementId: elementMap['chair-front'], x: 1500, y: 980 },
      { elementId: elementMap['lamp'], x: 1450, y: 900 },
      { elementId: elementMap['desk'], x: 1300, y: 900 },
      { elementId: elementMap['chair-front'], x: 1300, y: 980 },
      { elementId: elementMap['lamp'], x: 1250, y: 900 },
      { elementId: elementMap['plant'], x: 1600, y: 800 },

      // Executive area (bottom section)
      { elementId: elementMap['big-table'], x: 300, y: 1500 },
      { elementId: elementMap['chair-front'], x: 300, y: 1600 },
      { elementId: elementMap['plant'], x: 150, y: 1500 },
      { elementId: elementMap['bookshelf'], x: 500, y: 1500 },
      { elementId: elementMap['carpet'], x: 300, y: 1500 },

      // Relaxation area (bottom right)
      { elementId: elementMap['carpet'], x: 1500, y: 1500 },
      { elementId: elementMap['table'], x: 1500, y: 1500 },
      { elementId: elementMap['chair-front'], x: 1450, y: 1450 },
      { elementId: elementMap['chair-front'], x: 1550, y: 1450 },
      { elementId: elementMap['chair-front'], x: 1450, y: 1550 },
      { elementId: elementMap['chair-front'], x: 1550, y: 1550 },
      { elementId: elementMap['plant'], x: 1650, y: 1500 },
      { elementId: elementMap['plant'], x: 1350, y: 1500 },

      // Bookshelves along walls
      { elementId: elementMap['bookshelf'], x: 128, y: 400 },
      { elementId: elementMap['bookshelf'], x: 128, y: 550 },
      { elementId: elementMap['bookshelf'], x: 128, y: 700 },
      { elementId: elementMap['bookshelf'], x: 1672, y: 400 },
      { elementId: elementMap['bookshelf'], x: 1672, y: 550 },
      { elementId: elementMap['bookshelf'], x: 1672, y: 700 },

      // Small garden area at the bottom-center
      { elementId: elementMap['pond'], x: 900, y: 1500 },
      { elementId: elementMap['grass'], x: 800, y: 1400 },
      { elementId: elementMap['grass'], x: 900, y: 1400 },
      { elementId: elementMap['grass'], x: 1000, y: 1400 },
      { elementId: elementMap['grass'], x: 800, y: 1500 },
      { elementId: elementMap['grass'], x: 1000, y: 1500 },
      { elementId: elementMap['grass'], x: 800, y: 1600 },
      { elementId: elementMap['grass'], x: 900, y: 1600 },
      { elementId: elementMap['grass'], x: 1000, y: 1600 },
      { elementId: elementMap['plant'], x: 800, y: 1400 },
      { elementId: elementMap['plant'], x: 1000, y: 1400 },

      // Additional whiteboards
      { elementId: elementMap['whiteboard'], x: 700, y: 800 },
      { elementId: elementMap['whiteboard'], x: 1300, y: 1200 },

      // More seating areas
      { elementId: elementMap['chair-left'], x: 700, y: 1100 },
      { elementId: elementMap['chair-left'], x: 700, y: 1200 },
      { elementId: elementMap['table'], x: 800, y: 1150 },
    ];

    // Create all map elements
    console.log('Creating map elements...');
    for (const mapElement of mapElements) {
      await prisma.mapElements.create({
        data: {
          mapId: officeMap.id,
          ...mapElement
        }
      });
    }

    console.log(`Created ${mapElements.length} map elements for the office`);
    console.log('Office map seeding completed successfully!');
  } catch (error) {
    console.log("office map creation failed--> ", error)
  }
}

// Helper function to generate floor tiles in a grid pattern
// function generateFloorTiles(width: number, height: number, floorTileId: string) {
//   const tiles = [];
//   const tileSize = 64; // Size of the floor tile

//   for (let x = 0; x < width; x += tileSize) {
//     for (let y = 0; y < height; y += tileSize) {
//       tiles.push({
//         elementId: floorTileId,
//         x,
//         y
//       });
//     }
//   }

//   return tiles;
// }

// Helper function to generate perimeter walls
function generatePerimeterWalls(width: number, height: number, wallId: string, wallLeftId: string) {
  const walls = [];
  const wallWidth = 64;

  // Top and bottom walls
  for (let x = 0; x < width; x += wallWidth) {
    walls.push({
      elementId: wallId,
      x,
      y: 0
    });
    walls.push({
      elementId: wallId,
      x,
      y: height - wallWidth
    });
  }

  // Left and right walls
  for (let y = wallWidth; y < height - wallWidth; y += wallWidth) {
    walls.push({
      elementId: wallLeftId,
      x: 0,
      y
    });
    walls.push({
      elementId: wallLeftId,
      x: width - wallWidth,
      y
    });
  }

  return walls;
}

main();