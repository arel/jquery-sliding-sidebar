/*

Copyright (c) 2013, Arel Cordero
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer. Redistributions in binary
form must reproduce the above copyright notice, this list of conditions and
the following disclaimer in the documentation and/or other materials provided
with the distribution. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

*/

;(function ( $, window, document, undefined ) {

    var pluginName = "slidingSidebar",
        defaults = {
            // propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {

        init: function() {

            if (document.doctype === null) {
                // Note: a strict doctype definition is required for
                // $(window).height() to give a correct value.
                console.log("Warning: a strict doctype is required but not defined.");
            }

            var t = this;
            $(window)
            .on('resize.slidingSidebar', t.element,
                function(){t.update(t.element, t.options);})
            .on('scroll.slidingSidebar', t.element,
                function(){t.update(t.element, t.options);})
            .trigger('scroll');
        },

        update: function(elem, options) {

            $elem = $(elem);

            // record initial position
            if ($elem.data("orig_top") === undefined) {
                $elem.data("orig_top", $elem.offset().top);
                console.log("recorded original top: "+$elem.data("orig_top"));
            }

            // get/update previous position
            var prev_scroll_top = $elem.data('scroll_top');
            var scroll_top = $(window).scrollTop();
            var prev_direction = $elem.data('direction');
            $elem.data('scroll_top', $(window).scrollTop());

            // determine scroll direction
            var direction = "";
            if (prev_scroll_top === undefined || prev_scroll_top <= scroll_top) {
                direction = "down";
            } else {
                direction = "up";
            }
            $elem.data('direction', direction);

            // If direction changed, release element (make absolute positioned)
            if (direction != prev_direction) {
                var _pos = $elem.offset().top;
                console.log("changed! " + _pos);
                $elem.css("position", "absolute").css("top", _pos + "px").css("bottom", "auto");
                $elem.data("snapped", false);
            }

            // If direction is going down, and bottom is above the window, snap to bottom

            if ($elem.data("snapped") !== true) {
                if (direction == "down" && $elem.height() + $elem.offset().top < (scroll_top + $(window).height())) {
                    console.log("snapped bottom!");
                    $elem.css("position", "fixed").css("top", "auto").css("bottom", "0px");
                    $elem.data("snapped", true);
                } else if (direction == "up" && $elem.offset().top > (scroll_top)) {
                    console.log("snapped top!");
                    $elem.css("position", "fixed").css("top", "0px").css("bottom", "auto");
                    $elem.data("snapped", true);
                }
            }

            if (direction == "up" && $elem.offset().top < $elem.data("orig_top")) {
                $elem.removeAttr("style");
                $elem.data("snapped", false);
                console.log("totally unsnapped!");
                console.log($elem.offset().top);
                console.log($elem.data("orig_top"));
            }

            console.log(direction + " " + scroll_top);


        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );
