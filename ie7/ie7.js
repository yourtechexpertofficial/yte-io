/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'yte\'">' + entity + '</span>' + html;
	}
	var icons = {
		'ico-home': '&#xe902;',
		'ico-newspaper': '&#xe904;',
		'ico-pencil': '&#xe905;',
		'ico-image': '&#xe90d;',
		'ico-images': '&#xe90e;',
		'ico-play': '&#xe912;',
		'ico-files-empty': '&#xe925;',
		'ico-calendar': '&#xe953;',
		'ico-display': '&#xe956;',
		'ico-mobile': '&#xe958;',
		'ico-bubbles': '&#xe96f;',
		'ico-user': '&#xe971;',
		'ico-search': '&#xe986;',
		'ico-settings': '&#xe994;',
		'ico-trophy': '&#xe99e;',
		'ico-gift': '&#xe99f;',
		'ico-bin': '&#xe9ac;',
		'ico-download3': '&#xe9c7;',
		'ico-link': '&#xe9cb;',
		'ico-attachment': '&#xe9cd;',
		'ico-happy': '&#xe9df;',
		'ico-plus': '&#xea0a;',
		'ico-minus': '&#xea0b;',
		'ico-cross': '&#xea0f;',
		'ico-checkmark': '&#xea10;',
		'ico-play3': '&#xea1c;',
		'ico-arrow-down': '&#xea3e;',
		'ico-embed2': '&#xea80;',
		'ico-share': '&#xea82;',
		'ico-amazon': '&#xea87;',
		'ico-twitter': '&#xea96;',
		'ico-rss': '&#xea9b;',
		'ico-youtube': '&#xea9d;',
		'ico-reddit': '&#xeac6;',
		'ico-pinterest': '&#xead1;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/ico-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
