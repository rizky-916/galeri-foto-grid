/*
 * Galeri Foto Grid — logika tampilan & lightbox.
 * Tidak perlu diedit; atur isi galeri di gallery-data.js.
 *
 * Prinsip keamanan:
 * - Semua teks dari konfigurasi dimasukkan lewat textContent (bukan innerHTML),
 *   jadi tidak bisa menyisipkan HTML/skrip.
 * - Path gambar divalidasi: hanya file di origin yang sama yang diterima.
 */
(function () {
    "use strict";

    var MAX_TEXT = 300; // batas panjang teks agar tata letak tidak rusak

    var config = window.GALLERY_CONFIG || {};
    var site = config.site || {};
    var photos = sanitizePhotos(Array.isArray(config.photos) ? config.photos : []);

    /* ---------- Utilitas ---------- */

    function cleanText(value) {
        if (typeof value !== "string") return "";
        var text = value.trim();
        return text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + "…" : text;
    }

    // Mengembalikan path jika aman (lokal, origin sama), selain itu null.
    function safeLocalPath(path) {
        if (typeof path !== "string") return null;
        var p = path.trim();
        if (!p) return null;
        // Tolak skema apa pun (http:, javascript:, data:, ...), URL "//host", dan backslash.
        if (/^[a-z][a-z0-9+.\-]*:/i.test(p) || p.indexOf("//") === 0 || p.indexOf("\\") !== -1) {
            return null;
        }
        try {
            var url = new URL(p, document.baseURI);
            if (url.protocol !== window.location.protocol || url.host !== window.location.host) {
                return null;
            }
        } catch (e) {
            return null;
        }
        return p;
    }

    function sanitizePhotos(list) {
        var result = [];
        list.forEach(function (item, i) {
            if (!item || typeof item !== "object") return;
            var src = safeLocalPath(item.src);
            if (!src) {
                console.warn("[Galeri] Foto #" + (i + 1) + " dilewati: 'src' kosong atau bukan path lokal.");
                return;
            }
            var alt = cleanText(item.alt);
            if (!alt) {
                console.warn("[Galeri] Foto #" + (i + 1) + " tidak punya 'alt'. Tambahkan deskripsi demi aksesibilitas.");
            }
            result.push({
                src: src,
                thumb: safeLocalPath(item.thumb) || src,
                alt: alt,
                caption: cleanText(item.caption)
            });
        });
        return result;
    }

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el && value) el.textContent = value;
    }

    /* ---------- Header & footer ---------- */

    var title = cleanText(site.title);
    setText("gallery-title", title);
    setText("gallery-subtitle", cleanText(site.subtitle));
    setText("gallery-footer", cleanText(site.footer).replace(/\{year\}/g, String(new Date().getFullYear())));
    if (title) document.title = title;

    /* ---------- Grid ---------- */

    var grid = document.getElementById("gallery-grid");
    var emptyNotice = document.getElementById("gallery-empty");

    if (photos.length === 0) {
        emptyNotice.hidden = false;
        return;
    }

    var fragment = document.createDocumentFragment();

    photos.forEach(function (photo, index) {
        var li = document.createElement("li");
        li.className = "gallery-cell";

        var button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-item";
        button.setAttribute("aria-label", "Perbesar: " + (photo.caption || photo.alt || "foto " + (index + 1)));
        button.addEventListener("click", function () { openLightbox(index); });

        var img = document.createElement("img");
        img.src = photo.thumb;
        img.alt = photo.alt;
        img.width = 800;   // rasio 4:3 → mencegah pergeseran tata letak
        img.height = 600;
        img.loading = index < 4 ? "eager" : "lazy";
        img.decoding = "async";
        img.addEventListener("error", function () {
            button.classList.add("is-broken");
            console.warn("[Galeri] Gambar tidak ditemukan: " + photo.thumb);
        });
        button.appendChild(img);

        if (photo.caption) {
            var cap = document.createElement("span");
            cap.className = "gallery-caption";
            cap.textContent = photo.caption;
            button.appendChild(cap);
        }

        li.appendChild(button);
        fragment.appendChild(li);
    });

    grid.appendChild(fragment);

    /* ---------- Lightbox ---------- */

    var dialog = document.getElementById("lightbox");
    var lbImg = document.getElementById("lightbox-img");
    var lbCaption = document.getElementById("lightbox-caption");
    var lbCounter = document.getElementById("lightbox-counter");
    var current = 0;

    if (!dialog || typeof dialog.showModal !== "function") {
        // Browser lama tanpa <dialog>: tetap tampilkan grid, tanpa lightbox.
        grid.classList.add("no-lightbox");
        return;
    }

    if (photos.length < 2) dialog.classList.add("is-single");

    function show(index) {
        current = (index + photos.length) % photos.length;
        var photo = photos[current];
        lbImg.src = photo.src;
        lbImg.alt = photo.alt;
        lbCaption.textContent = photo.caption || photo.alt;
        lbCounter.textContent = (current + 1) + " / " + photos.length;
        preload(current + 1);
        preload(current - 1);
    }

    function preload(index) {
        var photo = photos[(index + photos.length) % photos.length];
        var img = new Image();
        img.src = photo.src;
    }

    function openLightbox(index) {
        show(index);
        if (!dialog.open) dialog.showModal();
    }

    function closeLightbox() {
        if (dialog.open) dialog.close();
    }

    dialog.addEventListener("click", function (event) {
        var action = event.target.closest("[data-action]");
        if (action) {
            var name = action.getAttribute("data-action");
            if (name === "close") closeLightbox();
            else if (name === "prev") show(current - 1);
            else if (name === "next") show(current + 1);
            return;
        }
        // Klik di area gelap (bukan pada gambar) menutup lightbox.
        if (event.target === dialog || event.target.classList.contains("lightbox-figure")) {
            closeLightbox();
        }
    });

    dialog.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
        else if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
    });

    // Geser (swipe) di layar sentuh.
    var touchStartX = null;
    dialog.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) > 50 && photos.length > 1) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    dialog.addEventListener("close", function () {
        lbImg.removeAttribute("src");
    });
})();
