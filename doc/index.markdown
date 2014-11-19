# Base Site
Base Site is an http server that responds to requests for html pages.

This application is only used for responding to requests for html pages and has
no support for serving static assets.

## [TODO](todo.html)

### Usage
Create a new directory, add this project as a dependency, and run npm install.

Create the following new sub directorys and symlinks:

- exec: server scripts
  - buildStyle -> ../node\_modules/BaseSite/exec/buildStyle
  - start -> ../node\_modules/BaseSite/exec/start
- helpers: handlebars helpers available in the partial. These are node modules which export one function (the helper).
- lib: custom library modules. These are node modules which export whatever they wish and can be included with lib('name of library without extension').
- partials: handlebars templates to be used from responders (.hbs extension) using global renderMarkdown function.
- public: javascript, css, images, any other static assets served by another http server or CDN.
  - base -> ../node\_modules/BaseSite/public
- responders: modules which respond to http requests
- style: sass source to be built by exec/buildStyle

Create Site.njs in root directory. This is the "main". See one of the other sites for examples. It's a subclass of BaseSite/BaseSite.njs. Must implement "getConfigs".

To start the server, run exec/start from the site's root.
