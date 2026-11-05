/* J&L Consulting : logique du site public. Aucune dépendance. */
(function () {
  'use strict';

  /* Réglages à adapter */
  const CONFIG = {
    WHATSAPP: '242069640167',
    AIRTEL: '', // Exemple : '+242 05 000 00 00'. Vide : le site affiche « Numéro sur demande ».
    CONTENT_URL: 'data/content.json'
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const waLink = (text) => 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(text);

  /* Fiches pays */
  const tabs = $$('[role="tab"]');

  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    $('#bulle').textContent = tab.dataset.bulle;
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      selectTab(tabs[next], true);
    });
  });

  $$('[data-tab]').forEach((link) => {
    link.addEventListener('click', () => selectTab(document.getElementById('tab-' + link.dataset.tab)));
  });

  /* Carrousels des lieux emblématiques : les photos des fiches masquées ne sont pas téléchargées. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const AUTO_MS = 5000;
  const RESUME_MS = 8000;
  let autoPlay = !reduceMotion && !saveData;
  let ticketVisible = false;
  let lastTouch = 0;
  const pauseButtons = [];

  function paintPause() {
    pauseButtons.forEach((b) => {
      b.textContent = autoPlay ? '❚❚' : '▶︎';
      b.setAttribute('aria-label', autoPlay ? 'Mettre le défilement en pause' : 'Reprendre le défilement');
    });
  }

  function setupCarousel(root) {
    const track = $('.slides', root);
    const slides = $$('.slide', root);
    let index = 0;

    const counter = make('span', 'car-count');
    const paint = () => { counter.textContent = (index + 1) + ' / ' + slides.length; };
    const show = (n) => {
      index = (n + slides.length) % slides.length;
      track.scrollTo({ left: slides[index].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      paint();
    };
    const button = (cls, text, label, onClick) => {
      const b = make('button', 'car-btn ' + cls, text);
      b.type = 'button';
      if (label) b.setAttribute('aria-label', label);
      b.addEventListener('click', onClick);
      root.appendChild(b);
      return b;
    };

    root.appendChild(counter);
    button('car-prev', '‹', 'Photo précédente', () => { lastTouch = Date.now(); show(index - 1); });
    button('car-next', '›', 'Photo suivante', () => { lastTouch = Date.now(); show(index + 1); });
    pauseButtons.push(button('car-pause', '', '', () => { autoPlay = !autoPlay; paintPause(); }));

    track.addEventListener('scroll', () => {
      if (!track.clientWidth) return;
      const seen = Math.round(track.scrollLeft / track.clientWidth);
      if (seen !== index) { index = seen; paint(); }
    }, { passive: true });
    root.addEventListener('pointerdown', () => { lastTouch = Date.now(); });
    paint();

    return { root, next: () => show(index + 1) };
  }

  const carousels = $$('.carousel').map(setupCarousel);
  paintPause();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      ticketVisible = entries[0].isIntersecting;
    }, { threshold: 0.2 }).observe($('.ticket'));
  }

  setInterval(() => {
    if (!autoPlay || !ticketVisible || document.hidden || Date.now() - lastTouch < RESUME_MS) return;
    const current = carousels.find((c) => c.root.offsetParent !== null);
    if (!current || current.root.matches(':hover') || current.root.contains(document.activeElement)) return;
    current.next();
  }, AUTO_MS);

  /* Liens qui préremplissent le formulaire de rendez-vous */
  $$('[data-dest], [data-motif]').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.dest) $('#rdv-dest').value = link.dataset.dest;
      if (link.dataset.motif) $('#rdv-motif').value = link.dataset.motif;
    });
  });

  /* Ouvre WhatsApp et laisse un lien de secours si le navigateur bloque l'onglet */
  function sendToWhatsApp(text, statusEl) {
    const url = waLink(text);
    window.open(url, '_blank', 'noopener');
    statusEl.textContent = 'Votre message est prêt. Dans WhatsApp, appuyez sur Envoyer. ';
    const again = document.createElement('a');
    again.href = url;
    again.target = '_blank';
    again.rel = 'noopener';
    again.textContent = 'Rouvrir WhatsApp';
    statusEl.appendChild(again);
  }

  /* Rendez-vous */
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  $('#rdv-date').min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  function frenchDate(iso) {
    const parts = iso.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  $('#form-rdv').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.elements;
    sendToWhatsApp([
      'Bonjour J&L Consulting, je souhaite prendre rendez-vous.',
      '',
      'Nom : ' + f.nom.value.trim(),
      'Motif : ' + f.motif.options[f.motif.selectedIndex].text,
      'Destination : ' + f.destination.value,
      'Date souhaitée : ' + frenchDate(f.date.value),
      'Format : ' + f.format.value,
      '',
      'Merci de me confirmer la disponibilité.'
    ].join('\n'), $('#rdv-status'));
  });

  /* Mobile Money */
  if (CONFIG.AIRTEL) {
    $('#num-airtel').textContent = CONFIG.AIRTEL;
    $('#airtel-numero').hidden = false;
    $('#airtel-demande').hidden = true;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    }
  }

  $$('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      const ok = await copyText($(btn.dataset.copy).textContent.replace(/\s/g, ''));
      btn.textContent = ok ? 'Numéro copié' : 'Copie impossible';
      setTimeout(() => { btn.textContent = label; }, 2000);
    });
  });

  $('#form-transfert').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const lines = [
      'Bonjour J&L Consulting, je déclare un transfert Mobile Money.',
      '',
      'Nom : ' + f.nom.value.trim(),
      'Réseau : ' + f.reseau.value,
      'Numéro ayant payé : ' + f.tel.value.trim(),
      'Montant : ' + Number(f.montant.value).toLocaleString('fr-FR') + ' FCFA',
      'Référence de transaction : ' + f.ref.value.trim()
    ];
    if (f.objet.value.trim()) lines.push('Prestation ou devis : ' + f.objet.value.trim());
    lines.push('', 'Merci de vérifier la réception.');
    sendToWhatsApp(lines.join('\n'), $('#pay-status'));
  });

  /* Témoignages et vidéos publiés depuis l'espace admin */
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function renderTestimonials(items) {
    const list = $('#liste-temoignages');
    items.forEach((t) => {
      if (!t || !t.name || !t.text) return;
      const fig = make('figure', 'quote');
      fig.appendChild(make('blockquote', '', t.text));
      const cap = make('figcaption', '', t.name);
      if (t.country) cap.appendChild(make('span', '', t.country));
      fig.appendChild(cap);
      list.appendChild(fig);
    });
    $('#temoignages').hidden = !list.children.length;
  }

  /* L'iframe YouTube n'est chargée qu'au clic pour préserver le forfait des visiteurs. */
  function renderVideos(items) {
    const list = $('#liste-videos');
    items.forEach((v) => {
      if (!v || !/^[\w-]{11}$/.test(v.id)) return;
      const title = v.title || 'Vidéo J&L Consulting';
      const box = make('article', 'video');
      const btn = make('button', 'frame');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Lire la vidéo : ' + title);
      const img = make('img');
      img.src = 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg';
      img.alt = '';
      img.loading = 'lazy';
      img.width = 320;
      img.height = 180;
      btn.append(img, make('span', 'play'));
      btn.addEventListener('click', () => {
        const wrap = make('div', 'frame');
        const iframe = make('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0';
        iframe.title = title;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        wrap.appendChild(iframe);
        btn.replaceWith(wrap);
      });
      box.appendChild(btn);
      if (v.title) box.appendChild(make('h3', '', v.title));
      list.appendChild(box);
    });
    $('#videos').hidden = !list.children.length;
  }

  fetch(CONFIG.CONTENT_URL, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((data) => {
      renderTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
      renderVideos(Array.isArray(data.videos) ? data.videos : []);
    })
    .catch(() => { /* Sections facultatives : elles restent masquées. */ });
})();
