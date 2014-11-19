# Authentication

### Uses
- Whole page/responder auth required
  - all site
  - select pages
  - categories of pages
- Different content of page depending on auth
- POST requests (YAGNI)
  - edit page in-browser (KISS, Iterative, some day soon!)
  - create/edit comment (some day soon!)

### openid/oauth
I don't want to validate, store, and handle credentials. For now just use google oauth, but possibly open this up to other login services (yahoo, hotmail, &hellip;) later.

### YAGNI!!
Public documents are viewable by everyone.
Private documents are viewable by only authenticated users in the users table.

App can determine whether user is authenticated to change content for private/public viewers.

### database
    users
      idx_pk
      id

    sessions
      idx_pk
      token

    docs
      idx_pk
      publish_ts
      last_edit_ts
      title
      body
      type (article, post)
      private
