let currentAudio = new Audio();
let currentSongUrl = null;
let currentSongIcon = null;
let currentSongIdx = 0;
let songs = [];
let displaySong = document.querySelector(".displaySong");
let volume = document.querySelector(".volume");

let seekbar = document.querySelector(".seekbar");

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = "0" + sec;
    return `${min}:${sec}`;
} 

async function loadPlaylist(folderName) {
    songs = [];
    let sList = document.querySelector(".songList ul");
    sList.innerHTML = "";

    //fetching songs from a particular folder
let a = await fetch(`/songs/${folderName}/songs.json`);
    let res = await a.text();

    let fres = new DOMParser();
    let response = fres.parseFromString(res, "text/html");
    let as = response.getElementsByTagName("a");

    // store full song URLs
    for (let idx = 0; idx < as.length; idx++) {
        const ele = as[idx];
        if (ele.href.endsWith(".mp3")) {
            songs.push(ele.href);
        }
    }
    
    //creating songlist and managing play and pause
    songs.forEach(songUrl => {
        let li = document.createElement("li");
        let songName = decodeURIComponent(songUrl.split("/").pop().replace(".mp3", ""));
        li.innerHTML = `
            <i class="fa-solid fa-music ps"></i>
            <div class="sName">${songName}</div>
            <i class="fa-solid fa-circle-play ps song-icon"></i>`;

        //adding event listener to manage play pause
        let playLib = li.querySelector(".song-icon");
        let playbr = document.querySelector(".playbr");
        
        

        li.addEventListener("click", () => {

            //displaying songName
            displaySong.innerText = songName;

            if(currentAudio.paused || currentAudio.src != songUrl) {
                //playing a song
                currentAudio.src = songUrl;
                currentSongIdx = songs.indexOf(songUrl);
                currentSongUrl = songUrl;         //to be used in playbr eventListener
                currentSongIcon = playLib;        //to be used in playbr eventListener
                currentAudio.play();

                //reseting icons of other songs
                document.querySelectorAll(".song-icon").forEach(icon => {
                    icon.classList.replace("fa-circle-pause", "fa-circle-play");
                });

                //managing left-cont play pause
                playLib.classList.replace("fa-circle-play", "fa-circle-pause");

                //managing right-cont play pause
                playbr.classList.replace("fa-play", "fa-pause");
               
            } else {
                //pausing a song
                currentAudio.pause();
                currentAudio.currentTime=0;

                //managing left-cont play pause
                playLib.classList.replace("fa-circle-pause", "fa-circle-play");

                //managing right-cont play pause
                playbr.classList.replace("fa-pause", "fa-play");
            }
        });
        sList.appendChild(li);
    })

    //setting first song as default
    if (songs.length > 0) {
    let firstSong = songs[0];
    currentAudio.src = firstSong;

    // show name
    document.querySelector(".displaySong").innerText =
        decodeURIComponent(firstSong.split("/").pop().replace(".mp3", ""));

    // show duration once metadata is ready
    currentAudio.addEventListener("loadedmetadata", () => {
        document.querySelector(".displayDuration").innerText =
            `0:00 / ${formatTime(currentAudio.duration)}`;
        document.querySelector(".seekbar").max = currentAudio.duration;
    });

    // set volume icon
    document.querySelector(".volume").innerHTML =
        `<i class="fa-solid fa-volume-high"></i>`;
    }
}

//adding eventlistener to each playlist
document.querySelectorAll(".cd").forEach(card => {
    card.addEventListener("click", () => {
        let folder = card.dataset.playlist;
        loadPlaylist(folder);
    })
})

//managing right container's play-pause
let playbr = document.querySelector(".playbr");
playbr.addEventListener("click", () => {
    
    if (currentAudio.paused) {
        currentAudio.play();
        playbr.classList.replace("fa-play", "fa-pause");
        currentSongIcon.classList.replace("fa-circle-play", "fa-circle-pause");
    } else {
        currentAudio.pause();
        playbr.classList.replace("fa-pause", "fa-play");
        currentSongIcon.classList.replace("fa-circle-pause", "fa-circle-play");
    }
});

//displaying song duration
let displayDuration = document.querySelector(".displayDuration");
currentAudio.addEventListener("loadedmetadata", () => {
    seekbar.max = currentAudio.duration;
    displayDuration.innerHTML = `0:00 / ${formatTime(currentAudio.duration)}`;
    volume.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
    let volIcon = volume.querySelector("i");  // now it exists

    volIcon.addEventListener("click", () => {
        volIcon.classList.toggle("fa-volume-xmark");
        volIcon.classList.toggle("fa-volume-high");
        currentAudio.muted = !currentAudio.muted;
    });
});
currentAudio.addEventListener("timeupdate", () => {
    displayDuration.innerHTML = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
    seekbar.value = currentAudio.currentTime;
});

//managing prev-next function
let previous = document.querySelector(".previous");
let next = document.querySelector(".next");
previous.addEventListener("click", () => {
    currentSongIdx--;
    if(currentSongIdx<0) currentSongIdx = songs.length-1;
    currentAudio.src = songs[currentSongIdx];
    currentAudio.play();

    document.querySelectorAll(".song-icon").forEach(icon => {
        icon.classList.replace("fa-circle-pause", "fa-circle-play");
    });

    //managing left-cont play pause
    currentSongIcon = document.querySelectorAll(".song-icon")[currentSongIdx];
    currentSongIcon.classList.replace("fa-circle-play", "fa-circle-pause");

    //managing right-cont play pause
    playbr.classList.replace("fa-play", "fa-pause");

    let songName = decodeURI(songs[currentSongIdx].split("/").pop().replace(".mp3", ""));
    displaySong.innerHTML = songName;
})
next.addEventListener("click", () => {
    currentSongIdx++;
    if(currentSongIdx>=songs.length) currentSongIdx = 0;
    currentAudio.src = songs[currentSongIdx];
    currentAudio.play();

    document.querySelectorAll(".song-icon").forEach(icon => {
         icon.classList.replace("fa-circle-pause", "fa-circle-play");
    });

    //managing left-cont play pause 
    currentSongIcon = document.querySelectorAll(".song-icon")[currentSongIdx];
    currentSongIcon.classList.replace("fa-circle-play", "fa-circle-pause");

    //managing right-cont play pause
    playbr.classList.replace("fa-play", "fa-pause");

    let songName = decodeURI(songs[currentSongIdx].split("/").pop().replace(".mp3", ""));
    displaySong.innerHTML = songName;
})

//managing seekbar 
seekbar.addEventListener("input", () => {
    currentAudio.currentTime = seekbar.value;
})

//managing hamburger 
let hamburger = document.querySelector(".hamburger");
hamburger.addEventListener("click", () => {
    document.querySelector(".same-cont").style.left = "0";
})

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".same-cont").style.left = "-110%";
})

window.addEventListener("DOMContentLoaded", () => {
    loadPlaylist("default"); // load songs/default.json automatically
});


//managing dark/light theme 
let themeButton = document.querySelector(".but");
themeButton.addEventListener("click", () => {
    let currClass = document.querySelector(".theme-icn");
    if(currClass.classList.contains("fa-moon")) {
        themeButton.innerHTML = `<i  class="fa-solid fa-sun theme-icn"></i> Light Mode`
    } else {
        themeButton.innerHTML = `<i  class="fa-solid fa-moon theme-icn"></i> Dark Mode`
    }
    document.body.classList.toggle("light-theme");

})



