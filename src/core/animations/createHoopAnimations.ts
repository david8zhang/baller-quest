export const createHoopAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'rim-animation',
    frames: anims.generateFrameNames('rim-animation', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
