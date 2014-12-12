# TODO

1. edit posts in-browser
1. max mysql reconnects exceeded.
```
Max mysql reconnects exceeded.
/home/josh/repos/BaseSite/BaseSite.njs:194
                  throw err;
                        ^
Error: Connection lost: The server closed the connection.
    at Protocol.end (/home/josh/repos/BaseSite/node_modules/mysql/lib/protocol/Protocol.js:103:13)
    at Socket.<anonymous> (/home/josh/repos/BaseSite/node_modules/mysql/lib/Connection.js:88:28)
    at Socket.EventEmitter.emit (events.js:126:20)
    at _stream_readable.js:895:16
    at process._tickCallback (node.js:339:11)
```
  - http://stackoverflow.com/a/20211143
1. "private post" login link should return user to the post they came from.
1. per-doc private users (eg I want to share only one doc with one user)
1. cleanup code
  1. merge this repo with joshterrell.com since I'm consolidating to one website.
  1. remove unneeded junk
  1. change all indent to 2space.
1. write tests
1. delete expired sessions in cron task.
1. make tool to reload partials, helpers, and modules on change (so don't have to restart)
1. tool to determine how long googleImage links last for. cache the links for that long
  1. decide whether I even want to keep using google drive for hosting images.
1. document history
