import os
import re
from PIL import Image, ImageDraw

def render_logo():
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Blue rounded rectangle background
    draw.rounded_rectangle([0, 0, size, size], radius=int(size * 0.22), fill='#1944F1')

    # White CB cutout path from group_3.svg
    path_scale = 700.0 / 134.0
    offset_x = (1024 - 134.0 * path_scale) / 2.0 - 53.0 * path_scale
    offset_y = (1024 - 125.0 * path_scale) / 2.0 - 57.0 * path_scale

    svg_content = open('public/group_3.svg', 'r', encoding='utf-8').read()
    d_matches = re.findall(r'd="([^"]+)"', svg_content)
    if len(d_matches) > 1:
        d_str = d_matches[1]
        subpaths = d_str.split(' Z')
        for sub in subpaths:
            sub = sub.strip()
            if not sub:
                continue
            coords = re.findall(r'([0-9]+\.?[0-9]*)\s*,\s*([0-9]+\.?[0-9]*)', sub)
            if coords:
                pts = [(float(x) * path_scale + offset_x, float(y) * path_scale + offset_y) for x, y in coords]
                draw.polygon(pts, fill='#F5F3F3')

    img.save('public/campus-buddy-logo.png')

    # Update launcher icons across mipmap directories
    mipmap_sizes = {
        'android/app/src/main/res/mipmap-mdpi': 48,
        'android/app/src/main/res/mipmap-hdpi': 72,
        'android/app/src/main/res/mipmap-xhdpi': 96,
        'android/app/src/main/res/mipmap-xxhdpi': 144,
        'android/app/src/main/res/mipmap-xxxhdpi': 192,
    }

    for folder, dim in mipmap_sizes.items():
        os.makedirs(folder, exist_ok=True)
        resized = img.resize((dim, dim), Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder, 'ic_launcher.png'))
        resized.save(os.path.join(folder, 'ic_launcher_round.png'))
        resized.save(os.path.join(folder, 'ic_launcher_foreground.png'))

    # Update splash screen images across drawable directories (centered group_3 logo on black bg)
    drawable_sizes = {
        'android/app/src/main/res/drawable-land-mdpi': (480, 320, 160),
        'android/app/src/main/res/drawable-land-hdpi': (800, 480, 220),
        'android/app/src/main/res/drawable-land-xhdpi': (1280, 720, 280),
        'android/app/src/main/res/drawable-land-xxhdpi': (1600, 960, 360),
        'android/app/src/main/res/drawable-land-xxxhdpi': (1920, 1280, 440),
        'android/app/src/main/res/drawable-port-mdpi': (320, 480, 160),
        'android/app/src/main/res/drawable-port-hdpi': (480, 800, 220),
        'android/app/src/main/res/drawable-port-xhdpi': (720, 1280, 280),
        'android/app/src/main/res/drawable-port-xxhdpi': (960, 1600, 360),
        'android/app/src/main/res/drawable-port-xxxhdpi': (1280, 1920, 440),
    }

    for folder, (w, h, logo_dim) in drawable_sizes.items():
        os.makedirs(folder, exist_ok=True)
        splash_bg = Image.new('RGBA', (w, h), (0, 0, 0, 255))
        resized_logo = img.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        offset_x_pos = (w - logo_dim) // 2
        offset_y_pos = (h - logo_dim) // 2
        splash_bg.paste(resized_logo, (offset_x_pos, offset_y_pos), resized_logo)
        splash_bg.save(os.path.join(folder, 'splash.png'))

    print('Successfully generated exact group_3 launcher icons and black splash screen assets!')

if __name__ == '__main__':
    render_logo()
