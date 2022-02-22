export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }
    /**
     *   Load the game assets.
     */
    preload() {}

    /**
     *   Create the game objects (images, groups, sprites and animations).
     */
    create() {
        // Init ballon chase button
        let ballonChaseButton = this.add.text(100, 100, 'Chasse aux ballons');
        ballonChaseButton.setPadding(10);
        ballonChaseButton.setStyle({ backgroundColor: '#e55c90', fontSize: 32 });
        ballonChaseButton.setInteractive();
        ballonChaseButton.x = this.game.config.width / 2 - ballonChaseButton.width / 2;
        ballonChaseButton.y = this.game.config.height / 4 - ballonChaseButton.height / 2;

        // Init color chase button
        let colorChaseButton = this.add.text(100, 100, 'Chasse aux coleurs');
        colorChaseButton.setPadding(10);
        colorChaseButton.setStyle({ backgroundColor: '#e55c90', fontSize: 32 });
        colorChaseButton.setInteractive();
        colorChaseButton.x = this.game.config.width / 2 - colorChaseButton.width / 2;
        colorChaseButton.y = (this.game.config.height * 3) / 4 - colorChaseButton.height / 2;
        ballonChaseButton.on('pointerdown', () => {
            this.goToMainScene('balloons');
        });
        colorChaseButton.on('pointerdown', () => {
            this.goToMainScene('colors');
        });
        // Navigate to main scene passing data
        //this.goToMainScene(yourChoice);
    }

    /**
     * Go to Main scene
     */
    goToMainScene(choice) {
        this.scene.start('MainScene', { choice: choice });
    }
}
