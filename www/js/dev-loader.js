(async () => {
    const v = Date.now();
    const res = await fetch('index.html?v=' + v, { cache: 'no-store' });
    let html = await res.text();
    html = html.replace(/(href|src)="((?:css|js)\/[^"?]+)(\?[^"]*)?"/g, '$1="$2?v=' + v + '"');
    document.open();
    document.write(html);
    document.close();
})();