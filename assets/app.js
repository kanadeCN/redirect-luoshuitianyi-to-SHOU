/* 洛水天依 · 跳转页逻辑 */
(function () {
  'use strict';

  // —— 可调参数 ——
  var REDIRECT_URL = 'https://www.shou.edu.cn'; // 跳转目标（末尾不要加 /）
  var PRESERVE_PATH = true;                     // 是否保留原路径与查询参数
  var DURATION_MS = 7000;          // 跳转等待时间
  var PICTURE_DIR = 'pictures/';   // 图片目录

  // —— 作者 / 作品信息模块（见 assets/gallery.js）——
  var GALLERY = window.GALLERY || {};
  var AUTHORS = GALLERY.authors || {};
  var WORKS = GALLERY.works || {};

  var bg = document.getElementById('bg');
  var bar = document.getElementById('bar');
  var countdown = document.getElementById('countdown');
  var credit = document.getElementById('credit');
  var progress = document.querySelector('.progress');

  // 1) 候选图片 = 自动扫描结果 ∪ gallery.works 中登记的条目
  var candidates = [];
  if (Array.isArray(window.PICTURES)) candidates = candidates.concat(window.PICTURES);
  Object.keys(WORKS).forEach(function (k) {
    if (candidates.indexOf(k) === -1) candidates.push(k);
  });

  if (candidates.length) {
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    var src = /^(https?:)?\/\//.test(pick) ? pick : PICTURE_DIR + pick;
    bg.addEventListener('load', function () { bg.classList.add('is-ready'); });
    bg.src = encodeURI(src);
    renderCredit(pick);
  } else {
    // 没有图片时给一个柔和的渐变兜底，并提示
    bg.style.background = 'linear-gradient(135deg, #66ccff, #cfeaff 60%, #ffffff)';
    credit.textContent = '未在 pictures/ 目录找到图片';
  }

  // 2) 解析某张图片的作者 / 作品信息
  //    优先用 gallery.js 的配置，未登记则回退为「作者-作品名.ext」文件名解析
  function resolveMeta(filename) {
    var short = filename.replace(/^.*\//, '');
    var base = short.replace(/\.[^.]+$/, '');

    // 文件名兜底值
    var authorName = '', title = base;
    var i = base.indexOf('-');
    if (i > 0) {
      authorName = base.slice(0, i).trim();
      title = base.slice(i + 1).trim();
    }

    // gallery 配置覆盖
    var m = WORKS[filename] || WORKS[short];
    if (m) {
      if (m.title) title = m.title;
      if (m.author) {
        if (typeof m.author === 'string') {
          var a = AUTHORS[m.author];
          authorName = a && a.name ? a.name : m.author;
        } else {
          authorName = m.author.name || authorName;
        }
      }
    }

    // 按作者名查链接
    var authorUrl = '';
    for (var key in AUTHORS) {
      if (AUTHORS.hasOwnProperty(key) && AUTHORS[key].name === authorName) {
        authorUrl = AUTHORS[key].url || '';
        break;
      }
    }
    return { author: authorName, url: authorUrl, title: title };
  }

  // 3) 渲染署名
  function renderCredit(filename) {
    var meta = resolveMeta(filename);
    var html = '';
    if (meta.author) {
      var authorHtml = esc(meta.author);
      if (meta.url) {
        authorHtml = '<a class="credit__link" href="' + esc(meta.url) +
          '" target="_blank" rel="noopener noreferrer">' + authorHtml + '</a>';
      }
      html += '画师：' + authorHtml + '<span class="credit__sep">·</span>';
    }
    html += '作品：' + esc(meta.title);
    credit.innerHTML = html;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
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

  // 4) 进度条 + 倒计时
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
