/* Channel「英语6000小时」：圆点目录 + 点读正文
   数据全部按需加载，Channel 首屏不受影响：
   - 第一次切到这个分类才拿 index.json 画圆点，并默认打开第一篇
   - 点圆点才拿那一篇的 sentences.json
   - 音频点到哪句才拿哪句的 mp3
   数据由源文件夹的 _sync_to_site.py 生成；assets/english/ 已在 robots.txt 里禁止抓取，不被收录。
   播放逻辑照搬自口语进阶 html/01-demo.html */
(function () {
    var BASE = '/assets/english/';
    // 与 01-demo.html 的 tiers 表一致，index.json 里的 tier 是这里的下标
    var TIERS = [
        { name: '开口篇', color: '#74BF9E' },
        { name: '基础篇', color: '#66C7E8' },
        { name: '进阶I', color: '#C2BDF3' },
        { name: '进阶II', color: '#F2BA5D' },
        { name: '进阶III', color: '#F56542' }
    ];

    var root = document.getElementById('cat-english');
    if (!root) return;
    var dotsEl = root.querySelector('.english-dots');
    var titleEl = root.querySelector('.english-title');
    var articleEl = root.querySelector('.english-article');
    var playBtn = root.querySelector('.english-play');
    var playIcon = root.querySelector('.english-play-icon');
    var playLabel = root.querySelector('.english-play-label');

    var loaded = false;
    var currentNum = null;
    var loadToken = 0;        // 连点圆点时，只认最后一次请求的结果
    var cache = {};           // 已加载过的篇目，点回去不再请求

    var sentences = [];
    var currentAudio = null;
    var playState = 'stopped'; // 'stopped' | 'playing' | 'paused'
    var playIndex = 0;

    function stop() {
        if (currentAudio) currentAudio.pause();
        currentAudio = null;
        playState = 'stopped';
        playIndex = 0;
        updateControlUI();
    }

    function speak(i, onEnd) {
        var audio = new Audio(BASE + currentNum + '/' + String(i).padStart(3, '0') + '.mp3');
        currentAudio = audio;
        if (onEnd) audio.onended = onEnd;
        audio.play();
    }

    function updateControlUI() {
        if (playState === 'playing') {
            playIcon.className = 'english-play-icon is-pause';
            playLabel.textContent = '暂停';
        } else {
            playIcon.className = 'english-play-icon';
            playLabel.textContent = '播放全文';
        }
    }

    function playOne(i) {
        if (currentAudio) currentAudio.pause();
        playState = 'stopped';
        updateControlUI();
        speak(i);
    }

    function advancePlayAll() {
        if (playState !== 'playing' || playIndex >= sentences.length) {
            playState = 'stopped';
            playIndex = 0;
            updateControlUI();
            return;
        }
        speak(playIndex, function () {
            playIndex++;
            advancePlayAll();
        });
    }

    function togglePlayAll() {
        if (!sentences.length) return;
        if (playState === 'playing') {
            if (currentAudio) currentAudio.pause();
            playState = 'paused';
            updateControlUI();
        } else if (playState === 'paused') {
            playState = 'playing';
            updateControlUI();
            if (currentAudio) currentAudio.play();
        } else {
            if (currentAudio) currentAudio.pause();
            playState = 'playing';
            playIndex = 0;
            updateControlUI();
            advancePlayAll();
        }
    }

    function render(item, paragraphs) {
        titleEl.textContent = item.num + ' / ' + item.title;
        articleEl.innerHTML = '';
        sentences = [];
        paragraphs.forEach(function (para) {
            var p = document.createElement('p');
            para.forEach(function (text) {
                var span = document.createElement('span');
                span.className = 'english-sentence';
                span.textContent = text;
                var idx = sentences.length;
                span.onclick = function () { playOne(idx); };
                sentences.push(text);
                p.appendChild(span);
                p.appendChild(document.createTextNode(' '));
            });
            articleEl.appendChild(p);
        });
    }

    function open(item) {
        stop();
        currentNum = item.num;
        dotsEl.querySelectorAll('.english-dot').forEach(function (d) {
            d.classList.toggle('is-current', d.dataset.num === item.num);
        });
        var token = ++loadToken;
        if (cache[item.num]) {
            render(item, cache[item.num]);
            return;
        }
        titleEl.textContent = item.num + ' / ' + item.title;
        articleEl.innerHTML = '';
        sentences = [];
        fetch(BASE + item.num + '/sentences.json')
            .then(function (r) { return r.json(); })
            .then(function (paragraphs) {
                cache[item.num] = paragraphs;
                if (token === loadToken) render(item, paragraphs);
            })
            .catch(function () {
                if (token === loadToken) articleEl.textContent = '加载失败，请刷新重试';
            });
    }

    function activate() {
        if (loaded) return;
        loaded = true;
        fetch(BASE + 'index.json')
            .then(function (r) { return r.json(); })
            .then(function (items) {
                items.forEach(function (item) {
                    var tier = TIERS[item.tier] || TIERS[0];
                    var dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'english-dot';
                    dot.dataset.num = item.num;
                    dot.textContent = item.num;
                    dot.title = item.num + ' · ' + item.title + '（' + tier.name + '）';
                    dot.style.backgroundColor = tier.color;
                    dot.onclick = function () { open(item); };
                    dotsEl.appendChild(dot);
                });
                if (items.length) open(items[0]);
            })
            .catch(function () {
                loaded = false;
                articleEl.textContent = '加载失败，请刷新重试';
            });
    }

    playBtn.onclick = togglePlayAll;

    // Channel.html 的 showCategory 切分类时调用：切进来加载，切走停音频
    window.__englishOnCategory = function (id) {
        if (id === 'cat-english') activate();
        else stop();
    };
})();
