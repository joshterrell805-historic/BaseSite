$(function() {
window.PageActions = {
  add: add,
  enable: enable,
  disable: disable,
};

var actions = {};
var ids = ['edit', 'view', 'private', 'public', 'create', 'delete', 'submit'];
var exclusivePairs = [['edit', 'view'], ['private', 'public'], ['create', 'delete'],
    ['submit']];
function add(opts) {
  if (ids.indexOf(opts.id) === -1) {
    throw new Error('Invalid action ' + opts.id);
  }
  actions[opts.id] = $('#action-' + opts.id);
  actions[opts.id].children('a').attr('href', opts.href);
  actions[opts.id].attr('title', opts.tooltip);
}

function enable(id) {
  if (!actions[id]) {
    throw new Error('Action ' + id + ' has not been added yet');
  }
  var found = false;
  for (var i = 0; !found && i < exclusivePairs.length; ++i) {
    var pair = exclusivePairs[i];
    var index = pair.indexOf(id);
    if (index !== -1) {
      found = true;
      for (var j = 0; j < pair.length; ++j) {
        if (j === index) continue;
        if (actions[pair[j]] && !actions[pair[j]].hasClass('hidden'))
          throw new Error('Cannot enable ' + id + ' when ' + pair[j] +
              ' is enabled');
      }
    }
  }
  if (!found) {
    throw new Error(id + ' does not exist in exclusivePairs list');
  }
  actions[id].removeClass('hidden');
}

function disable(id) {
  if (!actions[id]) {
    throw new Error('Action ' + id + ' does not exist');
  }
  actions[id].addClass('hidden');
}
});
