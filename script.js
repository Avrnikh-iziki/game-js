window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')
    canvas.width = 1500;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', (e) => {
                if (
                    (e.key == "ArrowUp" || e.key == "ArrowDown") &&
                    this.game.keys.indexOf(e.key) === -1) this.game.keys.push(e.key)
                else if (e.key == " ") this.game.player.shootTop()
                else if (e.key == "d") this.game.debag = !this.game.debag
                else if (e.key == "s") {
                    this.game.gameOver = false
                    this.game.playerLives = 10
                }
            })
            window.addEventListener('keyup', (e) => {
                if (this.game.keys.indexOf(e.key) > -1) this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
            })
        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 7;
            this.markedFordDeletion = false
            this.image = document.getElementById('projectile')
        }

        update() {
            this.x += this.speed
            if (this.x > this.game.width * .8) this.markedFordDeletion = true
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y)
        }
    }
    class Praticle {
        constructor(game, x, y) {
            this.game = game
            this.x = x
            this.y = y
            this.image = document.getElementById("gears")
            this.framex = Math.floor(Math.random() * 3)
            this.framey = Math.floor(Math.random() * 3)
            this.spritSize = 50
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1)
            this.size = this.spritSize * this.sizeModifier
            this.speedx = Math.random() * 6 - 3
            this.speedy = Math.random() * -15
            this.gravity = .5
            this.markedFordDeletion = false
            this.angle = 0
            this.va = Math.random() * 0.2 - 0.1
            this.bounced = 0
            this.bottomBounce = Math.random() * 80 + 60

        }

        udpdate() {
            this.angle += this.va
            this.speedy += this.gravity
            this.x -= this.speedx + this.game.speed;
            this.y += this.speedy
            if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedFordDeletion = true
            if (this.y > this.game.height - this.bottomBounce && this.bounced < 2) {
                this.bounced++
                this.speedy *= -0.5;
            }
        }

        draw(context) {
            context.save()
            context.translate(this.x, this.y)
            context.rotate(this.angle)
            context.drawImage(
                this.image,
                this.framex * this.spritSize,
                this.framey * this.spritSize,
                this.spritSize,
                this.spritSize,

                this.size * -0.5,
                this.size * -0.5,
                this.size,
                this.size

            )
            context.restore()

        }
    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedy = 0;
            this.framex = 0
            this.framey = 0
            this.maxFrame = 37
            this.maxSpeed = 8;
            this.projectiles = []
            this.image = document.getElementById('player')

            this.powerUp = false
            this.powerUpTimer = 0
            this.powerUpLimite = 10000
            this.lives = 10
        }
        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) this.speedy = - this.maxSpeed
            else if (this.game.keys.includes('ArrowDown')) this.speedy = this.maxSpeed;
            else this.speedy = 0;
            this.y += this.speedy;
            if (this.y > this.game.height - this.height / 2) this.y = this.game.height - this.height / 2
            if (this.y < -this.height / 2) this.y = -this.height / 2

            this.projectiles.forEach(projectile => projectile.update())
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedFordDeletion)

            if (this.framex < this.maxFrame) this.framex++
            else this.framex = 0

            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimite) {
                    this.powerUpTimer = 0;
                    this.powerUp = false
                    this.framey = 0
                } else {
                    this.powerUpTimer += deltaTime
                    this.framey = 1
                    if (this.game.amo < this.game.maxAmo * 2) this.game.amo += .1
                }
            }
        }
        draw(context) {
            if (this.game.debag) context.strokeRect(this.x, this.y, this.width, this.height)
            this.projectiles.forEach(projectile => projectile.draw(context))
            context.drawImage(
                this.image,

                this.framex * this.width,
                this.framey * this.height,
                this.width,
                this.height,

                this.x,
                this.y,
                this.width,
                this.height
            )

        }

        shootTop() {
            if (this.game.amo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
                this.game.amo--;
            }

            if (this.powerUp) this.shootButtom()
        }

        shootButtom() {
            if (this.game.amo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175))
            }
        }

        enterPowerUp() {
            this.powerUpTimer = 0
            this.powerUp = true
            if (this.game.amo < this.game.maxAmo) this.game.amo = this.game.maxAmo * 2
        }


    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedx = Math.random() * -5.5 - 0.5;
            this.markedFordDeletion = false;

            this.framx = 0
            this.framey = 0
            this.maxFrame = 37


        }
        update() {
            this.x += this.speedx - this.game.speed;
            if (this.x + this.width < 0) this.markedFordDeletion = true
            if (this.framx < this.maxFrame) {
                this.framx++
            } else {
                this.framx = 0
            }

        }

        draw(context) {
            if (this.game.debag) {
                context.strokeRect(
                    this.x,
                    this.y,
                    this.width,
                    this.height
                )
                context.fillStyle = "black"
                context.font = "20px Helvetica"
                context.fillText(
                    this.lives,
                    this.x,
                    this.y
                )
            }

            context.drawImage(
                this.image,

                this.framx * this.width,
                this.framey * this.height,
                this.width,
                this.height,

                this.x,
                this.y,
                this.width,
                this.height
            )

        }
    }
    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height)
            this.image = document.getElementById('angler1')
            this.framey = Math.floor(Math.random() * 3)
            this.lives = 2;
            this.score = this.lives

        }
    }
    class Angler2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height)
            this.image = document.getElementById('angler2')
            this.framey = Math.floor(Math.random() * 2)
            this.lives = 3;
            this.score = this.lives
        }
    }
    class LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height)
            this.image = document.getElementById('lucky')
            this.framey = Math.floor(Math.random() * 2)
            this.lives = 2;
            this.score = this.lives * 2
            this.type = "lucky"
        }
    }
    class HavieHhale extends Enemy {
        constructor(game) {
            super(game);
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.9 - this.height)
            this.image = document.getElementById('hivewhale')
            this.framey = 0
            this.lives = 15;
            this.score = this.lives
            this.type = "hivewhale"
            this.speedx = Math.random() * -1.2 - 0.2
        }
    }
    class Drons extends Enemy {
        constructor(game, x, y) {
            super(game);
            this.x = x
            this.y = y
            this.width = 115;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height)
            this.image = document.getElementById('drone')
            this.framey = Math.floor(Math.random() * 2)
            this.lives = 3;
            this.score = this.lives
            this.type = "drone"
            this.speedx = Math.random() * -4.2 - 0.5
        }
    }
    class Layer {
        constructor(game, image, spedModifier) {
            this.game = game
            this.image = image
            this.spedModifier = spedModifier
            this.width = 1768
            this.height = 500
            this.x = 0
            this.y = 0
        }

        update() {
            if (this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.spedModifier
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y)
            context.drawImage(this.image, this.x + this.width, this.y)
        }
    }
    class Backgound {
        constructor(game) {
            this.game = game
            this.image1 = document.getElementById("layer1")
            this.image2 = document.getElementById("layer2")
            this.image3 = document.getElementById("layer3")
            this.image4 = document.getElementById("layer4")

            this.layer1 = new Layer(this.game, this.image1, 0.2)
            this.layer2 = new Layer(this.game, this.image2, 0.4)
            this.layer3 = new Layer(this.game, this.image3, 1)
            this.layer4 = new Layer(this.game, this.image4, 1.5)

            this.layers = [this.layer1, this.layer2, this.layer3]
        }

        update() {
            this.layers.forEach(layer => layer.update())
        }

        draw(context) {
            this.layers.forEach(layer => layer.draw(context))
        }
    }
    class Explosion {
        constructor(game, x, y) {
            this.game = game
            this.framex = 0
            this.spritHeight = 200
            this.spritWidth = 200
            this.fps = 30
            this.timer = 0
            this.width = this.spritWidth
            this.height = this.spritHeight
            this.x = x - this.width * 0.5
            this.y = y - this.height * 0.5
            this.interval = 1000 / this.fps
            this.markedFordDeletion = false
            this.maxFrame = 8
        }

        update(deltaTime) {
            this.x -= this.game.speed
            if (this.timer > this.interval) {
                this.framex++
                this.timer = 0
            } else {
                this.timer += deltaTime
            }

            if (this.framex > this.maxFrame) this.markedFordDeletion = true
        }
        draw(context) {
            context.drawImage(
                this.image,
                this.framex * this.spritWidth,
                0,
                this.spritWidth,
                this.spritHeight,

                this.x,
                this.y,
                this.width,
                this.height
            )
        }
    }
    class SmokExposion extends Explosion {
        constructor(game, x, y) {
            super(game, x, y)
            this.image = document.getElementById('smoke')
        }
    }
    class FireExposion extends Explosion {
        constructor(game, x, y) {
            super(game, x, y)
            this.image = document.getElementById("fire")
        }
    }
    class Ui {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Bangers";
            this.color = "yellow";
        }
        draw(context) {
            context.save()
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black"
            context.fillStyle = this.color
            context.font = `${this.fontSize}px ${this.fontFamily}`

            context.fillText(
                `Score: ${this.game.score}`,
                20,
                40
            )

            const formatedTime = (this.game.gameTime * 0.001).toFixed(1)

            context.fillText(
                `Timer: ${formatedTime}`,
                20,
                65
            )
            context.fillText(
                "press 's' to Start",
                20,
                115
            )
            context.fillText(
                `Your Lives: ${this.game.playerLives}`,
                20,
                90
            )
            if (this.game.gameOver) {
                context.textAlign = "center"
                let message1
                let message2
                if (this.game.score > this.game.winingSscore) {
                    message1 = "You Win!"
                    message2 = "well done!"
                } else {
                    message1 = "You lose!"
                    message2 = "try again next time!"
                }

                context.font = `50px ${this.fontFamily}`
                context.fillText(
                    message1,
                    this.game.width * 0.5,
                    this.game.height * 0.5 - 40
                )
                context.font = `25px ${this.fontFamily}`
                context.fillText(
                    message2,
                    this.game.width * 0.5,
                    this.game.height * 0.5 + 40
                )
            }

            if (this.game.player.powerUp) context.fillStyle = "red";
            for (let i = 0; i < this.game.amo; i++) {
                context.fillRect(
                    150 + 5 * i,
                    20,
                    2,
                    20
                );
            }

            context.restore()
        }

    }
    class Game {
        constructor(width, height) {

            this.width = width
            this.height = height

            this.player = new Player(this)
            this.input = new InputHandler(this)
            this.background = new Backgound(this)
            this.ui = new Ui(this)

            this.keys = []
            this.enemies = []
            this.Praticles = []
            this.explosions = []

            this.enemyTimer = 0
            this.enemyInterval = 1000;

            this.amo = 20
            this.maxAmo = 50
            this.amoTimer = 0
            this.amoInterval = 500

            this.score = 0
            this.playerLives = 10
            this.winingSscore = 100

            this.gameTime = 0
            this.timeLimit = 150000

            this.speed = 1

            this.gameOver = true
            this.debag = false
        }

        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            this.background.update()
            this.player.update(deltaTime)
            this.background.layer4.update()

            if (this.amoTimer > this.amoInterval) {
                if (this.amo < this.maxAmo) this.amo++;
                this.amoTimer = 0
            } else this.amoTimer += deltaTime

            this.Praticles.forEach(particle => particle.udpdate())
            this.Praticles = this.Praticles.filter(particle => !particle.markedFordDeletion)

            this.explosions.forEach(explosion => explosion.update(deltaTime))
            this.explosions = this.explosions.filter(explosion => !explosion.markedFordDeletion)

            this.enemies.forEach(enemy => {
                enemy.update()
                if (this.chekCollison(this.player, enemy)) {
                    enemy.markedFordDeletion = true

                    for (let i = 0; i < enemy.score; i++) {
                        this.Praticles.push(new Praticle(
                            this,
                            enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5
                        ))
                    }

                    if (enemy.type == "lucky") this.player.enterPowerUp()
                    if (!this.gameOver) this.score--;
                    if (!this.gameOver) this.playerLives--
                    if (this.playerLives <= 0) this.gameOver = true
                }

                this.player.projectiles.forEach(projectile => {
                    if (this.chekCollison(enemy, projectile)) {
                        this.addexplosion(enemy)
                        enemy.lives--;
                        projectile.markedFordDeletion = true

                        this.Praticles.push(new Praticle(
                            this,
                            enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5
                        ))


                        if (enemy.lives < 0) {
                            enemy.markedFordDeletion = true
                            if (enemy.type == "hivewhale") {

                                for (let i = 0; i < 5; i++) {
                                    this.enemies.push(new Drons(
                                        this,
                                        enemy.x + Math.random() * enemy.width,
                                        enemy.y + Math.random() * enemy.height * 0.5
                                    ))
                                }
                            }
                            for (let i = 0; i < enemy.score; i++) {
                                this.Praticles.push(new Praticle(
                                    this,
                                    enemy.x + enemy.width * 0.5,
                                    enemy.y + enemy.height * 0.5
                                ))
                            }
                            if (!this.gameOver) this.score += enemy.score;

                        }
                    }
                })
            })
            this.enemies = this.enemies.filter(enemy => !enemy.markedFordDeletion)
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy()
                this.enemyTimer = 0;
            } else this.enemyTimer += deltaTime
        }

        draw(context) {
            this.background.draw(context)
            this.player.draw(context);
            this.ui.draw(context)
            this.enemies.forEach(enemy => enemy.draw(context))
            this.Praticles.forEach(particle => particle.draw(context))
            this.explosions.forEach(explosion => explosion.draw(context))
            this.background.layer4.draw(context)
        }

        addEnemy() {
            const rnadomiez = Math.random()
            if (rnadomiez < 0.3) this.enemies.push(new Angler1(this))
            else if (rnadomiez < 0.6) this.enemies.push(new Angler2(this))
            else if (rnadomiez < 0.8) this.enemies.push(new HavieHhale(this))
            else this.enemies.push(new LuckyFish(this))
        }
        addexplosion(enemy) {
            const rnadomiez = Math.random()
            if (rnadomiez < .5) {
                this.explosions.push(new SmokExposion(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5))
            } else {
                this.explosions.push(new FireExposion(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5))
            }
        }
        chekCollison(r1, r2) {
            return (
                r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height)
    let lastTime = 0;

    function animate(timeStmp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const deltaTime = timeStmp - lastTime;
        lastTime = timeStmp;
        game.draw(ctx)
        game.update(deltaTime)

        requestAnimationFrame(animate)
    }

    animate(0)
});