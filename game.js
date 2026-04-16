const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// pantalla completa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
const scoreText = document.getElementById("score");

let img = new Image();
img.src = "assets/img/gatito.png";

let objects = [];
let flashes = []; // flashes de colisión

const TOTAL = 25;
const MOVEMENTS = ["down","up","diagonal","circular"];

class Object2D {

    constructor(){
        this.size = 50;

        this.posX = Math.random() * canvas.width;
        this.posY = Math.random() * canvas.height;

        this.speed = Math.random()*3 + 1;

        this.type = MOVEMENTS[Math.floor(Math.random()*4)];

        this.dx = (Math.random()-0.5)*this.speed*2;
        this.dy = (Math.random()-0.5)*this.speed*2;

        this.angle = 0;
    }

    draw(){
        ctx.drawImage(
            img,
            this.posX - this.size/2,
            this.posY - this.size/2,
            this.size,
            this.size
        );
    }

    move(){

        switch(this.type){

            case "down":
                this.posY += this.speed;
                break;

            case "up":
                this.posY -= this.speed;
                break;

            case "diagonal":
                this.posX += this.dx;
                this.posY += this.dy;
                break;

            case "circular":
                this.angle += 0.05;
                this.posX += Math.cos(this.angle)*2;
                this.posY += Math.sin(this.angle)*2;
                break;
        }

        // reaparecer aleatorio
        if(this.posX < 0 || this.posX > canvas.width ||
           this.posY < 0 || this.posY > canvas.height){

            this.posX = Math.random()*canvas.width;
            this.posY = Math.random()*canvas.height;
        }
    }

    update(){
        this.move();
        this.draw();
    }
}

// generar objetos
function generateObjects(){
    objects = [];
    for(let i=0;i<TOTAL;i++){
        objects.push(new Object2D());
    }
}

// colisiones con flash
function checkCollisions(){

    for(let i=0;i<objects.length;i++){
        for(let j=i+1;j<objects.length;j++){

            let a = objects[i];
            let b = objects[j];

            let dx = a.posX - b.posX;
            let dy = a.posY - b.posY;

            let dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < a.size * 0.7){

                // crear flash
                flashes.push({
                    x: (a.posX + b.posX)/2,
                    y: (a.posY + b.posY)/2,
                    radius: 5,
                    life: 8
                });

                // rebote
                let tempDx = a.dx;
                let tempDy = a.dy;

                a.dx = b.dx;
                a.dy = b.dy;

                b.dx = tempDx;
                b.dy = tempDy;
            }
        }
    }
}

// dibujar flashes
function drawFlashes(){

    flashes.forEach((f, index)=>{

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,150," + (f.life/8) + ")";
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI*2);
        ctx.fill();

        f.radius += 3;
        f.life--;

        if(f.life <= 0){
            flashes.splice(index,1);
        }
    });
}

// click eliminar
canvas.addEventListener("click", function(e){

    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    objects.forEach((obj,index)=>{

        let dx = mouseX - obj.posX;
        let dy = mouseY - obj.posY;

        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < obj.size/2){

            objects.splice(index,1);
            score++;

            scoreText.innerText = "Eliminados: " + score;

            objects.push(new Object2D());
        }
    });
});

// animación
function animate(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    objects.forEach(obj => obj.update());

    checkCollisions();

    drawFlashes(); //  efecto flash

    requestAnimationFrame(animate);
}

// esperar imagen
img.onload = () => {
    generateObjects();
    animate();
};

img.onerror = () => {
    console.error("Error cargando imagen");
};