import os
import shutil
import subprocess
import tempfile
from pathlib import Path


CREATE_NO_WINDOW = 0x08000000


def _run_hidden(args, timeout=20):
    kwargs = {
        "capture_output": True,
        "text": True,
        "timeout": timeout,
    }
    if os.name == "nt":
        kwargs["creationflags"] = CREATE_NO_WINDOW
    return subprocess.run(args, **kwargs)


def _dir_size(path):
    total = 0
    root = Path(path)
    if not root.exists():
        return 0
    try:
        for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
            for name in filenames:
                file_path = Path(dirpath) / name
                try:
                    if file_path.is_symlink():
                        continue
                    total += file_path.stat().st_size
                except (OSError, PermissionError):
                    continue
            # Avoid descending into reparse points that can loop.
            keep = []
            for dirname in dirnames:
                child = Path(dirpath) / dirname
                try:
                    if child.is_symlink():
                        continue
                    keep.append(dirname)
                except (OSError, PermissionError):
                    continue
            dirnames[:] = keep
    except (OSError, PermissionError):
        return total
    return total


def _safe_remove(path: Path):
    try:
        if path.is_symlink() or path.is_file():
            path.unlink(missing_ok=True)
            return True
        if path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
            return True
    except (OSError, PermissionError):
        return False
    return False


def _temp_paths():
    paths = {Path(tempfile.gettempdir())}
    windir = os.environ.get("WINDIR")
    if windir:
        paths.add(Path(windir) / "Temp")
    local = os.environ.get("LOCALAPPDATA")
    if local:
        paths.add(Path(local) / "Temp")
    return [path for path in paths if path.exists()]


def _thumbnail_cache_dir():
    local = os.environ.get("LOCALAPPDATA")
    if not local:
        return None
    path = Path(local) / "Microsoft" / "Windows" / "Explorer"
    return path if path.exists() else None


def _inet_cache_dir():
    local = os.environ.get("LOCALAPPDATA")
    if not local:
        return None
    path = Path(local) / "Microsoft" / "Windows" / "INetCache"
    return path if path.exists() else None


def scan_system():
    temp_bytes = sum(_dir_size(path) for path in _temp_paths())
    cache_dir = _inet_cache_dir()
    cache_bytes = _dir_size(cache_dir) if cache_dir else 0
    thumb_dir = _thumbnail_cache_dir()
    thumb_bytes = 0
    if thumb_dir:
        for file in thumb_dir.glob("thumbcache*"):
            try:
                thumb_bytes += file.stat().st_size
            except (OSError, PermissionError):
                continue

    items = [
        {
            "id": "temp",
            "label": "Temporary files",
            "bytes": temp_bytes,
            "safe": True,
        },
        {
            "id": "cache",
            "label": "Cache",
            "bytes": cache_bytes,
            "safe": True,
        },
        {
            "id": "thumbnails",
            "label": "Thumbnail cache",
            "bytes": thumb_bytes,
            "safe": True,
        },
    ]

    return {
        "success": True,
        "items": items,
        "total_bytes": sum(item["bytes"] for item in items),
    }


def clean_temp():
    deleted = 0
    recovered = 0
    for folder in _temp_paths():
        try:
            for item in folder.iterdir():
                try:
                    size = 0
                    if item.is_file() or item.is_symlink():
                        try:
                            size = item.stat().st_size
                        except OSError:
                            size = 0
                    if _safe_remove(item):
                        deleted += 1
                        recovered += size
                except (OSError, PermissionError):
                    continue
        except (OSError, PermissionError):
            continue
    return {"removed": deleted, "bytes": recovered, "ok": True}


def clear_user_cache():
    cache_dir = _inet_cache_dir()
    if cache_dir is None:
        return {"removed": 0, "bytes": 0, "ok": True}
    recovered = 0
    removed = 0
    try:
        for item in cache_dir.iterdir():
            try:
                size = _dir_size(item) if item.is_dir() else item.stat().st_size
            except (OSError, PermissionError):
                size = 0
            if _safe_remove(item):
                removed += 1
                recovered += size
    except (OSError, PermissionError):
        return {"removed": removed, "bytes": recovered, "ok": False}
    return {"removed": removed, "bytes": recovered, "ok": True}


def clear_thumbnail_cache():
    cache = _thumbnail_cache_dir()
    if cache is None:
        return {"removed": 0, "bytes": 0, "ok": True}
    removed = 0
    recovered = 0
    for file in cache.glob("thumbcache*"):
        try:
            size = file.stat().st_size
            file.unlink()
            removed += 1
            recovered += size
        except (OSError, PermissionError):
            continue
    return {"removed": removed, "bytes": recovered, "ok": True}


def flush_dns():
    try:
        result = _run_hidden(["ipconfig", "/flushdns"])
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False


def empty_recycle_bin():
    try:
        result = _run_hidden([
            "powershell",
            "-NoProfile",
            "-Command",
            "Clear-RecycleBin -Force -ErrorAction SilentlyContinue",
        ])
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False


def optimize_system(actions=None):
    if actions is None:
        selected = {"temp", "cache", "thumbnails", "dns", "recycle"}
    else:
        selected = {str(item) for item in actions}
    details = []
    recovered = 0

    if "temp" in selected:
        temp = clean_temp()
        recovered += temp["bytes"]
        details.append({
            "id": "temp",
            "label": "Temporary files cleaned",
            "ok": temp["ok"],
            "bytes": temp["bytes"],
            "removed": temp["removed"],
        })

    if "cache" in selected:
        cache = clear_user_cache()
        recovered += cache["bytes"]
        details.append({
            "id": "cache",
            "label": "Cache cleaned",
            "ok": cache["ok"],
            "bytes": cache["bytes"],
            "removed": cache["removed"],
        })

    if "thumbnails" in selected:
        thumbs = clear_thumbnail_cache()
        recovered += thumbs["bytes"]
        details.append({
            "id": "thumbnails",
            "label": "Thumbnail cache cleaned",
            "ok": thumbs["ok"],
            "bytes": thumbs["bytes"],
            "removed": thumbs["removed"],
        })

    if "dns" in selected:
        dns_ok = flush_dns()
        details.append({
            "id": "dns",
            "label": "DNS cache flushed",
            "ok": dns_ok,
            "bytes": 0,
        })

    if "recycle" in selected:
        recycle_ok = empty_recycle_bin()
        details.append({
            "id": "recycle",
            "label": "Recycle Bin emptied",
            "ok": recycle_ok,
            "bytes": 0,
        })

    return {
        "status": "Optimization Completed",
        "recovered_bytes": recovered,
        "details": details,
        "temp_files_removed": next((item.get("removed") for item in details if item["id"] == "temp"), 0),
        "dns_flushed": next((item.get("ok") for item in details if item["id"] == "dns"), False),
        "recycle_bin": next((item.get("ok") for item in details if item["id"] == "recycle"), False),
        "thumbnail_cache_removed": next((item.get("removed") for item in details if item["id"] == "thumbnails"), 0),
    }
