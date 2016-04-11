/* global define */
'use strict';
define([
    'profile/router'
], function(ProfileRouter) {
    return function() {
        return new ProfileRouter();
    };
});
