/*
* @Author: chongzhen
* @Date:   2015-03-21 11:59:53
* @Last Modified by:   chongzhen
* @Last Modified time: 2015-03-28 13:43:23
*/

/* global define*/
'use strict';
define([
    'underscore',
    'backbone',
    'home/home-total-ticket-model'
], function(_,Backbone,TotalTicketModel){
    var HomePackageModel = Backbone.Model.extend({
        urlRoot: 'tickets/total',
        parse: function(response) {
            // this.set({pageNumber: response.pageNumber});
            // var pagedTickets = new HomeTicketCollection();
            // pagedTickets.add(response.pagedTickets);
            // this.set({pagedTickets: pagedTickets});

            // this.set({ 'user' : new HomeUserModel(response.user) });
            this.set({ 'totalTicket' : new TotalTicketModel({
                'expiredNum' :response.expiredNum,
                'todayExpiredNum' :response.todayExpiredNum,
                'openedNum' :response.openedNum,
                'pendingNum' :response.pendingNum,
                'unassignedNum' :response.unassignedNum})});
        }
    });
    return HomePackageModel;
});
