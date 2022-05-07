/**
 * Global variables for game options
 */
export const gameOptions = {
    listNumber: [],
    clickedElementCounter: [],
    matriceCard: [],
    notVerified: true,
    validateCard: 0,
}

/**
 * Global Variables for the different levels
 */
export const levelParams = {
    configLevel: [
        { numberCard: 6, pairNumber: 2, thumbRows: 2, thumbCols: 3 },
        { numberCard: 10, pairNumber: 2, thumbRows: 2, thumbCols: 5 },
        { numberCard: 14, pairNumber: 2, thumbRows: 2, thumbCols: 7 },
        { numberCard: 18, pairNumber: 2, thumbRows: 3, thumbCols: 6 },
        { numberCard: 24, pairNumber: 2, thumbRows: 4, thumbCols: 6 },
        { numberCard: 28, pairNumber: 2, thumbRows: 4, thumbCols: 7 },
        { numberCard: 30, pairNumber: 2, thumbRows: 5, thumbCols: 6 },
        { numberCard: 6, pairNumber: 3, thumbRows: 2, thumbCols: 3 },
        { numberCard: 12, pairNumber: 3, thumbRows: 3, thumbCols: 4 },
        { numberCard: 18, pairNumber: 3, thumbRows: 3, thumbCols: 6 },
        { numberCard: 24, pairNumber: 3, thumbRows: 4, thumbCols: 6 },
        { numberCard: 30, pairNumber: 3, thumbRows: 5, thumbCols: 6 },
        { numberCard: 8, pairNumber: 4, thumbRows: 2, thumbCols: 4 },
        { numberCard: 16, pairNumber: 4, thumbRows: 4, thumbCols: 4 },
        { numberCard: 24, pairNumber: 4, thumbRows: 4, thumbCols: 6 },
        { numberCard: 28, pairNumber: 4, thumbRows: 4, thumbCols: 7 },
    ],
    levelNumber: 0,
}

export default class GameScene extends Phaser.Scene {
    /**
     * Constructor
     */
    constructor() {
        super('GameScene');
    }

    /**
     * Init the scene with data sent from another scene
     */
    init(data) {
        this.mode = data.mode;
        this.levelNumber = data.levelNumber;
        console.log("GameScene: mode=" + this.mode);
        console.log("GameScene: levelNumber=" + this.levelNumber);

    }

    /**
     * Load the game assets.
     */
    preload() {
        // Load blue cards mode
        this.load.spritesheet('card-blue', './assets/card-blue.png', {
            frameWidth: 200.25,
            frameHeight: 243
        });

        // Load rose cards mode
        this.load.spritesheet('card-rose', './assets/card-rose.png', {
            frameWidth: 200.25,
            frameHeight: 243
        });
    }

    /**
     * Create and init assets
     */
    create() {
        // Save level number in global var
        levelParams.levelNumber = this.levelNumber;
        console.log(levelParams.configLevel[this.levelNumber]);

        // Generate matrix of value based on level parameters
        for (let i = 1; i <= levelParams.configLevel[levelParams.levelNumber]['numberCard'] / levelParams.configLevel[levelParams.levelNumber]['pairNumber']; i++) {
            for (let j = 0; j < levelParams.configLevel[levelParams.levelNumber]['pairNumber']; j++) {
                gameOptions.listNumber.push(i);
            }
        }

        // Shuffle matrix of cards
        let shuffledListNumber = this.shuffleArray(gameOptions.listNumber);

        // Count generated card
        let counter = 0;

        // Generate card on rows and cols
        for (let j = 1; j <= levelParams.configLevel[levelParams.levelNumber]['thumbRows']; j++) {
            for (let i = 1; i <= levelParams.configLevel[levelParams.levelNumber]['thumbCols']; i++) {
                // Generator of card
                this.generateCard(
                    this.game.config.width / 2 + 100 * (levelParams.configLevel[levelParams.levelNumber]['thumbCols'] / 2 - i + 1 / 2),
                    this.game.config.height / 2 + 125 * (levelParams.configLevel[levelParams.levelNumber]['thumbRows'] / 2 - j + 1 / 2),
                    shuffledListNumber[counter], counter);
                // Validate one count card
                counter++
            }
        }

        // Display rule of the game
        var textRule = "Trouver les paires de " + levelParams.configLevel[levelParams.levelNumber]['pairNumber'] + " cardes en un minimum d'essais !";
        this.ruleTest = this.add.text(25, 25, textRule, {
            fontSize: '20px',
            fill: '#000000'
        });
        this.ruleTest.x = this.game.config.width / 2 - this.ruleTest.width / 2;
    }

