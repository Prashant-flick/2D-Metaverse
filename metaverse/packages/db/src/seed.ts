import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define the elements data
  const elements = [
    {
      name: 'floor-tile',
      height: 64,
      width: 64,
      ImageUrl: '/assets/floor-tile.png',
      isStatic: true,
      depth: -10
    },
    {
      name: 'table',
      height: 64,
      width: 128,
      ImageUrl: '/assets/table.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'desk',
      height: 64,
      width: 128,
      ImageUrl: '/assets/desk.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'plant',
      height: 64,
      width: 128,
      ImageUrl: '/assets/plant.png',
      isStatic: false,
      depth: 1
    },
    {
      name: 'bookshelf',
      height: 128,
      width: 128,
      ImageUrl: '/assets/bookshelf.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'whiteboard',
      height: 128,
      width: 128,
      ImageUrl: '/assets/whiteboard.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'coffeemachine',
      height: 128,
      width: 128,
      ImageUrl: '/assets/coffeemachine.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'lamp',
      height: 64,
      width: 64,
      ImageUrl: '/assets/lamp.png',
      isStatic: false,
      depth: 1
    },
    {
      name: 'carpet',
      height: 128,
      width: 128,
      ImageUrl: '/assets/carpet.png',
      isStatic: true,
      depth: -1
    },
    {
      name: 'big-table',
      height: 128,
      width: 192,
      ImageUrl: '/assets/big-table.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'chair-left',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-left.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'chair-front',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-front.png',
      isStatic: false,
      depth: 0
    }, {
      name: 'chair-back',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-back.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'chair-right',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-right.png',
      isStatic: false,
      depth: 0
    },
    {
      name: 'pond',
      height: 128,
      width: 192,
      ImageUrl: '/assets/pond.png',
      isStatic: true,
      depth: 0
    },
    {
      name: 'wall-horizontal',
      height: 64,
      width: 128,
      ImageUrl: '/assets/wall-horizontal.png',
      isStatic: true,
      depth: 0
    },
    {
      name: "wall-vertical",
      height: 64,
      width: 64,
      ImageUrl: '/assets/wall-vertical.png',
      isStatic: true,
      depth: 0
    },
    {
      name: 'grass',
      height: 64,
      width: 64,
      ImageUrl: '/assets/grass.png',
      isStatic: true,
      depth: -9
    },
  ];

  console.log('Starting to seed elements...');

  try {
    for (const element of elements) {
      const createdElement = await prisma.element.create({
        data: element,
      });
      console.log(`Created element with ID: ${createdElement.id}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.log("seeding elements failed--> ", error);
  }
}

main()