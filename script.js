let currentSong = new Audio();
let songs;
let currFolder;
let info = document.querySelector(".songinfo");
let time = document.querySelector(".songtime");
let songtime = document.querySelector(".songtime");
let circle = document.querySelector(".circle");
let seekbar = document.querySelector(".seekbar");
let hamburger = document.querySelector(".hamburger");
let left = document.querySelector(".left");
let closebtn = document.querySelector(".close");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");
let range = document.querySelector(".range>input");
let cardContainer = document.querySelector(".cardsContainer");
let volume = document.querySelector(".volume>img");

function secondsToMinutes(seconds) {
  // Convert input to number
  seconds = Number(seconds);

  // Handle invalid or negative input
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // Show all the songs in the playlist
    let songUl = document.querySelector(".songsList").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                <i class="fa-solid fa-music music"></i>
                <div class="info">
                  <div>${song.replaceAll("%20", " ").replaceAll("%2", " ")}</div>
                  <div>Shreyansh</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <i class="fa-solid fa-circle-play"></i>
                </div></li>`;
    }
    // Attach an Event Listener to each song

    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()) ; 
        })

    })
    return songs;
}

const playMusic = (track, pause= false) =>{
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "pause.svg"
    }
    info.innerHTML = decodeURI(track);
    time.innerHTML = "00:00 / 00:00"
}

async function main() {
    // Get the Songs list
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // Attach an Event Listner to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "pause.svg"
        }
        else{
            currentSong.pause();
            play.src = "play.svg"
        }
    })

    // Adding an Event Listener for TimeUpdate

    currentSong.addEventListener("timeupdate", () => {
        songtime.innerHTML = `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        circle.style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    // Adding an Event Listner for seekbar

    seekbar.addEventListener("click", e =>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        circle.style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent) / 100;
    })

    // Adding an Event Listner for hamburger

    hamburger.addEventListener("click", () =>{
        left.style.left = "0";
    })

    // Adding an Event Listner for Closeing Button

    closebtn.addEventListener("click", () =>{
        left.style.left = "-120%";
    })

    // Adding an Event Listner for Previous Button
    previous.addEventListener("click", () =>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1]);
        }
    })

    // Adding an Event Listner for Next Button
    next.addEventListener("click", () =>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1]);
        }
    })

    // Adding an Event Listner for Volume

    range.addEventListener("click", (e) => {
        currentSong.volume = parseInt(e.target.value)/ 100;
    })

    // Event Listner for Loading Songs

    Array.from(document.getElementsByClassName("cards")).forEach(e =>{
        e.addEventListener("click", async item=> {
           songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

    // Adding an Event Listener for Mute Button

    volume.addEventListener("click", e =>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            range.value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            range.value = 10;
        }
    })

    // Display all the Albums on the Page

    displayAlbums();
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[1];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="cards">
              <div class="play">
                <i class="fa-solid fa-play"></i>
                </div>
              <img src="/songs/${folder}/cover.jpg" alt="">
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }
    // Event Listner for Loading Songs

    Array.from(document.getElementsByClassName("cards")).forEach(e =>{
        e.addEventListener("click", async item=> {
           songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
           playMusic(songs[0]);
        })
    })
}

main();