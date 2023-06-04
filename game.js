class Game {
    sounds = {
        tap: document.getElementById("tap-sound"),
        losing: document.getElementById("losing-sound"),
        score: document.getElementById("score-sound"),
        sequence: document.getElementById("sequence-sound"),
        start: document.getElementById("start-sound"),
        tictac: document.getElementById("tic-tac-sound"),
    };
    score = 0;
    gameStarted = false;

    start() {
        this.sounds.start.play();
        this.gameStarted = true;
        this.score = 0;
    }

    reset() {
        this.gameStarted = false;
        this.score = 0;
    }

    lose() {
        this.sounds.losing.play();
        this.sounds.tictac.pause();
        this.sounds.tictac.currentTime = 0;
    }
}

class Genius extends Game {
    limit = 4;
    sequence = [];
    currentSequence = 0;
    colorsOrder = ["red", "green", "blue", "yellow"];
    playSequenceTimeoutOut;
    playSequenceTimeoutIn;
    timerCountDown;

    buttons = {
        start: document.getElementById("start-button"),
    };

    labels = {
        score: document.getElementById("score-label"),
        feedback: document.getElementById("feedback-label"),
        counter: document.getElementById("start-counter"),
    };

    startGenius() {
        this.resetGame();
        this.start();

        this.labels.feedback.innerText = "";

        this.buttons.start.classList.add("hide");
        this.labels.counter.classList.remove("hide");

        for (let index = 0; index <= 3; index++) {
            new Promise((resolve, reject) => {
                this.labels.counter.classList.remove("animate__slideInUp");
                setTimeout(() => {
                    this.labels.counter.innerText = `${3 - index}`;
                    this.labels.counter.classList.add("animate__slideInUp");

                    if (index === 3) {
                        resolve();
                    }
                }, 800 * index);
            }).then(() => {
                this.labels.counter.innerText = `Já!`;

                setTimeout(() => {
                    this.labels.counter.classList.add("hide");
                    this.labels.counter.innerText = "";
                    this.gameStarted = true;

                    this.labels.score.classList.remove("hide");
                    this.labels.score.innerHTML = this.score;

                    this.buttons.start.classList.add("hide");

                    this.generateSequence();
                }, 900);
            });
        }
    }

    resetGame() {
        this.reset();

        this.sequence = [];
        this.currentSequence = 0;

        this.labels.feedback.classList.remove("hide");
        this.labels.score.classList.add("hide");

        clearTimeout(this.playSequenceTimeoutOut);
        clearTimeout(this.playSequenceTimeoutIn);
        clearInterval(this.timerCountDown);
    }

    async generateSequence() {
        clearInterval(this.timerCountDown);

        const current = Math.floor(Math.random() * this.limit) + 1;

        this.sequence.push(current);
        this.currentSequence = 0;

        await this.playSequence();
    }

    async playSequence() {
        this.sounds.tictac.pause();
        this.sounds.tictac.currentTime = 0;

        for (const value of this.sequence) {
            const color = this.colorsOrder[value - 1];
            const button = document.getElementById(`${color}-button`);

            await new Promise((resolve, reject) => {
                this.playSequenceTimeoutIn = setTimeout(() => {
                    this.sounds.sequence.play();
                    button.classList.add("active");
                }, 500);

                this.playSequenceTimeoutOut = setTimeout(() => {
                    button.classList.remove("active");
                    resolve();
                }, 1500);
            });
        }

        this.timerCountDown = this.countDown(5);
    }

    countDown(seconds) {
        const tictac = this.sounds.tictac;
        const loseCallback = () => this.loseGame();

        let counter = setInterval(function () {
            tictac.play();
            seconds--;

            if (seconds < 0) {
                tictac.pause();
                tictac.currentTime = 0;

                clearInterval(counter);
                loseCallback();
            }
        }, 1000);

        return counter;
    }

    pressButton(value) {
        if (!this.gameStarted) return;

        this.sounds.tap.pause();
        this.sounds.tap.currentTime = 0;
        this.sounds.tap.play();

        this.labels.score.classList.remove("animate__heartBeat");

        const current = this.sequence[this.currentSequence];

        if (current === value) {
            this.currentSequence++;

            if (this.currentSequence === this.sequence.length) {
                this.score++;
                this.labels.score.classList.add("animate__heartBeat");
                this.labels.score.innerHTML = this.score;
                this.sounds.score.play();

                this.generateSequence();
            }
        } else {
            this.loseGame();
        }
    }

    loseGame() {
        this.lose();

        this.buttons.start.classList.remove("hide");

        this.labels.feedback.innerText = "Você perdeu! 😵";

        document.querySelectorAll(".genius-button").forEach((item) => {
            item.classList.remove("active");
        });

        this.resetGame();
    }
}
