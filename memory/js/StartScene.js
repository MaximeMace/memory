export default class StartScene extends Phaser.Scene {
    /**
     * Constructor
     */
    constructor() {
        super('StartScene');
    }

    /**
     * Create and init game assets
     */
    create() {
        // Init border menu
        this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2,
            this.game.config.width * 3 / 5,
            this.game.config.height * 5 / 6,
            0xF6F6F6).setStrokeStyle(4, 0x000000);

        // Init text title menu
        // //@TODO 120 with text width
        this.titleMenu = this.add.text(this.game.config.width / 2 - 75, 120, 'MEMORY', {
            fontSize: '40px',
            fill: '#000',
        });

        // Initialize play button blue mode
        let playBtnBlue = this.add.text(100, 100, 'Play blue');
        playBtnBlue.setPadding(10);
        playBtnBlue.setStyle({ backgroundColor: '#e55c90', fontSize: 32 });
        playBtnBlue.setInteractive();
        playBtnBlue.x = this.game.config.width / 2 - playBtnBlue.width / 2;
        playBtnBlue.y = this.game.config.height / 4 - playBtnBlue.height / 2;

        // Initialize play button rose mode
        let playBtnRose = this.add.text(100, 100, 'Play rose');
        playBtnRose.setPadding(10);
        playBtnRose.setStyle({ backgroundColor: '#e55c90', fontSize: 32 });
        playBtnRose.setInteractive();
        playBtnRose.x = this.game.config.width / 2 - playBtnRose.width / 2;
        playBtnRose.y = this.game.config.height / 3;

        // Manage mode choice blue mode
        playBtnBlue.on('pointerdown', () => {
            this.goToGameScene('blue');
        });

        // Manage mode choice rose mode
        playBtnRose.on('pointerdown', () => {
            this.goToGameScene('rose');
        });
    }

    /**
     * Go to Main scene
     * 
     * @params {string} mode - choice mode
     */
    goToGameScene(mode = null) {
        this.scene.start('LevelScene', { mode: mode });
    }
}