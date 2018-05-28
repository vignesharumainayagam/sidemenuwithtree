var process_data = function(module_name, data) {
    // frappe.module_links[module_name] = [];
    data.forEach(function(section) {
        section.items.forEach(function(item) {
            item.style = '';
            if (item.type === "doctype") {
                item.doctype = item.name;

                // map of doctypes that belong to a module
                // frappe.module_links[module_name].push(item.name);
            }
            if (!item.route) {
                if (item.link) {
                    item.route = strip(item.link, "#");
                } else if (item.type === "doctype") {
                    if (frappe.model.is_single(item.doctype)) {
                        item.route = 'Form/' + item.doctype;
                    } else {
                        if (item.filters) {
                            frappe.route_options = item.filters;
                        }
                        item.route = "List/" + item.doctype;
                        //item.style = 'font-weight: 500;';
                    }
                    // item.style = 'font-weight: bold;';
                } else if (item.type === "report" && item.is_query_report) {
                    item.route = "query-report/" + item.name;
                } else if (item.type === "report") {
                    item.route = "Report/" + item.doctype + "/" + item.name;
                } else if (item.type === "page") {
                    item.route = item.name;
                }
            }

            if (item.route_options) {
                item.route += "?" + $.map(item.route_options, function(value, key) {
                    return encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }).join('&');
            }

            if (item.type === "page" || item.type === "help" || item.type === "report" ||
                (item.doctype && frappe.model.can_read(item.doctype))) {
                item.shown = true;
            }
        });
    });
};

function change_menu(that) {
    // console.log(that);
    $('.main-sidebar a[href="#_menu11"]').tab('show');
    $('#filterid').children(":last").text('filters');


    var me = that;

    $('.zmApps').find('.sel').removeClass('sel');
    $(that).addClass('sel');
    // setTimeout(function() {
    //     $('.menu_result').empty();

    //     $('.menu_result').append(frappe.render_template("menu_list", { menuitems: menuitems[$(that).attr('id')] }))

    // }, 10);


    if (frappe.get_module($(that).attr('id'))['data']) {
        var m = frappe.get_module($(that).attr('id'));
        // m.data = r.message.data;
        process_data($(that).attr('id'), m.data);
        $('.menu_result').empty();

        $('.menu_result').append(frappe.render_template("menu_list", { menuitems: m.data }))

    } else {
        frappe.call({
            method: "frappe.desk.moduleview.get",
            args: {
                module: $(that).attr('id')
            },
            callback: function(r) {

                // var m = frappe.get_module(module_name);
                // m.data = r.message.data;


                var m = frappe.get_module($(that).attr('id'));
                m.data = r.message.data;
                process_data($(that).attr('id'), m.data);
                $('.menu_result').empty();

                $('.menu_result').append(frappe.render_template("menu_list", { menuitems: m.data }))


            }

        });
    }





}



function gotolist(that, e) {
    $('#filterid').children(":last").text('filters')

    frappe.set_route($(that).attr('id'));
    $(that).parent().parent().find('.sel').removeClass('sel');

    $(that).addClass('sel');

    $('.filter_list').empty();


    setTimeout(function() {
        if (cur_list) {
            if (frappe.listview_settings[frappe.get_route()[1]]) {

                if (frappe.listview_settings[frappe.get_route()[1]].enable_menu) {
                    // $('.main-sidebar a[href="#_menu22"]').tab('show');
                    $('.main-sidebar a[href="#_menu22"]').tab('show');
                    $('.SCl').css({ 'width': "280px" });
                    $('.SCl').css({ 'left': "0px" });
                    $('.zm_apps').css({ 'display': "none" });
                    // $('.filter_list').css('height', $(window).height() - 100);
                    $('.filter_list').slimScroll({
                        height: ($(window).height() - 120)
                    });

                    $('.filter_list').html(frappe.render_template('filter_list', frappe.listview_settings[cur_list.doctype]['filterlist']))


                }

                if (frappe.listview_settings[frappe.get_route()[1]].multi_fiter) {
                    exec_multifilter(frappe.get_route()[1])
                }
                if (frappe.listview_settings[frappe.get_route()[1]].enable_tree) {
                    exec_treefilter(frappe.get_route()[1])
                }


            }
        }


    }, 500);
    $('body').removeClass('sidebar-open');



}

