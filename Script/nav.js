fetch('/Pages/nav.html')
  .then(res => res.text())
  .then(html => document.getElementById('nav-placeholder').innerHTML = html);

fetch('/Pages/footer.html')
  .then(res => res.text())
  .then(html => document.getElementById('footer-placeholder').innerHTML = html);