/* global define*/
'use strict';
define([
    'underscore',
    'backbone',
    'moment',
    'home/home-package-model',
    'home/home-activities-collection',
    'amcharts',
    'moment-timezone'
], function(_,Backbone,moment,HomePackageModel) {

    var homeDevTableView;

    var HomeDevTableItemView = Backbone.View.extend({
        template : 'templates:home:home-dev-table-item',
        tagName: 'tr',
        events: {
        },
        serialize: function () {
            return _.extend(this.model.toJSON(), {status: homeDevTableView.status});
        },
        initialize: function () {
        }
    });

    //个人侧写 profile
    //一个展示的view 一个编辑的view
    var HomeDevTableView = Backbone.View.extend({
        template : 'templates:home:home-dev-table',
        status: '2',
        initialize: function (o) {
            if(o){
                this.opts = o;
            }
        },
        events: {
        },
        beforeRender: function(){

        },
        afterRender: function () {
            //this._fetchResults();
        },
        _fetchParams: function () {
            this.params = {};
            if(this.opts){
                _.extend(this.params, this.opts);
            }
            return this.params;
        },
        // 获取结果
        _fetchResults: function (page) {
            page = page || 0;
            // 删除所有已经存在的
            this.removeView('tbody');
            // 删除分页
            if (this.pagination === true) {
                this.pagination = false;
                try {
                    this.$('#pagination').pagination('destroy');
                } catch (e) {
                    //TODO
                }
                delete this.pagination;
            }
            // 展示加载行
            this.$('.loading').show();
            // 隐藏没有数据行
            this.$('.non-items').hide();
            this._fetchParams();
            this.collection.fetch({
                reset: true,
                data: _.extend({orderBy: 'lastestmodifytime', sort: 'desc', page: page}, this.params)
            }).done(_.bind(this._setItemViews, this)).done(_.bind(function () {
                if (this.collection.page.totalPages < 1) {
                    return;
                }
                var fetch = _.bind(this._fetchResults, this),
                    page = this.collection.page;
                this.pagination = true;
                this.$('#pagination').pagination({
                    startPage: page.number + 1,
                    totalPages: page.totalPages,
                    href: '/settings/agents?page={{number}}',
                    onPageClick: function (e, page) {
                        fetch(page - 1);
                    }
                });
            }, this));
        },
        _setItemViews: function () {
            if (this.collection.length > 0) { // 如果包含多个结果
                // 设置表格内容
                this.setViews({
                    'tbody': this.collection.map(function (model) {
                        return new HomeDevTableItemView({model: model});
                    })
                });
                // 没有结果行隐藏。。。
                // 渲染子视图，显示结果。。。
                this.renderViews().promise().done(function () {
                    // 隐藏加载行
                    this.$('.loading').hide();
                });
            } else {// 没有结果。。。
                this.$('.loading').hide();
                this.$('.non-items').show();
            }
        }
    });

    var HomeView = Backbone.View.extend({
        template: 'templates:home:home',
        model: new HomePackageModel(),
        initialize: function(){
        },
        serialize: function(){

        },
        beforeRender: function(){
            this.setView('#information', /*homeDevTableView = */new HomeDevTableView());
        },
        afterRender: function(){
        }
    });
    return HomeView;
});
