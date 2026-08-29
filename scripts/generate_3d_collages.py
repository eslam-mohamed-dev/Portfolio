#!/usr/bin/env python3
"""
Universal 3D App Showcase Collage Generator
-------------------------------------------
Generates 1920x1080 high-definition 3D phone showcase collages matching the
exact empirical pixel standards of the portfolio.

Default Frame: iPhone 15 Pro Frame
Optional Frame: Android Punch-Hole Frame (--frame-type android)
"""

import os
import sys
import argparse
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CANVAS_W, CANVAS_H = 1920, 1080

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def create_rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (size[0] - 1, size[1] - 1)], radius=radius, fill=255)
    return mask

def render_iphone15_phone(screenshot_path, target_h, frame_path="assets/img/iphone15_frame.png"):
    ss = Image.open(screenshot_path).convert("RGBA")
    
    if os.path.exists(frame_path):
        frame = Image.open(frame_path).convert("RGBA")
        frame_w, frame_h = frame.size
        screen_x, screen_y = 18, 18
        screen_w, screen_h = 466, 988
        
        scaled_ss = ss.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
        mask = create_rounded_mask((screen_w, screen_h), radius=48)
        
        phone = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
        phone.paste(scaled_ss, (screen_x, screen_y), mask)
        phone.paste(frame, (0, 0), frame)
    else:
        bezel = 12
        aspect = ss.width / ss.height
        screen_h = 900
        screen_w = int(screen_h * aspect)
        scaled_ss = ss.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
        
        frame_w = screen_w + bezel * 2
        frame_h = screen_h + bezel * 2
        
        phone = Image.new("RGBA", (frame_w, frame_h), (25, 30, 42, 255))
        mask = create_rounded_mask((screen_w, screen_h), radius=36)
        phone.paste(scaled_ss, (bezel, bezel), mask)

    scale = target_h / phone.height
    target_w = int(phone.width * scale)
    return phone.resize((target_w, target_h), Image.Resampling.LANCZOS)

def render_android_phone(screenshot_path, target_h):
    ss = Image.open(screenshot_path).convert("RGBA")
    aspect = ss.width / ss.height
    bezel = 10
    screen_h = 960
    screen_w = int(screen_h * aspect)
    
    scaled_ss = ss.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    screen_mask = create_rounded_mask((screen_w, screen_h), radius=38)
    
    frame_w = screen_w + bezel * 2
    frame_h = screen_h + bezel * 2
    
    frame_mask = create_rounded_mask((frame_w, frame_h), radius=44)
    frame = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    bezel_body = Image.new("RGBA", (frame_w, frame_h), (20, 24, 34, 255))
    frame.paste(bezel_body, (0, 0), frame_mask)
    
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle([(0, 0), (frame_w - 1, frame_h - 1)], radius=44, outline=(60, 72, 95, 220), width=2)
    frame.paste(scaled_ss, (bezel, bezel), screen_mask)
    
    punch_hole_radius = 12
    punch_x = frame_w // 2
    punch_y = bezel + 22
    draw.ellipse([
        (punch_x - punch_hole_radius, punch_y - punch_hole_radius),
        (punch_x + punch_hole_radius, punch_y + punch_hole_radius)
    ], fill=(10, 12, 18, 255), outline=(30, 36, 48, 255), width=1)
    
    shadow_pad = 30
    shadow_w = frame_w + shadow_pad * 2
    shadow_h = frame_h + shadow_pad * 2
    shadow = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [(shadow_pad, shadow_pad), (shadow_w - shadow_pad, shadow_h - shadow_pad)],
        radius=44, fill=(0, 0, 0, 150)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    
    composite = Image.new("RGBA", (shadow_w, shadow_h), (0, 0, 0, 0))
    composite.paste(shadow, (0, 0))
    composite.paste(frame, (shadow_pad, shadow_pad), frame)
    
    scale = target_h / composite.height
    target_w = int(composite.width * scale)
    return composite.resize((target_w, target_h), Image.Resampling.LANCZOS)

def apply_perspective_yaw(pil_img, yaw_deg):
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
    warped = cv2.warpPerspective(
        np_img, M, (w, h),
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0)
    )
    return Image.fromarray(warped, "RGBA")

