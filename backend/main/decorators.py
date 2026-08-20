import json
import jwt
from functools import wraps
from django.apps import apps
from django.conf import settings

from rest_framework import exceptions, status

from django.http import (
    Http404,
    JsonResponse,
    HttpResponseBadRequest,
)
import traceback
from contextlib import suppress

from main.utils.function.utils import remove_file_from_cdn
from rest_framework.exceptions import ValidationError


def ajax_required(f):

    @wraps(f)
    def inner(request, *args, **kwargs):

        if request.method != "POST":
            return JsonResponse({
                "success": False,
                "error": "Malformed data!"
            })

        try:
            payload = json.loads(request.body)
        except Exception:
            pass
        else:
            args = [payload, *args]

        try:
            return f(request, *args, **kwargs)
        except Http404:
            return HttpResponseBadRequest('{"success": false}')

    return inner


def login_required():
    ''' Хэрэглэгчийг нэвтэрсэн эсэхийг шалгах нь
    '''
    def decorator(view_func):

        def wrap(self, request, *args, **kwargs):
            User = apps.get_model('core', 'User')
            user_id = request.session.get('_auth_user_id')

            user = User.objects.filter(id=user_id).first()
            if user_id:
                request.user = user
            else:
                raise exceptions.AuthenticationFailed('unauthenticated')

            return view_func(self, request, *args, **kwargs)

        return wrap

    return decorator


def handle_serializer_errors(func):
    """
    to handle serializer errors for example: to use it in useForm() to display errors with setError()
    """

    def wrapper(self, request, *args, **kwargs):
        # to remove files to rollback on errors
        created_file_pathes = []

        try:
            return func(self, request, created_file_pathes=created_file_pathes, *args, **kwargs)

        except ValidationError as serializer_errors:
            with suppress(Exception):
                for file_path in created_file_pathes:
                    remove_file_from_cdn(file_path)

            traceback.print_exc()
            return request.send_error_valid(serializer_errors.detail)

        except Exception:
            with suppress(Exception):
                for file_path in created_file_pathes:
                    remove_file_from_cdn(file_path)

            # to transfer exception to parent exception handler
            raise

    return wrapper


def login_required_jwt():
    ''' Хэрэглэгчийн хүчинтэй токен үүссэн эсэхийг шалгах '''
    def decorator(view_func):
        def wrap(self, request, *args, **kwargs):
            auth_header = request.headers.get('Authorization')
            StudentLogin = apps.get_model("lms", 'StudentLogin')

            if not auth_header:
                return JsonResponse({
                    "success": False,
                    "data": [],
                    "error": "Токеноо илгээнэ үү",
                    "status": status.HTTP_401_UNAUTHORIZED
                })

            # header ихэвчлэн "Bearer <token>" хэлбэртэй ирдэг тул салгаж авна
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return JsonResponse({
                    "success": False,
                    "data": [],
                    "error": "Токен буруу байна",
                    "status": status.HTTP_401_UNAUTHORIZED
                })

            token = parts[1]

            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                return JsonResponse({
                    "success": False,
                    "data": [],
                    "error": "Токен хугацаа нь дууссан",
                    "status": status.HTTP_401_UNAUTHORIZED
                })
            except jwt.InvalidTokenError:
                return JsonResponse({
                    "success": False,
                    "data": [],
                    "error": "Хүчингүй токен",
                    "status": status.HTTP_401_UNAUTHORIZED
                })
            try:
                user = StudentLogin.objects.get(pk=payload.get('user_id'))
            except StudentLogin.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "data": [],
                    "error": "Хэрэглэгч олдсонгүй",
                    "status": status.HTTP_401_UNAUTHORIZED
                })

            # request.user-д бүрэн user объект оруулж өгнө
            request.user = user

            return view_func(self, request, *args, **kwargs)
        return wrap
    return decorator