function exec_filter(doctype, cur_doc, filter_type) {
    // if (frappe.listview_settings[cur_list.doctype].enable_menu) {
    frappe.call({
        method: "frappe.desk.search.search_link",
        args: {
            doctype: doctype,
            txt: ""
        },
        callback: function(res) {

            $('.filter_list').html(frappe.render_template('filter_list', res));


            frappe.listview_settings[cur_doc].filterlist = res;

            setTimeout(function() {

                $('.main-sidebar a[href="#_menu22"]').tab('show');
                $('.SCl').css({ 'width': "280px" });
                $('.SCl').css({ 'left': "0px" });
                $('.zm_apps').css({ 'display': "none" });
                // $('.filter_list').css('height', $(window).height() - 100);
                $('.filter_list').slimScroll({
                    height: ($(window).height() - 120)
                });
            }, 100);






        }
    });

    // }
}





function exec_multifilter(cur_doc) {
    var multifilter = frappe.listview_settings[cur_doc].multi_filter_fields;
    frappe.call({
        method: "frappe.desk.search.search_link",
        args: {
            doctype: multifilter[0].name,
            txt: ""
        },
        callback: function(res) {
            res.multifilter = multifilter;
            $('.filter_list').html(frappe.render_template('multifilter_list', res));
            $('.filter_list').find("#" + multifilter[0].field + "").parent().append(frappe.render_template('subfilter_list', res));
            setTimeout(function() {

                $('.main-sidebar a[href="#_menu22"]').tab('show');
                $('.SCl').css({ 'width': "280px" });
                $('.SCl').css({ 'left': "0px" });
                $('.zm_apps').css({ 'display': "none" });
                // $('.filter_list').css('height', $(window).height() - 100);
                $('.filter_list').slimScroll({
                    height: ($(window).height() - 120)
                });
            }, 100);
        }
    });
}




function get_filters(that) {
    if ($('.filter_list').find("#" + $(that).attr('id') + "").next().length != 0) {
        return
    } else {
        frappe.call({
            method: "frappe.desk.search.search_link",
            args: {
                doctype: $(that).attr('filter-doc'),
                txt: ""
            },
            callback: function(res) {
                console.log(res)
                // $('.filter_list').find("#" + $(that).attr('id') + "").next().remove();
                $('.filter_list').find("#" + $(that).attr('id') + "").parent().append(frappe.render_template('subfilter_list', res));
            }
        });

    }

}

function select_multi_filter(that) {
    var filter_type = $(that).parent().parent().prev().attr('filter-field');
    $('.page-form div[data-fieldname="' + filter_type + '"] input').val($(that).attr('data-id'))
    frappe.set_route("List", cur_list.doctype, {
        [filter_type]: $(that).attr('data-id')
    });
}







function select_filter(that) {
    $(that).parent().find('.sel').removeClass('sel');

    $(that).addClass('sel');

    var filter_type = frappe.listview_settings[cur_list.doctype]['filt_field'];
    $('.page-form div[data-fieldname="' + filter_type + '"] input').val($(that).attr('data-id'))

    frappe.set_route("List", cur_list.doctype, {
        [filter_type]: $(that).attr('data-id')
    });

}

function filtertab() {
    // if (!frappe.model.is_single(cur_frm.doctype)) {

    if (frappe.listview_settings[frappe.get_route()[1]]) {
        $('.main-sidebar a[href="#_menu22"]').tab('show');
        $('.SCl').css({ 'width': "280px" });
        $('.SCl').css({ 'left': "0px" });
        $('.zm_apps').css({ 'display': "none" });
        // $('.filter_list').css('height', $(window).height() - 100);
        $('.filter_list').slimScroll({
            height: ($(window).height() - 120)
        });

    }
    if (!cur_frm.is_new() && !frappe.model.is_single(cur_frm.doctype)) {
        $('.main-sidebar a[href="#_menu22"]').tab('show');
        $('.SCl').css({ 'width': "280px" });
        $('.SCl').css({ 'left': "0px" });
        $('.zm_apps').css({ 'display': "none" });
        // $('.filter_list').css('height', $(window).height() - 100);
        $('.filter_list').slimScroll({
            height: ($(window).height() - 100)
        });

    } else {
        // $('.main-sidebar a[href="#_menu11"]').tab('show');
        menutab();
        // $('.filter_list').empty();
        // $('.main-sidebar a[href="#_menu22"]').tab('show');
        // $('.SCl').css({ 'width': "280px" });
        // $('.SCl').css({ 'left': "0px" });
        // $('.zm_apps').css({ 'display': "none" });
        // // $('.filter_list').css('height', $(window).height() - 100);
        // $('.filter_list').slimScroll({
        //     height: ($(window).height() - 100)
        // });


    }




}

