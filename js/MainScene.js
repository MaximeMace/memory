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
    preload() {}

    /**
     *   Create the game objects (images, groups, sprites and animations).
     */
    create() {}

    /**
     *  Update the scene frame by frame, responsible for move and rotate the bird and to create and move the pipes.
     */
    update() {}
}
