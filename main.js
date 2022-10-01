config = {
    body: document.querySelector("body"),
    title: document.getElementById("title"),
    myCanvas: document.getElementById("myCanvas"),
    outputDiv: document.getElementById("outputDiv"),
    localInput: document.getElementById("local-input"),
    convertBtn: document.getElementById("convert-btn"),
    footer: document.querySelector("footer"),
    density: "Ñ@#W$9876543210?!abc;:+=-,._ ",
    extensions: ["jpg", "jpeg", "png", "mp4"],
};

config.myCanvas.width = 320;
config.myCanvas.height = 180;
let w = config.myCanvas.width;
let h = config.myCanvas.height;
const block = 3;
const table = new Array(Math.floor(h / block));

class Picture {
    constructor(path) {
        this.img = new Image();
        config.outputDiv.innerHTML = "<h5>変換中...</h5>";
        config.convertBtn.disabled = true;
        this.img.onload = () => {
            config.outputDiv.innerHTML = "";
            config.footer.style.display = "flex";
            config.convertBtn.disabled = false;
            this.load();
        }
        this.img.src = path;
    }
    
    load() {
        config.myCanvas.width = this.img.width;
        config.myCanvas.height = this.img.height;
        w = myCanvas.width;
        h = myCanvas.height;
        const ctx = config.myCanvas.getContext("2d");
        const longer = w > h ? w : h;
        if (longer > 300) {
            const x = 300 / longer;
            w = Math.floor(w * x);
            h = Math.floor(h * x);
        }
        ctx.drawImage(this.img, 0, 0, w, h);

        for (let y=0; y < h; y+=block) {
            let s = "";
            for (let x=0; x < w; x+=block) {
                const pixelData = ctx.getImageData(x, y, block, block);
                const r = pixelData.data[0];
                const g = pixelData.data[1];
                const b = pixelData.data[2];
                const grey = (r+g+b) / 3;
                const len = config.density.length - 1;
                let index = len - Math.floor(grey * len / 255);
                const asc = config.density[index];
                s += `<span>`;
                s += asc == " " ? "&nbsp;" : asc;
                s += `</span>`;
            }
            config.outputDiv.innerHTML += s + "<br>";
        }
    }
}

class Video {
    constructor(path) {
        this.video = document.createElement("video");
        this.video.src = path;
        this.video.muted = true;
        this.video.id = "video";
        this.video.width = myCanvas.width;
        this.video.height = myCanvas.height;
        this.video.autoplay = true;
        config.body.prepend(this.video);
        this.interlace = 0;
    }
    
    load() {
        this.video.play();
        const ctx = config.myCanvas.getContext("2d");
        let interlace = 0;
        for (let y=0; y < Math.floor(h / block); y ++) {
            table[y] = new Array(Math.floor(w / block)).fill("b" + y);
            const rowDiv = document.createElement("div");
            rowDiv.id = "row" + y;
            for (let x=0; x < Math.floor(w / block); x ++) {
                const span = document.createElement("span");
                span.classList.add("ele");
                span.innerHTML = "&nbsp;";
                rowDiv.append(span);
            }
            config.outputDiv.append(rowDiv);
        }
        canvasUpdate();
        
        function canvasUpdate() {
            interlace = interlace == 0 ? 1 : 0;
            ctx.drawImage(document.getElementById("video"), 0, 0, w, h);
            let y = interlace;
            for (; y < Math.floor(h / block); y += 2) {
                for (let x=0; x < Math.floor(w / block); x ++) {
                    const pixelData = ctx.getImageData(x*block, y*block, block, block);
                    const r = pixelData.data[0];
                    const g = pixelData.data[1];
                    const b = pixelData.data[2];
                    const grey = r*0.3 + g*0.6 + b*0.1;
                    const len = config.density.length - 1;
                    let index = len - Math.floor(grey * len / 255);
                    if (table[y][x] == config.density[index-1]
                        ||  table[y][x] == config.density[index]
                        ||  table[y][x] == config.density[index+1]) {
                            continue;
                        }
                        const asc = config.density[index];
                        table[y][x] = asc;
                        const row = document.getElementById("row" + y);
                        const span = row.querySelectorAll(".ele")[x];
                        span.innerHTML = asc == " " ? "&nbsp;" : asc;
                        // span.style.color = `rgb(${r},${g},${b})`;
                    }
                }
            requestAnimationFrame(canvasUpdate);   
        }
    }
    
    
}

