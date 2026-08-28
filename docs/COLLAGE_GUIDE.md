# 🎨 Universal 3D iPhone 15 Portfolio Showcase Collage Guide

This guide documents the standardized, generic Python pipeline for generating high-resolution, 3D perspective smartphone showcase collages for **any mobile application** added to the portfolio.

---

## 🛠️ 1. Prerequisites & Installation

Ensure the required Python packages and system tools are installed:

```bash
pip install Pillow opencv-python numpy
brew install cairosvg
```

---

## 📁 2. Inputs & Brand Customization

The generator pipeline accepts input parameters for any new application. If paths are not provided via CLI flags, the script interactively prompts for them:

| Input Parameter | Description | Example |
| :--- | :--- | :--- |
| `--screenshots` | Directory containing phone screenshot PNGs | `/Users/eslam/Desktop/App Screenshots` |
| `--logo` | App logo image (SVG or high-res PNG) | `/path/to/logo.svg` or `/path/to/logo.png` |
| `--brand-color` | Primary brand accent hex color | `#ea580c` (Orange), `#dc2626` (Red), `#0284c7` (Blue) |
| `--output` | Destination directory for PNG collages | `assets/img/` |

---

## 🎨 3. Dynamic App-Theme Background Glow

The collage canvas utilizes a dark, moody midnight slate theme matching the portfolio aesthetic:

1. **Outer Frame Canvas**: Deep midnight navy slate (`#080e1b` / RGB `[8, 14, 27]`).
2. **Dynamic Brand Theme Center Glow**: The subtle radial warm glow centered behind the devices automatically derives its tint from the app's `--brand-color` hex:
   $$\text{RGB}_{\text{center}} = 0.22 \times \text{RGB}_{\text{brand}} + [10, 10, 12]$$
3. **Smooth Mathematical Falloff**: Blends smoothly from center tint to midnight outer slate using $t = \text{dist}^{1.4}$, avoiding harsh glowing rings while keeping high contrast for device bezels and top logos.

---

## 📐 4. Layout Architecture & 3D Perspective Rules

### A. 5-Device Hero Layout (Storefront / Home Experience)
* **Perspective Yaw Angles**: `[-12°, -6°, 0°, +6°, +12°]`
* **Device Scale Heights**: `[590px, 670px, 760px, 670px, 590px]`
* **Vertical Y Offsets**: `[285px, 230px, 185px, 230px, 285px]`
* **Render Z-Order**: Outer devices (`0, 4`) $\rightarrow$ Inner devices (`1, 3`) $\rightarrow$ Center Hero (`2` on top).

### B. 3-Device Feature Flow Layout (Checkout / Order Logistics)
* **Perspective Yaw Angles**: `[-8°, 0°, +8°]`
* **Device Scale Heights**: `[670px, 760px, 670px]`
* **Vertical Y Offsets**: `[230px, 185px, 230px]`
* **Render Z-Order**: Outer devices (`0, 2`) $\rightarrow$ Center Hero (`1` on top).

### C. Top Logo Clearance Gap
* Render original vector logo badge at `height = 80px` centered at `y = 30px`.
* Maintain a minimum **75px vertical gap** between logo bottom and center phone top.

---

## 💻 5. Quick Run Instructions

Run the universal generator directly from the terminal. If arguments are omitted, the script will prompt interactively:

```bash
python3 scripts/generate_3d_collages.py \
  --screenshots "/Users/eslam/Desktop/Highness Fruits Screenshots" \
  --logo "assets/img/highness-logo-original-hd.png" \
  --brand-color "#ea580c"
```

---

## 🐍 6. Complete Reusable Python Generator Script

```python
import os
import sys
import argparse
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CANVAS_W, CANVAS_H = 1920, 1080
FRAME_PATH = "assets/img/iphone15_frame.png"

# Load iPhone 15 Frame & Screen Mask
raw_frame = Image.open(FRAME_PATH).convert("RGBA")
FRAME_W, FRAME_H = raw_frame.size
SCREEN_X, SCREEN_Y = 18, 18
SCREEN_W, SCREEN_H = 466, 988
SCREEN_RADIUS = 48

raw_screen_mask = Image.new("L", (SCREEN_W, SCREEN_H), 0)
sm_draw = ImageDraw.Draw(raw_screen_mask)
sm_draw.rounded_rectangle([(0, 0), (SCREEN_W - 1, SCREEN_H - 1)], radius=SCREEN_RADIUS, fill=255)

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return [int(hex_str[i:i+2], 16) for i in (0, 2, 4)]

def render_full_phone(screenshot_path, target_h):
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
    y, x = np.ogrid[:CANVAS_H, :CANVAS_W]
    center_x, center_y = CANVAS_W / 2.0, CANVAS_H / 2.0 - 40.0
    
    max_dist = np.sqrt(center_x**2 + center_y**2)
    dist = np.sqrt((x - center_x)**2 + (y - center_y)**2) / max_dist
    dist = np.clip(dist * 1.05, 0, 1)
    
    # Calculate dark warm brand glow color from app's brand hex
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
    parser.add_argument("--brand-color", default="#ea580c", help="App brand primary hex color")
    parser.add_argument("--output", default="assets/img", help="Output directory")
    args = parser.parse_args()

    screenshots_dir = prompt_input_if_missing(args.screenshots, "Enter path to Screenshots directory")
    logo_path = prompt_input_if_missing(args.logo, "Enter path to App Logo image")
    brand_color = args.brand_color or input("Enter App Brand Primary Hex Color [#ea580c]: ").strip() or "#ea580c"

    os.makedirs(args.output, exist_ok=True)
    print(f"\n🚀 Generating 3D Showcase Collages for brand color '{brand_color}'...")
    # Generator rendering logic...
```

---
*Created for Eslam Mohamed Portfolio.*
