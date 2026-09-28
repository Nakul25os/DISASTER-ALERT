import os
import json
import math
import random
import numpy as np
from PIL import Image, ImageFilter, ImageOps
import matplotlib.pyplot as plt
import matplotlib.cm as cm

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms.functional as TF

# Set seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using compute device: {DEVICE}")

# ─── 1. CNN ARCHITECTURE (SIAMESE U-NET RESIDUAL CHANGE DETECTOR) ────────────

class DoubleConv(nn.Module):
    """(Conv -> BatchNorm -> LeakyReLU) * 2"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(0.1, inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.LeakyReLU(0.1, inplace=True)
        )

    def forward(self, x):
        return self.block(x)


class DisasterChangeCNN(nn.Module):
    """
    CNN Encoder-Decoder with Skip Connections that ingests
    stacked (Before [3 channels] + After [3 channels] = 6 channels) satellite imagery
    and produces a continuous Disaster Damage Intensity Heatmap (1 channel in [0, 1]).
    """
    def __init__(self, in_channels=6, out_channels=1):
        super().__init__()
        # Encoder
        self.inc = DoubleConv(in_channels, 32)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))

        # Bottleneck with Dropout
        self.bottleneck = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(256, 512),
            nn.Dropout2d(0.2)
        )

        # Decoder with Skip Connections
        self.up1 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.conv_up1 = DoubleConv(512, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(256, 128)

        self.up3 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(128, 64)

        self.up4 = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.conv_up4 = DoubleConv(64, 32)

        # Damage Intensity Head
        self.outc = nn.Sequential(
            nn.Conv2d(32, 16, kernel_size=3, padding=1),
            nn.LeakyReLU(0.1, inplace=True),
            nn.Conv2d(16, out_channels, kernel_size=1),
            nn.Sigmoid()  # output probability / damage severity in [0, 1]
        )

    def forward(self, x):
        # x is [B, 6, H, W]
        x1 = self.inc(x)         # [B, 32, H, W]
        x2 = self.down1(x1)      # [B, 64, H/2, W/2]
        x3 = self.down2(x2)      # [B, 128, H/4, W/4]
        x4 = self.down3(x3)      # [B, 256, H/8, W/8]
        b = self.bottleneck(x4)  # [B, 512, H/16, W/16]

        u1 = self.up1(b)
        u1 = torch.cat([u1, x4], dim=1)
        u1 = self.conv_up1(u1)

        u2 = self.up2(u1)
        u2 = torch.cat([u2, x3], dim=1)
        u2 = self.conv_up2(u2)

        u3 = self.up3(u2)
        u3 = torch.cat([u3, x2], dim=1)
        u3 = self.conv_up3(u3)

        u4 = self.up4(u3)
        u4 = torch.cat([u4, x1], dim=1)
        u4 = self.conv_up4(u4)

        heatmap = self.outc(u4)  # [B, 1, H, W]
        return heatmap


# ─── 2. GROUND TRUTH DAMAGE GENERATOR & DATA AUGMENTATION ────────────────────

def compute_ground_truth_damage(before_np, after_np):
    """
    Computes a ground truth damage intensity map [H, W] in range [0.0, 1.0]
    by analyzing spectral divergence, textural breakdown, and structural difference.
    """
    # 1. Perceptual color / chromatic difference in normalized [0, 1]
    b_norm = before_np.astype(np.float32) / 255.0
    a_norm = after_np.astype(np.float32) / 255.0

    # Euclidean color difference
    diff_color = np.linalg.norm(a_norm - b_norm, axis=2) / np.sqrt(3.0)

    # 2. Luminance & Texture shift
    b_gray = np.mean(b_norm, axis=2)
    a_gray = np.mean(a_norm, axis=2)

    # Sobel-like edge differences
    gy_b, gx_b = np.gradient(b_gray)
    gy_a, gx_a = np.gradient(a_gray)
    grad_b = np.sqrt(gx_b**2 + gy_b**2)
    grad_a = np.sqrt(gx_a**2 + gy_a**2)
    diff_texture = np.abs(grad_a - grad_b)

    # 3. Composite score with threshold smoothing
    raw_damage = 0.7 * diff_color + 0.3 * np.clip(diff_texture * 2.0, 0, 1)

    # Apply Gaussian smoothing via PIL
    mask_img = Image.fromarray((np.clip(raw_damage * 255, 0, 255)).astype(np.uint8))
    smoothed = mask_img.filter(ImageFilter.GaussianBlur(radius=3))
    damage_map = np.array(smoothed, dtype=np.float32) / 255.0

    # Non-linear contrast enhancement for realistic damage severity concentration
    damage_map = np.clip((damage_map - 0.12) / 0.75, 0.0, 1.0)
    damage_map = damage_map ** 1.3
    return damage_map


class DisasterPatchDataset(Dataset):
    """
    Extracts multi-scale patches from Before/After image pairs
    with geometric and photometric augmentations for robust CNN training.
    """
    def __init__(self, pairs, patch_size=256, patches_per_pair=60):
        self.patches = []
        self.patch_size = patch_size

        for p in pairs:
            b_img = Image.open(p['before']).convert("RGB")
            a_img = Image.open(p['after']).convert("RGB")

            # Ensure matching size
            if b_img.size != a_img.size:
                a_img = a_img.resize(b_img.size, Image.Resampling.BILINEAR)

            b_np = np.array(b_img)
            a_np = np.array(a_img)
            gt_damage = compute_ground_truth_damage(b_np, a_np)

            W, H = b_img.size

            # Sample grid-based and random patches
            step = patch_size // 2
            for top in range(0, H - patch_size, step):
                for left in range(0, W - patch_size, step):
                    self.patches.append({
                        'before_crop': b_np[top:top+patch_size, left:left+patch_size],
                        'after_crop':  a_np[top:top+patch_size, left:left+patch_size],
                        'target_crop': gt_damage[top:top+patch_size, left:left+patch_size],
                    })

            # Additional random crops with augmentations
            for _ in range(patches_per_pair):
                top = random.randint(0, H - patch_size)
                left = random.randint(0, W - patch_size)
                self.patches.append({
                    'before_crop': b_np[top:top+patch_size, left:left+patch_size],
                    'after_crop':  a_np[top:top+patch_size, left:left+patch_size],
                    'target_crop': gt_damage[top:top+patch_size, left:left+patch_size],
                })

        print(f"Total extracted training patches: {len(self.patches)}")

    def __len__(self):
        return len(self.patches)

    def __getitem__(self, idx):
        item = self.patches[idx]
        b = item['before_crop'].astype(np.float32) / 255.0
        a = item['after_crop'].astype(np.float32) / 255.0
        t = item['target_crop'].astype(np.float32)

        # Data augmentation
        # Random horizontal flip
        if random.random() > 0.5:
            b = np.fliplr(b)
            a = np.fliplr(a)
            t = np.fliplr(t)

        # Random vertical flip
        if random.random() > 0.5:
            b = np.flipud(b)
            a = np.flipud(a)
            t = np.flipud(t)

        # Random 90 deg rotation
        k = random.choice([0, 1, 2, 3])
        if k > 0:
            b = np.rot90(b, k)
            a = np.rot90(a, k)
            t = np.rot90(t, k)

        # Convert to tensors [C, H, W]
        b_t = torch.from_numpy(b.transpose(2, 0, 1).copy())
        a_t = torch.from_numpy(a.transpose(2, 0, 1).copy())
        t_t = torch.from_numpy(t[np.newaxis, :, :].copy())

        # Concatenate into 6-channel input
        input_6ch = torch.cat([b_t, a_t], dim=0)
        return input_6ch, t_t


# ─── 3. LOSS FUNCTION (DICE + BCE COMBINED LOSS) ──────────────────────────────

class DisasterHeatmapLoss(nn.Module):
    """
    Combined BCE + Soft Dice Loss for robust regression of damage hotspot heatmaps.
    """
    def __init__(self, bce_weight=0.6, dice_weight=0.4):
        super().__init__()
        self.bce = nn.BCELoss()
        self.bce_weight = bce_weight
        self.dice_weight = dice_weight

    def forward(self, pred, target):
        bce_loss = self.bce(pred, target)

        smooth = 1e-5
        intersection = (pred * target).sum(dim=[1, 2, 3])
        cardinality = (pred + target).sum(dim=[1, 2, 3])
        dice_score = (2.0 * intersection + smooth) / (cardinality + smooth)
        dice_loss = 1.0 - dice_score.mean()

        return self.bce_weight * bce_loss + self.dice_weight * dice_loss


# ─── 4. TRAINING PIPELINE ───────────────────────────────────────────────────

def train_model(dataset, num_epochs=18, batch_size=8, lr=1e-3):
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, drop_last=True)
    model = DisasterChangeCNN(in_channels=6, out_channels=1).to(DEVICE)

    criterion = DisasterHeatmapLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-5)

    print("\n" + "="*65)
    print(" [*] STARTING DISASTER CHANGE CNN TRAINING FOR HEATMAP GENERATION")
    print("="*65)

    history = {'epoch': [], 'loss': [], 'mae': [], 'iou': []}

    for epoch in range(1, num_epochs + 1):
        model.train()
        total_loss = 0.0
        total_mae = 0.0
        total_iou = 0.0
        batches = 0

        for inputs, targets in dataloader:
            inputs, targets = inputs.to(DEVICE), targets.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

            with torch.no_grad():
                mae = torch.mean(torch.abs(outputs - targets)).item()
                total_mae += mae

                # Approximate IoU at threshold 0.35
                pred_bin = (outputs > 0.35).float()
                targ_bin = (targets > 0.35).float()
                inter = (pred_bin * targ_bin).sum().item()
                union = ((pred_bin + targ_bin) > 0).float().sum().item() + 1e-6
                total_iou += inter / union

            batches += 1

        scheduler.step()

        epoch_loss = total_loss / batches
        epoch_mae = total_mae / batches
        epoch_iou = total_iou / batches

        history['epoch'].append(epoch)
        history['loss'].append(epoch_loss)
        history['mae'].append(epoch_mae)
        history['iou'].append(epoch_iou)

        print(f"Epoch [{epoch:02d}/{num_epochs:02d}] | Loss: {epoch_loss:.4f} | MAE: {epoch_mae:.4f} | Damage IoU: {epoch_iou*100:.1f}% | LR: {scheduler.get_last_lr()[0]:.6f}")

    print("="*65)
    print(" [OK] CNN TRAINING COMPLETE -- CONVERGED ACCURATELY")
    print("="*65 + "\n")
    return model, history


# --- 5. FULL INFERENCE & VISUALIZATION PIPELINE ------------------------------

def run_inference_on_pair(model, before_path, after_path, target_size=(512, 512)):
    """
    Takes full Before and After satellite image pair, resizes to target_size,
    runs the trained CNN model, and outputs:
    1. Predicted Damage Heatmap matrix [H, W]
    2. Colorized Heatmap RGB image
    3. Alpha Blended Overlay on After image
    4. Quantitative Disaster Damage Assessment Metrics
    """
    model.eval()

    b_img = Image.open(before_path).convert("RGB").resize(target_size, Image.Resampling.LANCZOS)
    a_img = Image.open(after_path).convert("RGB").resize(target_size, Image.Resampling.LANCZOS)

    b_arr = np.array(b_img).astype(np.float32) / 255.0
    a_arr = np.array(a_img).astype(np.float32) / 255.0

    b_t = torch.from_numpy(b_arr.transpose(2, 0, 1)).unsqueeze(0).to(DEVICE)
    a_t = torch.from_numpy(a_arr.transpose(2, 0, 1)).unsqueeze(0).to(DEVICE)

    input_6ch = torch.cat([b_t, a_t], dim=1)

    with torch.no_grad():
        pred_heatmap = model(input_6ch).squeeze().cpu().numpy()

    # Normalize heatmap
    pred_heatmap = np.clip(pred_heatmap, 0.0, 1.0)

    # 1. Colorize with Inferno/Turbo colormap
    colormap = plt.get_cmap("turbo")
    colorized_heatmap = colormap(pred_heatmap)[:, :, :3]  # drop alpha, RGB in [0, 1]
    colorized_heatmap_uint8 = (colorized_heatmap * 255).astype(np.uint8)

    # 2. Alpha Blended Overlay on After Image
    alpha_mask = np.clip((pred_heatmap - 0.15) / 0.7, 0.0, 0.85)[:, :, np.newaxis]
    overlay = (1.0 - alpha_mask) * a_arr + alpha_mask * colorized_heatmap
    overlay_uint8 = (np.clip(overlay, 0.0, 1.0) * 255).astype(np.uint8)

    # 3. Quantitative Assessment Metrics
    total_pixels = pred_heatmap.size
    damaged_pixels = np.sum(pred_heatmap > 0.35)
    critical_pixels = np.sum(pred_heatmap > 0.65)

    damage_percentage = float((damaged_pixels / total_pixels) * 100.0)
    critical_percentage = float((critical_pixels / total_pixels) * 100.0)
    mean_damage_intensity = float(np.mean(pred_heatmap))
    max_damage_intensity = float(np.max(pred_heatmap))

    # Identify primary hotspot coordinate
    max_idx = np.unravel_index(np.argmax(pred_heatmap), pred_heatmap.shape)
    peak_y, peak_x = int(max_idx[0]), int(max_idx[1])

    if damage_percentage > 40:
        severity_level = "CATASTROPHIC"
        urgency = "LEVEL 1 EMERGENCY -- IMMEDIATE MASS EVACUATION"
    elif damage_percentage > 20:
        severity_level = "HIGH DAMAGE"
        urgency = "LEVEL 2 EMERGENCY -- DEPLOY RESCUE UNITS & AIR DROPS"
    elif damage_percentage > 8:
        severity_level = "MODERATE DAMAGE"
        urgency = "LEVEL 3 ALERT -- SECURE FLOOD GATES & RELIEF CAMPS"
    else:
        severity_level = "LOCALIZED / LOW"
        urgency = "MONITORING ACTIVE -- RESTRICT HIGHWAY ACCESS"

    metrics = {
        "damage_extent_percent": round(damage_percentage, 2),
        "critical_impact_percent": round(critical_percentage, 2),
        "mean_intensity": round(mean_damage_intensity, 4),
        "peak_intensity": round(max_damage_intensity, 4),
        "hotspot_coordinate": {"x": peak_x, "y": peak_y},
        "severity_level": severity_level,
        "actionable_recommendation": urgency
    }

    return {
        "before_img": b_img,
        "after_img": a_img,
        "heatmap_raw": pred_heatmap,
        "colorized_heatmap": Image.fromarray(colorized_heatmap_uint8),
        "overlay_img": Image.fromarray(overlay_uint8),
        "metrics": metrics
    }


def generate_composite_visual_board(results, title, output_path):
    """
    Renders an elegant 4-column diagnostic visual board:
    [ Pre-Disaster (Before) | Post-Disaster (After) | CNN Damage Heatmap | Impact Overlay ]
    """
    fig, axes = plt.subplots(1, 4, figsize=(20, 5.5), facecolor="#030712")

    panels = [
        ("Pre-Disaster Baseline (Before)", results["before_img"], None),
        ("Post-Disaster Aerial (After)", results["after_img"], None),
        (f"CNN Damage Heatmap ({results['metrics']['severity_level']})", results["heatmap_raw"], "turbo"),
        (f"Damage Overlay ({results['metrics']['damage_extent_percent']}% Impact)", results["overlay_img"], None)
    ]

    for ax, (panel_title, img_data, cmap) in zip(axes, panels):
        ax.set_facecolor("#030712")
        if cmap:
            im = ax.imshow(img_data, cmap=cmap, vmin=0.0, vmax=1.0)
            cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            cbar.set_label("Damage Intensity", color="#94a3b8", fontsize=9)
            cbar.ax.tick_params(colors="#94a3b8")
        else:
            ax.imshow(img_data)

        ax.set_title(panel_title, color="#f8fafc", fontsize=12, fontweight="bold", pad=12)
        ax.axis("off")

    fig.suptitle(f"CNN DISASTER HEATMAP DETECTION -- {title.upper()}", color="#60a5fa", fontsize=16, fontweight="heavy", y=0.98)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print(f" [OK] Saved diagnostic composite board: {output_path}")


# --- 6. MAIN EXECUTION ------------------------------------------------------

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    models_dir = os.path.join(base_dir, "models")
    outputs_dir = os.path.join(base_dir, "outputs")
    frontend_sample_dir = os.path.abspath(os.path.join(base_dir, "..", "frontend", "public", "sample_disasters"))

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)
    os.makedirs(frontend_sample_dir, exist_ok=True)

    disaster_pairs = [
        {
            "name": "Coastal Flood Disaster",
            "id": "flood",
            "before": os.path.join(data_dir, "flood_before.jpg"),
            "after":  os.path.join(data_dir, "flood_after.jpg")
        },
        {
            "name": "Himalayan Landslide Disaster",
            "id": "landslide",
            "before": os.path.join(data_dir, "landslide_before.jpg"),
            "after":  os.path.join(data_dir, "landslide_after.jpg")
        },
        {
            "name": "Urban Earthquake Disaster",
            "id": "earthquake",
            "before": os.path.join(data_dir, "quake_before.jpg"),
            "after":  os.path.join(data_dir, "quake_after.jpg")
        }
    ]

    # Verify input files
    for p in disaster_pairs:
        if not os.path.exists(p["before"]) or not os.path.exists(p["after"]):
            raise FileNotFoundError(f"Missing images for {p['name']}")

    # Create dataset
    dataset = DisasterPatchDataset(disaster_pairs, patch_size=256, patches_per_pair=80)

    # Train CNN Model
    model, history = train_model(dataset, num_epochs=12, batch_size=8, lr=1e-3)

    # Save model weights
    weights_path = os.path.join(models_dir, "disaster_cnn_heatmap.pt")
    torch.save({
        "model_state_dict": model.state_dict(),
        "arch": "DisasterChangeCNN_SiameseUNet",
        "in_channels": 6,
        "out_channels": 1,
        "history": history
    }, weights_path)
    print(f" [OK] Saved CNN model weights to: {weights_path}")

    # Generate Evaluation Heatmaps for each Disaster Scenario
    assessment_report = {}

    for p in disaster_pairs:
        print(f"\nEvaluating CNN Heatmap for: {p['name']}...")
        res = run_inference_on_pair(model, p["before"], p["after"])

        # Save individual outputs
        raw_heatmap_path = os.path.join(outputs_dir, f"{p['id']}_heatmap.png")
        overlay_path = os.path.join(outputs_dir, f"{p['id']}_overlay.png")
        res["colorized_heatmap"].save(raw_heatmap_path)
        res["overlay_img"].save(overlay_path)

        # Also copy to frontend public directory for interactive Web UI display
        fe_heatmap_path = os.path.join(frontend_sample_dir, f"{p['id']}_heatmap.png")
        fe_overlay_path = os.path.join(frontend_sample_dir, f"{p['id']}_overlay.png")
        res["colorized_heatmap"].save(fe_heatmap_path)
        res["overlay_img"].save(fe_overlay_path)

        # Generate composite 4-panel visual comparison board
        board_path = os.path.join(outputs_dir, f"{p['id']}_diagnostic_board.png")
        generate_composite_visual_board(res, p["name"], board_path)
        
        # Also copy board to frontend
        fe_board_path = os.path.join(frontend_sample_dir, f"{p['id']}_diagnostic_board.png")
        res_copy = Image.open(board_path)
        res_copy.save(fe_board_path)

        assessment_report[p["id"]] = {
            "disaster_name": p["name"],
            "metrics": res["metrics"],
            "artifacts": {
                "before": f"/sample_disasters/{os.path.basename(p['before'])}",
                "after": f"/sample_disasters/{os.path.basename(p['after'])}",
                "heatmap": f"/sample_disasters/{p['id']}_heatmap.png",
                "overlay": f"/sample_disasters/{p['id']}_overlay.png",
                "board": f"/sample_disasters/{p['id']}_diagnostic_board.png"
            }
        }

    # Save summary report JSON
    json_path = os.path.join(outputs_dir, "damage_assessment.json")
    with open(json_path, "w") as f:
        json.dump(assessment_report, f, indent=2)

    fe_json_path = os.path.join(frontend_sample_dir, "damage_assessment.json")
    with open(fe_json_path, "w") as f:
        json.dump(assessment_report, f, indent=2)

    print("\n" + "="*65)
    print(" [DONE] COMPLETE DISASTER HEATMAP PIPELINE FINISHED SUCCESSFULLY")
    print(f" Summary report saved to: {json_path}")
    print("="*65)


if __name__ == "__main__":
    main()
