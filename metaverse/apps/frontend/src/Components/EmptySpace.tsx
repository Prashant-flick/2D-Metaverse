import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import ws from '../Utils/WsClient';

const EmptySpace: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 600,
      parent: gameRef.current || undefined,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);

    let player: Phaser.Physics.Arcade.Sprite;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    let otherPlayers: { [key: string]: Phaser.Physics.Arcade.Sprite } = {};

    function preload(this: Phaser.Scene) {
      this.load.image('avatar', '/pikachu2d.jpeg');
      this.load.image('table', '/2dtable.jpeg');
      this.load.image('chair', '/2dchair.jpeg');
    }

    function create(this: Phaser.Scene) {
      // Create player sprite
      player = this.physics.add.sprite(600, 300, 'avatar').setScale(0.2);
      // this.cameras.main.startFollow(player);

      // Add objects in the space
      this.add.image(300, 200, 'table').setScale(0.3);
      this.add.image(900, 400, 'chair').setScale(0.2);

      cursors = this.input.keyboard?.createCursorKeys()

      // Listen for messages from server
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'user-joined':
            addOtherPlayer(data.payload.userId, data.payload.x, data.payload.y, this);
            break;
          case 'move':
            updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y);
            break;
          case 'user-left':
            removeOtherPlayer(data.payload.userId);
            break;
        }
      };

      // Send 'join' event when connected
      // ws.send(
      //   JSON.stringify({
      //     type: 'join',
      //     payload: {
      //       spaceId: 'space123',
      //       token: 'YOUR_TOKEN_HERE',
      //     },
      //   })
      // );
    }

    function update(this: Phaser.Scene) {
      let moved = false;

      if (cursors.left?.isDown) {
        player.setVelocityX(-200);
        moved = true;
      } else if (cursors.right?.isDown) {
        player.setVelocityX(200);
        moved = true;
      } else {
        player.setVelocityX(0);
      }

      if (cursors.up?.isDown) {
        player.setVelocityY(-200);
        moved = true;
      } else if (cursors.down?.isDown) {
        player.setVelocityY(200);
        moved = true;
      } else {
        player.setVelocityY(0);
      }

      if (moved) {
        // ws.send(
        //   JSON.stringify({
        //     type: 'move',
        //     payload: {
        //       x: player.x,
        //       y: player.y,
        //     },
        //   })
        // );
      }
    }

    function addOtherPlayer(id: string, x: number, y: number, scene: Phaser.Scene) {
      const otherPlayer = scene.physics.add.sprite(x, y, 'avatar').setScale(0.5);
      otherPlayers[id] = otherPlayer;
    }

    function updatePlayerPosition(id: string, x: number, y: number) {
      if (otherPlayers[id]) {
        otherPlayers[id].setPosition(x, y);
      }
    }

    function removeOtherPlayer(id: string) {
      if (otherPlayers[id]) {
        otherPlayers[id].destroy();
        delete otherPlayers[id];
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} style={{ width: '100%', height: '100%' }} />;
};

export default EmptySpace;
