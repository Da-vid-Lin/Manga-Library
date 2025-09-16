document.addEventListener('DOMContentLoaded', function() {
  const board = document.getElementById('board');
  let selectedCellIndex = null;

  const favourites = [
    "Favourite Anime of all time", "Best Story", "Favourite Art Style", `"I'll watch it some day"`, "Big Personal Impact", "Best fighting scenes / combat", "You like, but everyone hates", "You hate, but everyone likes", "Underrated", "Overrated", `"Why do I like this?"`, "Anime you can watch 100 times", "That atmosphere...", "Bad Day Cure", "Favourite Character", "Favourite Spin-Off", "Biggest Letdown", `"Back in the day" anime`, "Best Music / Soundtracks", "Criminally Overlooked", "Depressing Anime", "Favourite ACTIVE Anime Series", "Original Pick", `"Not usually my thing but..."`
  ];

  const years = [
    "2002", "2003", "2004", "2005", "2006", "2007",
    "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015",
    "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023",
    "2024", "2025"
  ];

  const letters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ];

  const changingChoice = document.getElementById('faveType');
  var messages = favourites

  changingChoice.addEventListener('change', function() {
    var choice = changingChoice.value.trim();
    
    if (choice == "1"){messages = favourites}
    if (choice == "2"){messages = years}
    if (choice == "3"){messages = letters}
    generateGrid(messages);
  });

  function generateGrid(messages) {
    while (board.firstChild) {board.removeChild(board.firstChild);}
    for (let i = 0; i < messages.length; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;

      // Add caption
      const caption = document.createElement('div');
      caption.classList.add('caption');
      caption.textContent = messages[i];
      cell.appendChild(caption);

      // Add selection logic
      cell.addEventListener('click', () => {
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        selectedCellIndex = i;
      });

      board.appendChild(cell);
    }
  }

  async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const type = document.getElementById('searchType').value;
    if (!query) return;

    const response = await fetch(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=6`);
    const data = await response.json();
    const results = document.getElementById('results');
    results.innerHTML = '';

    data.data.forEach(item => {
      const imageUrl = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url;
      const title = item.title || item.name;

      const container = document.createElement('div');
      container.classList.add('result');

      const img = document.createElement('img');
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.alt = title;

      const caption = document.createElement('div');
      caption.textContent = title;
      caption.style.fontSize = '12px';

      container.appendChild(img);
      container.appendChild(caption);
      container.onclick = () => selectImage(imageUrl, title);

      results.appendChild(container);
    });
  }

  const searchInput = document.getElementById("search-btn");
  searchInput.addEventListener("click", searchAnime);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchAnime()
    }
  });

  function selectImage(imageUrl, title) {
    let cell;
    if (selectedCellIndex !== null) {
      cell = document.querySelector(`.cell[data-index='${selectedCellIndex}']`);
    } else {
      cell = Array.from(document.querySelectorAll('.cell')).find(c => !c.querySelector('img'));
      if (!cell) {
        alert('All cells are filled. Please select one to replace.');
        return;
      }
    }

    const existingCaption = cell.querySelector('.caption');
    cell.innerHTML = '';
    if (existingCaption) cell.appendChild(existingCaption);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    const img = document.createElement('img');
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.style.top = '0px';
    img.style.left = '0px';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.objectFit = 'cover';
    img.style.transform = `scale(1.0)`;

    const caption = document.createElement('div');

    container.appendChild(img);
    container.appendChild(caption);
    cell.appendChild(container);
    selectedCellIndex = null;
  }

  const downloadInput = document.getElementById("download-btn");
  downloadInput.addEventListener("click", async () => {
    const captions = document.querySelectorAll('.caption');
    captions.forEach(caption => caption.style.display = 'block');

    html2canvas(board, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null
    }).then(canvas => {
      captions.forEach(caption => caption.style.display = 'block');

      const link = document.createElement('a');
      link.download = 'anime_board.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });

  generateGrid(messages);

});