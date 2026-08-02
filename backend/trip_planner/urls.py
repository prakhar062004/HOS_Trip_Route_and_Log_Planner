from django.urls import path
from .views import PlanTripView, SuggestLocationsView

urlpatterns = [
    path('plan-trip/', PlanTripView.as_view(), name='plan-trip'),
    path('suggest-locations/', SuggestLocationsView.as_view(), name='suggest-locations'),
]
