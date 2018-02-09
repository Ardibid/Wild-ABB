# This file assigns URLs to the functions in view.py file

from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView
from wildABB_APP.views import readJoints,setJoints,readSensors

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name="index.html")),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^robot/', TemplateView.as_view(template_name="robotUI.html")),
    url(r'^readJoints/',  readJoints, name="readJoints"),
    url(r'^setJoints/',  setJoints, name="setJoints"),
    url(r'^readSensors/', readSensors, name="readSensors"),

]