function menutab() {
    $('.main-sidebar a[href="#_menu11"]').tab('show');

    $('#menu123').css({ 'width': "200px" });
    // $('.SCl').css({ 'left': "80px" });
    // $('.menu_result').css({ 'width': "200px" });
    // $('.menu_result').css({ 'left': "80px" });
    $('#menu123').css({ 'left': "80px" });
    $('.zm_apps').css({ 'display': "block" });

}
$(document).ready(function() {
    $('header').prepend(frappe.render_template("logo"));
    $('header .navbar .container').prepend(frappe.render_template("sidebar-toggle"));
    $('.main-section').append(frappe.render_template("main-sidebar1"));
    $('header').addClass('main-header');
    $('body').addClass('skin-blue sidebar-mini');
    $('#body_div').addClass('content-wrapper');
    bdtheme.set_user_background();
    var parent_item = frappe.get_desktop_icons(true)
        .filter(d => d.type === 'module' && !d.blocked)
        .sort((a, b) => { return (a._label > b._label) ? 1 : -1; });

    setTimeout(function() {

        if (frappe.breadcrumbs.all[frappe.breadcrumbs.current_page()]) {

            frappe.call({
                method: "frappe.desk.moduleview.get",
                args: {
                    module: frappe.breadcrumbs.all[frappe.breadcrumbs.current_page()]['module']
                },
                callback: function(r) {
                    var m = frappe.get_module(frappe.breadcrumbs.all[frappe.breadcrumbs.current_page()]['module']);
                    m.data = r.message.data;
                    process_data(frappe.breadcrumbs.all[frappe.breadcrumbs.current_page()]['module'], m.data);
                    $('.menu_result').append(frappe.render_template("menu_list", { menuitems: m.data }))
                    $('.zmApps li[id="' + frappe.breadcrumbs.all[frappe.breadcrumbs.current_page()]['module'] + '"]').addClass("sel");
                    $('#_menu11 a[id="#' + frappe.get_route()[0] + '/' + frappe.get_route()[1] + '"]').parent().parent().parent().addClass('active')
                }
            });
        } else {
            frappe.call({
                method: "frappe.desk.moduleview.get",
                args: {
                    module: parent_item[0].module_name
                },
                callback: function(r) {
                    var m = frappe.get_module(parent_item[0].module_name);
                    m.data = r.message.data;
                    process_data(parent_item[0].module_name, m.data);
                    $('.menu_result').append(frappe.render_template("menu_list", { menuitems: m.data }))
                    $('.zmApps li:first-child').addClass("sel");
                    $('.menu_result li:first-child').addClass("active");


                }
            });

        }

    }, 3500);







    $('.zmApps').append(frappe.render_template("parent_menu", { parent_item: parent_item }))
    $('.menu_result').css('height', $(window).height() - 100);
    $('.zm_apps').css('height', $(window).height() - 122)
    $('.zmApps').slimScroll({
        height: ($(window).height() - 122)
    });

});



frappe.provide("bdtheme");

// add toolbar icon
$(document).bind('toolbar_setup', function() {
    frappe.app.name = "bdoop Erp";
    $('.navbar-home').html(frappe._('Home'));

});

bdtheme.set_user_background = function(src, selector, style) {
    if (!selector) selector = "#page-desktop";
    if (!style) style = "Fill Screen";
    if (src) {
        if (window.cordova && src.indexOf("http") === -1) {
            src = frappe.base_url + src;
        }
        var background = repl('background: url("%(src)s") center center;', { src: src });
    } else {
        var background = "background-color: #FFFFFF;";
    }

    frappe.dom.set_style(repl('%(selector)s { \
        %(background)s \
        %(style)s \
    }', {
        selector: selector,
        background: background,
        style: ""
    }));
}

