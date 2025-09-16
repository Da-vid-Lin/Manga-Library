const board = document.getElementById('board');
let selectedCellIndex = null;

for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  cell.addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
    selectedCellIndex = i;
  });
  board.appendChild(cell);
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

function selectImage(imageUrl, title) {
  let cell;
  if (selectedCellIndex !== null) {
    cell = document.querySelector(`.cell[data-index='${selectedCellIndex}']`);
  } else {
    cell = Array.from(document.querySelectorAll('.cell')).find(c => !c.hasChildNodes());
    if (!cell) {
      alert('All cells are filled. Please select one to replace.');
      return;
    }
  }

  cell.innerHTML = '';

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

  let isDragging = false;
  let startY, startTop;

  img.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startTop = parseInt(img.style.top) || 0;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dy = e.clientY - startY;
    let newTop = startTop + dy;

    // Limit dragging so image doesn't show empty space
    const containerHeight = cell.clientHeight;
    const imgHeight = img.offsetHeight;

    const maxTop = 0;
    const minTop = containerHeight - imgHeight;

    // Clamp newTop between minTop and maxTop
    if (newTop > maxTop) newTop = maxTop;
    if (newTop < minTop) newTop = minTop;

    img.style.top = `${newTop}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });


  container.appendChild(img);
  container.appendChild(caption);
  cell.appendChild(container);
  selectedCellIndex = null;
}

function downloadBoard() {
  const captions = document.querySelectorAll('.caption');
  captions.forEach(caption => caption.style.display = 'none');

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
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
          e.preventDefault();
          searchAnime();
      }
  });
});