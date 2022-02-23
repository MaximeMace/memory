let balloons;
let delay = 100;
export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    init(data) {
        // Pasing your last scene choice into this.choice for the actual scene
        this.choice = data.choice;
    }
    /**
     *   Load the game assets.
     */
    preload() {
        this.load.spritesheet('balloons', 'assets/ballon-sprite.png', {
            frameWidth: 128,
            frameHeight: 128,
        });
    }

    /**
     *   Create the game objects (images, groups, sprites and animations).
     */
    create() {
        this.scaleBalloon =
            this.game.config.width > this.game.config.height
                ? this.game.config.width * 0.0001
                : this.game.config.width * 0.0002;
        balloons = this.physics.add.group();

        // Init timer for creating fruit
        this.timer = this.time.addEvent({
            delay: delay,
            callback: this.createBallon,
            callbackScope: this,
            loop: true,
            paused: false,
        });
    }

    /**
     * Here go the code to create a balloon
     */
    createBallon() {
        var balloon = balloons.create(
            Phaser.Math.Between(0 + 100, this.game.config.width - 100),
            this.game.config.height + 100,
            'balloons'
        );
        balloon.setScale(this.scaleBalloon).setScrollFactor(0);
        balloon.setFrame(Phaser.Math.Between(0, 4));
        balloon.allowGravity = true;
        balloon.setGravityY(-100);
        balloon.body.immovable = true;
    }

    /**
     *  Update the scene frame by frame, responsible for move and rotate the bird and to create and move the pipes.
     */
    update() {}
}