    /**
     *  Update the scene frame by frame
     */
    update() {
        // Check if the cards are similar
        this.checkSuccess();
    }


    /**
     * Shuffle value on an array
     * 
     * @param {int[]} array - array to shuffle 
     * @returns 
     */
    shuffleArray(array) {
        let currentId = array.length;
        // There remain elements to shuffle
        while (0 !== currentId) {
            // Pick a remaining element
            let randId = Math.floor(Math.random() * currentId);
            currentId -= 1;
            // Swap it with the current element.
            let tmp = array[currentId];
            array[currentId] = array[randId];
            array[randId] = tmp;
        }
        return array;
    }

    /**
     * Generate card 
     * 
     * @param {int} width - width of card
     * @param {int} height - height of card
     * @param {int} cardType - card type data
     * @param {int} idCard - id of card
     */
    generateCard(width, height, cardType, idCard) {
        // Create visual card
        var card = this.physics.add.sprite(width, height, this.mode == 'blue' ? 'card-blue' : 'card-rose', cardType);
        card.setScale(.5);

        // Create visual back card
        var cardHide = this.physics.add.sprite(width, height, this.mode == 'blue' ? 'card-blue' : 'card-rose', 0).setInteractive();
        cardHide.setScale(.5);

        // Initialize event click on back card
        cardHide.on('pointerdown', function() {
            // If user doesn't reveal too much card
            if (gameOptions.clickedElementCounter.length < levelParams.configLevel[levelParams.levelNumber]['pairNumber']) {
                // Disable back card to reveal card
                cardHide.visible = false;
                // Add card to reveal card array
                gameOptions.clickedElementCounter.push({ idCard: idCard, cardType: cardType });
            }
        });

        // Add card to matrix of card
        gameOptions.matriceCard.push({ idCard: idCard, card: card, cardHide: cardHide });
    }


    /**
     * Validate if a pair of cards are successful
     */
    checkSuccess() {
        // Verify if reveal card count is true and not verification was made
        if (gameOptions.clickedElementCounter.length >= levelParams.configLevel[levelParams.levelNumber]['pairNumber'] && gameOptions.notVerified) {
            // Verification is in process
            gameOptions.notVerified = false;

            // Variable to validate if cards are similar
            let isSameCard = true;

            // For each card verify if it's not similar
            for (let j = 1; j < levelParams.configLevel[levelParams.levelNumber]['pairNumber']; j++) {
                if (gameOptions.clickedElementCounter[j]['cardType'] != gameOptions.clickedElementCounter[j - 1]['cardType']) {
                    isSameCard = false;
                }
            }

            // If cards are similar
            if (isSameCard) {
                // Delay to show the choice to users
                setTimeout(() => {
                    // Disable cards because it is successful
                    for (let j = 0; j < levelParams.configLevel[levelParams.levelNumber]['pairNumber']; j++) {
                        gameOptions.matriceCard[gameOptions.clickedElementCounter[j]['idCard']]['card'].visible = false;
                    }

                    // Clicked card counter to zero
                    gameOptions.clickedElementCounter =   [];
                    gameOptions.notVerified = true;

                    // Add n cards validate to the counter
                    gameOptions.validateCard += levelParams.configLevel[levelParams.levelNumber]['pairNumber'];
                    // Check if it is game over
                    this.endGame();
                }, 1500);

            } else {
                setTimeout(() => {
                    // Make back card overlap card
                    for (let j = 0; j < levelParams.configLevel[levelParams.levelNumber]['pairNumber']; j++) {
                        gameOptions.matriceCard[gameOptions.clickedElementCounter[j]['idCard']]['cardHide'].visible = true;
                    }

                    // Clicked card counter to zero
                    gameOptions.clickedElementCounter =   [];
                    gameOptions.notVerified = true;
                }, 1500);
            }
        }
    }

    /**
     * Verify context of end game
     */
    endGame() {
        // If number of card success is equal to total card number
        if (gameOptions.validateCard >= levelParams.configLevel[levelParams.levelNumber]["numberCard"]) {
            // gameOptions.clickedElementCounter = 0;
            this.scene.start('StartScene');
        }
    }
}