    /**
 * WBS handler
 */
var wbs_handler = {

    urls: {
        info: window.wbs_info_url,
        add: window.wbs_add_tim_url,
    },

    modal_selector: {
        info: ".wbs-modal-info",
        add: ".wbs-modal-add",
    },

    forms_selector: {
        add: ".json_add_zi_partner",
    },

    /**
     * Get value
     */
    get_value: function(select) {
      return select.val();
    },

    /**
     * Hide info button
     */
    hide_info_button: function(select) {
        var button = select.next().find(".wbs-info-button");

        button.hide();
    },

    /**
     * Show info button
     */
    show_info_button: function(select) {
        var button = select.next().find(".wbs-info-button");

        button.show();
    },

    /**
     * Hide add button
     */
    hide_add_button: function(select) {
        var button = select.next().find(".wbs-add-button");

        button.hide();
    },

    /**
     * Show add button
     */
    show_add_button: function(select) {
        var button = select.next().find(".wbs-add-button");

        button.show();
    },

    /**
     * Init buttons
     */
    init_buttons: function() {
        var _this = this;

        $(".wbs-select-tim").each(function (idx) {
            var select = $(this);
            var value = _this.get_value(select);

            if (value == "") {
                _this.hide_info_button(select);
            }
        });
    },

    get_proposal_selector: function($proposal){
        var data_id = $proposal.attr('data-id');
        var proposal_selector = '.cs_wrapper[data-id='+ data_id  +']';
        return proposal_selector;
    },

    /**
     * Select handler
     */
    select_handler: function() {
        var _this = this;

         $("body").on("change keyup", ".model-site", function() {
             var select = $(this);
             var value = _this.get_value(select);
             var $proposal = select.closest('.cs_wrapper');
             var work_package = $proposal.closest('.collapse-work-package').data('work-package');
             var zi_partner_value = $('.collapse-work-package[data-work-package='+ work_package +']').find('.zi-partner-select').val();
             _this.model_site_notification(zi_partner_value, $(this), work_package);
        });

        $("body").on("change keyup", ".wbs-select", function() {
            var select = $(this);
            var value = _this.get_value(select);
            var $proposal = select.closest('.cs_wrapper');
            var work_package = $proposal.closest('.collapse-work-package').data('work-package');
            var prefix = $proposal.attr('data-prefix');

            if (value == "") {
                _this.hide_info_button(select);
            }
            else {
                _this.show_info_button(select);
                _this.load_info_form(prefix, select, work_package);
            }
        });
    },



    /**
     * Add empty option
     */
    add_empty_option: function(select) {
        select.append('<option selected="selected" value="">---------</option>');
    },

    /**
     * Reset select
     */
    reset_select: function(select) {
        select.empty();
        this.add_empty_option(select);
    },

    /**
     * Reset selects
     */
    reset: function(select) {
        var _this = this;

        _this.reset_select(select);
        _this.hide_info_button(select);
        _this.hide_add_button(select);

    },

    /**
     * Load options
     */
    load: function(zi_partner_value, $model_site) {
        var _this = this;
        var $proposal = get_proposal($model_site);
        var $wbs_select = $proposal.find('.wbs-select-tim');
        if (zi_partner_value == '' || $model_site.val() == '' ){

            _this.reset($wbs_select);
            _this.hide_add_button($wbs_select);
            _this.hide_info_button($wbs_select);
            $wbs_select.attr('disabled', 'disabled');
        }else{
            var params;
            var url;

            params = {
                "zi_partner_id": zi_partner_value,
                'model_site': $model_site.val(),
                'tim': true
            };

            url = window.ssr_wbs_tim_json;

            $.getJSON(
                url,
                params,
                function (data) {
                    var options = "";
                    var i;
                    var option;
                    var value;
                    var text;

                    var wbs_list = data.wbs_list;
                    var has_data = wbs_list.length > 0;

                    if (has_data) {
                        for (i = 0; i < wbs_list.length; i++) {
                            value = wbs_list[i].value;
                            text = wbs_list[i].text;
                            option = "<option value='" + value + "'>" + text + "</option>";
                            options += option;
                        }
                    }

                    var selected_option = $wbs_select.val();
                    _this.reset_select($wbs_select);

                    if(data.model_site_with_wbs){
                        _this.show_add_button($wbs_select);
                        $wbs_select.removeAttr('disabled');
                    }else{
                        _this.hide_add_button($wbs_select);
                        $wbs_select.attr('disabled', 'disabled');
                    }

                    if (has_data) {
                        $wbs_select.append(options);
                        $wbs_select.val(selected_option);
                    }


                }
            );

        }

    },

    load_info_form: function(proposal_prefix, select, work_package) {
        var _this = this;

        var url = _this.urls.info;

        var params = {
            "wbs_id": _this.get_value(select)
        };

        var selector_modal_info = _this.modal_selector.info + '[data-prefix='+ proposal_prefix +'][data-work-package='+ work_package +']';
        zi_partner_and_wbs_modal_handler.set_modal_title(selector_modal_info, 'WBS info');
        zi_partner_and_wbs_modal_handler.set_modal_body(selector_modal_info, 'loading...');
        $.getJSON(
            url,
            params,
            function (data) {
                zi_partner_and_wbs_modal_handler.set_modal_body(selector_modal_info, data.html);
            }
        );
    },

    load_add_form: function(modal_prefix, proposal_material_id) {
        var _this = this;

        var url = _this.urls.add;
        var $proposal = $('.cs_wrapper[data-id='+ proposal_material_id +']');
        var work_package = $proposal.closest('.collapse-work-package').data('work-package');

        var params = {
            "zip_id_partner_id": $('.collapse-work-package[data-work-package='+ work_package +']').find('.zi-partner-select').val(),
            // "proposal_material_id": proposal_material_id,
            'model_site': $proposal.find('.model-site').val()
        };

        var selector_modal_add = _this.modal_selector.add + '[data-prefix='+ modal_prefix +'][data-work-package='+ work_package +']';
        zi_partner_and_wbs_modal_handler.set_modal_title(selector_modal_add, 'Add WBS');
        zi_partner_and_wbs_modal_handler.set_modal_body(selector_modal_add, 'loading...');
        $.getJSON(
            url,
            params,
            function (data) {
                zi_partner_and_wbs_modal_handler.set_modal_body(selector_modal_add, data.html);

            }
        );
    },



    /**
     * Notification of ZI partner change
     */
    zi_partner_change_notification: function(work_package, zi_partner_id) {
        var _this = this;
        var zi_partner_value = zi_partner_id;

        // if (zi_partner_value != "") {
        $.each($('.collapse-work-package[data-work-package='+ work_package +']').find('.model-site'), function(){
            _this.model_site_notification(zi_partner_value, $(this), work_package);
        });
        // }
    },

    model_site_notification: function (zi_partner_value, $model_site, work_package) {
        this.load(zi_partner_value, $model_site);

        var $proposal = get_proposal($model_site);
        var prefix = $proposal.attr('data-prefix');
        var proposal_material_id = $proposal.data('id');
        if(zi_partner_value != '') {
            this.load_add_form(prefix, proposal_material_id, work_package);
        }
    },

    send_add_form: function($modal){
        var _this = this;
        var $form = $modal.find('.json_add_zi_partner');

        var wbs_form_selector = '#' + $modal.attr('id') + ' ' + '.json_add_zi_partner';
        var $proposal = $('.cs_wrapper[data-prefix='+ $modal.attr('data-prefix') +']');

        var $work_package = $proposal.closest('.collapse-work-package');

        var params = {
            "zip_id_partner_id": $work_package.find('.zi-partner-select').val(),
            'model_site': $proposal.find('.model-site').val()
        };

        var url = _this.urls.add + "?" + $.param(params);

        var post_data = $form.serialize() + '?' + $.param(params);
        $.post(url, $form.serialize(), function(data){
            zi_partner_and_wbs_modal_handler.show_errors(wbs_form_selector, data.success, data.message, data.errors);
            if(data.success){
                // $work_package.find('select').val('');
                $work_package.find('.wbs-select').append('<option value="'+ data.wbs.id +'">'+ data.wbs.name +'</option>');

                $work_package.find('.cs_wrapper[data-prefix='+ $modal.data('prefix') +']').find('.wbs-select').val(data.wbs.id);
                $modal.modal('hide');
            }

        });
    },

    /**
     * Initialize
     */
    init: function() {
        var _this = this;
        this.init_buttons();
        this.select_handler();

        if (zi_partner_handler.get_value() == ""){
            _this.reset();
        }


        $.each($('.cs_wrapper'), function(){
            var $model_site = $(this).find('.model-site');
            var $wbs_select = $(this).find('.wbs-select');
            if($model_site.val() == ''){

                _this.reset($wbs_select);
                _this.hide_add_button($wbs_select);
                _this.hide_info_button($wbs_select);
                $wbs_select.attr('disabled', 'disabled');
            }

            $(this).find('.wbs-select').trigger('change');
            if(zi_partner_handler.get_value() != ''){
                var $proposal = get_proposal($(this));
                _this.load_add_form($proposal.data('prefix'), $proposal.data('id'));
            }
        });

        $('body').on('click', '.modal-save-new-button', function(){
            var $modal = $(this).closest('.wbs-modal-add');

            _this.send_add_form($modal)
        });


    }
};

