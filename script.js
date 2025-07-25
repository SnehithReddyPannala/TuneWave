async function getSongs(folder) {
    currFolder = folder;
    const res = await fetch(`music/${folder}/info.json`);
    const songs = await res.json(); // songs = ["Dhop.mp3", ...]
    return songs;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

let currFolder;
let currentSong = new Audio();
let isSongLoaded = false;
let songs;

const playMusic = (track, pause = false) => {
    currentSong.src = `music/${currFolder}/` + encodeURIComponent(track);
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        play.src = "img/play.svg";
    }

    isSongLoaded = true;
    const cleaned = decodeURIComponent(track).replace(" - (Raag.Fm)", "").replace(".mp3", "");
    document.querySelector(".songinfo").innerHTML = cleaned;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    const songListItems = document.querySelectorAll(".songList ul li");
    songListItems.forEach(li => {
        const file = li.getAttribute("data-file");
        const playIcon = li.querySelector("img:last-child");

        if (decodeURIComponent(file) === decodeURIComponent(track)) {
            li.classList.add("playing");
            playIcon.src = pause ? "img/play.svg" : "img/pause.svg";
        } else {
            li.classList.remove("playing");
            playIcon.src = "img/play.svg";
        }
    });
};

async function main() {
    document.querySelector(".songinfo").innerHTML = "Select a song";
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    play.src = "img/play.svg";

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    currentSong.volume = 0.7;
    document.querySelector(".range input").value = 0.7;
    document.querySelector(".volume > img").src = "img/volume.svg";

    currentSong.addEventListener("ended", () => {
        const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop()) === currentFile);
        const nextIndex = (index + 1) % songs.length;
        playMusic(decodeURIComponent(songs[nextIndex].split("/").pop()));
    });

   play.addEventListener("click", () => {
    if (!isSongLoaded) return;

    const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
    const songListItems = document.querySelectorAll(".songList ul li");

    if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";

        // Update song list icons
        songListItems.forEach(li => {
            const file = li.getAttribute("data-file");
            const playIcon = li.querySelector("img:last-child");

            if (decodeURIComponent(file) === currentFile) {
                playIcon.src = "img/pause.svg";
            } else {
                playIcon.src = "img/play.svg";
            }
        });

    } else {
        currentSong.pause();
        play.src = "img/play.svg";

        // Update song list icons
        songListItems.forEach(li => {
            const file = li.getAttribute("data-file");
            const playIcon = li.querySelector("img:last-child");

            if (decodeURIComponent(file) === currentFile) {
                playIcon.src = "img/play.svg";
            }
        });
    }
});


    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop()) === currentFile);
        const prevIndex = index <= 0 ? 0 : index - 1;
        playMusic(decodeURIComponent(songs[prevIndex].split("/").pop()));
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        const currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop()) === currentFile);
        const nextIndex = (index + 1) % songs.length;
        playMusic(decodeURIComponent(songs[nextIndex].split("/").pop()));
    });

    document.querySelector(".range input").addEventListener("input", (e) => {
        const volume = parseFloat(e.target.value);
        currentSong.volume = volume;
        document.querySelector(".volume > img").src = volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
            e.target.src = "img/mute.svg";
        } else {
            currentSong.volume = 0.5; // Default volume
            document.querySelector(".range input").value = 0.5;
            e.target.src = "img/volume.svg";
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
            e.classList.add("active");

            const folder = item.currentTarget.dataset.folder;
            const artistName = item.currentTarget.querySelector("p").innerText;

            console.log("Fetching Songs from", folder);

            songs = await getSongs(folder);
            currFolder = folder;

            if (songs.length > 0) {
                const firstSong = decodeURIComponent(songs[0].split("/").pop());
                playMusic(firstSong, true); // Don't set pause icon on first load

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

                Array.from(songUL.getElementsByTagName("li")).forEach(li => {
                    li.addEventListener("click", () => {
                        const fileName = li.getAttribute("data-file");

                        if (currentSong.src.includes(encodeURIComponent(fileName)) && !currentSong.paused) {
                            currentSong.pause();
                            play.src = "img/play.svg";
                            li.querySelector("img:last-child").src = "img/play.svg";
                        } else {
                            playMusic(fileName);
                        }
                    });
                });
            }
        });
    });
}

main();
