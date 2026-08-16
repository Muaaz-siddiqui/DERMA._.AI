from django.apps import AppConfig
import logging


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Monkey-patch the existing views.is_likely_skin_image function to use
        # the new validator implemented in image_validator.py. This keeps
        # existing view code unchanged while improving validation.
        try:
            from . import views
            from .image_validator import validate_image

            def _patched_is_likely_skin_image(image_array):
                try:
                    import numpy as np
                    from PIL import Image

                    arr = np.asarray(image_array)
                    # Handle normalized float arrays (0-1) and uint8 (0-255)
                    if arr.dtype == np.float32 or arr.dtype == np.float64:
                        arr2 = np.clip(arr * 255.0, 0, 255).astype('uint8')
                    else:
                        arr2 = arr.astype('uint8')
                    pil = Image.fromarray(arr2)
                    is_valid, reason, metrics = validate_image(pil)
                    return bool(is_valid)
                except Exception:
                    # Preserve original permissive behavior on error
                    return True

            views.is_likely_skin_image = _patched_is_likely_skin_image
        except Exception as e:
            logging.getLogger(__name__).exception("Failed to patch is_likely_skin_image: %s", e)
