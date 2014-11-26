module.exports = User;

function User() {
  this.id = null;
  this.email = null;
}

User.find = function find(id) {
  return mysqlQuery('SELECT id, email FROM users WHERE id = (?)', [id])
  .then(function(results) {
    if (results.length == 0) {
      return null;
    } else {
      var user = new User();
      user.id = results[0].id;
      user.email = results[0].email;
      return user;
    }
  });
};

User.findByEmails = function findByEmails(emails) {
  return mysqlQuery('SELECT id, email FROM users WHERE email IN (?) '
      + 'ORDER BY id ASC LIMIT 1', [emails])
  .then(function(results) {
    if (results.length == 0) {
      return null;
    } else {
      var user = new User();
      user.id = results[0].id;
      user.email = results[0].email;
      return user;
    }
  });
};
