import os
import sys
import argparse
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CANVAS_W, CANVAS_H = 1920, 1080

def get_frame_path():
    # Resolve iphone15_frame.png relative to repo assets/img
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, ".."))
    return os.path.join(repo_root, "assets", "img", "iphone15_frame.png")

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return [int(hex_str[i:i+2], 16) for i in (0, 2, 4)]

def render_full_phone(screenshot_path, target_h, frame_path):
    raw_frame = Image.open(frame_path).convert("RGBA")
    FRAME_W, FRAME_H = raw_frame.size
    SCREEN_X, SCREEN_Y = 18, 18
    SCREEN_W, SCREEN_H = 466, 988
    SCREEN_RADIUS = 48

    raw_screen_mask = Image.new("L", (SCREEN_W, SCREEN_H), 0)
    sm_draw = ImageDraw.Draw(raw_screen_mask)
    sm_draw.rounded_rectangle([(0, 0), (SCREEN_W - 1, SCREEN_H - 1)], radius=SCREEN_RADIUS, fill=255)

    ss = Image.open(screenshot_path).convert("RGBA")
    scaled_ss = ss.resize((SCREEN_W, SCREEN_H), Image.Resampling.LANCZOS)
    raw_phone = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    raw_phone.paste(scaled_ss, (SCREEN_X, SCREEN_Y), raw_screen_mask)
    raw_phone.paste(raw_frame, (0, 0), raw_frame)
    scale = target_h / FRAME_H
    target_w = int(FRAME_W * scale)
    return raw_phone.resize((target_w, target_h), Image.Resampling.LANCZOS)

def apply_perspective_angle(pil_img, yaw_deg):
    if yaw_deg == 0:
        return pil_img
    
    np_img = np.array(pil_img)
    h, w, _ = np_img.shape
    src_pts = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    
    rad = np.radians(abs(yaw_deg))
    d_y = int(h * np.sin(rad) * 0.15)
    d_x = int(w * (1 - np.cos(rad)) * 0.15)
    
    if yaw_deg < 0:
        dst_pts = np.float32([[0, 0], [w - d_x, d_y], [w - d_x, h - d_y], [0, h]])
    else:
        dst_pts = np.float32([[d_x, d_y], [w, 0], [w, h], [d_x, h - d_y]])
        
    M = cv2.getPerspectiveTransform(src_pts, dst_pts)
    warped_np = cv2.warpPerspective(
        np_img, M, (w, h),
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0)
    )
    return Image.fromarray(warped_np, "RGBA")

def build_brand_background(brand_hex="#ea580c"):
    # Dark moody midnight slate canvas with subtle brand theme center glow
    y, x = np.ogrid[:CANVAS_H, :CANVAS_W]
    center_x, center_y = CANVAS_W / 2.0, CANVAS_H / 2.0 - 40.0
    
    max_dist = np.sqrt(center_x**2 + center_y**2)
    dist = np.sqrt((x - center_x)**2 + (y - center_y)**2) / max_dist
    dist = np.clip(dist * 1.05, 0, 1)
    
    brand_rgb = np.array(hex_to_rgb(brand_hex), dtype=float)
    c_center = np.clip(brand_rgb * 0.22 + np.array([10, 10, 12]), 0, 255)
    c_outer = np.array([8, 14, 27], dtype=float)
    
    t = dist ** 1.4
    t = np.expand_dims(t, axis=2)
    
    rgb = (1.0 - t) * c_center + t * c_outer
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    
    alpha = np.full((CANVAS_H, CANVAS_W, 1), 255, dtype=np.uint8)
    rgba = np.dstack((rgb, alpha))
    return Image.fromarray(rgba, "RGBA")

