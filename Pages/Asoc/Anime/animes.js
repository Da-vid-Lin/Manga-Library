document.addEventListener("DOMContentLoaded", async function() {
    const loadingElement = document.querySelector('.loading');
    loadingElement.style.display = 'block';

    const listResponse = await fetch("Script/Cache/anime_list.json");
    const listData = await listResponse.json();
    const List = listData.anime_titles.sort();
    
    const cacheResponse = await fetch("Script/Cache/anime_cache.json");
    const animeCache = await cacheResponse.json();

    const statResponse = await fetch("Script/Cache/anime_summary.json");
    const animeStat = await statResponse.json();

    //document.getElementById("stat-placeholder").innerHTML = "<h3> Total Episodes: " + animeStat["total_tv_episodes"] + "</h3>";
    var episodeCount = 0;
    document.getElementById("stat-placeholder").innerHTML = "<h3> Total Episodes: " + episodeCount + "</h3>";

    let animeList = ``;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    for (let title of List) {
        const newTitle = title.toLowerCase().replaceAll(" ", "_");
        let anime;

        if (animeCache[newTitle]) {
            anime = animeCache[newTitle];
            console.log(`Loaded from cache: ${title}`);
        } else {
            try {
                console.log(`Fetching from API: ${title}`);
                const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    anime = data.data[0];
                } else {
                    console.log(`No results found for: ${title}`);
                }

                await sleep(1000);

            } catch (error) {
                console.error(`Error fetching anime "${title}":`, error);
            }
        }
        episodeCount = episodeCount + anime.episodes
        document.getElementById("stat-placeholder").innerHTML = "<h3> Total Episodes: " + episodeCount + "</h3>";

        const genres = anime.genres.map(g => g.name).join(', ');
        const trailerLink = anime.trailer && anime.trailer.url ? `<a href="${anime.trailer.url}" target="_blank">Watch Trailer</a>` : "Trailer not available.";

        animeList += `
            <div class="choice-card">
                <a href="Pages/Media/Watch/watch.html?${newTitle}&${anime.episodes ?? 0}">
                    <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                    <div class="content">
                        <h3>${anime.title_english ?? anime.title}</h3>
                        <hr>
                        <p><strong>Episodes:</strong> ${anime.episodes ?? "?"}</p>
                        <p><strong>Type:</strong> ${anime.type ?? "?"}</p>
                        <p><strong>Score:</strong> ${anime.score ?? "?"}</p>
                        <p><strong>Genres:</strong> ${genres ?? "?"}</p>
                        <hr>
                        <div class="trailer-link">${trailerLink}</div>
                    </div>
                </a>
            </div>
        `;
    }

    loadingElement.style.display = 'none';

    document.getElementById("list-placeholder").innerHTML = animeList;

});


