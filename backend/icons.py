import hashlib
import io
import json
import os
from pathlib import Path

CACHE_DIR = Path(__file__).resolve().parent / "cache" / "icons"
INDEX_FILE = CACHE_DIR / "index.json"
_icon_paths = {}


def _load_index():
    try:
        if INDEX_FILE.exists():
            data = json.loads(INDEX_FILE.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                _icon_paths.update(data)
    except (OSError, json.JSONDecodeError):
        pass


def _save_index():
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        INDEX_FILE.write_text(json.dumps(_icon_paths), encoding="utf-8")
    except OSError:
        pass


_load_index()


def icon_id_for(exe_path):
    if not exe_path:
        return None
    return hashlib.md5(os.path.normcase(exe_path).encode("utf-8", "ignore")).hexdigest()[:16]


def register_icon(exe_path):
    icon_id = icon_id_for(exe_path)
    if icon_id:
        _icon_paths[icon_id] = exe_path
    return icon_id


def flush_icon_index():
    _save_index()


def _hicon_to_png(hicon, size=32):
    import ctypes
    from ctypes import wintypes
    from PIL import Image

    user32 = ctypes.windll.user32
    gdi32 = ctypes.windll.gdi32

    class BITMAPINFOHEADER(ctypes.Structure):
        _fields_ = [
            ("biSize", wintypes.DWORD),
            ("biWidth", ctypes.c_long),
            ("biHeight", ctypes.c_long),
            ("biPlanes", wintypes.WORD),
            ("biBitCount", wintypes.WORD),
            ("biCompression", wintypes.DWORD),
            ("biSizeImage", wintypes.DWORD),
            ("biXPelsPerMeter", ctypes.c_long),
            ("biYPelsPerMeter", ctypes.c_long),
            ("biClrUsed", wintypes.DWORD),
            ("biClrImportant", wintypes.DWORD),
        ]

    class BITMAPINFO(ctypes.Structure):
        _fields_ = [("bmiHeader", BITMAPINFOHEADER), ("bmiColors", wintypes.DWORD * 3)]

    hdc = user32.GetDC(0)
    hdc_mem = gdi32.CreateCompatibleDC(hdc)
    hbmp = gdi32.CreateCompatibleBitmap(hdc, size, size)
    gdi32.SelectObject(hdc_mem, hbmp)
    user32.DrawIconEx(hdc_mem, 0, 0, hicon, size, size, 0, None, 0x0003)

    bmi = BITMAPINFO()
    bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bmi.bmiHeader.biWidth = size
    bmi.bmiHeader.biHeight = -size
    bmi.bmiHeader.biPlanes = 1
    bmi.bmiHeader.biBitCount = 32
    bmi.bmiHeader.biCompression = 0
    buf = ctypes.create_string_buffer(size * size * 4)
    gdi32.GetDIBits(hdc_mem, hbmp, 0, size, buf, ctypes.byref(bmi), 0)

    image = Image.frombuffer("RGBA", (size, size), buf, "raw", "BGRA", 0, 1).copy()
    user32.DestroyIcon(hicon)
    gdi32.DeleteObject(hbmp)
    gdi32.DeleteDC(hdc_mem)
    user32.ReleaseDC(0, hdc)

    out = io.BytesIO()
    image.save(out, format="PNG")
    return out.getvalue()


def _extract_windows_icon(exe_path, size=32):
    import ctypes
    from ctypes import wintypes

    class SHFILEINFOW(ctypes.Structure):
        _fields_ = [
            ("hIcon", wintypes.HICON),
            ("iIcon", ctypes.c_int),
            ("dwAttributes", wintypes.DWORD),
            ("szDisplayName", wintypes.WCHAR * 260),
            ("szTypeName", wintypes.WCHAR * 80),
        ]

    info = SHFILEINFOW()
    flags = 0x000000100 | (0x000000001 if size <= 16 else 0x000000000)
    ctypes.windll.shell32.SHGetFileInfoW(exe_path, 0, ctypes.byref(info), ctypes.sizeof(info), flags)
    if not info.hIcon:
        return None
    return _hicon_to_png(info.hIcon, size=size)


def get_icon_png(icon_id):
    if not icon_id:
        return None

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{icon_id}.png"
    if cache_file.exists() and cache_file.stat().st_size > 0:
        return cache_file.read_bytes()

    exe_path = _icon_paths.get(icon_id)
    if not exe_path or not os.path.isfile(exe_path):
        return None

    try:
        data = _extract_windows_icon(exe_path)
    except Exception:
        data = None

    if not data:
        return None
    cache_file.write_bytes(data)
    return data
