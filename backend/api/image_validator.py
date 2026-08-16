from typing import Tuple, Optional, Dict
from PIL import Image, ImageFilter
import numpy as np
from collections import deque


def _rgb_to_ycrcb(rgb: np.ndarray):
    r = rgb[:, :, 0].astype(np.float32)
    g = rgb[:, :, 1].astype(np.float32)
    b = rgb[:, :, 2].astype(np.float32)
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cb = 128.0 + (b - y) * 0.564
    cr = 128.0 + (r - y) * 0.713
    return y, cr, cb


def _largest_component_ratio(bin_mask: np.ndarray) -> float:
    h, w = bin_mask.shape
    visited = np.zeros_like(bin_mask, dtype=bool)
    max_size = 0
    total = h * w
    neighbors = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    for y in range(h):
        for x in range(w):
            if bin_mask[y, x] and not visited[y, x]:
                size = 0
                dq = deque()
                dq.append((y, x))
                visited[y, x] = True
                while dq:
                    cy, cx = dq.popleft()
                    size += 1
                    for dy, dx in neighbors:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and bin_mask[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            dq.append((ny, nx))
                if size > max_size:
                    max_size = size
    return float(max_size) / float(total)


def validate_image(pil_image: Image.Image,
                   debug: bool = False
                   ) -> Tuple[bool, Optional[str], Dict]:
    """
    Validate whether an image likely contains human skin.

    Returns:
      (is_valid: bool, reason: Optional[str], metrics: dict)
    """
    metrics = {}
    try:
        # Fast integrity and mode checks
        if pil_image is None:
            return False, "corrupt_or_empty_image", metrics
        img = pil_image.convert("RGB")
        w, h = img.size
        metrics['width'] = w
        metrics['height'] = h

        # Reject extremely small images
        if w < 40 or h < 40:
            return False, "image_too_small", metrics

        # Compute luminance (brightness) check
        arr = np.asarray(img).astype(np.float32)  # H x W x 3, 0-255
        lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]) / 255.0
        mean_lum = float(np.mean(lum))
        metrics['mean_luminance'] = mean_lum
        if mean_lum < 0.03:
            return False, "too_dark", metrics
        if mean_lum > 0.97:
            return False, "too_bright", metrics

        # Blur/flatness check: use edge filter variance
        small = img.resize((128, 128))
        edges = small.filter(ImageFilter.FIND_EDGES)
        edges_arr = np.asarray(edges.convert("L")).astype(np.float32)
        edge_std = float(edges_arr.std())
        metrics['edge_std'] = edge_std
        if edge_std < 8.0:
            return False, "image_too_blurry_or_flat", metrics

        # Color-space skin masks (YCrCb and HSV)
        small_arr = np.asarray(small).astype(np.uint8)
        _, cr, cb = _rgb_to_ycrcb(small_arr)
        crcb_mask = (cr >= 135) & (cr <= 180) & (cb >= 85) & (cb <= 135)

        hsv = small.convert("HSV")
        hsv_arr = np.asarray(hsv).astype(np.uint8)
        h_chan = hsv_arr[:, :, 0].astype(np.float32) * (360.0 / 255.0)  # degrees
        s_chan = hsv_arr[:, :, 1].astype(np.float32) / 255.0
        v_chan = hsv_arr[:, :, 2].astype(np.float32) / 255.0
        hsv_mask = ( (h_chan >= 0) & (h_chan <= 50) | (h_chan >= 320) & (h_chan <= 360) ) & (s_chan >= 0.15) & (v_chan >= 0.2)

        # Combined mask
        skin_mask = crcb_mask & hsv_mask
        skin_pixels = int(np.sum(skin_mask))
        total_pixels = skin_mask.size
        skin_ratio = float(skin_pixels) / float(total_pixels)
        metrics['skin_ratio'] = skin_ratio

        # Require minimum overall skin pixel coverage
        MIN_SKIN_RATIO = 0.02  # 2% of small image
        if skin_ratio < MIN_SKIN_RATIO:
            return False, f"insufficient_skin_coverage({skin_ratio:.4f})", metrics

        # Connected region check (largest connected skin region)
        largest_comp = _largest_component_ratio(skin_mask)
        metrics['largest_component_ratio'] = largest_comp
        MIN_LARGEST_COMP = 0.01  # 1% of image
        if largest_comp < MIN_LARGEST_COMP:
            return False, f"no_coherent_skin_region({largest_comp:.4f})", metrics

        # Optional: texture inside skin region (use edge density in skin region)
        gray = np.asarray(small.convert("L")).astype(np.float32)
        edge_binary = (np.asarray(edges.convert("L")).astype(np.float32) > 20)
        edge_density = float(np.sum(edge_binary & skin_mask) / max(1, np.sum(skin_mask)))
        metrics['skin_edge_density'] = edge_density
        if edge_density < 0.02:
            return False, f"low_skin_texture({edge_density:.4f})", metrics

        return True, None, metrics
    except Exception as e:
        # On unexpected failure, be conservative and reject the image
        metrics['exception'] = str(e)
        return False, "validation_error", metrics
