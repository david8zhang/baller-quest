export const createPlayerAnimations = (anims: Phaser.Animations.AnimationManager) => {
  // Player idle dribble
  anims.create({
    key: 'player-dribble-front',
    frames: anims.generateFrameNames('player', {
      start: 0,
      end: 3,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-dribble-side',
    frames: anims.generateFrameNames('player', {
      start: 4,
      end: 6,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-dribble-back',
    frames: anims.generateFrameNames('player', {
      start: 7,
      end: 9,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })

  // Player running with ball
  anims.create({
    key: 'player-run-front',
    frames: anims.generateFrameNames('player', {
      start: 10,
      end: 13,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-run-side',
    frames: anims.generateFrameNames('player', {
      start: 14,
      end: 17,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-run-back',
    frames: anims.generateFrameNames('player', {
      start: 26,
      end: 29,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })

  // Player shoot animations
  anims.create({
    key: 'player-shoot-side',
    frames: anims.generateFrameNames('player', {
      start: 18,
      end: 21,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
  anims.create({
    key: 'player-shoot-front',
    frames: anims.generateFrameNames('player', {
      start: 22,
      end: 23,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
  anims.create({
    key: 'player-shoot-back',
    frames: anims.generateFrameNames('player', {
      start: 30,
      end: 33,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })

  // Player pass animations
  anims.create({
    key: 'player-pass-front',
    frames: anims.generateFrameNames('player', {
      start: 34,
      end: 37,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
  anims.create({
    key: 'player-pass-side',
    frames: anims.generateFrameNames('player', {
      start: 38,
      end: 41,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
  anims.create({
    key: 'player-pass-back',
    frames: anims.generateFrameNames('player', {
      start: 42,
      end: 45,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })

  // Player run without ball
  anims.create({
    key: 'player-run-offball-side',
    frames: anims.generateFrameNames('player', {
      start: 46,
      end: 49,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-run-offball-front',
    frames: anims.generateFrameNames('player', {
      start: 50,
      end: 53,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-run-offball-back',
    frames: anims.generateFrameNames('player', {
      start: 54,
      end: 57,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })

  // player idle offball
  anims.create({
    key: 'player-idle-offball-front',
    frames: anims.generateFrameNames('player', {
      start: 58,
      end: 60,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-idle-offball-side',
    frames: anims.generateFrameNames('player', {
      start: 61,
      end: 63,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
  anims.create({
    key: 'player-idle-offball-back',
    frames: anims.generateFrameNames('player', {
      start: 58,
      end: 60,
      suffix: '.png',
    }),
    repeat: -1,
    frameRate: 10,
  })
}
