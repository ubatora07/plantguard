import os
from PIL import Image, ImageDraw

SRC_FG = r"C:\Users\ubatora\.gemini\antigravity\brain\e4af84c6-3bd3-4c40-ad1b-81564cdde879\.user_uploaded\media_1789905190859.png"
SRC_BG = r"C:\Users\ubatora\.gemini\antigravity\brain\e4af84c6-3bd3-4c40-ad1b-81564cdde879\.user_uploaded\media_1789905382085.jpg"
PROJECT_ROOT = r"c:\Users\ubatora\Desktop\plantguard_ai_starter"

def run():
    fg = Image.open(SRC_FG).convert("RGBA")
    bg = Image.open(SRC_BG).convert("RGBA")
    print(f"Loaded FG: {fg.size}, BG: {bg.size}")

    # Ensure 1024x1024
    if bg.size != (1024, 1024):
        bg = bg.resize((1024, 1024), Image.Resampling.LANCZOS)
    if fg.size != (1024, 1024):
        fg = fg.resize((1024, 1024), Image.Resampling.LANCZOS)

    # 1. Full composite icon (for assets/images/icon.png and legacy launchers)
    # Emblem scaled to ~82% so it sits gracefully inside the icon borders
    emblem_size_icon = int(1024 * 0.82)
    fg_for_icon = fg.resize((emblem_size_icon, emblem_size_icon), Image.Resampling.LANCZOS)
    icon_offset = (1024 - emblem_size_icon) // 2

    composite_icon = bg.copy()
    composite_icon.paste(fg_for_icon, (icon_offset, icon_offset), fg_for_icon)

    dest_icon_png = os.path.join(PROJECT_ROOT, "assets", "images", "icon.png")
    composite_icon.save(dest_icon_png, "PNG", optimize=True)
    print(f"Saved {dest_icon_png}")

    # Save emblem directly as well
    dest_emblem = os.path.join(PROJECT_ROOT, "assets", "images", "logo-emblem.png")
    fg.save(dest_emblem, "PNG", optimize=True)
    print(f"Saved {dest_emblem}")

    # 2. Android adaptive background (1024x1024)
    dest_android_bg = os.path.join(PROJECT_ROOT, "assets", "images", "android-icon-background.png")
    bg.save(dest_android_bg, "PNG", optimize=True)
    print(f"Saved {dest_android_bg}")

    # 3. Android adaptive foreground (1024x1024 canvas, emblem scaled to 66% inside safe zone)
    fg_adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    emblem_size_adaptive = int(1024 * 0.66)
    fg_scaled = fg.resize((emblem_size_adaptive, emblem_size_adaptive), Image.Resampling.LANCZOS)
    adaptive_offset = (1024 - emblem_size_adaptive) // 2
    fg_adaptive.paste(fg_scaled, (adaptive_offset, adaptive_offset), fg_scaled)

    dest_android_fg = os.path.join(PROJECT_ROOT, "assets", "images", "android-icon-foreground.png")
    fg_adaptive.save(dest_android_fg, "PNG", optimize=True)
    print(f"Saved {dest_android_fg}")

    # 4. Splash icon (512x512)
    splash = composite_icon.resize((512, 512), Image.Resampling.LANCZOS)
    dest_splash = os.path.join(PROJECT_ROOT, "assets", "images", "splash-icon.png")
    splash.save(dest_splash, "PNG", optimize=True)
    print(f"Saved {dest_splash}")

    # 5. Generate Android native mipmaps
    res_dir = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

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

        # A) ic_launcher.webp (composite with subtle rounded corners)
        launcher_img = composite_icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        # Rounded corner mask (approx 20% radius)
        corner_r = max(4, int(icon_size * 0.20))
        mask = Image.new("L", (icon_size, icon_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle((0, 0, icon_size - 1, icon_size - 1), radius=corner_r, fill=255)
        
        launcher_rounded = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
        launcher_rounded.paste(launcher_img, (0, 0), mask)
        launcher_rounded.save(os.path.join(folder_path, "ic_launcher.webp"), "WEBP", quality=95)

        # B) ic_launcher_round.webp (full circle mask)
        circle_mask = Image.new("L", (icon_size, icon_size), 0)
        circle_draw = ImageDraw.Draw(circle_mask)
        circle_draw.ellipse((0, 0, icon_size - 1, icon_size - 1), fill=255)
        
        launcher_circle = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
        launcher_circle.paste(launcher_img, (0, 0), circle_mask)
        launcher_circle.save(os.path.join(folder_path, "ic_launcher_round.webp"), "WEBP", quality=95)

        # C) ic_launcher_background.webp (adaptive background at 108dp equivalent)
        bg_mip = bg.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        bg_mip.save(os.path.join(folder_path, "ic_launcher_background.webp"), "WEBP", quality=95)

        # D) ic_launcher_foreground.webp (adaptive foreground at 108dp equivalent)
        fg_mip = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
        emblem_mip_size = int(fg_size * 0.66)
        fg_scaled_mip = fg.resize((emblem_mip_size, emblem_mip_size), Image.Resampling.LANCZOS)
        fg_mip_offset = (fg_size - emblem_mip_size) // 2
        fg_mip.paste(fg_scaled_mip, (fg_mip_offset, fg_mip_offset), fg_scaled_mip)
        fg_mip.save(os.path.join(folder_path, "ic_launcher_foreground.webp"), "WEBP", quality=95)

        print(f"Updated mipmaps in {folder} (icon: {icon_size}x{icon_size}, adaptive: {fg_size}x{fg_size})")

    print("All icons successfully generated and saved!")

if __name__ == "__main__":
    run()
