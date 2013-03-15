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

            var t = this;

            if (document.doctype === null) {
                // Note: a strict doctype definition is required for
                // $(window).height() to give a correct value.
                console.log("WARN: strict doctype required but not defined.");
            }

            if ($(t.element).css("position") != "absolute") {
                // Note: this plugin assumes the element it's used with
                // is initially absolutely positioned.
                console.log("WARN: element not absolutely positioned.");
            }

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
                // console.log("recorded original top: "+$elem.data("orig_top"));
            }

            // get/update previous position
            var prev_scroll_top = $elem.data('scroll_top');
            var scroll_top = $(window).scrollTop();
            var prev_direction = $elem.data('direction');
            $elem.data('scroll_top', $(window).scrollTop());

            // determine scroll direction
            var direction = "none";
            if (prev_scroll_top !== undefined) {
                if (prev_scroll_top < scroll_top) {
                    direction = "down";
                    $elem.data('direction', direction);
                } else if (prev_scroll_top > scroll_top) {
                    direction = "up";
                    $elem.data('direction', direction);
                }
            }

            // If direction changed, release element (make absolute positioned)
            if (direction != "none" && direction != prev_direction) {
                var _pos = $elem.offset().top;

                $elem
                .css("position", "absolute")
                .css("top", _pos + "px")
                .css("bottom", "auto")
                .data("snapped", false);

                // console.log("changed! " + _pos);
            }

            if ($elem.data("snapped") !== true &&
                    $(document).height() >= $elem.height() + $elem.offset().top ) {

                // If direction is going down, and bottom is above the window,
                // snap to bottom. If direction is going up, snap to top.
                if (direction == "down" &&
                        $elem.height() + $elem.offset().top <
                        (scroll_top + $(window).height())) {

                    var _bot = Math.max(0, ($(window).height() + scroll_top) -
                                ($elem.offset().top + $elem.height()));

                    $elem
                    .css("position", "fixed")
                    .css("top", "auto")
                    .css("bottom", _bot + "px")
                    .data("snapped", true);

                    // console.log("snapped bottom!");

                } else if (direction == "up" &&
                           $elem.offset().top >
                           (scroll_top + $elem.data("orig_top"))) {

                    $elem
                    .css("position", "fixed")
                    .css("top", $elem.data("orig_top") + "px")
                    .css("bottom", "auto")
                    .data("snapped", true);

                    // console.log("snapped top!");
                }
            }

            // console.log(direction + " " + scroll_top);

        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );
