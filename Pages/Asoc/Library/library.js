document.addEventListener("DOMContentLoaded", async function() {
    const loadingElement = document.querySelector('.loading');
    loadingElement.style.display = 'block';

    const listResponse = await fetch("Data/library2.json");
    const listData = await listResponse.json();
    const List = listData.map(item => item.name).sort();
    
    const cacheResponse = await fetch("Data/manga_cache.json");
    const animeCache = await cacheResponse.json();

    function renderMangaVolumes(mangaName) {
        const manga = listData.find(item => item.name === mangaName);

        let html = "";
        let availableCount = 0;
        let unavailableCount = 0;

        manga.volumes.forEach((volume, index) => {
            if (manga.status[index]) {
                html += `<span class="unavailable">${volume}</span> `;
                unavailableCount++;
            } else {
                html += `<span class="available">${volume}</span> `;
                availableCount++;
            }
        });
        return {html, availableCount, unavailableCount};
    }

    document.getElementById("stat-placeholder").innerHTML = "";

    let animeList = ``;
    let totalAvailable = 0;
    let totalUnavailable = 0;

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

        const genres = anime.genres.map(g => g.name).join(', ');
        const trailerLink = anime.url && anime.url ? `<a href="${anime.url}" target="_blank">Open MyAnimeList</a>` : "Trailer not available.";
        const mangaInfo = renderMangaVolumes(title);
        totalAvailable += mangaInfo.availableCount;
        totalUnavailable += mangaInfo.unavailableCount;


        animeList += `
            <div class="choice-card">
                <a href="" onclick="return false">
                    <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                    <div class="content">
                        <h3>${anime.title_english ?? anime.title}</h3>
                        <hr>
                        <p><strong>Type:</strong> ${anime.type ?? "?"}</p>
                        <p><strong>Genres:</strong> ${genres ?? "?"}</p>
                        <p><strong>Available:</strong> ${mangaInfo.html}</p>
                        <hr>
                        <div class="trailer-link">${trailerLink}</div>
                    </div>
                </a>
            </div>
        `;

        document.getElementById("stat-placeholder").innerHTML = `<h3>Total Available: ${totalAvailable}/${totalAvailable + totalUnavailable}</h3><h3>Green = Available To Borrow</h3>`;
    }

    loadingElement.style.display = 'none';

    document.getElementById("list-placeholder").innerHTML = animeList;

});


