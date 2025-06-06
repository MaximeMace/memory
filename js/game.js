class MainScene extends Phaser.Scene {
    constructor() {
        super('main');
    }

    preload() {
        // create textures for bird and box using graphics
        const g = this.add.graphics();
        g.fillStyle(0xff0000, 1);
        g.fillCircle(20, 20, 20);
        g.generateTexture('bird', 40, 40);
        g.clear();
        g.fillStyle(0x8B4513, 1);
        g.fillRect(0, 0, 40, 40);
        g.generateTexture('box', 40, 40);
        g.destroy();
    }

    create() {
        // enable matter physics
        this.matter.world.setBounds(0, 0, 800, 600);

        // ground
        this.matter.add.rectangle(400, 590, 800, 20, { isStatic: true });

        // boxes to knock over
        this.boxes = [];
        this.boxes.push(this.matter.add.image(600, 550, 'box'));
        this.boxes.push(this.matter.add.image(640, 550, 'box'));
        this.boxes.push(this.matter.add.image(620, 510, 'box'));
        this.boxes.forEach(box => {
            box.setBody({ type: 'rectangle', width: 40, height: 40 });
            box.setFriction(0.1);
            box.setBounce(0.1);
        });

        // bird
        this.bird = this.matter.add.image(150, 520, 'bird');
        this.bird.setCircle(20);
        this.bird.setBounce(0.8);
        this.bird.setOrigin(0.5);
        this.bird.setStatic(true);

        this.slingshot = new Phaser.Math.Vector2(150, 520);
        this.isDragging = false;

        this.input.on('pointerdown', this.startDrag, this);
        this.input.on('pointermove', this.doDrag, this);
        this.input.on('pointerup', this.endDrag, this);
    }

    startDrag(pointer) {
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.bird.x, this.bird.y);
        if (dist <= 40 && this.bird.body.isStatic) {
            this.isDragging = true;
        }
    }

    doDrag(pointer) {
        if (!this.isDragging) return;
        const maxDist = 100;
        const angle = Phaser.Math.Angle.Between(this.slingshot.x, this.slingshot.y, pointer.x, pointer.y);
        let dist = Phaser.Math.Distance.Between(this.slingshot.x, this.slingshot.y, pointer.x, pointer.y);
        dist = Math.min(dist, maxDist);
        const x = this.slingshot.x + Math.cos(angle) * dist;
        const y = this.slingshot.y + Math.sin(angle) * dist;
        this.bird.setPosition(x, y);
    }

    endDrag(pointer) {
        if (!this.isDragging) return;
        this.isDragging = false;
        const dx = this.slingshot.x - this.bird.x;
        const dy = this.slingshot.y - this.bird.y;
        this.bird.setStatic(false);
        this.bird.setVelocity(dx * 0.2, dy * 0.2);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: MainScene
};

new Phaser.Game(config);