frappe.templates["logo"] = '<a href="/desk" class="logo">' +
    ' <span class="logo-mini"><b>bd</b></span>' +
    '      <span class="logo-lg"><b>bdoop</b></span>' +
    '    </a>';

frappe.templates["sidebar-toggle"] = '<a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button"><i class="octicon octicon-three-bars"></i>' +
    '<span class="sr-only">Toggle navigation</span>' +
    '</a>';
//





frappe.provide("frappe.ui.form");

function detailfield(that) {
    // $('.filter_list').find('.sel').removeClass('sel');
    $(that).parent().parent().find('.sel').removeClass('sel');

    $(that).addClass('sel');
    // $(that).addClass('sel');
    $('body').removeClass('sidebar-open');
    location.href = $(that).attr('href')
}
frappe.ui.form.Tab = Class.extend({
    init: function(opts) {
        $.extend(this, opts);

    },
    refresh: function() {
        this.limit_start = 0
        this.render_sidebar();
    },
    render_sidebar: function() {
        var me = this;
        this.get_coloums();
        this.fields_list = this.return_column();

        if (frappe.listview_settings[this.frm.doctype] && frappe.listview_settings[this.frm.doctype]['add_fields']) {
            this.fields_list = this.fields_list.concat(frappe.listview_settings[this.frm.doctype]['add_fields'])
        }


        this.settings = frappe.listview_settings[this.frm.doctype] || {};

        if (this.settings.enable_tabview === false) {
            return;
        }
        if (frappe.get_doc('DocType', this.frm.doctype).issingle == 0) {
            this.tab_list();

        }



    },
    tab_list: function() {
        var me = this;
        // console.log(this.columns);


        frappe.call({
            method: "school_theme.school_theme.school.get_tabinfo",
            args: {
                doctype: me.frm.doctype,
                name: me.frm.doc.name,
                fields: this.fields_list,
                limit_start: this.limit_start

            },
            callback: function(r) {
                frappe.model.set_docinfo(me.frm.doctype, me.frm.doc.name, "tab_list", r.docslist.tab_list);
                me.render_tablist(r.docslist.tab_list || []);
            }
        });

    },
    render_tablist: function(tablist) {
        // this.parent.find('.result').empty();
        $('aside').find('.tab-content').find('.filter_list').empty();
        $('.tab_title').val('')
        // console.log(this.parent);
        var tablist_data = {
            tablist: tablist,
            doctype: this.frm.doctype,
            subject: this.cur_fields[0].subject,
        };
        if (this.cur_fields[1]) {
            tablist_data.status = this.cur_fields[1].status

        }
        // console.log(tablist_data);
        // this.parent.find('.result').append(frappe.render_template("tab_list", { tablist: tablist, doctype: this.frm.doctype,subject:this.cur_fields[0].subject,status:this.cur_fields[1].status}))
        $('aside').find('.tab-content').find('.filter_list').html(frappe.render_template("tab_list", tablist_data))
        $('.filter_list [data-link="' + frappe.get_route_str() + '"]').addClass('sel');
        $('#_menu33').append($('.overlay-sidebar').parent().html())
        // $('#filterid').children(":last").text(this.frm.doctype)
        $('#filterid').children(":last").text('filters')




    },
    get_fields_in_list_view: function() {
        return this.frm.meta.fields.filter(df => {
            return df.in_list_view &&
                frappe.perm.has_perm(this.frm.doctype, df.permlevel, 'read') &&
                frappe.model.is_value_type(df.fieldtype);
        });
    },
    return_column: function() {
        this.fields = [];
        this.cur_fields = [];

        this.columns.forEach((d, i) => {

            if (d.type == 'Subject') {
                this.fields.push(d.df.fieldname);
                this.cur_fields.push({ 'subject': d.df.fieldname });
            }
            // if (d.type == 'Status') {
            //     this.fields.push( 'status');
            //     this.cur_fields.push({ 'status': 'status' });
            // }  
            if (d.type == 'Field') {
                this.fields.push(d.df.fieldname);
                this.cur_fields.push({ 'field': d.df.fieldname });
            }
        })
        this.fields.push('name');



        // this.fields.push("name", "employee_name", "creation", "status");
        return this.fields
    },
    get_coloums: function() {
        this.columns = [];

        const get_df = frappe.meta.get_docfield.bind(null, this.frm.doctype);

        // 1st column: title_field or name
        if (this.frm.meta.title_field) {
            this.columns.push({
                type: 'Subject',
                df: get_df(this.frm.meta.title_field)
            });
        } else {
            this.columns.push({
                type: 'Subject',
                df: {
                    label: __('Name'),
                    fieldname: 'name'
                }
            });
        }

        // 2nd column: Status indicator
        if (frappe.has_indicator(this.frm.doctype)) {
            // indicator
            this.columns.push({
                type: 'Status'
            });
        }


        const fields_in_list_view = this.get_fields_in_list_view();
        // Add rest from in_list_view docfields
        this.columns = this.columns.concat(
            fields_in_list_view
            .filter(df => {
                if (frappe.has_indicator(this.frm.doctype) && df.fieldname === 'status') {
                    return false;
                }
                return df.fieldname !== this.frm.meta.title_field;
            })
            .map(df => ({
                type: 'Field',
                df
            }))
        );

        // limit to 4 columns
        this.columns = this.columns.slice(0, 4);
    }

});


