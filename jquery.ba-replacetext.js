/*!
 * jQuery replaceText - v1.2 - 11/13/2013
 * http://benalman.com/projects/jquery-replacetext-plugin/
 * Created from https://github.com/WalrusCow/jquery-replacetext/commit/67b653339b31f86a4cbf5fbf2873d5976128bc5d
 * Pull request: https://github.com/cowboy/jquery-replacetext/pull/5
 *
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery replaceText: String replace for your jQueries!
//
// *Version: 1.2, Last updated: 11/13/2013*
//
// Project Home - http://benalman.com/projects/jquery-replacetext-plugin/
// GitHub       - http://github.com/cowboy/jquery-replacetext/
// Source       - http://github.com/cowboy/jquery-replacetext/raw/master/jquery.ba-replacetext.js
// (Minified)   - http://github.com/cowboy/jquery-replacetext/raw/master/jquery.ba-replacetext.min.js (0.5kb)
//
// About: License
//
// Copyright (c) 2009 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates one way
// in which this plugin can be used.
//
// replaceText - http://benalman.com/code/projects/jquery-replacetext/examples/replacetext/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, and what browsers it has been tested in.
//
// jQuery Versions - 1.3.2, 1.4.1
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
//
// About: Release History
//
// 1.2 - (11/13/2013) Maintain escaped HTML entities.
// 1.1 - (11/21/2009) Simplified the code and API substantially.
// 1.0 - (11/21/2009) Initial release

(function($){
  '$:nomunge'; // Used by YUI compressor.

  // Method: jQuery.fn.replaceText
  //
  // Replace text in specified elements. Note that only text content will be
  // modified, leaving all tags and attributes untouched. The new text can be
  // either text or HTML.
  //
  // Uses the String prototype replace method, full documentation on that method
  // can be found here:
  //
  // https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/String/Replace
  //
  // Usage:
  //
  // > jQuery('selector').replaceText( search, replace [, text_only ] );
  //
  // Arguments:
  //
  //  search - (RegExp|String) A RegExp object or substring to be replaced.
  //    Because the String prototype replace method is used internally, this
  //    argument should be specified accordingly.
  //  replace - (String|Function) The String that replaces the substring received
  //    from the search argument, or a function to be invoked to create the new
  //    substring. Because the String prototype replace method is used internally,
  //    this argument should be specified accordingly.
  //  text_only - (Boolean) If true, any HTML will be rendered as text. Defaults
  //    to false.
  //
  // Returns:
  //
  //  (jQuery) The initial jQuery collection of elements.

  // Map to escape HTML entities
  var entity_map = {
    escape : {
      '>' : '&gt;',
      '<' : '&lt;',
      '"' : '&quot;',
      "'" : '&#x27;',
      '&' : '&amp;'
    },
    unescape : {} // We will set this below
  };

  // We will use these arrays to build regular expressions for escaping
  var unescapedChars = [],
    escapedChars = [];

  for ( key in entity_map.escape ) {
    // Add an inverted `unescape` object to unescape HTML
    entity_map.unescape[ entity_map.escape[key] ] = key;

    // Track both the escaped and unescaped versions
    unescapedChars.push(key);
    escapedChars.push(entity_map.escape[key]);
  }

  // Build regular expressions to escape with
  var entity_regex = {
    escape : new RegExp( '[' + unescapedChars.join('') + ']', 'g'),
    unescape : new RegExp( '(' + escapedChars.join('|') + ')', 'g')
  };

  // Generically escape or unescape HTML entities in the code
  function esc( str, method ) {
    // Nothing to do with null or empty string
    if (!str) return str;

    // Replace proper strings with their corresponding replacements
    return str.replace(entity_regex[method], function( match ) {
      return entity_map[method][match];
    });
  };

  function escapeHtml( str ) {
    return esc(str, 'escape');
  }

  function unescapeHtml( str ) {
    return esc(str, 'unescape');
  }

  $.fn.replaceText = function( search, replace, text_only ) {
    return this.each(function(){
      var node = this.firstChild,
        val,
        new_val,

        // Elements to be removed at the end.
        remove = [];

      // Only continue if firstChild exists.
      if ( node ) {

        // Loop over all childNodes.
        do {

          // Only process text nodes.
          if ( node.nodeType === 3 ) {

            // The original node value.
            // We need to escape existing HTML because `nodeValue` unescapes
            // escaped HTML values.
            val = escapeHtml(node.nodeValue);

            // The new value.
            new_val = val.replace( search, replace );

            // Only replace text if the new value is actually different!
            if ( new_val !== val ) {

              if ( !text_only && /</.test( new_val ) ) {
                // The new value contains HTML, set it in a slower but far more
                // robust way.
                $(node).before( new_val );

                // Don't remove the node yet, or the loop will lose its place.
                remove.push( node );
              } else {
                // The new value contains no HTML, so it can be set in this
                // very fast, simple way.
                // We need to unescape the HTML now, because we previously
                // escaped it.
                node.nodeValue = unescapeHtml(new_val);
              }
            }
          }

        } while ( node = node.nextSibling );
      }

      // Time to remove those elements!
      remove.length && $(remove).remove();
    });
  };

})(jQuery);