def build_background(brand_hex="#2d1610"):
    brand_rgb = np.array(hex_to_rgb(brand_hex), dtype=float)
    c_center = np.clip(0.22 * brand_rgb + np.array([10, 10, 12]), 0, 255)
    c_outer = np.array([8, 14, 27], dtype=float) # Deep midnight navy slate
    
    y, x = np.ogrid[:CANVAS_H, :CANVAS_W]
    center_x, center_y = CANVAS_W / 2.0, CANVAS_H / 2.0 - 40.0
    
    max_dist = np.sqrt(center_x**2 + center_y**2)
    dist = np.clip(np.sqrt((x - center_x)**2 + (y - center_y)**2) / max_dist * 1.05, 0, 1)
    
    t = np.expand_dims(dist ** 1.4, axis=2)
    rgb = ((1.0 - t) * c_center + t * c_outer).astype(np.uint8)
    alpha = np.full((CANVAS_H, CANVAS_W, 1), 255, dtype=np.uint8)
    return Image.fromarray(np.dstack((rgb, alpha)), "RGBA")

def build_logo_badge(logo_path):
    if not logo_path or not os.path.exists(logo_path):
        return None
    
    logo_raw = Image.open(logo_path).convert("RGBA")
    logo_h = 65
    logo_w = int(logo_raw.width * (logo_h / logo_raw.height))
    logo_img = logo_raw.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    
    pad = 12
    badge_w, badge_h = logo_w + pad * 2, logo_h + pad * 2
    badge = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
    
    alpha = logo_img.split()[3]
    alpha_pad = Image.new("L", (badge_w, badge_h), 0)
    alpha_pad.paste(alpha, (pad, pad))
    
    shadow = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 80))
    badge.paste(shadow, (0, 0), alpha_pad.filter(ImageFilter.GaussianBlur(6)))
    badge.paste(logo_img, (pad, pad), logo_img)
    return badge

def generate_hero_collage(screenshots, output_path, brand_hex, logo_path, frame_type="iphone"):
    bg = build_background(brand_hex)
    
    badge = build_logo_badge(logo_path)
    if badge:
        logo_x = (CANVAS_W - badge.width) // 2
        bg.paste(badge, (logo_x, 35), badge)
        
    heights = [670, 725, 796, 725, 670]
    yaws = [-12, -6, 0, 6, 12]
    y_offsets = [282, 236, 190, 236, 282]
    xs = [167, 450, 760, 1150, 1450]
    
    phones = []
    for ss_path, h, y in zip(screenshots[:5], heights, yaws):
        if frame_type == "android":
            phone = render_android_phone(ss_path, h)
        else:
            phone = render_iphone15_phone(ss_path, h)
        phone_3d = apply_perspective_yaw(phone, y)
        phones.append(phone_3d)
        
    order = [0, 4, 1, 3, 2] # Render center on top
    for idx in order:
        bg.paste(phones[idx], (xs[idx], y_offsets[idx]), phones[idx])
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bg.convert("RGB").save(output_path, "PNG", quality=95)
    print(f"✅ Generated Showcase Collage ({frame_type.upper()} frame): {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Universal 3D App Showcase Collage Generator")
    parser.add_argument("--screenshots", help="Path to directory containing app screenshots")
    parser.add_argument("--logo", help="Path to app logo PNG image file")
    parser.add_argument("--brand-color", default="#2d1610", help="Hex brand color for subtle glow (default: #2d1610)")
    parser.add_argument("--frame-type", default="iphone", choices=["iphone", "android"], help="Device frame type (default: iphone)")
    parser.add_argument("--output", default="assets/img/showcase.png", help="Output PNG filepath")
    
    args = parser.parse_args()
    
    ss_dir = args.screenshots
    if not ss_dir or not os.path.exists(ss_dir):
        ss_dir = input("Enter path to screenshots directory: ").strip().strip("'\"")
        
    logo_file = args.logo
    if not logo_file or not os.path.exists(logo_file):
        logo_file = input("Enter path to logo PNG file (leave empty to skip): ").strip().strip("'\"")
        
    ss_files = sorted([os.path.join(ss_dir, f) for f in os.listdir(ss_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
    if len(ss_files) < 5:
        print(f"Error: Need at least 5 screenshots in {ss_dir}, found {len(ss_files)}.")
        sys.exit(1)
        
    generate_hero_collage(ss_files, args.output, args.brand_color, logo_file, args.frame_type)

if __name__ == "__main__":
    main()
