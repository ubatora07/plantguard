import os
from PIL import Image, ImageDraw

SRC_FG = r"C:\Users\ubatora\.gemini\antigravity\brain\e4af84c6-3bd3-4c40-ad1b-81564cdde879\.user_uploaded\media_1789905190859.png"
SRC_BG = r"C:\Users\ubatora\.gemini\antigravity\brain\e4af84c6-3bd3-4c40-ad1b-81564cdde879\.user_uploaded\media_1789905382085.jpg"
PROJECT_ROOT = r"c:\Users\ubatora\Desktop\plantguard_ai_starter"

def create_splash_assets():
    fg = Image.open(SRC_FG).convert("RGBA")
    bg = Image.open(SRC_BG).convert("RGBA")

    # Ensure 1024x1024
    if bg.size != (1024, 1024):
        bg = bg.resize((1024, 1024), Image.Resampling.LANCZOS)
    if fg.size != (1024, 1024):
        fg = fg.resize((1024, 1024), Image.Resampling.LANCZOS)

    # Create 1024x1024 circular icon badge
    circle_badge = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mask = Image.new("L", (1024, 1024), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, 1023, 1023), fill=255)
    circle_badge.paste(bg, (0, 0), mask)

    # Place emblem inside with comfortable padding (~84% size)
    emblem_size = int(1024 * 0.84)
    fg_scaled = fg.resize((emblem_size, emblem_size), Image.Resampling.LANCZOS)
    offset = (1024 - emblem_size) // 2
    circle_badge.paste(fg_scaled, (offset, offset), fg_scaled)

    # 1. Update assets/images/splash-icon.png
    dest_splash_png = os.path.join(PROJECT_ROOT, "assets", "images", "splash-icon.png")
    circle_badge.save(dest_splash_png, "PNG", optimize=True)
    print(f"Saved {dest_splash_png}")

    # 2. Update Android native drawable-*/splashscreen_logo.png
    res_dir = os.path.join(PROJECT_ROOT, "android", "app", "src", "main", "res")

    splash_densities = {
        "drawable-mdpi": (288, 192),      # canvas 288x288, icon 192x192
        "drawable-hdpi": (432, 288),      # canvas 432x432, icon 288x288
        "drawable-xhdpi": (576, 384),     # canvas 576x576, icon 384x384
        "drawable-xxhdpi": (864, 576),    # canvas 864x864, icon 576x576
        "drawable-xxxhdpi": (1152, 768),  # canvas 1152x1152, icon 768x768
    }

    for folder, (canvas_size, icon_size) in splash_densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        splash_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        icon_resized = circle_badge.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        offset = (canvas_size - icon_size) // 2
        splash_canvas.paste(icon_resized, (offset, offset), icon_resized)

        dest_file = os.path.join(folder_path, "splashscreen_logo.png")
        splash_canvas.save(dest_file, "PNG", optimize=True)
        print(f"Updated {dest_file} (canvas: {canvas_size}x{canvas_size}, icon: {icon_size}x{icon_size})")

    print("All splash screen assets generated successfully!")

if __name__ == "__main__":
    create_splash_assets()
