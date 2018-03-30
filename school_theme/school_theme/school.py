from __future__ import unicode_literals
import frappe, json

from frappe import throw,_

@frappe.whitelist(allow_guest=True)
def get_tabinfo(doc=None, doctype=None, fields=None,limit_start=None,limit_page_length=None):
	# if frappe.db.exists("Employee", "_T-Employee-0001"):
			frappe.response["docslist"] = {
				"tab_list": frappe.get_list(
					doctype,
					fields = fields,
					limit_page_length=22,
					limit_start=limit_start
					)
				}
	




@frappe.whitelist(allow_guest=True)
def post_tabinfo(doc=None):
	# if frappe.db.exists("Employee", "_T-Employee-0001"):
			frappe.response["docslist"] = {
				"tab_list": doc
				}
	


