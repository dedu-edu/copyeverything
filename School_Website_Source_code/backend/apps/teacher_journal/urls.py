from rest_framework.routers import DefaultRouter

from .views import *

router = DefaultRouter()

# Цахим журнал
router.register(r'irts/(?P<model>\w+)', JournalIrtsViewSet, basename='JournalIrts')

urlpatterns = router.urls