frappe.views.FilterTreeView = Class.extend({
    init: function(opts) {
        var me = this;

        this.opts = {};
        this.opts.get_tree_root = true;
        $.extend(this.opts, opts);
        this.doctype = opts.doctype;
        this.args = { doctype: me.doctype };
        this.page_name = frappe.get_route_str();
        this.get_tree_nodes = me.opts.get_tree_nodes || "frappe.desk.treeview.get_children";

        // this.get_permissions();
        // this.make_page();
        this.make_filters();

        if (me.opts.get_tree_root) {
            this.get_root();
        }

        this.onload();
        // this.set_menu_item();
        this.set_primary_action();
    },
    get_permissions: function() {
        this.can_read = frappe.model.can_read(this.doctype);
        this.can_create = frappe.boot.user.can_create.indexOf(this.doctype) !== -1 ||
            frappe.boot.user.in_create.indexOf(this.doctype) !== -1;
        this.can_write = frappe.model.can_write(this.doctype);
        this.can_delete = frappe.model.can_delete(this.doctype);
    },
    make_page: function() {
        var me = this;
        this.parent = frappe.container.add_page(this.page_name);
        frappe.ui.make_app_page({ parent: this.parent, single_column: true });

        this.page = this.parent.page;
        frappe.container.change_to(this.page_name);
        frappe.breadcrumbs.add(me.opts.breadcrumb || locals.DocType[me.doctype].module);

        this.set_title();

        this.page.main.css({
            "min-height": "300px",
            "padding-bottom": "25px"
        });

        this.page.add_inner_button(__('Expand All'), function() {
            me.tree.rootnode.load_all();
        });

        if (this.opts.view_template) {
            var row = $('<div class="row"><div>').appendTo(this.page.main);
            this.body = $('<div class="col-sm-6 col-xs-12"></div>').appendTo(row);
            this.node_view = $('<div class="col-sm-6 hidden-xs"></div>').appendTo(row);
        } else {
            this.body = this.page.main;
        }
    },
    set_title: function() {
        this.page.set_title(this.opts.title || __('{0} Tree', [__(this.doctype)]));
    },
    onload: function() {
        var me = this;
        this.opts.onload && this.opts.onload(me);
    },
    make_filters: function() {
        var me = this;
        frappe.treeview_settings.filters = []
        $.each(this.opts.filters || [], function(i, filter) {
            if (frappe.route_options && frappe.route_options[filter.fieldname]) {
                filter.default = frappe.route_options[filter.fieldname]
            }

            filter.change = function() {
                var val = this.get_value();
                me.args[filter.fieldname] = val;
                if (val) {
                    me.root_label = val;
                    me.page.set_title(val);
                } else {
                    me.root_label = me.opts.root_label;
                    me.set_title();
                }
                me.make_tree();
            }

            me.page.add_field(filter);

            if (filter.default) {
                $("[data-fieldname='" + filter.fieldname + "']").trigger("change");
            }
        })
    },
    get_root: function() {
        var me = this;
        frappe.call({
            method: me.get_tree_nodes,
            args: me.args,
            callback: function(r) {
                if (r.message) {
                    me.root_label = r.message[0]["value"];
                    me.make_tree();
                }
            }
        })
    },
    make_tree: function() {
        var me = this;
        $(me.parent).find(".tree").remove();

        this.tree = new frappe.ui.Tree({
            parent: $('.main-sidebar #_menu22').find('.filter_list'),
            label: me.args[me.opts.root_label] || me.root_label || me.opts.root_label,
            args: me.args,
            method: me.get_tree_nodes,
            toolbar: me.get_toolbar(),
            get_label: me.opts.get_label,
            onrender: me.opts.onrender,
            onclick: function(node) { me.select_node(node) },
        });
        cur_tree = this.tree;
    },
    select_node: function(node) {
        var me = this;
        frappe.set_route("List", cur_list.doctype, {
            'parent_item': node.title
        });
        if (this.opts.click) {
            this.opts.click(node);
        }
        if (this.opts.view_template) {
            this.node_view.empty();
            $(frappe.render_template(me.opts.view_template, { data: node.data, doctype: me.doctype })).appendTo(this.node_view);
        }
    },
    get_toolbar: function() {
        var me = this;

        var toolbar = [
            { toggle_btn: true },
            {
                label: __(me.can_write ? "Edit" : "Details"),
                condition: function(node) {
                    return !node.is_root && me.can_read;
                },
                click: function(node) {
                    frappe.set_route("Form", me.doctype, node.label);
                }
            },
            {
                label: __("Add Child"),
                condition: function(node) { return me.can_create && node.expandable; },
                click: function(node) {
                    me.new_node();
                },
                btnClass: "hidden-xs"
            },
            {
                label: __("Rename"),
                condition: function(node) {
                    let allow_rename = true;
                    if (me.doctype && frappe.get_meta(me.doctype)) {
                        if (!frappe.get_meta(me.doctype).allow_rename) allow_rename = false;
                    }
                    return !node.is_root && me.can_write && allow_rename;
                },
                click: function(node) {
                    frappe.model.rename_doc(me.doctype, node.label, function(new_name) {
                        node.tree_link.find('a').text(new_name);
                        node.label = new_name;
                    });
                },
                btnClass: "hidden-xs"
            },
            {
                label: __("Delete"),
                condition: function(node) { return !node.is_root && me.can_delete; },
                click: function(node) {
                    frappe.model.delete_doc(me.doctype, node.label, function() {
                        node.parent.remove();
                    });
                },
                btnClass: "hidden-xs"
            }
        ]

        if (this.opts.toolbar && this.opts.extend_toolbar) {
            return toolbar.concat(this.opts.toolbar)
        } else if (this.opts.toolbar && !this.opts.extend_toolbar) {
            return this.opts.toolbar
        } else {
            return toolbar
        }
    },
    new_node: function() {
        var me = this;
        var node = me.tree.get_selected_node();

        if (!(node && node.expandable)) {
            frappe.msgprint(__("Select a group node first."));
            return;
        }

        this.prepare_fields();

        // the dialog
        var d = new frappe.ui.Dialog({
            title: __('New {0}', [__(me.doctype)]),
            fields: me.fields
        });

        var args = $.extend({}, me.args);
        args["parent_" + me.doctype.toLowerCase().replace(/ /g, '_')] = me.args["parent"];

        d.set_value("is_group", 0);
        d.set_values(args);

        // create
        d.set_primary_action(__("Create New"), function() {
            var btn = this;
            var v = d.get_values();
            if (!v) return;

            var node = me.tree.get_selected_node();
            v.parent = node.label;
            v.doctype = me.doctype;

            if (node.is_root) {
                v['is_root'] = node.is_root;
            } else {
                v['is_root'] = false;
            }

            $.extend(args, v)
            return frappe.call({
                method: me.opts.add_tree_node || "frappe.desk.treeview.add_node",
                args: args,
                callback: function(r) {
                    if (!r.exc) {
                        d.hide();
                        if (node.expanded) {
                            node.toggle_node();
                        }
                        node.load_all();
                    }
                }
            });
        });
        d.show();
    },
    prepare_fields: function() {
        var me = this;

        this.fields = [{
            fieldtype: 'Check',
            fieldname: 'is_group',
            label: __('Group Node'),
            description: __("Further nodes can be only created under 'Group' type nodes")
        }]

        if (this.opts.fields) {
            this.fields = this.opts.fields;
        }

        this.ignore_fields = this.opts.ignore_fields || [];

        var mandatory_fields = $.map(me.opts.meta.fields, function(d) {
            return (d.reqd || d.bold && !d.read_only) ? d : null
        });

        var opts_field_names = this.fields.map(function(d) {
            return d.fieldname
        })

        mandatory_fields.map(function(d) {
            if ($.inArray(d.fieldname, me.ignore_fields) === -1 && $.inArray(d.fieldname, opts_field_names) === -1) {
                me.fields.push(d)
            }
        })
    },
    print_tree: function() {
        if (!frappe.model.can_print(this.doctype)) {
            frappe.msgprint(__("You are not allowed to print this report"));
            return false;
        }
        var tree = $(".tree:visible").html();
        var me = this;
        frappe.ui.get_print_settings(false, function(print_settings) {
            var title = __(me.docname || me.doctype);
            frappe.render_tree({ title: title, tree: tree, print_settings: print_settings });
        });
    },
    set_primary_action: function() {
        var me = this;
        if (!this.opts.disable_add_node && this.can_create) {
            me.page.set_primary_action(__("New"), function() {
                me.new_node();
            }, "octicon octicon-plus")
        }
    },
    set_menu_item: function() {
        var me = this;

        this.menu_items = [{
                label: __('View List'),
                action: function() {
                    frappe.set_route('List', me.doctype);
                }
            },
            {
                label: __('Print'),
                action: function() {
                    me.print_tree();
                }

            },
            {
                label: __('Refresh'),
                action: function() {
                    me.make_tree();
                }
            },
        ];

        if (me.opts.menu_items) {
            me.menu_items.push.apply(me.menu_items, me.opts.menu_items)
        }

        $.each(me.menu_items, function(i, menu_item) {
            var has_perm = true;
            if (menu_item["condition"]) {
                has_perm = eval(menu_item["condition"]);
            }

            if (has_perm) {
                me.page.add_menu_item(menu_item["label"], menu_item["action"]);
            }
        });

        // last menu item
        me.page.add_menu_item(__('Add to Desktop'), () => {
            const label = me.doctype === 'Account' ?
                __('Chart of Accounts') :
                __(me.doctype);
            frappe.add_to_desktop(label, me.doctype);
        });
    }
});


