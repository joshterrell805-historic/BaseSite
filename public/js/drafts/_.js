$(document).ready(function() {
  if (!window.draft)
    return;

  var editorHtml = '<div class="edit"><form><textarea id="code" name="code">'
    + draft.body
    + '</textarea></form>'
    + '</div>';
  $('#content > .draft').html(editorHtml);

  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: "gfm",
    keyMap: "vim",
    matchBrackets: true,
    showCursorWhenSelecting: true,
    autofocus: true,
    theme: "twilight",
  });

  window.doc = editor.getDoc();
  doc.on('change', updateBackend);
});

function updateBackend() {
  if (updateBackend.updating_)
    return;

  updateBackend.updating_ = true;

  draft.old_hash = draft.hash;
  draft.body = doc.getValue();
  draft.hash = md5(draft.title + draft.body + draft.doctype);

  if (draft.old_hash == draft.hash) {
    updateBackend.updating_ = false;
    return;
  }

  $.ajax({
    type: 'POST',
    url: '/api/draft',
    data: JSON.stringify(draft),
    success: onSuccess,
    error: onError,
    processData: false,
    datatype: 'text'
  });
  function onSuccess(data, textStatus, xhr) {
    setTimeout(function() {
      draft.old_hash = draft.hash;
      updateBackend.updating_ = false;
      updateBackend();
    },
    500); // don't want this getting sent too often
  }
  function onError(xhr, textStatus) {
    console.error(xhr);
    alert('error updating server!');
  }
}
