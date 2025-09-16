document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const usernameInput = document.getElementById('username');
    const loadingElement = document.querySelector('.loading');
    const errorElement = document.getElementById('error-message');
    const spinningWheel = document.getElementById('animeWheel');
    const changingChoice = document.getElementById('searchType');

    // Fetch user data from Jikan API
    async function fetchUserData(username) {
        const type = document.getElementById('searchType').value;
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';

        try {
            animedata = [];
            mangadata = [];

            var animefoundall = false;
            var animeoffset = 0;

            while (animefoundall == false){ 
                const response = await fetch(`https://corsproxy.io/?url=https://myanimelist.net/animelist/${username}/load.json?offset=${animeoffset}`);
                if (!response.ok) {
                    throw new Error('User not found or proxy error');
                }
                const data = await response.json();
                animedata = animedata.concat(data)
                if (data.length == 0){
                    animefoundall = true;
                }
                animeoffset = animeoffset + 300

            }

            
            var mangafoundall = false;
            var mangaoffset = 0;

            while (mangafoundall == false){
                const response = await fetch(`https://corsproxy.io/?url=https://myanimelist.net/mangalist/${username}/load.json?offset=${animeoffset}`);
                if (!response.ok) {
                    throw new Error('User not found or proxy error');
                }
                const data = await response.json();
                mangadata = mangadata.concat(data)
                if (data.length == 0){
                    mangafoundall = true;
                }
                mangaoffset = mangaoffset + 300

            }
            
            const canvas = document.getElementById("animeWheel");
            const ctx = canvas.getContext("2d");

            let segments = [];

            if (type == "anime"){
                for (let anime of animedata) {
                    if (anime.status == 6 && anime.anime_score_val > 0) {
                        segments.push([anime.anime_title,anime.anime_id]); 
                    }
                }
            }

            if (type == "manga"){
                for (let manga of mangadata) {
                    if (manga.status == 6 && manga.manga_score_val > 0) {
                        segments.push([manga.manga_title,manga.manga_id]); 
                    }
                }
            }

            let angle = 0;
            let spinning = false;

            function drawWheel() {
                const total = segments.length;
                const arc = (2 * Math.PI) / total;
                const radius = 300; 
            
                for (let i = 0; i < total; i++) {
                    const startAngle = i * arc;
                    const endAngle = startAngle + arc;
            
                    ctx.beginPath();
                    ctx.fillStyle = i % 2 === 0 ? "#222" : "#333";
                    ctx.moveTo(250, 250);
                    ctx.arc(250, 250, radius, startAngle, endAngle);
                    ctx.fill();
            
                    ctx.lineWidth = 2; 
                    ctx.strokeStyle = "#000";
                    ctx.stroke();
            
                    ctx.save();
                    ctx.translate(250, 250);
                    ctx.rotate(startAngle + arc / 2); 
                    ctx.textAlign = "center"; 
                    ctx.fillStyle = "#fff"; 
                    ctx.font = "16px Arial";
            
                    const textRadius = radius - 125; 
                    if (segments[i][0]) {
                        ctx.fillText(segments[i][0].slice(0, 20), textRadius, 0); 
                    }
            
                    ctx.restore();
                }
            }
            
            function drawArrow() {
                ctx.fillStyle = "#bb86fc";
                ctx.beginPath();
                ctx.moveTo(500, 250);  
                ctx.lineTo(480, 260);
                ctx.lineTo(480, 240);
                ctx.closePath();
                ctx.fill();
            }              

            drawWheel();
            drawArrow();

            window.spinWheel = function () {
                if (spinning || segments.length === 0) return;
                spinning = true;
            
                let spinAngle = Math.random() * 2000 + 2000; // Spin between 2000-4000 degrees
                let spinTime = 0;
                let spinTimeTotal = 3000;
            
                const animateSpin = () => {
                    const type = document.getElementById('searchType').value;
                    spinTime += 30;
                    if (spinTime >= spinTimeTotal) {
                        spinning = false;
                        const selected = Math.floor(segments.length - (angle % 360) / (360 / segments.length)) % segments.length;

                        //Display of selected show
                        const chosenId = segments[selected][1]; 
                        var chosenMedia = ``;

                        if (type == "anime"){
                            fetch(`https://api.jikan.moe/v4/anime/${chosenId}/full`)
                            .then(response => response.json())
                            .then(data => {
                                const anime = data.data;
                                chosenMedia = chosenMedia + `
                                    <div id="result1">
                                        <h2 class="section-title">You got: ${anime.title}</h2>
                                    </div>
                                    <div id="result2">
                                        <img src="${anime.images.jpg.image_url}" alt="${anime.title_english ?? anime.title}" class="anime-img">
                                        <div>
                                            <p><strong>Type:</strong> ${anime.type}</p>
                                            <p><strong>Score:</strong> ${anime.score}</p>
                                            <p><strong>Episodes:</strong> ${anime.episodes}</p>
                                            <p><strong>Season:</strong> ${anime.year} ${anime.season}</p>
                                            <p><strong>Genres:</strong> ${anime.genres.map(genre => genre.name).join(', ')}</p>
                                            <br>
                                            <p><strong>Synopsis:</strong> ${anime.synopsis}</p>
                                            <a href="${anime.trailer.url}" target="_blank" class="trailer-link">Watch Trailer</a>
                                        </div>
                                    </div>
                                `;

                                document.getElementById("result").innerHTML = chosenMedia;
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        }

                        if (type == "manga"){
                            fetch(`https://api.jikan.moe/v4/manga/${chosenId}/full`)
                            .then(response => response.json())
                            .then(data => {
                                const manga = data.data;
                                chosenMedia = chosenMedia + `
                                    <div id="result1">
                                        <h2 class="section-title">You got: ${manga.title}</h2>
                                    </div>
                                    <div id="result2">
                                        <img src="${manga.images.jpg.image_url}" alt="${manga.title_english ?? manga.title}" class="anime-img">
                                        <div>
                                            <p><strong>Type:</strong> ${manga.type}</p>
                                            <p><strong>Score:</strong> ${manga.score}</p>
                                            <p><strong>Chapters:</strong> ${manga.chapters}</p>
                                            <p><strong>Volumes:</strong> ${manga.volumes}</p>
                                            <p><strong>Genres:</strong> ${manga.genres.map(genre => genre.name).join(', ')}</p>
                                            <br>
                                            <p><strong>Synopsis:</strong> ${manga.synopsis}</p>
                                        </div>
                                    </div>
                                `;

                                document.getElementById("result").innerHTML = chosenMedia;
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        }

                        
                        return;
                    }
                    const easeOut = spinAngle * Math.pow(1 - spinTime / spinTimeTotal, 3);
                    angle += easeOut / 10;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.save();
                    ctx.translate(250, 250);
                    ctx.rotate((angle * Math.PI) / 180);
                    ctx.translate(-250, -250);
                    drawWheel();
                    ctx.restore();
                    
                    drawArrow();
                    requestAnimationFrame(animateSpin);
                };
                animateSpin();
            }

        } catch (error) {
            console.log('Error fetching user data:', error);
            errorElement.textContent = `Error: ${error.message}. Please check the username and try again.`;
            errorElement.style.display = 'block';
        }  finally {
            loadingElement.style.display = 'none';
        }
    }

    // Event listeners

    spinningWheel.addEventListener('click', function() {
        document.getElementById("result").innerHTML = "";
        spinWheel();
    });

    changingChoice.addEventListener('change', function() {
        document.getElementById("result").innerHTML = "";
        const username = usernameInput.value.trim();
        if (username) {
            fetchUserData(username);
        }
    });

    searchBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (username) {
            fetchUserData(username);
        }
    });

    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const username = usernameInput.value.trim();
            if (username) {
                fetchUserData(username);
            }
        }
    });

    //Auto running if username in query
    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('username');

    if (usernameFromUrl) {
        usernameInput.value = usernameFromUrl; // Optional: Fill input field
        fetchUserData(usernameFromUrl);
    }
});
