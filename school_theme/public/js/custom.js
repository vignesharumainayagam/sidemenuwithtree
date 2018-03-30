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
                    $('.zmApps li[id="'+frappe.breadcrumbs.all[frappe.breadcrumbs.current_page()]['module']+'"]').addClass("sel");
                    $('#_menu11 a[id="#'+frappe.get_route()[0]+'/'+frappe.get_route()[1]+'"]').parent().parent().parent().addClass('active')
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