$(document).on("form-refresh", function(e, frm) {

    this.frm = frm;


    $(this.frm.$wrapper).find('.layout-side-section').addClass('add_height');
    this.sidebar = $(this.frm.$wrapper).find('.form-sidebar');
    this.parent = $(this.frm.$wrapper).find('.form-sidebar').parent();
    filtertab();

    this.frm.tab = new frappe.ui.form.Tab({
        frm: this.frm,
        sidebar: this.sidebar,
        parent: this.parent
    });
    this.frm.tab.refresh();




});
function exec_treefilter() {
    var options = { doctype: "Item" };
    var treeview = {
        get_tree_nodes: "erpnext.stock.doctype.item.item.get_children",
        add_tree_node: "erpnext.stock.doctype.item.item.add_node",
        breadcrumb: "Planned Maintenance System",
        get_tree_root: false,
        root_label: "All Items",
        ignore_fields: ["parent_item"],
        onload: function(me) {
            frappe.treeview_settings['Item'].page = {};
            $.extend(frappe.treeview_settings['Item'].page, me.page);
            me.make_tree();
            // $(".btn-primary").hide();
        },

        extend_toolbar: false,

    }
    $.extend(options, treeview);
    var tpo = new frappe.views.FilterTreeView(options);
    $('.filter_list').html(tpo.tree.wrapper);
    setTimeout(function() {

        $('.main-sidebar a[href="#_menu22"]').tab('show');
        $('.SCl').css({ 'width': "280px" });
        $('.SCl').css({ 'left': "0px" });
        $('.zm_apps').css({ 'display': "none" });
        // $('.filter_list').css('height', $(window).height() - 100);
        $('.filter_list').slimScroll({
            height: ($(window).height() - 120)
        });
    }, 100);


}