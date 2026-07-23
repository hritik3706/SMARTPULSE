import os
import shutil
import subprocess
import tempfile
from pathlib import Path


def clean_temp():

    deleted = 0

    temp = Path(tempfile.gettempdir())

    for item in temp.iterdir():

        try:

            if item.is_file() or item.is_symlink():

                item.unlink()

                deleted += 1

            elif item.is_dir():

                shutil.rmtree(item, ignore_errors=True)

                deleted += 1

        except:

            pass

    return deleted


def flush_dns():

    try:

        subprocess.run(

            ["ipconfig", "/flushdns"],

            capture_output=True,

            text=True,

            shell=True

        )

        return True

    except:

        return False


def empty_recycle_bin():

    try:

        subprocess.run(

            [

                "powershell",

                "-Command",

                "Clear-RecycleBin -Force"

            ],

            capture_output=True,

            shell=True

        )

        return True

    except:

        return False


def clear_thumbnail_cache():

    try:

        cache = os.path.expandvars(

            r"%LOCALAPPDATA%\Microsoft\Windows\Explorer"

        )

        removed = 0

        for file in os.listdir(cache):

            if file.startswith("thumbcache"):

                try:

                    os.remove(

                        os.path.join(

                            cache,

                            file

                        )

                    )

                    removed += 1

                except:

                    pass

        return removed

    except:

        return 0


def optimize_system():

    report = {}

    report["temp_files_removed"] = clean_temp()

    report["dns_flushed"] = flush_dns()

    report["recycle_bin"] = empty_recycle_bin()

    report["thumbnail_cache_removed"] = clear_thumbnail_cache()

    report["status"] = "Optimization Completed"

    return report