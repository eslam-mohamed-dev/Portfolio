# 🎨 Universal 3D Portfolio Showcase Collage Guide

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

The generator pipeline accepts input parameters for any application. If paths are not provided via CLI flags, the script interactively prompts for them:

| Input Parameter | Description | Example |
| :--- | :--- | :--- |
| `--screenshots` | Directory containing phone screenshot PNGs | `/Users/eslam/Desktop/App Screenshots` |
| `--logo` | App logo image (SVG or high-res PNG) | `/path/to/logo.svg` or `/path/to/logo.png` |
| `--brand-color` | Primary brand accent hex color | `#2d1610` (Highness), `#122c3f` (Al-Monqiz), `#2f0e10` (ABAH) |
| `--frame-type` | Device frame style: `iphone` (Default) or `android` | `iphone` (Default for Flutter/iOS) or `android` (for Aflami Native Android) |
| `--output` | Destination filepath or directory for PNG collages | `assets/img/highness-1.png` |

---

## 🎨 3. Dynamic App-Theme Background Glow

The collage canvas utilizes a dark, moody midnight slate theme matching the portfolio aesthetic:

1. **Outer Frame Canvas**: Deep midnight navy slate (`#080e1b` / RGB `[8, 14, 27]`).
2. **Dynamic Brand Theme Center Glow**: The subtle radial warm glow centered behind the devices automatically derives its tint from the app's `--brand-color` hex:
   $$\text{RGB}_{\text{center}} = 0.22 \times \text{RGB}_{\text{brand}} + [10, 10, 12]$$
3. **Smooth Mathematical Falloff**: Blends smoothly from center tint to midnight outer slate using $t = \text{dist}^{1.4}$, avoiding harsh glowing rings while keeping high contrast for device bezels and top logos.

---

## 📱 4. Device Frames (iPhone 15 Default vs Android Option)

- **iPhone 15 Frame (Default — `--frame-type iphone`)**: Features edge-to-edge curved screen borders with Dynamic Island cutout (used by default for all Flutter & Cross-Platform apps).
- **Android Punch-Hole Frame (`--frame-type android`)**: Features sleek dark metallic bezels with top-center Punch-Hole camera cutout (used specifically for Native Kotlin Android apps like Aflami).

---

## 📐 5. Layout Architecture & Measured 3D Perspective Rules

To guarantee 100% pixel-perfect visual alignment across all portfolio project cards (**Al-Monqiz**, **Ali Bin Ali Hospital**, **Highness Fruits**, and **Aflami**), all collages follow these empirically measured scale, X-span, and elevation offsets:

### A. 5-Device Hero Layout (Storefront / Home Experience)
* **Perspective Yaw Angles**: `[-12°, -6°, 0°, +6°, +12°]`
* **Device Scale Heights**: `[670px, 725px, 796px, 725px, 670px]` *(Center hero: `796px` tall)*
* **Vertical Y Offsets**: `[282px, 236px, 190px, 236px, 282px]` *(Center phone starts at `y = 190px`)*
* **Exact Measured X Positions**: `[167px, 450px, 760px, 1150px, 1450px]` *(Spacious side-by-side placement without heavy overlapping)*
* **Render Z-Order**: Outer devices (`0, 4`) $\rightarrow$ Inner devices (`1, 3`) $\rightarrow$ Center Hero (`2` on top).

### B. Top Logo Clearance Gap
* Render original vector logo badge at `height = 65px` centered at `y = 35px`.
* Maintain an exact **78px vertical gap** between logo bottom (`y = 112px`) and center phone top (`y = 190px`) to ensure clean spacing away from the top logo.

---

## 💻 6. Quick Run Instructions

Run the universal generator directly from the terminal (defaults to iPhone 15 frame):

```bash
# Standard Run (Defaults to iPhone 15 Frame)
python3 scripts/generate_3d_collages.py \
  --screenshots "/Users/eslam/Desktop/Highness Fruits Screenshots" \
  --logo "assets/img/highness-logo-original-hd.png" \
  --brand-color "#2d1610"

# Explicit Native Android Run (For Native Android apps like Aflami)
python3 scripts/generate_3d_collages.py \
  --screenshots "/Users/eslam/Desktop/Aflami App Screenshots/Auth & Home" \
  --logo "assets/img/aflami-logo.png" \
  --brand-color "#410c12" \
  --frame-type android
```

---
*Created for Eslam Mohamed Portfolio.*
