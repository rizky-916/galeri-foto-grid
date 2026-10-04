/*
 * ============================================================
 *  KONFIGURASI GALERI — cukup edit file ini.
 * ============================================================
 *
 *  site.title     : judul di header
 *  site.subtitle  : teks kecil di bawah judul
 *  site.footer    : teks footer; "{year}" otomatis diganti tahun berjalan
 *
 *  photos[]       : daftar foto, tampil sesuai urutan
 *    src     (wajib)    path gambar ukuran penuh (untuk lightbox)
 *    thumb   (opsional) path gambar kecil untuk grid; jika kosong pakai src
 *    alt     (wajib)    deskripsi gambar untuk pembaca layar
 *    caption (opsional) keterangan yang tampil di kartu & lightbox
 *
 *  Catatan keamanan:
 *  - Path gambar harus berada di situs ini sendiri (mis. "assets/images/...").
 *    URL eksternal, "javascript:", "data:" dan sejenisnya akan ditolak.
 *  - Teks ditampilkan sebagai teks biasa, bukan HTML.
 *  - Hapus metadata EXIF/GPS dari foto pribadi sebelum diunggah
 *    (lihat tools/strip_exif.py).
 */
window.GALLERY_CONFIG = {
    site: {
        title: "Galeri Foto",
        subtitle: "Koleksi foto pilihan",
        footer: "© {year} Galeri Foto"
    },

    photos: [
        { src: "assets/images/sample-01.jpg", thumb: "assets/images/thumbs/sample-01.jpg", alt: "Gambar contoh 1: gradasi hijau dengan lingkaran", caption: "Contoh 1" },
        { src: "assets/images/sample-02.jpg", thumb: "assets/images/thumbs/sample-02.jpg", alt: "Gambar contoh 2: gradasi biru dengan bentuk gunung", caption: "Contoh 2" },
        { src: "assets/images/sample-03.jpg", thumb: "assets/images/thumbs/sample-03.jpg", alt: "Gambar contoh 3: gradasi ungu dengan garis diagonal", caption: "Contoh 3" },
        { src: "assets/images/sample-04.jpg", thumb: "assets/images/thumbs/sample-04.jpg", alt: "Gambar contoh 4: gradasi jingga dengan matahari", caption: "Contoh 4" },
        { src: "assets/images/sample-05.jpg", thumb: "assets/images/thumbs/sample-05.jpg", alt: "Gambar contoh 5: gradasi toska dengan lingkaran", caption: "Contoh 5" },
        { src: "assets/images/sample-06.jpg", thumb: "assets/images/thumbs/sample-06.jpg", alt: "Gambar contoh 6: gradasi merah muda dengan bentuk gunung", caption: "Contoh 6" },
        { src: "assets/images/sample-07.jpg", thumb: "assets/images/thumbs/sample-07.jpg", alt: "Gambar contoh 7: gradasi kuning dengan garis diagonal", caption: "Contoh 7" },
        { src: "assets/images/sample-08.jpg", thumb: "assets/images/thumbs/sample-08.jpg", alt: "Gambar contoh 8: gradasi nila dengan matahari", caption: "Contoh 8" }
    ]
};
