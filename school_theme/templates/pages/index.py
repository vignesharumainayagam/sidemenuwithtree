# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from frappe import throw,_

no_cache = 1
no_sitemap = 1

@frappe.whitelist(allow_guest=True)
def get_context(context):
	campaign_list=frappe.db.get_all('Campaign', fields = ['campaign_name'])
	context.campaign_list = campaign_list
