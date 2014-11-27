module.exports = Responder;

function Responder() {
   GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
   'GET': function* GET(cont) {
      this.stylesheets.push('/base/css/404.css');
      return this.renderPage(__filename, {});
   }
};
