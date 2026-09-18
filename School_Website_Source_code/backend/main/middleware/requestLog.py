import json
import copy
import traceback
from django.apps import apps

AccessHistoryLms = apps.get_model('lms', 'AccessHistoryLms')
Errors = apps.get_model('lms', 'Errors')
Error500 = apps.get_model('lms', 'Error500')
RequestLogGet = apps.get_model('lms', 'RequestLogGet')
RequestLogPut = apps.get_model('lms', 'RequestLogPut')
RequestLogPost = apps.get_model('lms', 'RequestLogPost')
RequestLogDelete = apps.get_model('lms', 'RequestLogDelete')

SENSITIVE_FIELDS = {
    'password',
    'old_password',
    'confirm_password',
    'new_password',
}


def sanitize_log_body(value):
    """Request log-д нууц мэдээлэл хадгалахаас хамгаална."""
    if isinstance(value, dict):
        return {
            key: None if key.lower() in SENSITIVE_FIELDS else sanitize_log_body(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [sanitize_log_body(item) for item in value]

    return value

from django.utils.deprecation import MiddlewareMixin

def create_log_get(data, body):
    """ GET request log баазд хадгалах
    """
    RequestLogGet.objects.create(**data)


def create_log_post(data, body):
    """ POST request log баазд хадгалах
    """
    data_copy = data.copy()
    body_copy = json.dumps(copy.deepcopy(body))
    data_copy['data'] = body_copy
    RequestLogPost.objects.create(**data_copy)


def create_log_put(data, body):
    """ PUT request log баазд хадгалах
    """
    data_copy = data.copy()
    body_copy = json.dumps(copy.deepcopy(body))
    data_copy['data'] = body_copy
    RequestLogPut.objects.create(**data_copy)


def create_log_delete(data, body):
    """ DELETE request log баазд хадгалах
    """
    RequestLogDelete.objects.create(**data)


def get_error_info(request):
    """ Алдааны мэдээлэллийг баазад хадгалах data үүсгэх
    """
    data = {
        'url': request.META['PATH_INFO'],
        'method': request.META['REQUEST_METHOD'],
        'headers' : json.dumps(dict(request.headers), indent=4, ensure_ascii=False),
        'scheme' : request.scheme,
        'system_type' : AccessHistoryLms.LMS
    }
    return data


def set_body(self):
    """ self-ээс body авах
    """
    try:
        body = self.body
    except Exception as e:
        body = {}
    return body


class RequestLogMiddleware(MiddlewareMixin):
    """ Системд хандах хүсэлтүүдийн log-ийг хадгалах
    """

    def process_request(self, request):
        user_id = request.user.pk if request.user.is_authenticated else None

        data = {
            'url': request.META['PATH_INFO'],
            'query_string': request.META['QUERY_STRING'],
            'remote_ip': request.environ['REMOTE_ADDR'],
            'user_id' : user_id,
            'system_type': AccessHistoryLms.LMS
        }
        if request.META['REQUEST_METHOD'] in ["POST", "PUT"]:
            try:
                body = sanitize_log_body(json.loads(request.body))
            except Exception:
                body = ""
        else:
            body = ""

        # Middleware instance олон хүсэлтэд зэрэг ашиглагддаг тул request тус бүрд хадгална.
        request._request_log_body = body
        request._request_log_data = data

    def process_exception(self, request, exception):
        """ Server дээр гарсан 500 алдааны мэдээлэл хадгалах
        """

        try:
            error_text = json.loads(exception.args[0])
            data = get_error_info(request)
            data['description'] = error_text['args']
            data['code'] = error_text['code']

            if request.META['REQUEST_METHOD'] in ["POST", "PUT"]:
                body = getattr(request, '_request_log_body', {})
            else:
                body = {}

            data['data'] = json.dumps(body, indent=4, ensure_ascii=False)
            Errors.objects.create(**data)
        except:
            data = get_error_info(request)
            data['description'] = exception
            if "хуудас байхгүй байна." in str(exception):
                return
            if request.META['REQUEST_METHOD'] in ["POST", "PUT"]:
                body = getattr(request, '_request_log_body', {})
            else:
                body = {}

            data['data'] = json.dumps(body, indent=4, ensure_ascii=False)
            Error500.objects.create(**data)

    def process_response(self, request, response):
        """ Системд хандах хүсэлтүүдийн log-ийг хадгалах
        """

        log_methods = {
            'GET': create_log_get,
            'POST': create_log_post,
            'PUT': create_log_put,
            'DELETE': create_log_delete,
        }
        data = getattr(request, '_request_log_data', None)
        body = getattr(request, '_request_log_body', '')

        if data is None:
            return response

        data['status_code'] = response.status_code

        if request.META['REQUEST_METHOD'] in log_methods:
            try:
                log_methods[request.META['REQUEST_METHOD']](data, body)
            except Exception:
                # Log хадгалах алдаа үндсэн API response-ийг эвдэх ёсгүй.
                traceback.print_exc()

        return response
