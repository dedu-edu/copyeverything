from rest_framework.routers import DefaultRouter
from .viewsets import BasicViewSet

router = DefaultRouter()
router.register(r'(?P<model>\w+)', BasicViewSet, basename='Basic')

urlpatterns = router.urls