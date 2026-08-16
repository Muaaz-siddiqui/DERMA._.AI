import numpy as np
from django.test import SimpleTestCase

from .views import is_likely_skin_image


class SkinImageGuardTests(SimpleTestCase):
    def test_rejects_non_skin_image(self):
        image = np.zeros((64, 64, 3), dtype=np.uint8)
        image[:, :, 0] = 200
        image[:, :, 1] = 200
        image[:, :, 2] = 200
        self.assertFalse(is_likely_skin_image(image))

    def test_accepts_skin_tone_image(self):
        image = np.zeros((64, 64, 3), dtype=np.uint8)
        image[:, :, 0] = 180
        image[:, :, 1] = 120
        image[:, :, 2] = 100
        self.assertTrue(is_likely_skin_image(image))
