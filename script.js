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
let volumeControls = document.querySelector(".volume");
let volumeToggle = document.querySelector(".volume-toggle");
let volumeIcon = document.querySelector(".volume-toggle img");
const siteRoot = new URL(".", window.location.href);

function siteUrl(path) {
    return new URL(path, siteRoot);
}

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
    const response = await fetch(siteUrl(`${folder}/songs.json`));
    if (!response.ok) throw new Error(`Could not load songs for ${folder}`);
    songs = await response.json();
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
    currentSong.src = siteUrl(`${currFolder}/${encodeURIComponent(track)}`).href;
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

    range.addEventListener("input", () => {
        currentSong.volume = Number(range.value) / 100;
        volumeIcon.src = range.value === "0" ? "mute.svg" : "volume.svg";
    })

    volumeToggle.addEventListener("click", () => {
        const isOpen = volumeControls.classList.toggle("volume-open");
        volumeToggle.setAttribute("aria-expanded", String(isOpen));
    })

    document.addEventListener("click", e => {
        if (!volumeControls.contains(e.target)) {
            volumeControls.classList.remove("volume-open");
            volumeToggle.setAttribute("aria-expanded", "false");
        }
    })

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            volumeControls.classList.remove("volume-open");
            volumeToggle.setAttribute("aria-expanded", "false");
        }
    })

    // Event Listner for Loading Songs

    Array.from(document.getElementsByClassName("cards")).forEach(e =>{
        e.addEventListener("click", async item=> {
           songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

    // Display all the Albums on the Page

    displayAlbums();
}

async function displayAlbums() {
    const response = await fetch(siteUrl("songs/index.json"));
    const folders = await response.json();
    for (const folder of folders) {
            const albumResponse = await fetch(siteUrl(`songs/${encodeURIComponent(folder)}/info.json`));
            const album = await albumResponse.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="cards">
              <div class="play">
                <i class="fa-solid fa-play"></i>
                </div>
              <img src="${siteUrl(`songs/${encodeURIComponent(folder)}/cover.jpg`)}" alt="">
              <h2>${album.title}</h2>
              <p>${album.description}</p>
            </div>`
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