class Webcam {
    constructor() {
        this.video = document.createElement("video");
        this.video.id = "video";
        this.video.width = myCanvas.width;
        this.video.height = myCanvas.height;
        this.video.autoplay = true;
        config.body.prepend(this.video);
        
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                    width: {ideal: this.video.width},
                    height: {ideal: this.video.height}
                }
            }).then(stream => {
                this.video.srcObject = stream;
        });
    }
        
    load() {
        const ctx = config.myCanvas.getContext("2d");
        let interlace = false;
        for (let y=0; y < Math.floor(h / block); y ++) {
            table[y] = new Array(Math.floor(w / block)).fill("b" + y);
            const rowDiv = document.createElement("div");
            rowDiv.id = "row" + y;
            for (let x=0; x < Math.floor(w / block); x ++) {
                const span = document.createElement("span");
                span.classList.add("ele");
                span.innerHTML = "&nbsp;";
                rowDiv.append(span);
            }
            config.outputDiv.append(rowDiv);
        }
        canvasUpdate();

        function canvasUpdate() {
            ctx.drawImage(document.getElementById("video"), 0, 0, w, h);
            interlace = interlace ? false : true;
            let y = interlace ? 0 : 1;
            for (; y < Math.floor(h / block); y += 2) {
                for (let x=0; x < Math.floor(w / block); x++) {
                    const pixelData = ctx.getImageData(x*block, y*block, block, block);
                    const r = pixelData.data[0];
                    const g = pixelData.data[1];
                    const b = pixelData.data[2];
                    const grey = r*0.3 + g*0.6 + b*0.1;
                    const len = config.density.length - 1;
                    let index = len - Math.floor(grey * len / 255);
                    if (table[y][x] == config.density[index-1]
                    ||  table[y][x] == config.density[index]
                    ||  table[y][x] == config.density[index+1]) {
                        continue;
                    }
                    const asc = config.density[index];
                    table[y][x] = asc;
                    const row = document.getElementById("row" + y);
                    const span = row.querySelectorAll(".ele")[x];
                    span.innerHTML = asc == " " ? "&nbsp;" : asc;
                    // span.style.color = `rgb(${r},${g},${b})`;
                }
            }
            requestAnimationFrame(canvasUpdate);
        }
    }
}

class Media {
    constructor (type, path=null) {
        if (type == "picture") this.media = new Picture(path);
        if (type == "video") this.media = new Video(path);
        if (type == "webcam") this.media = new Webcam();
    }

    load() {
        this.media.load();
    }
}


config.localInput.addEventListener("change", getFileName);
config.localInput.addEventListener("change", changeBtnInnerHTML);
config.convertBtn.addEventListener("click", convert);

function getFileName() {
    let value = config.localInput.value.split("\\");
    document.getElementById("file-path").innerHTML = value[value.length-1];
}

function changeBtnInnerHTML() {
    let value = config.localInput.value.split("\\");
    if (value == "") config.convertBtn.innerHTML = "WEBカメラを使う";
    else config.convertBtn.innerHTML = "変換";
}

function convert() {
    if (!config.title.classList.contains("d-none")) config.title.classList.add("d-none");

    let path = config.localInput.value.trim();
    config.footer.style.display = "none";
    config.outputDiv.innerHTML = "";
    config.localInput.value = "";
    document.getElementById("file-path").innerHTML = "";
    config.convertBtn.innerHTML = "WEBカメラを使う";
    myCanvas.width = 320;
    myCanvas.height = 180;
    w = myCanvas.width;
    h = myCanvas.height;
    if (path == "") {
        const media = new Media("webcam", path);
        media.load();
        config.footer.style.display = "flex";
        return;
    }
    let fileName = path.split("\\");
    fileName = fileName[fileName.length-1];
    let extension = fileName.split(".");
    extension = extension[extension.length-1];
    if (!config.extensions.includes(extension)) { alert ("未対応の拡張子です"); return; }
    
    let type;
    if (extension == "mp4") type = "video";
    else type = "picture";
    
    path = "http://127.0.0.1:8887/" + fileName;
    const media = new Media(type, path);
    if (type == "picture") return;
    media.load();
    config.footer.style.display = "flex";
}

