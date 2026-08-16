import json
import requests as http_requests

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Detection, Doctor
from .serializers import DetectionSerializer, DoctorSerializer

ML_SERVICE_URL = 'http://ml:7860'

LABELS = [
    'Acne',               # 0
    'Actinic Keratosis',  # 1
    'Basal Cell Carcinoma', # 2
    'Benign Keratosis',   # 3
    'Dermatofibroma',     # 4
    'Eczema',             # 5
    'Melanocytic Nevi',   # 6
    'Melanoma',           # 7
    'Psoriasis',          # 8
    'Vascular Lesion',
]

DESCRIPTIONS = {
    'Acne': 'Acne is a common skin condition that causes pimples, blackheads, and whiteheads due to clogged pores. It is usually managed with proper skincare and medications.',
    'Actinic Keratosis': 'Actinic keratosis is a rough, scaly patch caused by prolonged sun exposure. It is considered precancerous and should be monitored or treated early.',
    'Basal Cell Carcinoma': 'Basal cell carcinoma is the most common type of skin cancer. It grows slowly and rarely spreads, but early treatment is important.',
    'Benign Keratosis': 'Benign keratosis includes non-cancerous skin growths such as seborrheic keratosis. These are harmless but may resemble other skin conditions.',
    'Dermatofibroma': 'Dermatofibroma is a small, benign skin growth often found on the limbs. It is harmless and usually does not require treatment.',
    'Eczema': 'Eczema is a condition that causes dry, itchy, and inflamed skin. Regular moisturizing and avoiding triggers help manage symptoms.',
    'Melanocytic Nevi': 'Melanocytic nevi, commonly known as moles, are benign growths of pigment-producing cells. Most are harmless but should be checked for changes.',
    'Melanoma': 'Melanoma is a serious and potentially deadly form of skin cancer. Early detection and medical treatment are critical for survival.',
    'Psoriasis': 'Psoriasis is a chronic autoimmune condition that causes thick, scaly patches on the skin. It is managed with medications and lifestyle care.',
    'Vascular Lesion': 'Vascular lesions are skin conditions caused by abnormal blood vessels, such as angiomas. They are usually benign and harmless.',
}

DISCLAIMER = 'This is a preliminary AI result. Please consult a qualified dermatologist.'


def get_mock_response():
    return {
        'disease': 'Impetigo',
        'confidence': 0.84,
        'description': DESCRIPTIONS.get('Impetigo', 'A common skin infection.'),
        'disclaimer': DISCLAIMER
    }


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_image(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)

    image_file = request.FILES.get('image')
    if not image_file:
        return JsonResponse({'detail': 'No image provided'}, status=400)

    try:
        files = {'file': (image_file.name, image_file.read(), image_file.content_type)}
        resp = http_requests.post(str(ML_SERVICE_URL), files=files, timeout=30)

        if resp.status_code == 400:
            return JsonResponse(resp.json(), status=400)

        if resp.status_code != 200:
            return JsonResponse({
                'detail': f'ML service returned status {resp.status_code}',
                'warning': 'Falling back to mock response.',
                **get_mock_response()
            })

        predictions = resp.json().get('predictions', [])
        if not predictions:
            return JsonResponse({'detail': 'No predictions returned from ML service'}, status=500)

        label = predictions[0][0]
        confidence = predictions[0][1]
        description = DESCRIPTIONS.get(label, 'No specific information available.')

        Detection.objects.create(
            user=request.user,
            disease=label,
            confidence=confidence,
            description=description,
            status='Completed'
        )

        return JsonResponse({
            'disease': label,
            'confidence': confidence,
            'description': description,
            'disclaimer': DISCLAIMER
        })
    except http_requests.exceptions.ConnectionError:
        return JsonResponse({
            'detail': 'ML service is not available',
            'warning': 'Model not loaded. Returning a fallback response.',
            **get_mock_response()
        })
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not all([name, email, password]):
        return JsonResponse({'detail': 'Name, email, and password are required.'}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({'detail': 'A user with this email already exists.'}, status=400)

    try:
        user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
        # We can store phone in user profile if needed, for now just create user.
        return JsonResponse({'message': 'Registration successful. Please login.'}, status=201)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return JsonResponse({'detail': 'Email and password are required.'}, status=400)

    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({
            'token': token.key,
            'is_admin': user.is_staff or user.is_superuser
        })
    else:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=401)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    detections = Detection.objects.filter(user=request.user)
    serializer = DetectionSerializer(detections, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_detection_details(request, id):
    try:
        detection = Detection.objects.get(id=id, user=request.user)
        serializer = DetectionSerializer(detection)
        return JsonResponse(serializer.data)
    except Detection.DoesNotExist:
        return JsonResponse({'detail': 'Detection not found.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctors(request):
    # Support optional ?disease=Eczema filtering, or ?city=Lahore filtering
    disease_filter = request.query_params.get('disease')
    city_filter = request.query_params.get('city')
    
    doctors = Doctor.objects.filter(is_active=True)
    
    if disease_filter:
        doctors = doctors.filter(specialty__icontains=disease_filter)
        
    if city_filter and city_filter != 'All Cities':
        doctors = doctors.filter(city__iexact=city_filter)
        
    serializer = DoctorSerializer(doctors, many=True)
    return JsonResponse(serializer.data, safe=False)
