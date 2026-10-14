/* 洛水天依 · 跳转页逻辑 */
(function () {
  'use strict';

  // —— 可调参数 ——
  var REDIRECT_URL = 'https://www.shou.edu.cn'; // 跳转目标（末尾不要加 /）
  var PRESERVE_PATH = true;                     // 是否保留原路径与查询参数
  var DURATION_MS = 7000;          // 跳转等待时间
  var PICTURE_DIR = 'pictures/';   // 图片目录
  var AUTHOR_URL = 'https://m.bilibili.com/space/3546859981244551'; // 作者主页链接

  var bg = document.getElementById('bg');
  var bar = document.getElementById('bar');
  var countdown = document.getElementById('countdown');
  var credit = document.getElementById('credit');
  var progress = document.querySelector('.progress');

  // 1) 随机选图作为背景
  var list = Array.isArray(window.PICTURES) ? window.PICTURES : [];
  if (list.length) {
    var pick = list[Math.floor(Math.random() * list.length)];
    var src = /^(https?:)?\/\//.test(pick) ? pick : PICTURE_DIR + pick;
    bg.addEventListener('load', function () { bg.classList.add('is-ready'); });
    bg.src = encodeURI(src);
    renderCredit(pick);
  } else {
    // 没有图片时给一个柔和的渐变兜底，并提示
    bg.style.background = 'linear-gradient(135deg, #c9e6ff, #e6f4ff 60%, #ffffff)';
    credit.textContent = '未在 pictures/ 目录找到图片';
  }

  // 2) 解析「作者 - 作品名」并渲染署名
  function renderCredit(filename) {
    var base = filename.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
    var i = base.indexOf('-');
    var author = '', work = base;
    if (i > 0) {
      author = base.slice(0, i).trim();
      work = base.slice(i + 1).trim();
    }
    var html = '';
    if (author) {
      var authorHtml = esc(author);
      if (AUTHOR_URL) {
        authorHtml = '<a class="credit__link" href="' + esc(AUTHOR_URL) +
          '" target="_blank" rel="noopener noreferrer">' + authorHtml + '</a>';
      }
      html += '作者：' + authorHtml + '<span class="credit__sep">·</span>';
    }
    html += '作品：' + esc(work);
    credit.innerHTML = html;
  }

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 组装跳转目标：可选保留原路径与查询参数
  function buildTarget() {
    var base = REDIRECT_URL.replace(/\/+$/, '');
    // 本地 file:// 打开时不保留路径（否则会把本地磁盘路径带上）
    if (!PRESERVE_PATH || location.protocol === 'file:') return base + '/';
    // 去掉结尾的 index.html，其余路径原样保留
    var path = location.pathname.replace(/index\.html$/i, '');
    return base + path + location.search;
  }

  // 3) 进度条 + 倒计时
  var start = null;
  var redirected = false;

  function tick(now) {
    if (start === null) start = now;
    var p = Math.min((now - start) / DURATION_MS, 1);
    var pct = Math.round(p * 100);

    progress.setAttribute('aria-valuenow', String(pct));
    var remain = Math.max(0, Math.ceil((DURATION_MS - (now - start)) / 1000));
    if (countdown.textContent !== String(remain)) countdown.textContent = String(remain);

    if (p < 1) {
      requestAnimationFrame(tick);
    } else if (!redirected) {
      redirected = true;
      window.location.replace(buildTarget());
    }
  }

  // 用 CSS 过渡驱动进度条宽度，用 rAF 同步倒计时
  requestAnimationFrame(function (now) {
    start = now;
    // 强制一次回流后设为 100%，触发过渡
    void bar.offsetWidth;
    bar.style.width = '100%';
    requestAnimationFrame(tick);
  });
})();
