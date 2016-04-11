/*global define*/
define([
    'jed'
], function (Jed) {
    var data = {
        "domain": "messages",
        "locale_data": {
            "messages": {
                "20": [null, "低"],
                "": {"domain": "messages", "plural_forms": "nplurals=2; plural=(n==1 ? 1 : 2);", "lang": "zh_CN"}
            }
        }
    };

    var jed = window.jed = new Jed(data);
    window.gettext = function () {
        var context = arguments[0];
        return jed.ngettext(context, context, 1);
    };
    window.ngettext = function (context, contexts, n) {
        return jed.ngettext(context, contexts, n ? 1 : n);
    };
    return jed;
});
