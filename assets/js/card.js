/* ============================================================
   Channel 卡片交互：图片slider + 分享按钮
   Channel.html 的瀑布流和 channel-item.html 的独立页共用。
   瀑布流分列逻辑（__channelMasonry）是 Channel 专属，留在 Channel.html。
   ============================================================ */

/* 分享按钮：X/WhatsApp是纯intent链接（markup里直接写）；
   Instagram没有网页分享接口，行为=复制链接+新窗口打开Instagram+toast提示粘贴；
   原生分享用Web Share API（手机端唤起系统分享面板），不支持的浏览器退化为复制链接 */
(function () {
    var toastEl;
    var toastTimer;
    function showToast(msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'share-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
    }
    function copyText(text, doneMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { showToast(doneMsg); });
        } else {
            showToast('复制失败，请手动复制地址');
        }
    }
    document.querySelectorAll('[data-share-ig]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            copyText(btn.dataset.shareUrl, '链接已复制，请在 Instagram 里粘贴');
            window.open('https://www.instagram.com/', '_blank', 'noopener');
        });
    });
    document.querySelectorAll('[data-share-native]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share({ title: btn.dataset.shareTitle, url: btn.dataset.shareUrl }).catch(function () {});
            } else {
                copyText(btn.dataset.shareUrl, '链接已复制');
            }
        });
    });
})();

/* 卡片图片slider：左右箭头循环切换，圆点直达；单图卡片没有[data-slider]标记不会进这里 */
document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-slider-track]');
    var count = track.children.length;
    if (count < 2) return;
    var dots = slider.querySelectorAll('[data-slider-dot]');
    var index = 0;
    function go(i) {
        index = (i + count) % count;
        track.style.transform = 'translateX(-' + index * 100 + '%)';
        dots.forEach(function (d, k) { d.classList.toggle('active', k === index); });
    }
    slider.querySelector('[data-slider-prev]').addEventListener('click', function () { go(index - 1); });
    slider.querySelector('[data-slider-next]').addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (d) {
        d.addEventListener('click', function () { go(parseInt(d.dataset.sliderDot, 10)); });
    });
});
