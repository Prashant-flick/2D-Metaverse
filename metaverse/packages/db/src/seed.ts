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
    },
    {
      name: 'table',
      height: 64,
      width: 128,
      ImageUrl: '/assets/table.png',
      isStatic: false,
    },
    {
      name: 'desk',
      height: 64,
      width: 128,
      ImageUrl: '/assets/desk.png',
      isStatic: false,
    },
    {
      name: 'plant',
      height: 64,
      width: 128,
      ImageUrl: '/assets/plant.png',
      isStatic: false,
    },
    {
      name: 'bookshelf',
      height: 128,
      width: 128,
      ImageUrl: '/assets/bookshelf.png',
      isStatic: false,
    },
    {
      name: 'whiteboard',
      height: 128,
      width: 128,
      ImageUrl: '/assets/whiteboard.png',
      isStatic: false,
    },
    {
      name: 'coffeemachine',
      height: 128,
      width: 128,
      ImageUrl: '/assets/coffeemachine.png',
      isStatic: false,
    },
    {
      name: 'lamp',
      height: 64,
      width: 64,
      ImageUrl: '/assets/lamp.png',
      isStatic: false,
    },
    {
      name: 'carpet',
      height: 128,
      width: 128,
      ImageUrl: '/assets/carpet.png',
      isStatic: true,
    },
    {
      name: 'big-table',
      height: 128,
      width: 192,
      ImageUrl: '/assets/big-table.png',
      isStatic: false,
    },
    {
      name: 'chair-left',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-left.png',
      isStatic: false,
    }, {
      name: 'chair-front',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-front.png',
      isStatic: false,
    }, {
      name: 'chair-back',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-back.png',
      isStatic: false,
    },
    {
      name: 'chair-right',
      height: 64,
      width: 64,
      ImageUrl: '/assets/chair-right.png',
      isStatic: false,
    },
    {
      name: 'pond',
      height: 128,
      width: 192,
      ImageUrl: '/assets/pond.png',
      isStatic: true,
    },
    {
      name: 'wall-horizontal',
      height: 64,
      width: 128,
      ImageUrl: '/assets/wall-horizontal.png',
      isStatic: true,
    },
    {
      name: "wall-vertical",
      height: 64,
      width: 64,
      ImageUrl: '/assets/wall-vertical.png',
      isStatic: true
    },
    {
      name: 'grass',
      height: 64,
      width: 64,
      ImageUrl: '/assets/grass.png',
      isStatic: true,
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