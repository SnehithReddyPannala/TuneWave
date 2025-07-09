
async function getSongs(folder){
    currFolder = folder; 
    let a=await fetch(`http://127.0.0.1:5500/music/${folder}/`);
    let response=await a.text();
    console.log(response);
    let div=document.createElement("div");
    div.innerHTML=response;
    let as=div.getElementsByTagName("a");
    let songs=[];
    for(let i=0;i<as.length;i++){
        const elements= as[i];
        if(elements.href.endsWith(".mp3")){
            songs.push(elements.href);
        }
    }
    return songs;
}
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
    let currFolder;
    let currentSong=new Audio();
    let isSongLoaded = false;
    let songs;

const playMusic = (track, pause = false) => {
    currentSong.src = `music/${currFolder}/` + encodeURIComponent(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }else{
        play.src = "img/play.svg";
    }

    isSongLoaded = true;

    // Clean display name
    const cleaned = decodeURIComponent(track)
        .replace(" - (Raag.Fm)", "")
        .replace(".mp3", "");

    document.querySelector(".songinfo").innerHTML = cleaned;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main(){
    songs= await getSongs("gunturkaram"); 
    currFolder = "gunturkaram"; 
    const firstRawName = decodeURIComponent(songs[0].split("/").pop());
    const firstCleanedName = firstRawName.replace(" - (Raag.Fm)", "");
    const firstFinalName = firstCleanedName.replace(".mp3", "");
    playMusic(firstRawName, true);
    currentSong.addEventListener("ended", () => {
    const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop()) === currentFile);

    if (index < songs.length - 1) {
        // Play next song
        const nextFile = decodeURIComponent(songs[index + 1].split("/").pop());
        playMusic(nextFile);
    } else {
        // Loop back to first song
        const firstFile = decodeURIComponent(songs[0].split("/").pop());
        playMusic(firstFile);
    }
});
 // Play the first song by default
    console.log(songs);
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

for (const song of songs) {
  const rawName = decodeURIComponent(song.split("/").pop());
  const cleanedName = rawName.replace(" - (Raag.Fm)", "");
  const finalName = cleanedName.replace(".mp3", "");
  songUL.innerHTML += `<li data-file="${rawName}"><img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${finalName}</div>
                            <div>SS Thaman</div>
                        </div>
                    <img class="invert" src="img/play.svg" alt=""></li>`;
}
Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const fileName=e.getAttribute("data-file");
            playMusic(fileName);
            console.log("Playing song: " + fileName);

        })
    })
   play.addEventListener("click", () => {
    if (!isSongLoaded) return; // Do nothing if no song is selected

    if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/play.svg";
    }
});
 currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
     document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0px";
        });
     document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
   // Create a simplified array with just filenames for easier index tracking
let songNames = songs.map(song => decodeURIComponent(song.split("/").pop()));

previous.addEventListener("click", () => {
    currentSong.pause();
    const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop()) === currentFile);

    if (index <= 0) {
        // First song, play again
        playMusic(decodeURIComponent(songs[0].split("/").pop()));
    } else {
        playMusic(decodeURIComponent(songs[index - 1].split("/").pop()));
    }
});

next.addEventListener("click", () => {
    currentSong.pause();
    const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
    const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop()) === currentFile);

    if (index >= songs.length - 1) {
        // Last song, play again
        playMusic(decodeURIComponent(songs[songs.length - 1].split("/").pop()));
    } else {
        playMusic(decodeURIComponent(songs[index + 1].split("/").pop()));
    }
});
// Volume change from range input
document.querySelector(".range input").addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value); // value between 0 and 1
    console.log("Setting volume to", volume);
    currentSong.volume = volume;

    if (volume > 0) {
        document.querySelector(".volume > img").src = "img/volume.svg";
    } else {
        document.querySelector(".volume > img").src = "img/mute.svg";
    }
});
// Toggle mute when clicking volume icon
document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (currentSong.volume > 0) {
        // Mute
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
        e.target.src = "img/mute.svg";
    } else {
        // Unmute to default (e.g., 0.5)
        currentSong.volume = 0.5;
        document.querySelector(".range input").value = 0.5;
        e.target.src = "img/volume.svg";
    }
});
 Array.from(document.getElementsByClassName("card")).forEach(e => { 
    e.addEventListener("click", async item => {
        document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));

    // Add active to clicked
    e.classList.add("active");

        
        const folder = item.currentTarget.dataset.folder;
        const artistName = item.currentTarget.querySelector("p").innerText; // ✅ Correct artist

        console.log("Fetching Songs from", folder);
        
        // Fetch songs
        songs = await getSongs(folder);  
        currFolder = folder;

        if (songs.length > 0) {
            const firstSong = decodeURIComponent(songs[0].split("/").pop());
            playMusic(firstSong);

            // 🟢 Update the Library (songList)
            let songUL = document.querySelector(".songList ul");
            songUL.innerHTML = "";

            for (const song of songs) {
                const rawName = decodeURIComponent(song.split("/").pop());
                const cleanedName = rawName.replace(" - (Raag.Fm)", "").replace(".mp3", "");
                songUL.innerHTML += `
                    <li data-file="${rawName}">
                        <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${cleanedName}</div>
                            <div>${artistName}</div>
                        </div>
                        <img class="invert" src="img/play.svg" alt="">
                    </li>`;
            }
            
            

            // Add click event to new songs
            Array.from(songUL.getElementsByTagName("li")).forEach(li => {
                li.addEventListener("click", () => {
                    const fileName = li.getAttribute("data-file");
                    playMusic(fileName);
                    console.log("Playing song:", fileName);
                });
            });
        }
    });
});



}
main();