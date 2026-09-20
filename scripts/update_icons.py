import os
import shutil
from PIL import Image, ImageDraw

SRC_IMAGE = r"C:\Users\ubatora\.gemini\antigravity\brain\e4af84c6-3bd3-4c40-ad1b-81564cdde879\.user_uploaded\media_1789903925794.png"
PROJECT_ROOT = r"c:\Users\ubatora\Desktop\plantguard_ai_starter"

def generate_icons():
    src_img = Image.open(SRC_IMAGE).convert("RGBA")
    print(f"Loaded source image: {src_img.size}")

    # 1. Update assets/images/icon.png
    dest_icon_png = os.path.join(PROJECT_ROOT, "assets", "images", "icon.png")
    src_img.save(dest_icon_png, "PNG", optimize=True)
    print(f"Saved {dest_icon_png}")

    # 2. Update assets/images/splash-icon.png (e.g. 512x512)
    splash = src_img.resize((512, 512), Image.Resampling.LANCZOS)
    dest_splash = os.path.join(PROJECT_ROOT, "assets", "images", "splash-icon.png")
    splash.save(dest_splash, "PNG", optimize=True)
    print(f"Saved {dest_splash}")

    # 3. Create Android adaptive foreground (1024x1024 canvas with icon in safe zone ~72% center)
    fg_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg_size = int(1024 * 0.72)
    fg_scaled = src_img.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
    offset = (1024 - fg_size) // 2
    fg_canvas.paste(fg_scaled, (offset, offset), fg_scaled)
    dest_fg = os.path.join(PROJECT_ROOT, "assets", "images", "android-icon-foreground.png")
    fg_canvas.save(dest_fg, "PNG", optimize=True)
    print(f"Saved {dest_fg}")

    # 4. Generate Android native mipmap densities
    res_dir = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")
    
    # launcher sizes (regular & round)
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    for folder, (icon_size, fg_size) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        # A) ic_launcher.webp
        icon_resized = src_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        icon_path = os.path.join(folder_path, "ic_launcher.webp")
        icon_resized.save(icon_path, "WEBP", quality=95)

        # B) ic_launcher_round.webp (circular mask for circular launchers)
        round_canvas = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
        mask = Image.new("L", (icon_size, icon_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, icon_size - 1, icon_size - 1), fill=255)
        round_canvas.paste(icon_resized, (0, 0), mask)
        round_path = os.path.join(folder_path, "ic_launcher_round.webp")
        round_canvas.save(round_path, "WEBP", quality=95)

        # C) ic_launcher_foreground.webp
        fg_mip_canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
        fg_inner_size = int(fg_size * 0.72)
        inner_icon = src_img.resize((fg_inner_size, fg_inner_size), Image.Resampling.LANCZOS)
        inner_offset = (fg_size - fg_inner_size) // 2
        fg_mip_canvas.paste(inner_icon, (inner_offset, inner_offset), inner_icon)
        fg_mip_path = os.path.join(folder_path, "ic_launcher_foreground.webp")
        fg_mip_canvas.save(fg_mip_path, "WEBP", quality=95)

        print(f"Generated mipmap assets in {folder}")

    print("All icons successfully generated!")

if __name__ == "__main__":
    generate_icons()
