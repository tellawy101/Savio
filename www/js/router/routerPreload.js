// ======================================
// router/routerPreload.js
// تحميل باقي الصفحات في الخلفية
// ======================================

// تحميل باقي الصفحات في الخلفية بعد أول تحميل
function preloadAllPages() {
    const pageNames = Object.keys(ROUTES);
    let index = 0;
    
    function loadNext() {
        if (index >= pageNames.length) return;
        const pageName = pageNames[index];
        index++;
        
        if (!templateCache[pageName]) {
            fetch(ROUTES[pageName].template)
                .then(function(res) {
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    return res.text();
                })
                .then(function(html) {
                    templateCache[pageName] = html;
                })
                .catch(function() {})
                .finally(function() {
                    setTimeout(loadNext, 50);
                });
        } else {
            setTimeout(loadNext, 0);
        }
    }
    
    loadNext();
}

setTimeout(preloadAllPages, 800);