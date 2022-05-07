export default class LevelScene extends Phaser.Scene {
    /**
     * Constructor
     */
    constructor() {
        super('LevelScene');
    }

    /**
     * Initialize the scene with data sent from another scene
     */
    init(data) {
        this.mode = data.mode;
        console.log("startScene: mode=" + this.mode);
    }

    /**
     * Preload assets for the scene
     */
    preload() {
        // Load level assets
        this.load.svg('levels', 'assets/svg/btn-rose.svg');
    }

    /**
     * Initialize objects for the scen
     */
    create() {
        // Thumbs variables
        var thumbRows = 4;
        var thumbCols = 4;
        var thumbWidth = 56;
        var thumbHeight = 56;
        var thumbSpacing = 100;

        // Creation of the thumbs group of level
        this.physics.add.staticGroup({ key: 'levels', frameQuantity: 0 });

        // Determining level thumbnails width and height for each page
        var levelLength = thumbWidth * thumbCols + thumbSpacing * (thumbCols - 1);
        var levelHeight = thumbWidth * thumbRows + thumbSpacing * (thumbRows - 1);

        // Horizontal offset to have level thumbnails horizontally centered in the page
        var offsetX = (this.game.config.width - levelLength) / 2;
        var offsetY = (this.game.config.height - levelHeight) / 2;

        // Looping through each level thumbnails
        for (var i = 0; i < thumbRows; i++) {
            for (var j = 0; j < thumbCols; j++) {
                // Get level number 
                var levelNumber = j + i * thumbRows;

                // Generate level thumbnail
                this.generateLevel(
                    offsetX + j * (thumbWidth + thumbSpacing),
                    offsetY + i * (thumbHeight + thumbSpacing),
                    levelNumber,
                    offsetX + j * (thumbWidth + thumbSpacing),
                    offsetY + i * (thumbHeight + thumbSpacing)
                );
            }
        }
    }

    /**
     * Generate level thumbnail
     * 
     * @param {int} widthLogo - width of level button
     * @param {int} heightLogo - height of level button
     * @param {int} levelNumber - level number data
     * @param {int} widthText - width text level
     * @param {int} heightText - height text level 
     */
    generateLevel(widthLogo, heightLogo, levelNumber, widthText, heightText) {
        // Create level logo
        var levelLogo = this.add.image(widthLogo, heightLogo, "levels");

        // Initialize event click on level logo
        levelLogo.setInteractive().once('pointerdown', function() {
            this.scene.start('GameScene', { levelNumber: levelNumber, mode: this.mode });
        }, this);

        // Add text to display number level
        var levelNumberText = this.add.text(widthText - levelLogo.width / 4.5, heightText - levelLogo.height / 4.5, this.getNumberLevel(levelNumber), {
            fontSize: '20px',
            fill: '#fff'
        });
    }

    getNumberLevel(levelNumber) {
        return (levelNumber < 10) ? '0' + levelNumber : levelNumber;
    }
}