// title
let asciiTitle = [
    "               AAA                 SSSSSSSSSSSSSSS         CCCCCCCCCCCCCIIIIIIIIIIIIIIIIIIII                 VVVVVVVV           VVVVVVVVIIIIIIIIIIDDDDDDDDDDDDD      EEEEEEEEEEEEEEEEEEEEEE     OOOOOOOOO     ",
    "              A:::A              SS:::::::::::::::S     CCC::::::::::::CI::::::::II::::::::I                 V::::::V           V::::::VI::::::::ID::::::::::::DDD   E::::::::::::::::::::E   OO:::::::::OO   ",
    "             A:::::A            S:::::SSSSSS::::::S   CC:::::::::::::::CI::::::::II::::::::I                 V::::::V           V::::::VI::::::::ID:::::::::::::::DD E::::::::::::::::::::E OO:::::::::::::OO ",
    "            A:::::::A           S:::::S     SSSSSSS  C:::::CCCCCCCC::::CII::::::IIII::::::II                 V::::::V           V::::::VII::::::IIDDD:::::DDDDD:::::DEE::::::EEEEEEEEE::::EO:::::::OOO:::::::O",
    "           A:::::::::A          S:::::S             C:::::C       CCCCCC  I::::I    I::::I                    V:::::V           V:::::V   I::::I    D:::::D    D:::::D E:::::E       EEEEEEO::::::O   O::::::O",
    "          A:::::A:::::A         S:::::S            C:::::C                I::::I    I::::I                     V:::::V         V:::::V    I::::I    D:::::D     D:::::DE:::::E             O:::::O     O:::::O",
    "         A:::::A A:::::A         S::::SSSS         C:::::C                I::::I    I::::I                      V:::::V       V:::::V     I::::I    D:::::D     D:::::DE::::::EEEEEEEEEE   O:::::O     O:::::O",
    "        A:::::A   A:::::A         SS::::::SSSSS    C:::::C                I::::I    I::::I   ---------------     V:::::V     V:::::V      I::::I    D:::::D     D:::::DE:::::::::::::::E   O:::::O     O:::::O",
    "       A:::::A     A:::::A          SSS::::::::SS  C:::::C                I::::I    I::::I   -:::::::::::::-      V:::::V   V:::::V       I::::I    D:::::D     D:::::DE:::::::::::::::E   O:::::O     O:::::O",
    "      A:::::AAAAAAAAA:::::A            SSSSSS::::S C:::::C                I::::I    I::::I   ---------------       V:::::V V:::::V        I::::I    D:::::D     D:::::DE::::::EEEEEEEEEE   O:::::O     O:::::O",
    "     A:::::::::::::::::::::A                S:::::SC:::::C                I::::I    I::::I                          V:::::V:::::V         I::::I    D:::::D     D:::::DE:::::E             O:::::O     O:::::O",
    "    A:::::AAAAAAAAAAAAA:::::A               S:::::S C:::::C       CCCCCC  I::::I    I::::I                           V:::::::::V          I::::I    D:::::D    D:::::D E:::::E       EEEEEEO::::::O   O::::::O",
    "   A:::::A             A:::::A  SSSSSSS     S:::::S  C:::::CCCCCCCC::::CII::::::IIII::::::II                          V:::::::V         II::::::IIDDD:::::DDDDD:::::DEE::::::EEEEEEEE:::::EO:::::::OOO:::::::O",
    "  A:::::A               A:::::A S::::::SSSSSS:::::S   CC:::::::::::::::CI::::::::II::::::::I                           V:::::V          I::::::::ID:::::::::::::::DD E::::::::::::::::::::E OO:::::::::::::OO ",
    " A:::::A                 A:::::AS:::::::::::::::SS      CCC::::::::::::CI::::::::II::::::::I                            V:::V           I::::::::ID::::::::::::DDD   E::::::::::::::::::::E   OO:::::::::OO   ",
    "AAAAAAA                   AAAAAAASSSSSSSSSSSSSSS           CCCCCCCCCCCCCIIIIIIIIIIIIIIIIIIII                             VVV            IIIIIIIIIIDDDDDDDDDDDDD      EEEEEEEEEEEEEEEEEEEEEE     OOOOOOOOO",
];

for (row of asciiTitle) {
    const rowArray = row.split("");
    for (let i=0; i < rowArray.length; i++) if (rowArray[i] == " ") rowArray[i] = "&nbsp;";
    config.title.innerHTML += `<p class="m-0" style="font-size:.3rem">${rowArray.join("")}</p>`;
}