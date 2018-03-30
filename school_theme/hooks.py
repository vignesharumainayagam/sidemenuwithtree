# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "school_theme"
app_title = "school_theme"
app_publisher = "Noor"
app_description = "school_theme description"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "noor@valiantsystems.com"
app_license = "MIT"

app_include_css = [
    "/assets/school_theme/css/school_theme.css",
    "/assets/school_theme/css/skin-blue.css",
    "/assets/school_theme/css/custom.css",
    "/assets/school_theme/css/temp.css",
]
app_include_js = [
    "/assets/school_theme/js/school_theme.js",
    "/assets/school_theme/js/custom.js",
    "/assets/school_theme/js/nicescroll.js",
    "/assets/js/school_theme-template.min.js",
]

# include js, css files in header of web template
web_include_css = "/assets/school_theme/css/school_theme-web.css"
# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/school_theme/css/school_theme.css"
# app_include_js = "/assets/school_theme/js/school_theme.js"

# include js, css files in header of web template
# web_include_css = "/assets/school_theme/css/school_theme.css"
# web_include_js = "/assets/school_theme/js/school_theme.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "school_theme.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "school_theme.install.before_install"
# after_install = "school_theme.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "school_theme.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"school_theme.tasks.all"
# 	],
# 	"daily": [
# 		"school_theme.tasks.daily"
# 	],
# 	"hourly": [
# 		"school_theme.tasks.hourly"
# 	],
# 	"weekly": [
# 		"school_theme.tasks.weekly"
# 	]
# 	"monthly": [
# 		"school_theme.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "school_theme.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "school_theme.event.get_events"
# }

