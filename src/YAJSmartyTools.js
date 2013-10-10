var YAJSmartyTools = {
	extend: function( oBase, oExtended ) {
		if(typeof(oBase)=='object' && typeof(oExtended)=='object') {
			for (var fieldName in oExtended) { 
				oBase[fieldName] = oExtended[fieldName]; 
			}
		}
	}
}