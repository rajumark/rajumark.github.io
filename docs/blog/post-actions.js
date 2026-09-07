/* Copy link + share, shared by every post page. */

(function () {
  'use strict';

  var bar = document.querySelector('.post-nav-inner');
  if (!bar) return;

  var pageUrl = function () {
    var link = document.querySelector('link[rel="canonical"]');
    // Prefer the canonical URL so a shared link never points at localhost.
    return (link && link.href) || window.location.href;
  };

  var pageTitle = function () {
    var h1 = document.querySelector('.post-header h1');
    return h1 ? h1.textContent.trim() : document.title;
  };

  var ICONS = {
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
  };

  var actions = document.createElement('div');
  actions.className = 'post-actions';

  var copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'action-btn';
  copyBtn.innerHTML = ICONS.copy + '<span>Copy link</span>';

  var shareWrap = document.createElement('div');
  shareWrap.className = 'share-wrap';

  var shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'action-btn';
  shareBtn.setAttribute('aria-haspopup', 'true');
  shareBtn.setAttribute('aria-expanded', 'false');
  shareBtn.innerHTML = ICONS.share + '<span>Share</span>';

  shareWrap.appendChild(shareBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(shareWrap);
  bar.appendChild(actions);

  /* ---- copy link ---- */

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  var resetTimer;
  function flash(msg, isError) {
    clearTimeout(resetTimer);
    copyBtn.innerHTML = (isError ? ICONS.copy : ICONS.check) + '<span>' + msg + '</span>';
    copyBtn.classList.toggle('done', !isError);
    resetTimer = setTimeout(function () {
      copyBtn.innerHTML = ICONS.copy + '<span>Copy link</span>';
      copyBtn.classList.remove('done');
    }, 2000);
  }

  copyBtn.addEventListener('click', function () {
    var url = pageUrl();
    function viaFallback() {
      var ok = fallbackCopy(url);
      flash(ok ? 'Copied' : 'Copy failed', !ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { flash('Copied'); }, viaFallback);
    } else {
      viaFallback();
    }
  });

  /* ---- share ---- */

  var menu = null;

  function closeMenu() {
    if (!menu) return;
    menu.remove();
    menu = null;
    shareBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKey, true);
  }

  function onDocClick(e) {
    if (menu && !menu.contains(e.target) && !shareBtn.contains(e.target)) closeMenu();
  }

  function onKey(e) {
    if (e.key === 'Escape') { closeMenu(); shareBtn.focus(); }
  }

  function openMenu() {
    var url = pageUrl();
    var title = pageTitle();
    var u = encodeURIComponent(url);
    var t = encodeURIComponent(title);

    var targets = [
      ['X / Twitter', 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u],
      ['LinkedIn',    'https://www.linkedin.com/sharing/share-offsite/?url=' + u],
      ['WhatsApp',    'https://api.whatsapp.com/send?text=' + t + '%20' + u],
      ['Reddit',      'https://www.reddit.com/submit?url=' + u + '&title=' + t],
      ['Email',       'mailto:?subject=' + t + '&body=' + u]
    ];

    menu = document.createElement('div');
    menu.className = 'share-menu';
    targets.forEach(function (pair) {
      var a = document.createElement('a');
      a.textContent = pair[0];
      a.href = pair[1];
      if (pair[1].indexOf('mailto:') !== 0) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.addEventListener('click', closeMenu);
      menu.appendChild(a);
    });

    shareWrap.appendChild(menu);
    shareBtn.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
  }

  shareBtn.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({ title: pageTitle(), url: pageUrl() }).catch(function () { /* dismissed */ });
      return;
    }
    if (menu) closeMenu(); else openMenu();
  });
})();
