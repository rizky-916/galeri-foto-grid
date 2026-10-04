#!/usr/bin/env python3
"""
strip_exif.py — Siapkan foto untuk galeri dengan aman.

  * Menghapus SEMUA metadata (EXIF, GPS/lokasi, info kamera, XMP, komentar).
  * Memutar gambar sesuai orientasi EXIF sebelum metadata dibuang.
  * Mengecilkan foto besar (default sisi terpanjang 1600 px).
  * Membuat thumbnail untuk grid (default 800 px) di folder thumbs/.
  * TIDAK pernah menimpa file asli — hasil disimpan ke folder output.

Prepare photos for the gallery safely: strips all metadata (incl. GPS),
fixes orientation, resizes, and creates thumbnails. Originals are never
overwritten.

Kebutuhan / Requirements:
    pip install Pillow

Pemakaian / Usage:
    python tools/strip_exif.py FOLDER_FOTO_ASLI
    python tools/strip_exif.py FOLDER_FOTO_ASLI --out assets/images --max 1600 --thumb 800
"""
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow belum terpasang. Jalankan: pip install Pillow")

SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}
# Lindungi dari "decompression bomb" (gambar raksasa yang menghabiskan memori).
Image.MAX_IMAGE_PIXELS = 80_000_000


def clean_image(src: Path, dst: Path, max_side: int, quality: int) -> None:
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)  # terapkan rotasi, lalu metadata dibuang
        if max_side > 0:
            im.thumbnail((max_side, max_side), Image.LANCZOS)

        ext = dst.suffix.lower()
        dst.parent.mkdir(parents=True, exist_ok=True)

        # Salin hanya data piksel ke gambar baru → tidak ada metadata yang terbawa.
        if ext in (".jpg", ".jpeg"):
            clean = Image.new("RGB", im.size)
            clean.paste(im.convert("RGB"))
            clean.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        else:
            mode = "RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB"
            clean = Image.new(mode, im.size)
            clean.paste(im.convert(mode))
            fmt = "PNG" if ext == ".png" else "WEBP"
            clean.save(dst, fmt, **({"optimize": True} if fmt == "PNG" else {"quality": quality}))


def main() -> int:
    parser = argparse.ArgumentParser(description="Hapus metadata, kecilkan foto, dan buat thumbnail.")
    parser.add_argument("input", type=Path, help="Folder berisi foto asli")
    parser.add_argument("--out", type=Path, default=Path("assets/images"), help="Folder output (default: assets/images)")
    parser.add_argument("--max", type=int, default=1600, help="Sisi terpanjang foto penuh, px (0 = tidak diubah)")
    parser.add_argument("--thumb", type=int, default=800, help="Sisi terpanjang thumbnail, px (0 = tanpa thumbnail)")
    parser.add_argument("--quality", type=int, default=82, help="Kualitas JPEG/WEBP 1-95 (default 82)")
    args = parser.parse_args()

    src_dir = args.input.resolve()
    out_dir = args.out.resolve()

    if not src_dir.is_dir():
        print(f"Folder tidak ditemukan: {src_dir}", file=sys.stderr)
        return 1
    if src_dir == out_dir:
        print("Folder input dan output tidak boleh sama (file asli tidak akan ditimpa).", file=sys.stderr)
        return 1
    if not 1 <= args.quality <= 95:
        print("--quality harus di antara 1 dan 95.", file=sys.stderr)
        return 1

    files = sorted(p for p in src_dir.iterdir() if p.is_file() and not p.is_symlink() and p.suffix.lower() in SUPPORTED)
    if not files:
        print("Tidak ada file .jpg/.jpeg/.png/.webp di folder input.")
        return 0

    ok = 0
    for f in files:
        # Nama file dibersihkan: hanya huruf, angka, '-', '_' dan '.'
        safe_name = "".join(c if c.isalnum() or c in "-_." else "-" for c in f.name)
        try:
            clean_image(f, out_dir / safe_name, args.max, args.quality)
            if args.thumb > 0:
                clean_image(f, out_dir / "thumbs" / safe_name, args.thumb, args.quality)
            ok += 1
            print(f"  ✓ {f.name} → {safe_name}")
        except Exception as exc:  # file rusak / bukan gambar
            print(f"  ✗ {f.name}: {exc}", file=sys.stderr)

    print(f"\nSelesai: {ok}/{len(files)} foto diproses ke {out_dir}")
    return 0 if ok == len(files) else 2


if __name__ == "__main__":
    sys.exit(main())
