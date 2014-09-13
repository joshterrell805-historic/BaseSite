module.exports = renderScript;

function renderScript(script) {
   switch (script.type) {
   case 'url':
      return "<script src='" + script.url + "'></script>";
   case 'code':
      return "<script>" + script.code + "</script>";
   default:
      var e = new Error('unrecognized script type ' + script.type);
      e.code = 'INVALID_TYPE';
      throw e;
   }
}
