async function fetchMangaSheet() {
    const sheetId = "2PACX-1vR1RKFrE4p-lyzf0P3-sDOaVV7i50Nx2DfbTYauHTg9S3UjTn7wzMXGNPTTmmvh_sUYNrqTbw_p4niX";
    const url = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;

    const response = await fetch(url);
    const text = await response.text();
    const rows = text.trim().split("\n").map(line => line.split(","));
    const dataRows = rows.slice(1);
    const mangaMap = {};

    dataRows.forEach(row => {
        const name = row[0].trim();
        const volume = Number(row[1].trim());
        const available = row[2].trim().toLowerCase() === "true";

        if (!mangaMap[name]) {
            mangaMap[name] = { name, volumes: [], status: [] };
        }

        mangaMap[name].volumes.push(volume);
        mangaMap[name].status.push(available);
    });

    // Convert map to array
    const mangaData = Object.values(mangaMap);

    return mangaData;
}


document.addEventListener("DOMContentLoaded", async function() {
    const loadingElement = document.querySelector('.loading');
    loadingElement.style.display = 'block';

    const listData = await fetchMangaSheet();
    const List = listData.map(item => item.name).sort();
    
    const cacheResponse = await fetch("Data/manga_cache.json");
    const mangaCache = await cacheResponse.json();

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

    let mangaList = ``;
    let totalAvailable = 0;
    let totalUnavailable = 0;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    for (let title of List) {
        const newTitle = title.toLowerCase().replaceAll(" ", "_");
        let manga;

        if (mangaCache[newTitle]) {
            manga = mangaCache[newTitle];
            console.log(`Loaded from cache: ${title}`);
        } else {
            try {
                console.log(`Fetching from API: ${title}`);
                const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    manga = data.data[0];
                } else {
                    console.log(`No results found for: ${title}`);
                }

                await sleep(1000);

            } catch (error) {
                console.error(`Error fetching manga "${title}":`, error);
            }
        }

        const genres = manga.genres.map(g => g.name).join(', ');
        const trailerLink = manga.url && manga.url ? `<a href="${manga.url}" target="_blank">Open MyAnimeList</a>` : "Trailer not available.";
        const mangaInfo = renderMangaVolumes(title);
        totalAvailable += mangaInfo.availableCount;
        totalUnavailable += mangaInfo.unavailableCount;


        mangaList += `
            <div class="choice-card">
                <a href="" onclick="return false">
                    <img src="${manga.images.jpg.large_image_url}" alt="${manga.title}">
                    <div class="content">
                        <h3>${manga.title_english ?? manga.title}</h3>
                        <hr>
                        <p><strong>Type:</strong> ${manga.type ?? "?"}</p>
                        <p><strong>Genres:</strong> ${genres ?? "?"}</p>
                        <p><strong>Available:</strong> ${mangaInfo.html}</p>
                        <hr>
                        <div class="trailer-link">${trailerLink}</div>
                    </div>
                </a>
            </div>
        `;

        document.getElementById("stat-placeholder").innerHTML = `<h3>Total Available: ${totalAvailable}/${totalAvailable + totalUnavailable}</h3><h3><span class="available">Green</span> = Available To Borrow</h3>`;
    }

    loadingElement.style.display = 'none';

    document.getElementById("list-placeholder").innerHTML = mangaList;

});


