$(function() {
   var options = {
      weekday: 'short',
      year:    'numeric',
      month:   'short',
      day:     'numeric',
      hour:    'numeric',
      minute:  'numeric',
   };

   replaceWithDates();
   $('body').bind("DOMSubtreeModified", replaceWithDates);

   /**
    * A timestamp node is a node that has the class "timestamp"
    * and the field "data-timestamp"
    *
    * The unix timestamp is stored in "data-timestamp".
    *
    * Gather the timestamp from "data-timestamp" and display a user
    *  friendly date in the html of the element.
    */
   function replaceWithDates() {
      $('.timestamp').each(function() {
         var elem = $(this);

         if (elem.hasClass('date-displayed')) {
            return;
         }

         var timestamp = elem.data('timestamp');
         var date = new Date(parseInt(timestamp * 1000)); // seconds to ms
         var dateString = date.toLocaleDateString('en-US', options);
         elem.html(dateString);

         elem.addClass('date-displayed');
      });
   }
});
