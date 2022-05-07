export default class EndScene extends Phaser.Scene {
    /**
     * Constructor
     */
    constructor() {
        super('EndScene');
    }

    /**
     * Load the game assets.
     */
    preload() {
        // Change color background to black
        this.cameras.main.setBackgroundColor('#000000');
    }
}