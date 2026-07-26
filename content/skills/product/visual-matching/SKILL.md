---
name: visual-matching
description: ImageMagick inspection of raster UI references for screenshot-based interface implementation and visual refinement.
---

## Workflow

1. Read the narrowest relevant live `magick` help before choosing commands.
2. Work from the original image; never measure a downscaled preview. Inspect the whole reference and every dense or ambiguous region at original pixel
   resolution. Keep generated inspection files outside the target repository unless the user asks to retain them.
3. Collect only evidence needed for implementation. Treat gradients, antialiasing, shadows, compression, and font identity as inferred rather than
   exact design tokens.
4. Before implementation, produce a compact reference specification covering viewport, region bounds, alignment, spacing, typography, colors, borders,
   radii, assets, and unresolved uncertainties. Label each value as measured or inferred.