/**
 * Init
 */
wbs_handler.init();

/**
 * -----------------------------------------------------------
 */

$(function () {
    $zip_partner = $('#id_zip_id_partner');

    if ($zip_partner.val() != "") {
        $('#zip_code').attr('value', $zip_partner.val());
    }

    disable_bts = function () {
        $('button.primaryAction').attr('disabled', 'disabled');
        $('button.primaryAction').addClass('gray_btn');
    };

    enable_bts = function () {
        $('button.primaryAction').removeAttr('disabled');
        $('button.primaryAction').removeClass('gray_btn');
    };

    close_ajax_box = function () {
        $("#dialog-form").modal('hide');
    };

    close_box = function (seconds) {
        setTimeout('close_ajax_box()', parseInt(seconds) * 1000);
    };

    $('body').on('click', '#add_zi_partner', function (e) {
        $('#errorMsg').removeClass();
        $('#errorMsg').empty();
        $('#json_add_zi_partner').each(function () {
            this.reset()
        });
        $("#dialog-form").modal('show');
    });


    $('body').on('change keyup', '.ajax_update', function () {
        var _target = $(this).attr('rel').split(' ');
        var target = '.' + $(this).attr('rel');

        if ($(this).val()) {

            if (_target.length > 1) {

                for (i in _target) {
                    target = '.' + _target[i];
                    $(target).empty();
                    $(target).append($('<option></option>').val('').html('---------'));
                }

            }

            $(target).empty();
            $(target).append($('<option></option>').val('').html('loading ...'));

            $.get(window.wbs_get_info_url + $(this).val() + '/', function (data) {
                $(target).empty();
                $(target).append($('<option></option>').val('').html('---------'));

                for (i in data) {
                    if (!data[i].errors) {
                        $(target).append($('<option></option>').val(data[i].attr.pk).html(data[i].attr.wbs_element +
                                ' (' + data[i].data.title + ')'));
                    }
                }

                if (data[i].wbs_qty) {
                    $('#id_wbs_quantity').html("<div class='higlighted-value'>" + data[i].wbs_qty + "</div>" );
                }

            }, 'json');
        }
    });

    function get_description_type_region(row, id_wbs) {
        update_row_table_description_type_region(row,
                '-',
                '-',
                '-'
        );
        if (row == 'project') {
            update_row_table_description_type_region('region',
                    '-',
                    '-',
                    '-'
            );
            update_row_table_description_type_region('zone',
                    '-',
                    '-',
                    '-'
            );
        }

        if (row == 'region') {
            update_row_table_description_type_region('zone',
                    '-',
                    '-',
                    '-'
            );
        }
        if(id_wbs){

            wbs_get_info_url_oi='/wbs/get_wbs_by_region/';
            if (window.ct_slug=='oi' && row=='region'){
                var params = {
                    "work_package": $('#id_work_package_text').val()
                };
                $.get(wbs_get_info_url_oi + id_wbs + '/', params, function (data) {
                    if(!data[0].errors){
                        description = data[0].attr._description;
                        type = data[0].attr._type;
                        region = data[0].attr._region;

                        update_row_table_description_type_region(row,
                            description,
                            type,
                            region
                        );
                    }

                }).fail(function(){

                });
            }
            else{
                $.get(window.wbs_get_info_url + id_wbs + '/', function (data) {
                    if(!data[0].errors){
                        description = data[0].attr._description;
                        type = data[0].attr._type;
                        region = data[0].attr._region;

                        update_row_table_description_type_region(row,
                            description,
                            type,
                            region
                        );
                    }

                }).fail(function(){

                });
            }

        }
    }

    function update_row_table_description_type_region(row, description, type, region) {
        $('#id_' + row + '_description').text(description);
        $('#id_' + row + '_type').text(type);
        $('#id_' + row + '_region').text(region);
    }

    $('body').on('change keyup', '.project', function () {
        $.get(window.wbs_get_company_url + $(this).val() + '/', function (data) {
            if (data.company_code) {
                if (data.company_code == 'BR11') {
                    $('.br81').hide();
                    $('.br81 input').removeAttr('checked');
                    $('.br11').show();
                }
                if (data.company_code == 'BR81') {
                    $('.br11').hide();
                    $('.br11 input').removeAttr('checked');
                    $('.br81').show();
                }
            }
        });

        get_description_type_region('project', $('.project').find(":selected").val());
    });

    $('body').on('change keyup','.region',function () {
        get_description_type_region('region', $('.region').find(":selected").val());
    });

    $('body').on('change keyup', '.zone', function () {
        get_description_type_region('zone', $('.zone').find(":selected").val());
    });


    $('.ajax_autocomplete').autocomplete(
            {
                source: function (request, response) {
                    var suggest = [];
                    $.get('/ajax_select/ajax_lookup/wbs_zip_id_partner',
                            {'q': request.term},
                            function (data) {
                                var re = /(\d+)\|(\d+)\|((?:\d+) - Site: (?:[0-9A-Za-z ]+\s|\t))/g;
                                var m = [];
                                data+='\t';
                                while ((m = re.exec(data)) !== null) {
                                    resp = {
                                        value: m[2],
                                        label: m[3]
                                    };
                                    suggest.push(resp);
                                }
                                return response(suggest);
                            }
                    );

                }

            });


    add_content_on_zi_table = function (response) {
        // Add one new line
        table = $('#selected_zi_partner');
        $('.empty').remove();
        new_line = new Object();
        content = response.content;

        tr = table.find('tr:last');
        tr.append($('<td class="check_wbs" id="wbs_' + content.wbs.join('-') + '"/>').append(content.zip_id_partner)); // zip_id_partner
        tr.append($('<td/>').append(content.plant.join(','))); // plants
        tr.append($('<td id="status_' + content.zip_id_partner + '"/>').append('waiting for response'));

        table.append($('<tr/>').append(''));

    };

    check_wbs_by_id = function () {
        wbs_list = new Array();
        $('.check_wbs').filter(function (i) {
            wbs_list.push($(this).attr('id'))
        });
        $.ajax({
            type: 'post',
            data: {'wbs': wbs_list,},
            cache: false,
            url: window.wbs_get_job_detail,
            success: function (response) {
                for (i in response) {
                    updated_status = response[i];
                    $('#status_' + updated_status).html('created');
                }
            }
        });
    };

}); // end document.ready