def load_logo_badge(logo_path):
    logo_raw = Image.open(logo_path).convert("RGBA")
    logo_h = 80
    logo_w = int(logo_raw.width * (logo_h / logo_raw.height))
    logo_img = logo_raw.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    
    pad = 20
    badge_w, badge_h = logo_w + pad * 2, logo_h + pad * 2
    badge = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
    
    logo_alpha = logo_img.split()[3]
    alpha_pad = Image.new("L", (badge_w, badge_h), 0)
    alpha_pad.paste(logo_alpha, (pad, pad))
    
    shadow = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 80))
    badge.paste(shadow, (0, 0), alpha_pad.filter(ImageFilter.GaussianBlur(6)))
    badge.paste(logo_img, (pad, pad), logo_img)
    return badge

def prompt_input_if_missing(value, prompt_text):
    if value and os.path.exists(value):
        return value
    while True:
        entered = input(f"{prompt_text}: ").strip().strip("'\"")
        if os.path.exists(entered):
            return entered
        print(f"❌ File/Directory not found: '{entered}'. Please try again.")

def main():
    parser = argparse.ArgumentParser(description="Universal 3D iPhone 15 Showcase Collage Generator")
    parser.add_argument("--screenshots", help="Path to screenshots directory")
    parser.add_argument("--logo", help="Path to app logo image (PNG/SVG)")
    parser.add_argument("--brand-color", default="#ea580c", help="App brand primary hex color (default: #ea580c)")
    parser.add_argument("--output", help="Output directory for PNG collages")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_output = os.path.abspath(os.path.join(script_dir, "..", "assets", "img"))
    output_dir = args.output or default_output
    frame_path = get_frame_path()

    screenshots_dir = prompt_input_if_missing(args.screenshots, "Enter path to Screenshots directory")
    logo_path = prompt_input_if_missing(args.logo, "Enter path to App Logo image")
    brand_color = args.brand_color or input("Enter App Brand Primary Hex Color [#ea580c]: ").strip() or "#ea580c"

    os.makedirs(output_dir, exist_ok=True)
    print(f"\n🚀 Generating 3D Showcase Collages for brand '{brand_color}'...")
    
    logo_badge = load_logo_badge(logo_path)
    logo_x = (CANVAS_W - logo_badge.width) // 2
    logo_y = 30
    
    all_imgs = []
    for root, _, files in os.walk(screenshots_dir):
        for f in sorted(files):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                all_imgs.append(os.path.join(root, f))

    if len(all_imgs) < 3:
        print(f"❌ Found only {len(all_imgs)} images in '{screenshots_dir}'. Minimum 3 screenshots required.")
        sys.exit(1)

    print(f"📸 Found {len(all_imgs)} screenshots. Building 3D Hero Collages...")
    
    # 1. Render 5-Phone Hero Collage
    bg1 = build_brand_background(brand_color)
    bg1.paste(logo_badge, (logo_x, logo_y), logo_badge)
    
    selected_5 = all_imgs[:5] if len(all_imgs) >= 5 else (all_imgs * 2)[:5]
    heights5 = [590, 670, 760, 670, 590]
    yaws5 = [-12, -6, 0, 6, 12]
    y_offsets5 = [285, 230, 185, 230, 285]
    
    phones5 = [apply_perspective_angle(render_full_phone(f, h, frame_path), y) for f, h, y in zip(selected_5, heights5, yaws5)]
    center_x = (CANVAS_W - phones5[2].width) // 2
    l_in_x = center_x - int(phones5[1].width * 0.68)
    r_in_x = center_x + int(phones5[2].width * 0.62)
    l_out_x = l_in_x - int(phones5[0].width * 0.68)
    r_out_x = r_in_x + int(phones5[3].width * 0.62)
    xs5 = [l_out_x, l_in_x, center_x, r_in_x, r_out_x]
    
    for idx in [0, 4, 1, 3, 2]:
        bg1.paste(phones5[idx], (xs5[idx], y_offsets5[idx]), phones5[idx])
        
    out1 = os.path.join(output_dir, "showcase-1.png")
    bg1.convert("RGB").save(out1, "PNG", quality=95)
    print(f"✅ Saved 5-Phone 3D Collage: {out1}")

if __name__ == "__main__":
    main()
